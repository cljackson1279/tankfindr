const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findTestAddresses() {
  console.log('🔍 Finding test addresses in different Florida regions...\n');

  // North Florida (Panhandle)
  console.log('📍 NORTH FLORIDA (Panhandle):');
  const { data: north, error: northError } = await supabase.rpc('find_nearest_septic_tank', {
    search_lat: 30.4383,
    search_lng: -84.2807,
    radius_meters: 50000
  });
  
  if (north && north.length > 0) {
    const record = north[0];
    console.log(`Address: ${record.attributes.SYSTADDR || 'N/A'}`);
    console.log(`Permit: ${record.attributes.APNO || 'N/A'}`);
    console.log(`County: ${record.county || 'N/A'}`);
    console.log(`Distance: ${Math.round(record.distance)} meters`);
    console.log(`Coordinates: ${record.latitude}, ${record.longitude}`);
  }

  console.log('\n📍 CENTRAL FLORIDA (Orlando area):');
  const { data: central, error: centralError } = await supabase.rpc('find_nearest_septic_tank', {
    search_lat: 28.5383,
    search_lng: -81.3792,
    radius_meters: 50000
  });
  
  if (central && central.length > 0) {
    const record = central[0];
    console.log(`Address: ${record.attributes.SYSTADDR || 'N/A'}`);
    console.log(`Permit: ${record.attributes.APNO || 'N/A'}`);
    console.log(`County: ${record.county || 'N/A'}`);
    console.log(`Distance: ${Math.round(record.distance)} meters`);
    console.log(`Coordinates: ${record.latitude}, ${record.longitude}`);
  }

  console.log('\n📍 SOUTHWEST FLORIDA (Naples/Fort Myers area):');
  const { data: southwest, error: swError } = await supabase.rpc('find_nearest_septic_tank', {
    search_lat: 26.1420,
    search_lng: -81.7948,
    radius_meters: 50000
  });
  
  if (southwest && southwest.length > 0) {
    const record = southwest[0];
    console.log(`Address: ${record.attributes.SYSTADDR || 'N/A'}`);
    console.log(`Permit: ${record.attributes.APNO || 'N/A'}`);
    console.log(`County: ${record.county || 'N/A'}`);
    console.log(`Distance: ${Math.round(record.distance)} meters`);
    console.log(`Coordinates: ${record.latitude}, ${record.longitude}`);
  }

  console.log('\n✅ Done!');
}

findTestAddresses().catch(console.error);
