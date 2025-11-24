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

    // Get septic context from REAL Supabase data
    console.log('COVERAGE_CHECK', {
      lat,
      lng,
      dataSource: 'supabase',
      fromTables: ['septic_sources']
    });

    const context = await getSepticContextForLocation(lat, lng);

    console.log('COVERAGE_RESULT', {
      isCovered: context.isCovered,
      classification: context.classification,
      sourcesCount: context.coverageSources?.length || 0
    });

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
