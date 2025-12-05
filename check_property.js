const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProperty() {
  const address = "5155 SW 6 Court, Plantation FL";
  console.log(`Searching for: ${address}`);
  console.log("=".repeat(80));

  const variations = [
    "%5155%SW%6%Court%",
    "%5155%SW%6th%Court%",
    "%5155 SW 6%",
    "%5155%Plantation%"
  ];

  for (const variation of variations) {
    console.log(`\nSearching with pattern: ${variation}`);
    
    const { data, error } = await supabase
      .from('florida_permits')
      .select('*')
      .ilike('address', variation)
      .limit(10);

    if (error) {
      console.log(`Error: ${error.message}`);
      continue;
    }

    if (data && data.length > 0) {
      console.log(`Found ${data.length} records:`);
      data.forEach(record => {
        console.log("\n" + "-".repeat(80));
        console.log(`Address: ${record.address}`);
        console.log(`County: ${record.county}`);
        console.log(`Permit Number: ${record.permit_number || 'N/A'}`);
        console.log(`System Type: ${record.system_type || 'N/A'}`);
        console.log(`Classification: ${record.classification || 'N/A'}`);
        console.log(`Latitude: ${record.latitude || 'N/A'}`);
        console.log(`Longitude: ${record.longitude || 'N/A'}`);
        console.log(`Capacity: ${record.capacity || 'N/A'}`);
        console.log(`Install Date: ${record.install_date || 'N/A'}`);
        console.log(`Approval Date: ${record.approval_date || 'N/A'}`);
        console.log(`Property Type: ${record.property_type || 'N/A'}`);
        console.log(`Water Supply: ${record.water_supply || 'N/A'}`);
        console.log(`Lot Size: ${record.lot_size || 'N/A'}`);
        console.log(`Parcel Number: ${record.parcel_number || 'N/A'}`);
      });
    } else {
      console.log("No records found");
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("Search complete");
}

checkProperty();
