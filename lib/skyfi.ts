import { geocodeAddressStrict } from './accurate-geocoder'

interface LocateResult {
  lat: number
  lng: number
  confidence: number
  depth: number
  place_name: string
  address: string
}

// Mock AI detection - make it realistic for property layout
function mockAIDetection(propertyLat: number, propertyLng: number, address: string): Omit<LocateResult, 'place_name' | 'address'> {
  // Septic tanks are typically:
  // 1. 10-30 feet from house (not property center)
  // 2. Downhill from house
  // 3. In line with plumbing stack
  
  const hash = address.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  // Place tank ~20 feet from property center in a consistent direction
  const distance = 0.0002 // ~20 feet in degrees (roughly)
  const angle = (Math.abs(hash) % 360) * Math.PI / 180 // Convert to radians
  
  return {
    lat: propertyLat + Math.sin(angle) * distance,
    lng: propertyLng + Math.cos(angle) * distance,
    confidence: 80 + (Math.abs(hash) % 15),
    depth: 2.5 + (Math.abs(hash) % 2)
  }
}

export async function locateTank(address: string): Promise<LocateResult> {
  console.log(`🛰️ Locating: "${address}"`)
  
  try {
    // 1. STRICT geocoding to property
    const { lat, lng, place_name } = await geocodeAddressStrict(address)
    console.log(`📍 Property location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    console.log(`📍 Place name: ${place_name}`)
    
    // Simulate API delay (1 second for "AI analysis")
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 2. Mock AI detection
    const result = mockAIDetection(lat, lng, address)
    
    return {
      ...result,
      place_name,
      address
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    throw new Error(`Could not locate address: ${address}. Please check the format and try again.`)
  }
}

// Real SkyFi API implementation (uncomment when API key is available)
/*
export async function locateTank(address: string): Promise<LocateResult> {
  // First geocode the address
  const { lat, lng, place_name } = await geocodeAddressStrict(address)
  
  // Then call SkyFi API with coordinates
  const response = await fetch('https://api.skyfi.com/v1/locate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SKYFI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      latitude: lat,
      longitude: lng,
      address: place_name
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to locate tank')
  }
  
  const data = await response.json()
  return {
    lat: data.latitude,
    lng: data.longitude,
    confidence: data.confidence_score,
    depth: data.estimated_depth,
    place_name,
    address
  }
}
*/
