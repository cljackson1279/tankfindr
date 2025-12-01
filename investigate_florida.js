const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function investigate() {
  console.log('🔍 INVESTIGATING FLORIDA DATA\n');
  console.log('='.repeat(70) + '\n');

  // Check total records by latitude range
  console.log('📊 RECORDS BY LATITUDE RANGE:\n');

  const ranges = [
    { name: 'South (24-26°) - Miami/Keys', min: 24, max: 26 },
    { name: 'Southeast (26-27°) - Fort Lauderdale', min: 26, max: 27 },
    { name: 'Central-South (27-28°) - West Palm/Fort Myers', min: 27, max: 28 },
    { name: 'Central (28-29°) - Orlando/Tampa', min: 28, max: 29 },
    { name: 'North-Central (29-30°) - Ocala/Gainesville', min: 29, max: 30 },
    { name: 'North (30-31°) - Jacksonville/Tallahassee', min: 30, max: 31 },
  ];

  for (const range of ranges) {
    const { count } = await supabase
      .from('septic_tanks')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'FL')
      .gte('latitude', range.min)
      .lt('latitude', range.max);
    
    const status = count > 0 ? '✅' : '❌';
    console.log(`   ${status} ${range.name.padEnd(45)} ${(count || 0).toLocaleString().padStart(10)} records`);
  }

  // Check records with NULL or invalid coordinates
  console.log('\n\n🔍 COORDINATE STATUS:\n');

  const { count: nullCoords } = await supabase
    .from('septic_tanks')
    .select('*', { count: 'exact', head: true })
    .eq('state', 'FL')
    .is('latitude', null);

  const { count: invalidCoords } = await supabase
    .from('septic_tanks')
    .select('*', { count: 'exact', head: true })
    .eq('state', 'FL')
    .not('latitude', 'is', null)
    .or('latitude.lt.24,latitude.gt.31');

  console.log(`   ❌ NULL coordinates: ${nullCoords?.toLocaleString()}`);
  console.log(`   ❌ Invalid coordinates (outside FL): ${invalidCoords?.toLocaleString()}`);

  // Sample some records to see their actual data
  console.log('\n\n📋 SAMPLE RECORDS FROM DIFFERENT REGIONS:\n');

  const { data: samples } = await supabase
    .from('septic_tanks')
    .select('latitude, longitude, county, state, attributes')
    .eq('state', 'FL')
    .limit(10);

  if (samples && samples.length > 0) {
    samples.slice(0, 3).forEach((r, i) => {
      console.log(`${i + 1}. County: ${r.county || 'N/A'}`);
      console.log(`   Coordinates: ${r.latitude}, ${r.longitude}`);
      console.log(`   Has APNO: ${r.attributes?.APNO ? 'Yes' : 'No'}`);
      console.log(`   Has Address: ${r.attributes?.SYSTADDR ? 'Yes' : 'No'}\n`);
    });
  }

  console.log('='.repeat(70));
}

investigate().catch(console.error);
