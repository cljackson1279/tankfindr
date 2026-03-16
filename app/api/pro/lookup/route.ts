import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSepticContextForLocation, logLookup } from '@/lib/septicLookup';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Florida DEP ArcGIS API - covers all 67 FL counties
const FDEP_API = 'https://ca.dep.state.fl.us/arcgis/rest/services/OpenData/SEPTIC_SYSTEMS/MapServer/0/query';

/**
 * Extract the street number from an address string.
 * e.g. "16125 County Road 455, Montverde, FL 34756" → "16125"
 */
function extractStreetNumber(address: string): string | null {
  const m = address.trim().match(/^(\d+)/);
  return m ? m[1] : null;
}

/**
 * Extract the city name from an address string.
 * Handles formats like "123 Main St, Tampa, FL 33602" or "123 Main St, Tampa FL 33602"
 */
function extractCity(address: string): string | null {
  // Try comma-separated: "123 Main St, Tampa, FL 33602" → "Tampa"
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 3) {
    // parts[-2] is typically the city
    return parts[parts.length - 2].toUpperCase().replace(/\s+FL\s*\d*$/, '').trim();
  }
  if (parts.length === 2) {
    // "123 Main St, Tampa FL 33602" — extract city from last part
    const m = parts[1].match(/^([A-Za-z\s]+)/);
    return m ? m[1].trim().toUpperCase() : null;
  }
  return null;
}

/**
 * Fetch FDEP features within a bounding box.
 */
async function fetchFDEP(
  lat: number,
  lng: number,
  radiusM: number,
  whereClause?: string
): Promise<any[]> {
  const delta = radiusM / 111320;
  const params = new URLSearchParams({
    geometry: `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`,
    geometryType: 'esriGeometryEnvelope',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'PHY_ADD1,PHY_CITY,PHY_ZIPCD,WW,WW_SRC_NAM,PARCELNO,ACRES,CO_NO,ALT_KEY',
    returnGeometry: 'true',
    outSR: '4326',
    resultRecordCount: '10',
    f: 'json',
  });
  if (whereClause) params.set('where', whereClause);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${FDEP_API}?${params}`, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'TankFindr/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) return [];
    const data = await response.json();
    return data?.features || [];
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

/**
 * Compute distance in metres between two lat/lng points.
 */
function distM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dlat = (lat2 - lat1) * 111320;
  const dlng = (lng2 - lng1) * 111320 * Math.cos(lat1 * Math.PI / 180);
  return Math.sqrt(dlat * dlat + dlng * dlng);
}

/**
 * Determine septic vs sewer for a Florida address using FDEP data.
 *
 * The FDEP database contains ONLY septic/OSTDS records — sewer properties are absent.
 *
 * Strategy:
 *   1. Address match: search for street number + city within 2km bounding box.
 *      If a matching record is found within 500m → this property is on septic.
 *   2. Area coverage: if no address match but FDEP has records within 1.5km
 *      → FDEP covers this area, property is likely on sewer (would be listed if septic).
 *   3. No data at all → unknown (FDEP doesn't cover this area).
 *
 * Returns:
 *   { result: 'septic', ... }  — address-matched FDEP record found
 *   { result: 'sewer' }        — area has FDEP data but no record for this address
 *   { result: 'unknown' }      — no FDEP data for this area
 */
async function queryFDEPForProperty(lat: number, lng: number, address: string): Promise<{
  result: 'septic' | 'sewer' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  tankLat?: number;
  tankLng?: number;
  parcelId?: string | null;
  fdepAddress?: string | null;
  wwType?: string | null;
  sourceName?: string | null;
  distanceMeters?: number;
}> {
  console.log('FDEP_PROPERTY_QUERY', { lat, lng, address });

  const streetNum = extractStreetNumber(address);
  const city = extractCity(address);

  console.log('FDEP_ADDRESS_PARSE', { streetNum, city });

  // Step 1: Address-matched search within 2km bounding box
  if (streetNum && city) {
    // Escape single quotes in city name for SQL safety
    const safeCity = city.replace(/'/g, "''").substring(0, 12);
    const whereClause = `PHY_ADD1 LIKE '${streetNum}%' AND PHY_CITY LIKE '%${safeCity}%'`;
    const features = await fetchFDEP(lat, lng, 2000, whereClause);

    console.log('FDEP_ADDRESS_MATCH', { count: features.length, whereClause });

    if (features.length > 0) {
      // Find the closest matching record (should be very close if it's the right address)
      let best = features[0];
      let bestDist = Infinity;
      for (const f of features) {
        const fLat = f.geometry?.y ?? lat;
        const fLng = f.geometry?.x ?? lng;
        const d = distM(lat, lng, fLat, fLng);
        if (d < bestDist) {
          bestDist = d;
          best = f;
        }
      }

      // Only accept if within 500m (guards against false address matches)
      if (bestDist <= 500) {
        const attrs = best.attributes || {};
        const geom = best.geometry || {};
        const ww = attrs.WW || '';
        const tankLat = geom.y ?? lat;
        const tankLng = geom.x ?? lng;

        console.log('FDEP_SEPTIC_MATCH', { ww, distanceM: Math.round(bestDist), addr: attrs.PHY_ADD1 });

        if (ww === 'KnownSeptic' || ww === 'LikelySeptic' || ww === 'SWLSeptic') {
          return {
            result: 'septic',
            confidence: ww === 'KnownSeptic' ? 'high' : 'medium',
            tankLat,
            tankLng,
            parcelId: attrs.PARCELNO || attrs.ALT_KEY || null,
            fdepAddress: attrs.PHY_ADD1 || null,
            wwType: ww,
            sourceName: attrs.WW_SRC_NAM || 'Florida DEP Statewide',
            distanceMeters: Math.round(bestDist),
          };
        }
        // Record found but not a septic type
        return { result: 'sewer', confidence: 'medium' };
      }
    }
  }

  // Step 2: Area coverage check — does FDEP have ANY data within 1.5km?
  const areaFeatures = await fetchFDEP(lat, lng, 1500);
  console.log('FDEP_AREA_CHECK', { count: areaFeatures.length });

  if (areaFeatures.length > 0) {
    // FDEP covers this area but no record for this address → on sewer
    return { result: 'sewer', confidence: 'medium' };
  }

  // No FDEP data at all for this area
  return { result: 'unknown', confidence: 'low' };
}

export async function POST(request: NextRequest) {
  try {
    const { userId, address, lat, lng } = await request.json();

    if (!userId || !address || !lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    console.log('User lookup:', { userId, userEmail: user?.email, userError });

    const isAdmin = user?.email === 'cljackson79@gmail.com';

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_tier, lookups_used')
      .eq('id', userId)
      .single();

    console.log('Profile lookup:', { userId, profile, profileError });

    if (!isAdmin) {
      if (profile?.subscription_status !== 'active') {
        return NextResponse.json(
          { error: 'No active subscription. Please subscribe to TankFindr Pro to access the locator.' },
          { status: 403 }
        );
      }

      // Limits: starter=100, pro=300, enterprise=unlimited
      if (profile.subscription_tier !== 'enterprise') {
        const limit = profile.subscription_tier === 'starter' ? 100 : 300;
        if ((profile.lookups_used || 0) >= limit) {
          return NextResponse.json(
            { error: `You've reached your monthly limit of ${limit} lookups. Upgrade your plan or wait for next billing cycle.` },
            { status: 403 }
          );
        }
      }

      await supabase
        .from('profiles')
        .update({ lookups_used: (profile.lookups_used || 0) + 1 })
        .eq('id', userId);
    }

    // Step 1: Query local Supabase database
    console.log('PRO_LOOKUP_QUERY', { userId, address, lat, lng });
    let context = await getSepticContextForLocation(lat, lng, 200, address);

    console.log('PRO_LOOKUP_RESULT', {
      classification: context.classification,
      confidence: context.confidence,
      isCovered: context.isCovered,
      hasTankPoint: !!context.tankPoint,
    });

    // Step 2: If local DB has no coverage, fall back to FDEP address-matched lookup
    if (!context.isCovered || context.classification === 'unknown') {
      console.log('FDEP_FALLBACK_TRIGGERED', { classification: context.classification, isCovered: context.isCovered });

      const fdep = await queryFDEPForProperty(lat, lng, address);
      console.log('FDEP_FALLBACK_RESULT', fdep);

      if (fdep.result === 'septic') {
        // Address-matched septic record found
        context = {
          ...context,
          isCovered: true,
          classification: fdep.confidence === 'high' ? 'septic' : 'likely_septic',
          confidence: fdep.confidence,
          tankPoint: { lat: fdep.tankLat!, lng: fdep.tankLng! },
          dataQuality: 'estimated_inventory',
          qualitySource: fdep.sourceName || 'Florida DEP Statewide',
          systemInfo: {
            type: fdep.wwType === 'KnownSeptic' ? 'Septic System' :
                  fdep.wwType === 'LikelySeptic' ? 'Likely Septic System' :
                  fdep.wwType || 'Septic System',
            permitNumber: fdep.parcelId || undefined,
          },
          coverageSources: [{
            id: 'fdep-statewide',
            name: fdep.sourceName || 'Florida DEP Statewide',
            state: 'FL',
            county: null,
            quality: 'medium',
            geometry_type: 'POINT',
            record_count: 1,
          }],
          nearestFeatures: [{
            id: `fdep-${fdep.parcelId || 'result'}`,
            source_id: 'fdep-statewide',
            county: 'Florida',
            state: 'FL',
            parcel_id: fdep.parcelId ?? null,
            address: fdep.fdepAddress ?? null,
            lat: fdep.tankLat!,
            lng: fdep.tankLng!,
            distance_meters: fdep.distanceMeters ?? 0,
            attributes: { WW: fdep.wwType },
            data_source: fdep.sourceName || 'Florida DEP Statewide',
          }],
        };
      } else if (fdep.result === 'sewer') {
        // FDEP has data for this area but no record for this address → on sewer
        context = {
          ...context,
          isCovered: true,
          classification: 'likely_sewer',
          confidence: 'medium',
          tankPoint: null,
          dataQuality: 'estimated_inventory',
          qualitySource: 'Florida DEP Statewide',
          systemInfo: null,
          coverageSources: [{
            id: 'fdep-statewide',
            name: 'Florida DEP Statewide',
            state: 'FL',
            county: null,
            quality: 'medium',
            geometry_type: 'POINT',
            record_count: 0,
          }],
          nearestFeatures: [],
        };
      }
      // If fdep.result === 'unknown', leave context as-is (unknown/not covered)
    }

    let distance = null;
    if (context.tankPoint) {
      distance = calculateDistance(lat, lng, context.tankPoint.lat, context.tankPoint.lng);
    }

    const resultSummary = {
      classification: context.classification,
      confidence: context.confidence,
      isCovered: context.isCovered,
      tankPoint: context.tankPoint,
      distance,
      systemInfo: context.systemInfo,
      riskLevel: context.riskLevel,
      sources: context.coverageSources,
      dataQuality: (context as any).dataQuality,
      qualitySource: (context as any).qualitySource,
    };

    const { data: job, error: jobError } = await supabase
      .from('septic_jobs')
      .insert({
        user_id: userId,
        address,
        lat,
        lng,
        result_summary: resultSummary,
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error saving job:', jobError);
      throw new Error('Failed to save job');
    }

    await logLookup({
      userId,
      address,
      lat,
      lng,
      classification: context.classification,
      confidence: context.confidence,
      resultSummary,
    });

    return NextResponse.json({
      jobId: job.id,
      ...resultSummary,
    });

  } catch (error: any) {
    console.error('Pro lookup error:', error);
    return NextResponse.json(
      { error: error.message || 'Lookup failed' },
      { status: 500 }
    );
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
