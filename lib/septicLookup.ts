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
  classification: 'septic' | 'sewer' | 'likely_septic' | 'likely_sewer' | 'unknown';
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

// Florida DEP ArcGIS REST API - covers all 67 Florida counties
const FDEP_SEPTIC_API = 'https://ca.dep.state.fl.us/arcgis/rest/services/OpenData/SEPTIC_SYSTEMS/MapServer/0/query';

/**
 * Query Florida DEP ArcGIS API for septic data (fallback for uncovered areas)
 * Covers all 67 Florida counties with KnownSeptic / LikelySeptic classifications
 */
async function queryFDEPApi(lat: number, lng: number, radiusMeters: number = 300): Promise<SepticFeature[]> {
  try {
    const params = new URLSearchParams({
      geometry: `${lng},${lat}`,
      geometryType: 'esriGeometryPoint',
      inSR: '4326',
      spatialRel: 'esriSpatialRelIntersects',
      distance: String(radiusMeters),
      units: 'esriSRUnit_Meter',
      outFields: 'PHY_ADD1,PHY_CITY,PHY_ZIPCD,WW,WW_UPD,WW_SRC_NAM,PARCELNO,LANDUSE,ACRES,CO_NO,ALT_KEY',
      returnGeometry: 'true',
      outSR: '4326',
      f: 'json',
    });

    const response = await fetch(`${FDEP_SEPTIC_API}?${params}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000), // 8 second timeout
    });

    if (!response.ok) return [];

    const data = await response.json();
    const features = data?.features || [];

    if (features.length === 0) return [];

    // Convert FDEP features to SepticFeature format
    return features.map((f: any, i: number) => {
      const attrs = f.attributes || {};
      const geom = f.geometry || {};
      const featureLat = geom.y || lat;
      const featureLng = geom.x || lng;

      // Calculate distance from search point
      const dlat = (featureLat - lat) * 111320;
      const dlng = (featureLng - lng) * 111320 * Math.cos(lat * Math.PI / 180);
      const distance = Math.sqrt(dlat * dlat + dlng * dlng);

      return {
        id: `fdep-${attrs.PARCELNO || attrs.ALT_KEY || i}`,
        source_id: 'fdep-statewide',
        county: attrs.PHY_CITY?.replace(' FL', '').trim() || 'Florida',
        state: 'FL',
        parcel_id: attrs.PARCELNO || null,
        address: attrs.PHY_ADD1 || null,
        lat: featureLat,
        lng: featureLng,
        distance_meters: Math.round(distance),
        attributes: {
          ...attrs,
          // Normalize WW field for classification
          WW: attrs.WW,
          // Map FDEP fields to standard fields
          data_source_type: 'fdep_statewide',
        },
        data_source: `FDEP Statewide - ${attrs.WW_SRC_NAM || 'Florida DEP'}`,
      };
    }).sort((a: SepticFeature, b: SepticFeature) => a.distance_meters - b.distance_meters);

  } catch (error) {
    console.error('FDEP API error:', error);
    return [];
  }
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
      // No local database coverage - try FDEP statewide API as fallback
      console.log('FDEP_FALLBACK', { lat, lng, reason: 'No local coverage' });
      const fdepFeatures = await queryFDEPApi(lat, lng, radiusMeters);

      if (fdepFeatures.length > 0) {
        // FDEP has data - classify based on WW field
        const nearestFdep = fdepFeatures[0];
        const wwType = nearestFdep.attributes?.WW || '';
        let classification: SepticContext['classification'] = 'unknown';
        let confidence: SepticContext['confidence'] = 'medium';

        if (wwType === 'KnownSeptic') {
          classification = nearestFdep.distance_meters < 150 ? 'septic' : 'likely_septic';
          confidence = nearestFdep.distance_meters < 50 ? 'high' : 'medium';
        } else if (wwType === 'LikelySeptic') {
          classification = 'likely_septic';
          confidence = 'medium';
        } else if (wwType === 'KnownSewer' || wwType === 'Sewer') {
          classification = 'likely_sewer';
          confidence = 'medium';
        } else {
          classification = 'unknown';
          confidence = 'low';
        }

        const tankPoint = { lat: nearestFdep.lat, lng: nearestFdep.lng };
        const systemInfo = extractSystemInfo(fdepFeatures);

        console.log('FDEP_RESULT', { classification, confidence, distance: nearestFdep.distance_meters, wwType });

        return {
          isCovered: true,
          classification,
          confidence,
          coverageSources: [{
            id: 'fdep-statewide',
            name: 'Florida DEP Statewide OSTDS Database',
            state: 'FL',
            county: null,
            quality: 'medium',
            geometry_type: 'POINT',
            record_count: fdepFeatures.length,
          }],
          nearestFeatures: fdepFeatures,
          tankPoint,
          parcelGeom: null,
          systemInfo,
          riskLevel: calculateRiskLevel(systemInfo, fdepFeatures),
          dataQuality: 'estimated_inventory',
          qualitySource: nearestFdep.attributes?.WW_SRC_NAM || 'Florida DEP Statewide',
        };
      }

      // FDEP also has no data - truly unknown
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
 * IMPORTANT: Must use geographic proximity - NOT just checking if table has any rows.
 * Otherwise all addresses worldwide would appear "covered" by Broward County data.
 */
async function checkCoverage(lat: number, lng: number): Promise<SepticSource[]> {
  try {
    // Check if we have ANY septic_tanks data within 5km of this point
    // This is the REAL coverage check - geographic, not just table existence
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
      if (tanksError.code === 'PGRST202' || tanksError.message?.includes('find_nearest_septic_tank') || tanksError.message?.includes('does not exist')) {
        console.error('⚠️  CRITICAL: find_nearest_septic_tank RPC function not found!');
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
    if (sources.length > 0) {
      // We have coverage but no records found
      // Could be sewer OR could be old/missing septic records
      // Be cautious: false negatives (missing septic) are worse than false positives
      
      // Check data quality of the source
      const source = sources[0];
      const hasGoodCoverage = source.record_count && source.record_count > 500;
      
      if (hasGoodCoverage) {
        // High quality data with many records, more likely sewer
        // But still not "high" confidence due to potential gaps in old records
        return { classification: 'likely_sewer', confidence: 'medium' };
      } else {
        // Lower quality data or few records, can't be sure
        return { classification: 'unknown', confidence: 'low' };
      }
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
  
  // Check for FDEP statewide data (KnownSeptic)
  if (attrs.WW === 'KnownSeptic') {
    return {
      quality: 'estimated_inventory',
      source: attrs.WW_SRC_NAM || 'Florida DEP Statewide OSTDS'
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
