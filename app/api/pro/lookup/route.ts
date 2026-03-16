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
 * Direct FDEP lookup using bounding box - fast and reliable
 */
async function queryFDEPDirect(lat: number, lng: number): Promise<{
  classification: 'septic' | 'likely_sewer' | 'unknown';
  confidence: 'medium' | 'low';
  tankLat: number;
  tankLng: number;
  parcelId: string | null;
  address: string | null;
  wwType: string | null;
  sourceName: string | null;
} | null> {
  try {
    const delta = 0.008; // ~800m bounding box
    const params = new URLSearchParams({
      geometry: `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`,
      geometryType: 'esriGeometryEnvelope',
      inSR: '4326',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: 'PHY_ADD1,PHY_CITY,WW,WW_SRC_NAM,PARCELNO,ACRES,CO_NO',
      returnGeometry: 'true',
      outSR: '4326',
      resultRecordCount: '10',
      f: 'json',
    });

    const url = `${FDEP_API}?${params}`;
    console.log('FDEP_DIRECT_QUERY', { lat, lng });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'TankFindr/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('FDEP_HTTP_ERROR', response.status);
      return null;
    }

    const data = await response.json();
    const features = data?.features || [];

    console.log('FDEP_DIRECT_RESULT', {
      featuresCount: features.length,
      error: data?.error,
      firstWW: features[0]?.attributes?.WW,
    });

    if (features.length === 0) return null;

    // Find the closest feature to the queried point
    let closest = features[0];
    let minDist = Infinity;
    for (const f of features) {
      const geom = f.geometry || {};
      const fLat = geom.y || lat;
      const fLng = geom.x || lng;
      const d = Math.sqrt(Math.pow(fLat - lat, 2) + Math.pow(fLng - lng, 2));
      if (d < minDist) {
        minDist = d;
        closest = f;
      }
    }

    const attrs = closest.attributes || {};
    const geom = closest.geometry || {};
    const ww = attrs.WW || '';

    let classification: 'septic' | 'likely_sewer' | 'unknown' = 'unknown';
    if (ww === 'KnownSeptic' || ww === 'LikelySeptic') {
      classification = 'septic';
    } else if (ww === 'KnownSewer' || ww === 'LikelySewer') {
      classification = 'likely_sewer';
    }

    return {
      classification,
      confidence: 'medium',
      tankLat: geom.y || lat,
      tankLng: geom.x || lng,
      parcelId: attrs.PARCELNO || null,
      address: attrs.PHY_ADD1 || null,
      wwType: ww,
      sourceName: attrs.WW_SRC_NAM || 'Florida DEP Statewide',
    };
  } catch (error: any) {
    console.error('FDEP_DIRECT_ERROR', error?.message || error);
    return null;
  }
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

      // Updated limits: starter=100, pro=300, enterprise=unlimited
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
    let context = await getSepticContextForLocation(lat, lng);

    console.log('PRO_LOOKUP_RESULT', {
      classification: context.classification,
      confidence: context.confidence,
      isCovered: context.isCovered,
      hasTankPoint: !!context.tankPoint,
    });

    // Step 2: If local DB has no coverage, fall back to FDEP API directly
    if (context.classification === 'unknown' || !context.isCovered) {
      console.log('FDEP_FALLBACK_TRIGGERED', { classification: context.classification });
      const fdepResult = await queryFDEPDirect(lat, lng);

      if (fdepResult && fdepResult.classification !== 'unknown') {
        console.log('FDEP_FALLBACK_SUCCESS', { classification: fdepResult.classification, ww: fdepResult.wwType });

        context = {
          ...context,
          isCovered: true,
          classification: fdepResult.classification === 'septic' ? 'septic' : 'likely_sewer',
          confidence: 'medium',
          tankPoint: { lat: fdepResult.tankLat, lng: fdepResult.tankLng },
          dataQuality: 'estimated_inventory',
          qualitySource: fdepResult.sourceName || 'Florida DEP Statewide',
          systemInfo: {
            type: fdepResult.wwType === 'KnownSeptic' ? 'Septic System' :
                  fdepResult.wwType === 'LikelySeptic' ? 'Likely Septic System' :
                  fdepResult.wwType || 'Unknown',
            permitNumber: fdepResult.parcelId || undefined,
          },
          coverageSources: [{
            id: 'fdep-statewide',
            name: fdepResult.sourceName || 'Florida DEP Statewide',
            state: 'FL',
            county: null,
            quality: 'medium',
            geometry_type: 'POINT',
            record_count: 1,
          }],
          nearestFeatures: [{
            id: `fdep-${fdepResult.parcelId || 'result'}`,
            source_id: 'fdep-statewide',
            county: 'Florida',
            state: 'FL',
            parcel_id: fdepResult.parcelId,
            address: fdepResult.address,
            lat: fdepResult.tankLat,
            lng: fdepResult.tankLng,
            distance_meters: Math.round(
              Math.sqrt(
                Math.pow((fdepResult.tankLat - lat) * 111320, 2) +
                Math.pow((fdepResult.tankLng - lng) * 111320 * Math.cos(lat * Math.PI / 180), 2)
              )
            ),
            attributes: { WW: fdepResult.wwType },
            data_source: fdepResult.sourceName || 'Florida DEP Statewide',
          }],
        };
      } else {
        console.log('FDEP_FALLBACK_NO_RESULT', { fdepResult });
      }
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
