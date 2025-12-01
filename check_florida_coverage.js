const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCoverage() {
  console.log('🔍 FLORIDA DATA COVERAGE ANALYSIS\n');
  console.log('='.repeat(60) + '\n');

  // Total Florida records
  const { count: totalFL } = await supabase
    .from('septic_tanks')
    .select('*', { count: 'exact', head: true })
    .eq('state', 'FL');
  
  console.log(`📊 TOTAL FLORIDA RECORDS: ${totalFL?.toLocaleString()}\n`);

  // Records with valid coordinates (geometry fix completed)
  const { count: validCoords } = await supabase
    .from('septic_tanks')
    .select('*', { count: 'exact', head: true })
    .eq('state', 'FL')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .gte('latitude', 24)
    .lte('latitude', 31)
    .gte('longitude', -87.5)
    .lte('longitude', -80);
  
  console.log(`✅ Records with VALID coordinates: ${validCoords?.toLocaleString()}`);
  console.log(`   (Geometry fix progress: ${((validCoords / totalFL) * 100).toFixed(1)}%)\n`);

  // Records with addresses
  const { count: withAddress } = await supabase
    .from('septic_tanks')
    .select('*', { count: 'exact', head: true })
    .eq('state', 'FL')
    .not('attributes->>SYSTADDR', 'is', null);
  
  console.log(`📍 Records with ADDRESS data: ${withAddress?.toLocaleString()}`);
  console.log(`   (${((withAddress / totalFL) * 100).toFixed(1)}% of total)\n`);

  // Check by county
  console.log('📋 COVERAGE BY COUNTY:\n');
  
  const { data: counties } = await supabase
    .from('septic_tanks')
    .select('county')
    .eq('state', 'FL')
    .not('county', 'is', null);
  
  if (counties) {
    const countyCounts = {};
    counties.forEach(r => {
      const county = r.county;
      countyCounts[county] = (countyCounts[county] || 0) + 1;
    });

    const sorted = Object.entries(countyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    sorted.forEach(([county, count]) => {
      console.log(`   ${county.padEnd(35)} ${count.toLocaleString().padStart(10)} records`);
    });
  }

  // Test RPC function in different regions
  console.log('\n\n🧪 TESTING RPC FUNCTION ACROSS FLORIDA:\n');

  const testLocations = [
    { name: 'Miami (South)', lat: 25.7617, lng: -80.1918 },
    { name: 'Orlando (Central)', lat: 28.5383, lng: -81.3792 },
    { name: 'Tampa (West)', lat: 27.9506, lng: -82.4572 },
    { name: 'Jacksonville (North)', lat: 30.3322, lng: -81.6557 },
    { name: 'Tallahassee (Panhandle)', lat: 30.4383, lng: -84.2807 },
  ];

  for (const loc of testLocations) {
    const { data } = await supabase.rpc('find_nearest_septic_tank', {
      search_lat: loc.lat,
      search_lng: loc.lng,
      radius_meters: 5000
    });
    
    const found = data?.length || 0;
    const status = found > 0 ? '✅' : '❌';
    console.log(`   ${status} ${loc.name.padEnd(25)} ${found} tanks within 5km`);
  }

  console.log('\n' + '='.repeat(60));
}

checkCoverage().catch(console.error);
