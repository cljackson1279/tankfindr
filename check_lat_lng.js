const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('🔍 Checking latitude/longitude population\n');
  
  // Sample some Florida records to see their coordinates
  const { data, error } = await supabase
    .from('septic_tanks')
    .select('id, county, latitude, longitude, geom_fixed')
    .eq('state', 'FL')
    .not('county', 'is', null)
    .limit(20);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sample of 20 Florida records:\n');
  data.forEach((r, i) => {
    const hasLatLng = r.latitude !== null && r.longitude !== null;
    const hasGeomFixed = r.geom_fixed !== null;
    const status = hasLatLng ? '✅' : '❌';
    console.log(`${i+1}. ${status} County: ${r.county || 'Unknown'} | Lat: ${r.latitude} | Lng: ${r.longitude} | geom_fixed: ${hasGeomFixed ? 'Yes' : 'No'}`);
  });
}

check().catch(console.error);
