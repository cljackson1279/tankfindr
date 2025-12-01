const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cijtllcbrvkbvrjriweu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpanRsbGNicnZrYnZyanJpd2V1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzY3NzE2NiwiZXhwIjoyMDc5MjUzMTY2fQ.c2QSUiwxAa5xh1-mzrS1_WyNCUb9CDmOENfkxkDDvz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPermit() {
  // Search for the specific permit
  const { data, error } = await supabase
    .from('septic_tanks')
    .select('*')
    .eq('state', 'FL')
    .limit(10000);

  if (error) {
    console.error('Error:', error);
    return;
  }

  const permit = data.find(r => r.attributes?.APNO === 'AP528688');
  
  if (permit) {
    console.log('Found permit AP528688:');
    console.log('\nFull attributes:');
    console.log(JSON.stringify(permit.attributes, null, 2));
    console.log('\nKey fields:');
    console.log('  APNO:', permit.attributes.APNO);
    console.log('  COMRESID:', permit.attributes.COMRESID);
    console.log('  SYSTTYPE:', permit.attributes.SYSTTYPE);
    console.log('  SYSTADDR:', permit.attributes.SYSTADDR);
    console.log('  CITY:', permit.attributes.CITY);
  } else {
    console.log('Permit AP528688 not found in first 10,000 records');
  }
}

checkPermit().catch(console.error);
