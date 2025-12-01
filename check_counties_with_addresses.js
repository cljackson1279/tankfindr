const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCounties() {
  console.log('🔍 Checking which Florida counties have address data...\n');

  // Get sample of records with addresses
  const { data, error } = await supabase
    .from('septic_tanks')
    .select('county, attributes')
    .eq('state', 'FL')
    .not('attributes->>SYSTADDR', 'is', null)
    .limit(50);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('❌ No records with addresses found');
    return;
  }

  // Count by county
  const countiesCounts = {};
  data.forEach(r => {
    const county = r.county || 'Unknown';
    countiesCounts[county] = (countiesCounts[county] || 0) + 1;
  });

  console.log('Counties with address data:');
  Object.entries(countiesCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([county, count]) => {
      console.log(`  ${county}: ${count} records`);
    });

  // Get 3 sample addresses from the most common county
  const topCounty = Object.keys(countiesCounts)[0];
  console.log(`\n\n📍 Sample addresses from ${topCounty}:\n`);

  const samples = data.filter(r => r.county === topCounty).slice(0, 3);
  samples.forEach((r, i) => {
    console.log(`${i + 1}. ${r.attributes.SYSTADDR}`);
    console.log(`   Permit: ${r.attributes.APNO}\n`);
  });
}

checkCounties().catch(console.error);
