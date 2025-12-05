const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function queryAddress() {
  console.log("Searching for: 5155 SW 6 Court, Plantation FL 33317");
  console.log("=".repeat(80));

  // Try different address variations in septic_tanks table
  const variations = [
    "%5155%",
    "%SW 6%Court%",
    "%Plantation%"
  ];

  for (const variation of variations) {
    console.log(`\nSearching septic_tanks with pattern: ${variation}`);
    
    const { data, error } = await supabase
      .from('septic_tanks')
      .select('*')
      .ilike('address', variation)
      .limit(20);

    if (error) {
      console.log(`Error: ${error.message}`);
      continue;
    }

    if (data && data.length > 0) {
      console.log(`Found ${data.length} records:`);
      data.forEach((record, i) => {
        console.log(`\n[${i+1}] ${"-".repeat(76)}`);
        console.log(`Address: ${record.address || 'N/A'}`);
        console.log(`County: ${record.county || 'N/A'}, State: ${record.state || 'N/A'}`);
        console.log(`Coordinates: ${record.lat || 'N/A'}, ${record.lng || 'N/A'}`);
        console.log(`Parcel ID: ${record.parcel_id || 'N/A'}`);
        console.log(`Source: ${record.data_source || 'N/A'}`);
        if (record.attributes) {
          console.log(`Attributes:`, JSON.stringify(record.attributes, null, 2));
        }
      });
    } else {
      console.log("No records found");
    }
  }

  console.log("\n" + "=".repeat(80));
}

queryAddress().then(() => process.exit(0));
