import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getSepticContextForLocation } from '@/lib/septicLookup';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { sessionId, address, lat, lng, adminEmail, upsells: adminUpsells } = await request.json();

    if (!sessionId || !address || !lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Admin bypass - skip payment verification
    const isAdminBypass = adminEmail === 'cljackson79@gmail.com' && sessionId === 'admin_bypass';
    let customerEmail = 'unknown';

    if (isAdminBypass) {
      console.log('ADMIN_BYPASS_REPORT', {
        adminEmail,
        address,
        skipPaymentVerification: true,
        dataSource: 'supabase'
      });
      customerEmail = adminEmail;
    } else {
      // Verify payment session for non-admin users
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        return NextResponse.json(
          { error: 'Payment not completed' },
          { status: 400 }
        );
      }
      customerEmail = session.customer_details?.email || 'unknown';
    }

    // Get septic context from REAL Supabase data
    console.log('FETCHING_SEPTIC_DATA', {
      lat,
      lng,
      dataSource: 'supabase',
      fromTables: ['septic_sources', 'septic_tanks']
    });

    const context = await getSepticContextForLocation(lat, lng);

    console.log('SEPTIC_DATA_FETCHED', {
      classification: context.classification,
      confidence: context.confidence,
      isCovered: context.isCovered,
      hasTankPoint: !!context.tankPoint,
      sourcesCount: context.coverageSources?.length || 0,
      featuresCount: context.nearestFeatures?.length || 0
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

    // Check if this is a paid session with upsells or admin bypass with upsells
    let upsells: string[] = [];
    if (isAdminBypass) {
      // Admin bypass - use upsells passed directly
      upsells = adminUpsells || [];
    } else {
      // Paid session - get upsells from Stripe metadata
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.metadata?.upsells) {
        try {
          upsells = JSON.parse(session.metadata.upsells);
        } catch (e) {
          console.error('Failed to parse upsells:', e);
        }
      }
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
      generatedAt: new Date().toISOString(),
      dataSource: 'supabase', // Debug indicator
      tablesUsed: ['septic_sources', 'septic_tanks'], // Debug indicator
    };

    // Add Environmental Risk data ONLY if user selected it (or pass upsells for admin testing)
    if (upsells.includes('environmental')) {
      console.log('FETCHING_ENVIRONMENTAL_DATA', { lat, lng, userPaid: true });
      reportData.environmentalRisk = await getEnvironmentalRiskData(lat, lng);
    }

    // Add Well & Groundwater Risk data ONLY if user selected it
    if (upsells.includes('well')) {
      console.log('FETCHING_WELL_DATA', { lat, lng, userPaid: true });
      reportData.groundwaterRisk = await getGroundwaterRiskData(lat, lng);
    }

    // Save report to database (skip for admin bypass or save with admin flag)
    if (!isAdminBypass) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      await supabase.from('property_reports').insert({
        email: customerEmail,
        address,
        lat,
        lng,
        report_data: reportData,
        stripe_payment_id: session.payment_intent as string,
        amount_paid: session.amount_total,
      });
    } else {
      // Still log admin reports for audit purposes
      await supabase.from('property_reports').insert({
        email: customerEmail,
        address,
        lat,
        lng,
        report_data: reportData,
        stripe_payment_id: 'admin_bypass',
        amount_paid: 0,
      });
    }

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
async function getEnvironmentalRiskData(lat: number, lng: number) {
  // TODO: Integrate with FEMA Flood Map API, USGS Soil Data, etc.
  // Returning null until real APIs are integrated
  
  console.log('ENVIRONMENTAL_RISK_NOT_AVAILABLE', {
    lat,
    lng,
    note: 'Environmental risk data not yet available - integrate FEMA/USGS APIs'
  });

  return null;
}

// Fetch well and groundwater risk data
async function getGroundwaterRiskData(lat: number, lng: number) {
  // TODO: Integrate with USGS National Water Information System, state well databases
  // Returning null until real APIs are integrated
  
  console.log('GROUNDWATER_RISK_NOT_AVAILABLE', {
    lat,
    lng,
    note: 'Groundwater risk data not yet available - integrate USGS/state well databases'
  });

  return null;
}
