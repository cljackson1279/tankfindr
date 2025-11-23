export async function geocodeAddressStrict(address: string): Promise<{lat: number, lng: number, place_name: string}> {
  // PARSE address into components
  const parts = address.split(',').map(p => p.trim())
  const street = parts[0] || ''
  const city = parts[1] || ''
  const stateZip = parts[2] || ''
  const state = stateZip.split(' ')[0] || ''
  const zip = stateZip.split(' ')[1] || ''

  // Build structured query (THIS IS THE KEY)
  const query = `${encodeURIComponent(street)}`
  
  const params = new URLSearchParams({
    access_token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN!,
    country: 'us',
    types: 'address',
    limit: '1'
  })

  // Add city/state filtering if available
  if (city && state) {
    const bbox = getCityBoundingBox(city, state)
    if (bbox) {
      params.append('bbox', bbox)
    }
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?${params.toString()}`
  
  console.log('🎯 FINAL GEOCODE URL:', url)
  console.log('🎯 ADDRESS PARTS:', { street, city, state, zip })

  const res = await fetch(url)
  const data = await res.json()
  
  console.log('🎯 MAPBOX RESPONSE:', data)

  if (!data.features?.length) {
    throw new Error(`Address not found: "${address}". Try: "123 Main St, City, ST ZIP"`)
  }

  const feature = data.features[0]
  const [lng, lat] = feature.center

  // VALIDATION: If result is not in expected state, WARN
  const context = feature.context || []
  const resultState = context.find((c: any) => c.id?.includes('region'))?.short_code || ''
  
  if (state && !resultState.includes(state)) {
    console.warn(`⚠️ Geocoding mismatch! Expected ${state}, got ${resultState}`)
    console.warn(`Result: ${feature.place_name}`)
  }

  return {
    lat,
    lng,
    place_name: feature.place_name
  }
}

// Helper: Get approximate bounding box for city/state
function getCityBoundingBox(city: string, state: string): string | null {
  // Predefined city centers (add your target cities)
  const cityBoxes: Record<string, string> = {
    'washington': '-77.2,38.8,-76.9,39.0',
    'new york': '-74.3,40.5,-73.7,40.9',
    'seattle': '-122.5,47.5,-122.2,47.8',
    'chicago': '-87.9,41.7,-87.5,42.0',
    'los angeles': '-118.7,33.7,-118.1,34.3',
    'san francisco': '-122.5,37.7,-122.3,37.8',
    'boston': '-71.2,42.3,-71.0,42.4',
    'miami': '-80.3,25.7,-80.1,25.9',
    'atlanta': '-84.5,33.7,-84.3,33.8',
    'dallas': '-97.0,32.7,-96.7,32.9',
    'houston': '-95.5,29.7,-95.2,29.9',
    'phoenix': '-112.2,33.4,-111.9,33.6'
  }
  
  const key = city.toLowerCase()
  return cityBoxes[key] || null
}
