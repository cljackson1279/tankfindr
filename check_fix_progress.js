const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProgress() {
  console.log('🔍 GEOMETRY FIX PROGRESS CHECK\n');
  console.log('='.repeat(60) + '\n');

  // Total records
  const { count: total } = await supabase
    .from('septic_tanks')
    .select('*', { count: 'exact', head: true })
    .eq('state', 'FL');

  console.log(`📊 Total Florida records: ${total?.toLocaleString()}\n`);

  // Records with coordinates in valid Florida range
  const { count: fixed } = await supabase
    .from('septic_tanks')
    .select('*', { count: 'exact', head: true })
    .eq('state', 'FL')
    .gte('latitude', 24)
    .lte('latitude', 31);

  const percent = ((fixed / total) * 100).toFixed(1);
  console.log(`✅ Records with FIXED coordinates: ${fixed?.toLocaleString()} (${percent}%)`);
  console.log(`⏳ Records still BROKEN: ${(total - fixed)?.toLocaleString()} (${(100 - percent).toFixed(1)}%)\n`);

  // Estimate completion
  if (percent > 0 && percent < 100) {
    const runsCompleted = Math.floor(fixed / 500);
    const totalRuns = Math.ceil(total / 500);
    const runsRemaining = totalRuns - runsCompleted;
    const minutesRemaining = Math.ceil((runsRemaining * 10) / 60);
    
    console.log(`📈 Progress: Run ${runsCompleted} of ~${totalRuns}`);
    console.log(`⏱️  Estimated time remaining: ~${minutesRemaining} minutes\n`);
  }

  // Check which regions are working
  console.log('🗺️  REGIONAL COVERAGE:\n');

  const regions = [
    { name: 'South Florida (Miami)', lat: 25.7617, lng: -80.1918 },
    { name: 'Southeast (Fort Lauderdale)', lat: 26.1224, lng: -80.1373 },
    { name: 'Southwest (Naples)', lat: 26.1420, lng: -81.7948 },
    { name: 'Central (Orlando)', lat: 28.5383, lng: -81.3792 },
    { name: 'West (Tampa)', lat: 27.9506, lng: -82.4572 },
    { name: 'Northeast (Jacksonville)', lat: 30.3322, lng: -81.6557 },
    { name: 'Panhandle (Tallahassee)', lat: 30.4383, lng: -84.2807 },
  ];

  for (const region of regions) {
    const { data } = await supabase.rpc('find_nearest_septic_tank', {
      search_lat: region.lat,
      search_lng: region.lng,
      radius_meters: 10000
    });
    
    const count = data?.length || 0;
    const status = count > 0 ? '✅' : '❌';
    console.log(`   ${status} ${region.name.padEnd(35)} ${count.toString().padStart(4)} tanks`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 TIP: Regions showing ✅ have been fixed and are ready to test!');
  console.log('   Regions showing ❌ are still waiting for geometry fix.\n');
}

checkProgress().catch(console.error);
