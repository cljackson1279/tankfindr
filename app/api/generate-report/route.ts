import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { getSepticContextForLocation } from '@/lib/septicLookup';
import { getEnvironmentalRisk } from '@/lib/environmental';
import { getGroundwaterRisk } from '@/lib/groundwater';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Server-side admin allowlist. Configure via ADMIN_EMAILS env var (comma-separated).
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'cljackson79@gmail.com')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function POST(request: NextRequest) {
  try {
    const { sessionId, address, lat, lng, upsells: requestedUpsells } = await request.json();

    if (!sessionId || !address || !lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let isAdminBypass = false;
    let customerEmail = 'unknown';
    let upsells: string[] = [];
    let paidSession: Stripe.Checkout.Session | null = null;

    if (sessionId === 'admin_bypass') {
      // SECURITY: admin status is verified server-side from the Supabase session
      // cookie. Never trust emails or flags sent in the request body/headers.
      const supabaseAuth = await createServerSupabase();
      const { data: { user } } = await supabaseAuth.auth.getUser();

      if (!user?.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      isAdminBypass = true;
      customerEmail = user.email;
      upsells = Array.isArray(requestedUpsells) ? requestedUpsells : [];

      console.log('ADMIN_BYPASS_REPORT', {
        adminEmail: customerEmail,
        address,
        verifiedVia: 'supabase_session',
      });
    } else {
      // Verify payment session (retrieve exactly once)
      paidSession = await stripe.checkout.sessions.retrieve(sessionId);

      if (paidSession.payment_status !== 'paid') {
        return NextResponse.json(
          { error: 'Payment not completed' },
          { status: 400 }
        );
      }

      // SECURITY: bind the session to the property it was purchased for.
      // Without this, one paid session could be replayed with different
      // addresses to generate unlimited reports.
      const mLat = parseFloat(paidSession.metadata?.lat || '');
      const mLng = parseFloat(paidSession.metadata?.lng || '');
      const latOk = !isNaN(mLat) && Math.abs(mLat - Number(lat)) < 0.001;
      const lngOk = !isNaN(mLng) && Math.abs(mLng - Number(lng)) < 0.001;

      if (paidSession.metadata?.type !== 'property_report' || !latOk || !lngOk) {
        return NextResponse.json(
          { error: 'This payment session does not match the requested property' },
          { status: 403 }
        );
      }

      customerEmail = paidSession.customer_details?.email || 'unknown';

      if (paidSession.metadata?.upsells) {
        try {
          upsells = JSON.parse(paidSession.metadata.upsells);
        } catch (e) {
          console.error('Failed to parse upsells:', e);
        }
      }

      // Idempotency: if this payment already generated a report, return the
      // saved copy (lets the customer refresh their report page safely).
      const { data: existingRows } = await supabase
        .from('property_reports')
        .select('report_data')
        .eq('stripe_payment_id', paidSession.payment_intent as string)
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingRows && existingRows.length > 0 && existingRows[0].report_data) {
        return NextResponse.json(existingRows[0].report_data);
      }
    }

    // Get septic context from Supabase + FDEP (address enables record matching)
    const context = await getSepticContextForLocation(lat, lng, 200, address);

    console.log('SEPTIC_DATA_FETCHED', {
      classification: context.classification,
      confidence: context.confidence,
      isCovered: context.isCovered,
      hasTankPoint: !!context.tankPoint,
      sourcesCount: context.coverageSources?.length || 0,
      featuresCount: context.nearestFeatures?.length || 0,
    });

    // Calculate distance if we have a tank point
    let distance = null;
    if (context.tankPoint) {
      distance = calculateDistance(
        lat,
        lng,
        context.tankPoint.lat,
        context.tankPoint.lng
      );
    }

    // Build report data
    const reportData: any = {
      address,
      lat,
      lng,
      classification: context.classification,
      confidence: context.confidence,
      isCovered: context.isCovered,
      tankPoint: context.tankPoint,
      distance,
      systemInfo: context.systemInfo,
      riskLevel: context.riskLevel,
      sources: context.coverageSources,
      dataQuality: context.dataQuality,
      qualitySource: context.qualitySource,
      generatedAt: new Date().toISOString(),
    };

    // Extract county and state from context for add-on APIs
    const county = context.nearestFeatures?.[0]?.county || undefined;
    const state = context.nearestFeatures?.[0]?.state || undefined;

    // Add Environmental Risk data ONLY if purchased
    if (upsells.includes('environmental')) {
      reportData.environmentalRisk = await getEnvironmentalRiskData(lat, lng, county, state);
    }

    // Add Well & Groundwater Risk data ONLY if purchased
    if (upsells.includes('well')) {
      reportData.groundwaterRisk = await getGroundwaterRiskData(lat, lng, county, state);
    }

    // Save report to database
    await supabase.from('property_reports').insert({
      email: customerEmail,
      address,
      lat,
      lng,
      report_data: reportData,
      stripe_payment_id: isAdminBypass
        ? 'admin_bypass'
        : (paidSession!.payment_intent as string),
      amount_paid: isAdminBypass ? 0 : paidSession!.amount_total,
    });

    return NextResponse.json(reportData);
  } catch (error: any) {
    console.error('Generate report error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}

// Calculate distance between two points in meters
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth's radius in meters
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

// Fetch environmental risk data (flood zones, wetlands, soil type)
async function getEnvironmentalRiskData(lat: number, lng: number, county?: string, state?: string) {
  try {
    const data = await getEnvironmentalRisk(lat, lng, county, state);
    return data;
  } catch (error: any) {
    console.error('ENVIRONMENTAL_DATA_ERROR', error);
    return null;
  }
}

// Fetch well and groundwater risk data
async function getGroundwaterRiskData(lat: number, lng: number, county?: string, state?: string) {
  try {
    const data = await getGroundwaterRisk(lat, lng, county, state);
    return data;
  } catch (error: any) {
    console.error('GROUNDWATER_DATA_ERROR', error);
    return null;
  }
}
