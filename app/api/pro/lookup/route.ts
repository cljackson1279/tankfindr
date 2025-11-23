import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSepticContextForLocation, logLookup } from '@/lib/septicLookup';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, address, lat, lng } = await request.json();

    if (!userId || !address || !lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Check user's subscription and usage limits
    // For now, allow all lookups

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

    // Build result summary
    const resultSummary = {
      classification: context.classification,
      confidence: context.confidence,
      isCovered: context.isCovered,
      tankPoint: context.tankPoint,
      distance,
      systemInfo: context.systemInfo,
      riskLevel: context.riskLevel,
      sources: context.coverageSources,
    };

    // Save to job history
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

    // Log the lookup
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
