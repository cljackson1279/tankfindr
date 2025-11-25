#!/usr/bin/env node

/**
 * Simple script to check if RPC function exists
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cijtllcbrvkbvrjriweu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkFunction() {
  console.log('\n🔍 Checking if find_nearest_septic_tank function exists...\n');

  try {
    // Try to call the function with a simple test
    const { data, error } = await supabase.rpc('find_nearest_septic_tank', {
      search_lat: 25.846351,
      search_lng: -80.21812,
      search_radius_meters: 1000
    });

    if (error) {
      console.error('❌ RPC Function Error:');
      console.error('   Message:', error.message);
      console.error('   Code:', error.code);
      console.error('   Hint:', error.hint || 'N/A');

      if (error.code === 'PGRST202' || error.message?.includes('Could not find') || error.message?.includes('does not exist')) {
        console.log('\n🚨 SOLUTION: The RPC function does NOT exist in your database!\n');
        console.log('📖 Apply the SQL migration:');
        console.log('   1. Go to https://supabase.com/dashboard');
        console.log('   2. Select your project: cijtllcbrvkbvrjriweu');
        console.log('   3. Click "SQL Editor" in sidebar');
        console.log('   4. Open supabase/migrations/004_add_rpc_functions.sql');
        console.log('   5. Copy the ENTIRE SQL content');
        console.log('   6. Paste in SQL Editor and click RUN');
        console.log('   7. Re-run this script to verify\n');
      } else if (error.code === '57014') {
        console.log('\n⚠️  Query timeout - database may be overloaded or unindexed\n');
      }

      process.exit(1);
    }

    console.log('✅ RPC function exists and works!');
    console.log(`📊 Found ${data?.length || 0} tanks within 1000m\n`);

    if (data && data.length > 0) {
      console.log('📍 Sample result:');
      console.log('  ', JSON.stringify(data[0], null, 2));
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

checkFunction();
