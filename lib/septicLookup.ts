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

    // 3. Classify septic vs sewer
    const { classification, confidence } = classifySepticStatus(
      nearestFeatures,
      coverageSources
    );

    // 4. Get best tank point
    const tankPoint = getBestTankPoint(nearestFeatures);

    // 5. Extract system info
    const systemInfo = extractSystemInfo(nearestFeatures);

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
    // This likely means the property is on city sewer
    // In Florida, if no septic system is found in a covered area,
    // it's most likely connected to municipal sewer
    return { classification: 'sewer', confidence: 'medium' };
  }

  const nearestFeature = features[0];
  const distance = nearestFeature.distance_meters;

  // High confidence if very close (within 15 meters)
  if (distance < 15) {
    return { classification: 'septic', confidence: 'high' };
  }

  // Medium confidence if reasonably close (15-50 meters)
  if (distance < 50) {
    return { classification: 'septic', confidence: 'medium' };
  }

  // Lower confidence if farther (50-200 meters)
  // Could be neighbor's tank or property boundary issue
  if (distance < 200) {
    return { classification: 'likely_septic', confidence: 'low' };
  }

  // Very far - probably not this property's tank
  return { classification: 'sewer', confidence: 'low' };
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
 * Extract system information from features
 */
function extractSystemInfo(features: SepticFeature[]): SepticContext['systemInfo'] {
  if (features.length === 0) return null;

  const nearest = features[0];
  const attrs = nearest.attributes || {};

  // Extract common fields (field names vary by county)
  const systemInfo: any = {};

  // Try different field name variations
  if (attrs.SYSTEM_TYPE || attrs.system_type || attrs.SystemType) {
    systemInfo.type = attrs.SYSTEM_TYPE || attrs.system_type || attrs.SystemType;
  }

  if (attrs.PERMIT_NUMBER || attrs.permit_number || attrs.PermitNumber || attrs.PERMIT_NO) {
    systemInfo.permitNumber = attrs.PERMIT_NUMBER || attrs.permit_number || attrs.PermitNumber || attrs.PERMIT_NO;
  }

  if (attrs.PERMIT_DATE || attrs.permit_date || attrs.PermitDate || attrs.APPROVAL_DATE) {
    systemInfo.permitDate = attrs.PERMIT_DATE || attrs.permit_date || attrs.PermitDate || attrs.APPROVAL_DATE;
  }

  if (attrs.INSTALL_DATE || attrs.install_date || attrs.InstallDate) {
    systemInfo.installDate = attrs.INSTALL_DATE || attrs.install_date || attrs.InstallDate;
  }

  if (attrs.LAST_SERVICE_DATE || attrs.last_service_date || attrs.LastServiceDate) {
    systemInfo.lastServiceDate = attrs.LAST_SERVICE_DATE || attrs.last_service_date || attrs.LastServiceDate;
  }

  // Calculate age estimate
  const permitDate = systemInfo.permitDate || systemInfo.installDate;
  if (permitDate) {
    const year = new Date(permitDate).getFullYear();
    const age = new Date().getFullYear() - year;
    if (age > 0 && age < 100) {
      systemInfo.ageEstimate = `${age} years old`;
    }
  }

  return Object.keys(systemInfo).length > 0 ? systemInfo : null;
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
