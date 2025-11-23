import { NextRequest, NextResponse } from 'next/server';
import { getSepticContextForLocation } from '@/lib/septicLookup';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Invalid lat/lng parameters' },
        { status: 400 }
      );
    }

    // Get septic context
    const context = await getSepticContextForLocation(lat, lng);

    return NextResponse.json({
      isCovered: context.isCovered,
      sources: context.coverageSources.map(s => ({
        name: s.name,
        state: s.state,
        county: s.county,
        quality: s.quality,
      })),
      confidence: context.confidence,
      classification: context.classification,
    });
  } catch (error) {
    console.error('Coverage check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
