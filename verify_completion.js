const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verify() {
  console.log('🔍 VERIFYING FLORIDA GEOMETRY FIX\n');
  console.log('='.repeat(70) + '\n');

  // Check remaining unfixed records
  const { count: remaining } = await supabase
    .from('septic_tanks')
    .select('*', { count: 'exact', head: true })
    .eq('state', 'FL')
    .is('geom_fixed', null);

  // Check total fixed records
  const { count: fixed } = await supabase
    .from('septic_tanks')
    .select('*', { count: 'exact', head: true })
    .eq('state', 'FL')
    .not('geom_fixed', 'is', null);

  // Check records with valid lat/lng
  const { count: withCoords } = await supabase
    .from('septic_tanks')
    .select('*', { count: 'exact', head: true })
    .eq('state', 'FL')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  console.log('📊 RESULTS:\n');
  console.log(`   ✅ Fixed records: ${(fixed || 0).toLocaleString()}`);
  console.log(`   ✅ Records with lat/lng: ${(withCoords || 0).toLocaleString()}`);
  console.log(`   ⏳ Remaining unfixed: ${(remaining || 0).toLocaleString()}\n`);

  if (remaining === 0) {
    console.log('🎉 SUCCESS! All Florida records have been fixed!\n');
  } else {
    console.log(`⚠️  Still ${remaining.toLocaleString()} records to process.\n`);
  }

  console.log('='.repeat(70));
}

verify().catch(console.error);
