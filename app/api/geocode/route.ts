import { NextRequest, NextResponse } from 'next/server';

async function geocodeAddress(address: string) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  
  if (!mapboxToken) {
    throw new Error('Mapbox token not configured');
  }

  // Use Mapbox Geocoding API
  const encodedAddress = encodeURIComponent(address);
  const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1`;

  const response = await fetch(geocodeUrl);
  
  if (!response.ok) {
    throw new Error('Geocoding failed');
  }

  const data = await response.json();

  if (!data.features || data.features.length === 0) {
    throw new Error('Address not found');
  }

  const [lng, lat] = data.features[0].center;
  const placeName = data.features[0].place_name;

  return {
    lat,
    lng,
    formatted_address: placeName
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const result = await geocodeAddress(address);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Geocoding failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const result = await geocodeAddress(address);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Geocoding failed', details: error.message },
      { status: 500 }
    );
  }
}
