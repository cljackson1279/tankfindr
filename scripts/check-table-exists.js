#!/usr/bin/env node

/**
 * Check if septic_tanks table exists and has data
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cijtllcbrvkbvrjriweu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkTable() {
  console.log('\n🔍 Checking septic_tanks table...\n');

  try {
    // Simple count query with short timeout
    const { count, error } = await supabase
      .from('septic_tanks')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Table error:', error.message);
      console.log('\n💡 The septic_tanks table may not exist or you don\'t have access.');
      process.exit(1);
    }

    console.log(`✅ Table exists with ${count || 0} total records`);

    // Check Florida specifically
    const { count: flCount, error: flError } = await supabase
      .from('septic_tanks')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'FL');

    if (!flError) {
      console.log(`🌴 Florida records: ${flCount || 0}`);
    }

    // Check Miami-Dade specifically
    const { count: miamiCount, error: miamiError } = await supabase
      .from('septic_tanks')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'FL')
      .eq('county', 'Miami-Dade');

    if (!miamiError) {
      console.log(`🏖️  Miami-Dade records: ${miamiCount || 0}`);
    }

    // Get a sample record
    const { data: sampleData, error: sampleError } = await supabase
      .from('septic_tanks')
      .select('county, state, lat, lng, geom')
      .eq('state', 'FL')
      .limit(1);

    if (!sampleError && sampleData && sampleData.length > 0) {
      console.log('\n📍 Sample record:');
      console.log('   County:', sampleData[0].county);
      console.log('   State:', sampleData[0].state);
      console.log('   Has lat/lng:', !!sampleData[0].lat, '/', !!sampleData[0].lng);
      console.log('   Has geom:', !!sampleData[0].geom);
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

checkTable();
