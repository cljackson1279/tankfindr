require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMiamiAddress() {
  const lat = 25.8464708;
  const lng = -80.2180634;
  const radiusMeters = 200;
  
  console.log('Testing lookup for 1234 NW 79th Street, Miami, FL');
  console.log('Coordinates:', lat, lng);
  console.log('Search radius:', radiusMeters, 'm\n');
  
  // Find nearest features
  const { data: features, error } = await supabase.rpc('find_nearest_septic_tank', {
    search_lat: lat,
    search_lng: lng,
    search_radius_meters: radiusMeters,
  });
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Found', features.length, 'septic records within', radiusMeters, 'm');
  
  if (features.length > 0) {
    const nearest = features[0];
    console.log('\nNearest septic system:');
    console.log('- Distance:', Math.round(nearest.distance_meters), 'm');
    console.log('- County:', nearest.county);
    console.log('- State:', nearest.state);
    console.log('- Address:', nearest.address || 'Not available');
    console.log('- Parcel ID:', nearest.parcel_id || 'Not available');
    console.log('- Attributes:', JSON.stringify(nearest.attributes, null, 2));
    
    // Determine classification
    const distance = nearest.distance_meters;
    let classification, confidence;
    
    if (distance < 30) {
      classification = 'septic';
      confidence = 'high';
    } else if (distance < 75) {
      classification = 'septic';
      confidence = 'medium';
    } else if (distance < 200) {
      classification = 'likely_septic';
      confidence = 'low';
    } else {
      classification = 'sewer';
      confidence = 'medium';
    }
    
    console.log('\nClassification:', classification);
    console.log('Confidence:', confidence);
  } else {
    console.log('\nNo septic systems found - likely on sewer system');
  }
}

testMiamiAddress();
