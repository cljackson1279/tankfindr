const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cijtllcbrvkbvrjriweu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpanRsbGNicnZrYnZyanJpd2V1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzY3NzE2NiwiZXhwIjoyMDc5MjUzMTY2fQ.c2QSUiwxAa5xh1-mzrS1_WyNCUb9CDmOENfkxkDDvz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCounties() {
  // Get unique county names for Florida
  const { data, error } = await supabase
    .from('septic_tanks')
    .select('county, state')
    .eq('state', 'FL')
    .limit(1000);

  if (error) {
    console.error('Error:', error);
    return;
  }

  const uniqueCounties = [...new Set(data.map(r => r.county))].sort();
  console.log('Florida counties in database:');
  uniqueCounties.forEach(county => {
    const count = data.filter(r => r.county === county).length;
    console.log(`  ${county} (${count} in sample)`);
  });

  // Now check if we can find the specific permit
  console.log('\n\nSearching for permit AP1267843...');
  const { data: permitData, error: permitError } = await supabase
    .from('septic_tanks')
    .select('id, county, state, attributes')
    .eq('state', 'FL')
    .limit(10000);

  if (permitError) {
    console.error('Permit search error:', permitError);
    return;
  }

  const found = permitData.filter(r => 
    r.attributes?.PERMIT_NUMBER === 'AP1267843' ||
    r.attributes?.permit_number === 'AP1267843' ||
    r.attributes?.PermitNumber === 'AP1267843' ||
    JSON.stringify(r.attributes).includes('AP1267843')
  );

  console.log(`Found ${found.length} records with permit AP1267843`);
  found.forEach(record => {
    console.log('\nRecord:', {
      id: record.id,
      county: record.county,
      permit: record.attributes?.PERMIT_NUMBER || record.attributes?.permit_number,
      address: record.attributes?.SITE_ADDRESS_FULL || record.attributes?.address
    });
  });
}

checkCounties().catch(console.error);
