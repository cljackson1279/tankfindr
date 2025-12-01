const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getTestAddresses() {
  console.log('🔍 Finding test addresses with septic systems...\n');

  // Get records from different regions
  const { data, error } = await supabase
    .from('septic_tanks')
    .select('*')
    .not('attributes->>SYSTADDR', 'is', null)
    .not('attributes->>APNO', 'is', null)
    .eq('state', 'FL')
    .limit(100);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No records found');
    return;
  }

  // Group by latitude ranges for different regions
  const north = data.filter(r => r.latitude > 29.5); // North Florida
  const central = data.filter(r => r.latitude >= 27.5 && r.latitude <= 29.5); // Central
  const south = data.filter(r => r.latitude < 27.5); // South Florida

  console.log('📍 NORTH FLORIDA:');
  if (north.length > 0) {
    const record = north[0];
    console.log(`Address: ${record.attributes.SYSTADDR}`);
    console.log(`Permit: ${record.attributes.APNO}`);
    console.log(`County: ${record.county}`);
    console.log(`Coordinates: ${record.latitude}, ${record.longitude}\n`);
  }

  console.log('📍 CENTRAL FLORIDA:');
  if (central.length > 0) {
    const record = central[0];
    console.log(`Address: ${record.attributes.SYSTADDR}`);
    console.log(`Permit: ${record.attributes.APNO}`);
    console.log(`County: ${record.county}`);
    console.log(`Coordinates: ${record.latitude}, ${record.longitude}\n`);
  }

  console.log('📍 SOUTH FLORIDA:');
  if (south.length > 0) {
    const record = south[0];
    console.log(`Address: ${record.attributes.SYSTADDR}`);
    console.log(`Permit: ${record.attributes.APNO}`);
    console.log(`County: ${record.county}`);
    console.log(`Coordinates: ${record.latitude}, ${record.longitude}\n`);
  }
}

getTestAddresses().catch(console.error);
