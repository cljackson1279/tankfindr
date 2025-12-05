const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listTables() {
  // Try to query the RPC function or information schema
  const { data, error } = await supabase
    .rpc('get_tables')
    .catch(() => null);
  
  if (error || !data) {
    // Try querying a known table to see structure
    console.log("Trying to find septic-related tables...");
    
    const tables = ['septic_systems', 'permits', 'tank_locations', 'florida_septic', 'septic_permits'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (!error) {
        console.log(`✅ Found table: ${table}`);
        if (data && data.length > 0) {
          console.log("Sample record:", JSON.stringify(data[0], null, 2));
        }
      }
    }
  }
}

listTables();
