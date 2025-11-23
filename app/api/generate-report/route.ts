import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getSepticContextForLocation } from '@/lib/septicLookup';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { sessionId, address, lat, lng } = await request.json();

    if (!sessionId || !address || !lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify payment session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get septic context
    const context = await getSepticContextForLocation(lat, lng);

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
    const reportData = {
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
    };

    // Save report to database
    await supabase.from('property_reports').insert({
      email: session.customer_details?.email || 'unknown',
      address,
      lat,
      lng,
      report_data: reportData,
      stripe_payment_id: session.payment_intent as string,
      amount_paid: session.amount_total,
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
