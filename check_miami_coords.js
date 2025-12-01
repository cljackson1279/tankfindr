const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMiami() {
  console.log('🔍 Checking Miami coordinates...\n');

  // Use RPC to find tanks near Miami
  const { data, error } = await supabase.rpc('find_nearest_septic_tank', {
    search_lat: 25.7617,
    search_lng: -80.1918,
    radius_meters: 10000
  });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${data?.length || 0} tanks near Miami\n`);

  if (data && data.length > 0) {
    console.log('Sample coordinates:');
    data.slice(0, 5).forEach((tank, i) => {
      console.log(`${i + 1}. Lat: ${tank.latitude}, Lng: ${tank.longitude}`);
      console.log(`   Distance: ${Math.round(tank.distance)}m`);
      console.log(`   Permit: ${tank.attributes?.APNO || 'N/A'}\n`);
    });

    // Check coordinate ranges
    const lats = data.map(t => t.latitude).filter(l => l != null);
    const lngs = data.map(t => t.longitude).filter(l => l != null);

    if (lats.length > 0) {
      console.log(`Latitude range: ${Math.min(...lats).toFixed(4)} to ${Math.max(...lats).toFixed(4)}`);
      console.log(`Longitude range: ${Math.min(...lngs).toFixed(4)} to ${Math.max(...lngs).toFixed(4)}`);
    }
  } else {
    console.log('❌ No tanks found near Miami');
  }
}

checkMiami().catch(console.error);
