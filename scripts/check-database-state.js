#!/usr/bin/env node

/**
 * Database State Diagnostic Script
 * Checks if septic_tanks table exists, has data, and if the RPC function works
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('\nYou need to set:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL');
  console.log('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseState() {
  console.log('🔍 Checking TankFindr Database State\n');
  console.log('=' .repeat(70));

  // 1. Check if septic_tanks table exists
  console.log('\n1️⃣  Checking if septic_tanks table exists...');
  try {
    const { data, error } = await supabase
      .from('septic_tanks')
      .select('id', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ septic_tanks table does NOT exist or is not accessible');
      console.log('   Error:', error.message);
    } else {
      console.log('✅ septic_tanks table exists');
      console.log(`   Total records: ${data?.length || 0}`);
    }
  } catch (err) {
    console.log('❌ Error checking table:', err.message);
  }

  // 2. Check total record count
  console.log('\n2️⃣  Checking total record count...');
  try {
    const { count, error } = await supabase
      .from('septic_tanks')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Cannot count records');
      console.log('   Error:', error.message);
    } else {
      console.log(`✅ Total septic_tanks records: ${count || 0}`);
      
      if (count === 0) {
        console.log('⚠️  WARNING: Table exists but has NO data!');
      }
    }
  } catch (err) {
    console.log('❌ Error counting records:', err.message);
  }

  // 3. Check Florida records specifically
  console.log('\n3️⃣  Checking Florida records...');
  try {
    const { count, error } = await supabase
      .from('septic_tanks')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'FL');
    
    if (error) {
      console.log('❌ Cannot query Florida records');
      console.log('   Error:', error.message);
    } else {
      console.log(`✅ Florida (FL) records: ${count || 0}`);
    }
  } catch (err) {
    console.log('❌ Error querying Florida:', err.message);
  }

  // 4. Sample a few records
  console.log('\n4️⃣  Sampling records...');
  try {
    const { data, error } = await supabase
      .from('septic_tanks')
      .select('id, county, state, address, attributes')
      .limit(3);
    
    if (error) {
      console.log('❌ Cannot sample records');
      console.log('   Error:', error.message);
    } else if (!data || data.length === 0) {
      console.log('⚠️  No records to sample');
    } else {
      console.log(`✅ Sample records (${data.length}):`);
      data.forEach((record, i) => {
        console.log(`\n   Record ${i + 1}:`);
        console.log(`   - ID: ${record.id}`);
        console.log(`   - County: ${record.county}`);
        console.log(`   - State: ${record.state}`);
        console.log(`   - Address: ${record.address || 'N/A'}`);
      });
    }
  } catch (err) {
    console.log('❌ Error sampling records:', err.message);
  }

  // 5. Check if find_nearest_septic_tank function exists
  console.log('\n5️⃣  Testing find_nearest_septic_tank RPC function...');
  try {
    // Test with Miami coordinates (where 1234 NW 79th St works)
    const testLat = 25.8478;
    const testLng = -80.2197;
    
    const { data, error } = await supabase.rpc('find_nearest_septic_tank', {
      search_lat: testLat,
      search_lng: testLng,
      search_radius_meters: 200,
    });
    
    if (error) {
      console.log('❌ find_nearest_septic_tank function does NOT exist or failed');
      console.log('   Error:', error.message);
    } else {
      console.log('✅ find_nearest_septic_tank function exists and works');
      if (data && data.length > 0) {
        console.log(`   Found ${data.length} tank(s) near Miami test location`);
        console.log(`   - Distance: ${data[0].distance_meters?.toFixed(1)}m`);
        console.log(`   - County: ${data[0].county}`);
      } else {
        console.log('   ⚠️  No tanks found near test location');
      }
    }
  } catch (err) {
    console.log('❌ Error testing RPC function:', err.message);
  }

  // 6. Check septic_sources table
  console.log('\n6️⃣  Checking septic_sources table...');
  try {
    const { count, error } = await supabase
      .from('septic_sources')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ septic_sources table issue');
      console.log('   Error:', error.message);
    } else {
      console.log(`✅ septic_sources records: ${count || 0}`);
    }
  } catch (err) {
    console.log('❌ Error checking septic_sources:', err.message);
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📋 DIAGNOSIS SUMMARY:\n');
  
  console.log('Next steps:');
  console.log('1. If septic_tanks table does NOT exist:');
  console.log('   → Run: node scripts/apply-schema.js');
  console.log('');
  console.log('2. If table exists but has 0 records:');
  console.log('   → Re-run import: node scripts/resume-florida-import.js');
  console.log('');
  console.log('3. If find_nearest_septic_tank function missing:');
  console.log('   → Apply function: node scripts/apply-rpc-function.js');
  console.log('');
}

checkDatabaseState().catch(console.error);
