import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface SepticSource {
  id: string;
  name: string;
  state: string;
  county: string | null;
  quality: 'high' | 'medium' | 'low';
  geometry_type: 'POINT' | 'POLYGON';
  record_count: number;
}

export interface SepticFeature {
  id: string;
  source_id: string;
  county: string;
  state: string;
  parcel_id: string | null;
  address: string | null;
  lat: number;
  lng: number;
  distance_meters: number;
  attributes: any;
  data_source: string;
}

export interface SepticContext {
  isCovered: boolean;
  classification: 'septic' | 'sewer' | 'likely_septic' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  coverageSources: SepticSource[];
  nearestFeatures: SepticFeature[];
  tankPoint: { lat: number; lng: number } | null;
  parcelGeom: any | null;
  systemInfo: {
    type?: string;
    permitNumber?: string;
    permitDate?: string;
    installDate?: string;
    lastServiceDate?: string;
    ageEstimate?: string;
  } | null;
  riskLevel?: 'low' | 'medium' | 'high';
  dataQuality?: 'verified_permit' | 'estimated_inventory' | 'unknown';
  qualitySource?: string;
}

/**
 * Main shared lookup service
 * Used by: Pro dashboard, Property reports, Quick check widget
 */
export async function getSepticContextForLocation(
  lat: number,
  lng: number,
  radiusMeters: number = 200
): Promise<SepticContext> {
  try {
    // 1. Check coverage - which sources cover this point?
    const coverageSources = await checkCoverage(lat, lng);
    
    if (coverageSources.length === 0) {
      return {
        isCovered: false,
        classification: 'unknown',
        confidence: 'low',
        coverageSources: [],
        nearestFeatures: [],
        tankPoint: null,
        parcelGeom: null,
        systemInfo: null,
      };
    }

    // 2. Find nearest septic features within radius
    const nearestFeatures = await findNearestFeatures(lat, lng, radiusMeters);

    // 3. Classify septic vs sewer (with data quality awareness)
    const { classification, confidence } = classifySepticStatus(
      nearestFeatures,
      coverageSources
    );

    // 4. Get best tank point
    const tankPoint = getBestTankPoint(nearestFeatures);

    // 5. Extract system info and detect data quality
    const systemInfo = extractSystemInfo(nearestFeatures);
    
    // 5b. Detect data quality from nearest feature
    let dataQuality: 'verified_permit' | 'estimated_inventory' | 'unknown' = 'unknown';
    let qualitySource = 'Unknown';
    if (nearestFeatures.length > 0) {
      const quality = detectDataQuality(nearestFeatures[0].attributes || {});
      dataQuality = quality.quality;
      qualitySource = quality.source;
    }

    // 6. Calculate risk level
    const riskLevel = calculateRiskLevel(systemInfo, nearestFeatures);

    return {
      isCovered: true,
      classification,
      confidence,
      coverageSources,
      nearestFeatures,
      tankPoint,
      parcelGeom: null, // TODO: Add parcel geometry if available
      systemInfo,
      riskLevel,
      dataQuality,
      qualitySource,
    };
  } catch (error) {
    console.error('Error in getSepticContextForLocation:', error);
    throw error;
  }
}

/**
 * Check which data sources cover this location
 */
async function checkCoverage(lat: number, lng: number): Promise<SepticSource[]> {
  try {
    // Query septic_sources table for coverage
    const { data, error } = await supabase
      .from('septic_sources')
      .select('*');

    if (error) {
      console.error('Error checking coverage:', error);
    }

    // If septic_sources table has data, use it
    if (data && data.length > 0) {
      console.log('COVERAGE_FROM_SOURCES', { sourcesCount: data.length });
      return data;
    }

    // FALLBACK: If septic_sources is empty, check if we have ANY septic_tanks data nearby
    // This handles the case where data is imported but metadata table not populated yet
    console.log('COVERAGE_FALLBACK', {
      message: 'septic_sources empty, checking for nearby tanks',
      lat,
      lng
    });

    const { data: nearbyTanks, error: tanksError } = await supabase.rpc('find_nearest_septic_tank', {
      search_lat: lat,
      search_lng: lng,
      search_radius_meters: 5000, // 5km radius for coverage check
    });

    if (tanksError) {
      console.error('❌ CRITICAL ERROR in checkCoverage - RPC call failed:', {
        message: tanksError.message,
        code: tanksError.code,
        hint: tanksError.hint,
        details: tanksError.details,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
      });
      // If RPC function doesn't exist, user needs to apply migration
      if (tanksError.code === 'PGRST202' || tanksError.message?.includes('find_nearest_septic_tank') || tanksError.message?.includes('does not exist')) {
        console.error('⚠️  CRITICAL: find_nearest_septic_tank RPC function not found!');
        console.error('👉 Apply SQL migration from MIGRATION_INSTRUCTIONS.md');
      }
      return [];
    }

    // If we found tanks nearby, create synthetic source entries
    if (nearbyTanks && nearbyTanks.length > 0) {
      const uniqueCounties = new Set<string>(nearbyTanks.map((t: any) => `${t.county},${t.state}`));
      const syntheticSources: SepticSource[] = Array.from(uniqueCounties).map((key: string) => {
        const [county, state] = key.split(',');
        return {
          id: `synthetic-${county}-${state}`,
          name: `${county} County Septic Records`,
          state,
          county,
          quality: 'high' as const,
          geometry_type: 'POINT' as const,
          record_count: nearbyTanks.filter((t: any) => t.county === county && t.state === state).length,
        };
      });

      console.log('COVERAGE_SYNTHETIC_SOURCES', {
        sourcesCount: syntheticSources.length,
        counties: syntheticSources.map(s => `${s.county}, ${s.state}`)
      });

      return syntheticSources;
    }

    // No coverage found
    console.log('COVERAGE_NONE', { lat, lng });
    return [];
  } catch (error) {
    console.error('Error in checkCoverage:', error);
    return [];
  }
}

/**
 * Find nearest septic tank features
 */
async function findNearestFeatures(
  lat: number,
  lng: number,
  radiusMeters: number
): Promise<SepticFeature[]> {
  try {
    // Use the existing find_nearest_septic_tank function
    const { data, error } = await supabase.rpc('find_nearest_septic_tank', {
      search_lat: lat,
      search_lng: lng,
      search_radius_meters: radiusMeters,
    });

    if (error) {
      console.error('❌ ERROR in findNearestFeatures - RPC call failed:', {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details,
        lat,
        lng,
        radiusMeters
      });
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in findNearestFeatures:', error);
    return [];
  }
}

/**
 * Classify as septic, sewer, likely septic, or unknown
 */
function classifySepticStatus(
  features: SepticFeature[],
  sources: SepticSource[]
): { classification: SepticContext['classification']; confidence: SepticContext['confidence'] } {
  if (features.length === 0) {
    // No septic tanks found within search radius
    // If we have coverage data, this likely means sewer system
    if (sources.length > 0) {
      return { classification: 'sewer', confidence: 'high' };
    }
    // No coverage data - truly unknown
    return { classification: 'unknown', confidence: 'low' };
  }

  const nearestFeature = features[0];
  const distance = nearestFeature.distance_meters;
  const attrs = nearestFeature.attributes || {};
  
  // Check data quality to adjust classification
  const quality = detectDataQuality(attrs);
  const isEstimated = quality.quality === 'estimated_inventory';
  const isVerified = quality.quality === 'verified_permit';

  // For verified permits: stricter distance thresholds
  if (isVerified) {
    if (distance < 30) {
      return { classification: 'septic', confidence: 'high' };
    }
    if (distance < 75) {
      return { classification: 'septic', confidence: 'medium' };
    }
    if (distance < 200) {
      return { classification: 'likely_septic', confidence: 'low' };
    }
    return { classification: 'sewer', confidence: 'medium' };
  }
  
  // For estimated records: more lenient, always show as likely_septic if found
  if (isEstimated) {
    if (distance < 100) {
      return { classification: 'likely_septic', confidence: 'medium' };
    }
    if (distance < 200) {
      return { classification: 'likely_septic', confidence: 'low' };
    }
    // Even if far, still show as likely_septic but low confidence
    return { classification: 'likely_septic', confidence: 'low' };
  }

  // Default behavior for unknown quality
  if (distance < 30) {
    return { classification: 'septic', confidence: 'high' };
  }
  if (distance < 75) {
    return { classification: 'septic', confidence: 'medium' };
  }
  if (distance < 200) {
    return { classification: 'likely_septic', confidence: 'low' };
  }
  return { classification: 'sewer', confidence: 'medium' };
}

/**
 * Get the best tank point from features
 */
function getBestTankPoint(features: SepticFeature[]): { lat: number; lng: number } | null {
  if (features.length === 0) return null;

  // Return the nearest feature's location
  const nearest = features[0];
  return { lat: nearest.lat, lng: nearest.lng };
}

/**
 * Detect data quality tier from attributes
 */
function detectDataQuality(attrs: any): { quality: 'verified_permit' | 'estimated_inventory' | 'unknown'; source: string } {
  // Check for verified permit data (has APNO permit number)
  if (attrs.APNO) {
    return {
      quality: 'verified_permit',
      source: 'Florida DOH Permit Records'
    };
  }
  
  // Check for estimated inventory data (has WW = "LikelySeptic")
  if (attrs.WW === 'LikelySeptic') {
    return {
      quality: 'estimated_inventory',
      source: 'Florida DOH 2009-2015 Inventory'
    };
  }
  
  // Unknown/other data
  return {
    quality: 'unknown',
    source: 'Unknown'
  };
}

/**
 * Extract system information from features
 */
function extractSystemInfo(features: SepticFeature[]): SepticContext['systemInfo'] {
  if (features.length === 0) return null;

  const nearest = features[0];
  const attrs = nearest.attributes || {};

  // Extract common fields (field names vary by county)
  const systemInfo: any = {};

  // FLORIDA-SPECIFIC RICH DATA EXTRACTION
  // System Type - Florida has detailed SYSTTYPE field
  if (attrs.SYSTTYPE) {
    systemInfo.type = attrs.SYSTTYPE; // e.g., "OSTDS Abandonment", "OSTDS Repair", "OSTDS Existing"
    systemInfo.systemTypeVerified = true;
  } else if (attrs.SYSTEM_TYPE || attrs.system_type || attrs.SystemType || attrs.WW || attrs.LANDUSE) {
    systemInfo.type = attrs.SYSTEM_TYPE || attrs.system_type || attrs.SystemType || attrs.WW || attrs.LANDUSE;
    systemInfo.systemTypeVerified = false;
  }

  // Permit Number - Florida has APNO field
  if (attrs.APNO) {
    systemInfo.permitNumber = attrs.APNO; // e.g., "AP1267843"
    systemInfo.permitNumberVerified = true;
  } else if (attrs.PERMIT_NUMBER || attrs.permit_number || attrs.PermitNumber || attrs.PERMIT_NO || attrs.PARCELNO || attrs.ALT_KEY) {
    systemInfo.permitNumber = attrs.PERMIT_NUMBER || attrs.permit_number || attrs.PermitNumber || attrs.PERMIT_NO || attrs.PARCELNO || attrs.ALT_KEY;
    systemInfo.permitNumberVerified = false;
  }

  // System Capacity - Florida has ESTIMGPD (Estimated Gallons Per Day)
  if (attrs.ESTIMGPD) {
    systemInfo.capacity = `${attrs.ESTIMGPD} GPD`;
    systemInfo.capacityVerified = true;
    // Estimate tank size from GPD
    const gpd = parseInt(attrs.ESTIMGPD);
    if (gpd <= 200) {
      systemInfo.estimatedTankSize = "750-1000 gallons";
    } else if (gpd <= 300) {
      systemInfo.estimatedTankSize = "1000-1250 gallons";
    } else if (gpd <= 400) {
      systemInfo.estimatedTankSize = "1250-1500 gallons";
    } else {
      systemInfo.estimatedTankSize = "1500+ gallons";
    }
  }

  // Lot Size - Florida has ACREAGE field
  if (attrs.ACREAGE || attrs.ACRES) {
    const acres = attrs.ACREAGE || attrs.ACRES;
    systemInfo.lotSize = `${acres} acres`;
    systemInfo.lotSizeVerified = true;
  }

  // Property Type - Florida has COMRESID field
  if (attrs.COMRESID) {
    systemInfo.propertyType = attrs.COMRESID; // "Residential" or "Commercial"
    systemInfo.propertyTypeVerified = true;
  }

  // Water Supply Type - Florida has WSUPLTYP field
  if (attrs.WSUPLTYP) {
    systemInfo.waterSupply = attrs.WSUPLTYP; // e.g., "SDWA Community", "SDWA Transient non community"
    systemInfo.waterSupplyVerified = true;
  }

  // Approval Status - Florida has FINSYSAPRV field
  if (attrs.FINSYSAPRV) {
    systemInfo.approvalStatus = attrs.FINSYSAPRV; // "Approved", etc.
    systemInfo.approvalStatusVerified = true;
  }

  // Dates - Florida has APPRDATE and FINALINSP (timestamps)
  if (attrs.APPRDATE) {
    try {
      const date = new Date(attrs.APPRDATE);
      systemInfo.permitDate = date.toLocaleDateString();
      systemInfo.approvalDate = date.toLocaleDateString();
      systemInfo.permitDateVerified = true;
    } catch (e) {
      systemInfo.permitDate = attrs.APPRDATE;
    }
  } else if (attrs.PERMIT_DATE || attrs.permit_date || attrs.PermitDate || attrs.APPROVAL_DATE || attrs.WW_UPD || attrs.ASMNT_YR) {
    const dateValue = attrs.PERMIT_DATE || attrs.permit_date || attrs.PermitDate || attrs.APPROVAL_DATE || attrs.WW_UPD || attrs.ASMNT_YR;
    systemInfo.permitDate = dateValue;
    systemInfo.permitDateVerified = false;
  }

  if (attrs.FINALINSP) {
    try {
      const date = new Date(attrs.FINALINSP);
      systemInfo.finalInspectionDate = date.toLocaleDateString();
      systemInfo.finalInspectionVerified = true;
    } catch (e) {
      systemInfo.finalInspectionDate = attrs.FINALINSP;
    }
  }

  if (attrs.INSTALL_DATE || attrs.install_date || attrs.InstallDate) {
    systemInfo.installDate = attrs.INSTALL_DATE || attrs.install_date || attrs.InstallDate;
  }

  if (attrs.LAST_SERVICE_DATE || attrs.last_service_date || attrs.LastServiceDate) {
    systemInfo.lastServiceDate = attrs.LAST_SERVICE_DATE || attrs.last_service_date || attrs.LastServiceDate;
  }

  // Tax Folio - Florida has FOLIO field
  if (attrs.FOLIO || attrs.GEOFOLIO) {
    systemInfo.taxFolio = attrs.FOLIO || attrs.GEOFOLIO;
    systemInfo.taxFolioVerified = true;
  }

  // System Address - Florida has SYSTADDR (often cleaner than main address)
  if (attrs.SYSTADDR) {
    systemInfo.systemAddress = attrs.SYSTADDR;
  }

  // Calculate age estimate from any available date
  const permitDate = systemInfo.permitDate || systemInfo.installDate;
  if (permitDate) {
    try {
      const year = typeof permitDate === 'number' ? permitDate : new Date(permitDate).getFullYear();
      const age = new Date().getFullYear() - year;
      if (age > 0 && age < 100) {
        systemInfo.ageEstimate = `${age} years old`;
      }
    } catch (e) {
      // Invalid date, skip age calculation
    }
  }

  // Add data source information
  if (nearest.data_source) {
    systemInfo.dataSource = nearest.data_source;
  }

  // Add county and state for context
  if (nearest.county) {
    systemInfo.county = nearest.county;
  }
  if (nearest.state) {
    systemInfo.state = nearest.state;
  }

  // Always return system info if we have a septic record, even if minimal
  return systemInfo;
}

/**
 * Calculate risk level based on age and location
 */
function calculateRiskLevel(
  systemInfo: SepticContext['systemInfo'],
  features: SepticFeature[]
): 'low' | 'medium' | 'high' | undefined {
  if (!systemInfo) return undefined;

  // Extract age from estimate
  const ageMatch = systemInfo.ageEstimate?.match(/(\d+) years/);
  const age = ageMatch ? parseInt(ageMatch[1]) : null;

  if (!age) return undefined;

  // Risk based on age
  if (age > 25) return 'high';
  if (age > 15) return 'medium';
  return 'low';
}

/**
 * Log a lookup for analytics and abuse prevention
 */
export async function logLookup(params: {
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  address: string;
  lat: number;
  lng: number;
  classification: string;
  confidence: string;
  resultSummary: any;
}): Promise<void> {
  try {
    await supabase.from('septic_lookups').insert({
      user_id: params.userId || null,
      session_id: params.sessionId || null,
      ip_address: params.ipAddress || null,
      address: params.address,
      lat: params.lat,
      lng: params.lng,
      classification: params.classification,
      confidence: params.confidence,
      result_summary: params.resultSummary,
    });
  } catch (error) {
    console.error('Error logging lookup:', error);
    // Don't throw - logging failure shouldn't break the lookup
  }
}

/**
 * Check rate limit for user or IP
 */
export async function checkRateLimit(
  userId: string | null,
  ipAddress: string,
  limit: number = 100,
  windowMinutes: number = 60
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_user_id: userId,
      p_ip_address: ipAddress,
      p_limit: limit,
      p_window_minutes: windowMinutes,
    });

    if (error) {
      console.error('Error checking rate limit:', error);
      return { allowed: true, remaining: limit }; // Fail open
    }

    const allowed = data === true;
    const remaining = allowed ? limit : 0;

    return { allowed, remaining };
  } catch (error) {
    console.error('Error in checkRateLimit:', error);
    return { allowed: true, remaining: limit }; // Fail open
  }
}
