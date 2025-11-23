export async function geocodeAddressStrict(address: string): Promise<{lat: number, lng: number, place_name: string}> {
  // Clean and encode the FULL address (don't split it)
  const cleanAddress = address.trim()
  const query = encodeURIComponent(cleanAddress)
  
  const params = new URLSearchParams({
    access_token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN!,
    country: 'us',
    types: 'address',
    limit: '1'
  })

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?${params.toString()}`
  
  console.log('🎯 GEOCODING ADDRESS:', cleanAddress)
  console.log('🎯 MAPBOX URL:', url)

  const res = await fetch(url)
  
  if (!res.ok) {
    console.error('Mapbox API error:', res.status, res.statusText)
    throw new Error(`Geocoding API error: ${res.status}`)
  }
  
  const data = await res.json()
  
  console.log('🎯 MAPBOX RESPONSE:', JSON.stringify(data, null, 2))

  if (!data.features?.length) {
    console.error('No results found for address:', cleanAddress)
    throw new Error(`Address not found: "${address}". Please verify the address and try again.`)
  }

  const feature = data.features[0]
  const [lng, lat] = feature.center

  console.log('✅ GEOCODED TO:', {
    lat,
    lng,
    place_name: feature.place_name,
    relevance: feature.relevance
  })

  // Warn if relevance is low (might be approximate)
  if (feature.relevance < 0.8) {
    console.warn(`⚠️ Low relevance score (${feature.relevance}). Result might be approximate.`)
  }

  return {
    lat,
    lng,
    place_name: feature.place_name
  }
}
