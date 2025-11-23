import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lng, address } = body;

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Search within 200 meters radius (as specified in the document)
    const searchRadiusMeters = 200;

    console.log(`🔍 Searching for septic tank near: ${lat}, ${lng}`);

    // Use PostGIS to find the nearest septic tank within radius
    const { data, error } = await supabase.rpc('find_nearest_septic_tank', {
      search_lat: lat,
      search_lng: lng,
      search_radius_meters: searchRadiusMeters
    });

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        { error: 'Database query failed', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      console.log('❌ No septic tank found within radius');
      return NextResponse.json({
        found: false,
        message: "No septic data available for this property/county yet. We're constantly adding more counties - join the waitlist to be notified when your area is covered!",
        metadata: {
          searched_location: { lat, lng },
          search_radius_meters: searchRadiusMeters
        }
      });
    }

    const tank = data[0];
    const distanceMeters = tank.distance_meters;

    // Calculate confidence based on distance (as specified in the document)
    let confidence: number;
    if (distanceMeters < 15) {
      confidence = 0.9;
    } else if (distanceMeters < 30) {
      confidence = 0.75;
    } else if (distanceMeters < 50) {
      confidence = 0.6;
    } else {
      confidence = 0.5;
    }

    console.log(`✅ Found tank: ${tank.address} (${distanceMeters.toFixed(1)}m away, confidence: ${confidence})`);

    // Extract coordinates from PostGIS geometry
    const tankLocation = {
      lat: tank.lat,
      lng: tank.lng
    };

    return NextResponse.json({
      found: true,
      confidence,
      tank_location: tankLocation,
      distance_meters: parseFloat(distanceMeters.toFixed(1)),
      metadata: {
        county: tank.county,
        state: tank.state,
        source: tank.data_source,
        parcel_id: tank.parcel_id,
        address_on_record: tank.address,
        attributes: tank.attributes
      }
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
