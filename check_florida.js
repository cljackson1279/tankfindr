const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cijtllcbrvkbvrjriweu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpanRsbGNicnZrYnZyanJpd2V1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzY3NzE2NiwiZXhwIjoyMDc5MjUzMTY2fQ.c2QSUiwxAa5xh1-mzrS1_WyNCUb9CDmOENfkxkDDvz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFlorida() {
  // Check if the specific permit exists
  const { data, error } = await supabase
    .from('septic_tanks')
    .select('id, county, state, geom, attributes')
    .eq('state', 'FL')
    .eq('county', 'Miami-Dade')
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Found', data.length, 'Miami-Dade records');
  data.forEach((record, i) => {
    console.log(`\nRecord ${i + 1}:`);
    console.log('  ID:', record.id);
    console.log('  County:', record.county);
    console.log('  Permit:', record.attributes?.PERMIT_NUMBER || 'N/A');
    console.log('  Address:', record.attributes?.SITE_ADDRESS_FULL || 'N/A');
    console.log('  Geom type:', typeof record.geom);
    console.log('  Geom value:', JSON.stringify(record.geom).substring(0, 200));
  });

  // Now test the RPC function
  console.log('\n\n=== Testing RPC function ===');
  const { data: rpcData, error: rpcError } = await supabase.rpc('find_nearest_septic_tank', {
    search_lat: 25.8504,
    search_lng: -80.2105,
    search_radius_meters: 500
  });

  if (rpcError) {
    console.error('RPC Error:', rpcError);
    return;
  }

  console.log('RPC found', rpcData?.length || 0, 'tanks near 1234 NW 79th Street');
  if (rpcData && rpcData.length > 0) {
    console.log('\nNearest tank:');
    console.log('  Distance:', rpcData[0].distance_meters, 'meters');
    console.log('  County:', rpcData[0].county);
    console.log('  Permit:', rpcData[0].attributes?.PERMIT_NUMBER || 'N/A');
    console.log('  Address:', rpcData[0].attributes?.SITE_ADDRESS_FULL || 'N/A');
  }
}

checkFlorida().catch(console.error);
