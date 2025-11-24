#!/usr/bin/env node

/**
 * Diagnostic script to check Supabase database state
 * Run with: node scripts/diagnose-database.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cijtllcbrvkbvrjriweu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('💡 Add it to your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function diagnose() {
  console.log('\n🔍 TankFindr Database Diagnostics\n');
  console.log('='.repeat(80));

  try {
    // 1. Check septic_tanks table
    console.log('\n1️⃣  Checking septic_tanks table...\n');

    const { data: tankData, error: tankError } = await supabase
      .from('septic_tanks')
      .select('county, state', { count: 'exact', head: false })
      .limit(1);

    if (tankError) {
      console.error('❌ Error accessing septic_tanks table:', tankError.message);
      console.log('👉 Table may not exist. Check Supabase dashboard.');
    } else {
      const { count } = await supabase
        .from('septic_tanks')
        .select('*', { count: 'exact', head: true });

      console.log(`✅ septic_tanks table exists`);
      console.log(`📊 Total records: ${count || 0}`);

      // Get Florida data specifically
      const { data: flData, error: flError } = await supabase
        .from('septic_tanks')
        .select('county', { count: 'exact' })
        .eq('state', 'FL')
        .limit(1);

      const { count: flCount } = await supabase
        .from('septic_tanks')
        .select('*', { count: 'exact', head: true })
        .eq('state', 'FL');

      console.log(`🌴 Florida records: ${flCount || 0}`);

      // Get Miami-Dade specifically
      const { count: miamiCount } = await supabase
        .from('septic_tanks')
        .select('*', { count: 'exact', head: true })
        .eq('state', 'FL')
        .eq('county', 'Miami-Dade');

      console.log(`🏖️  Miami-Dade records: ${miamiCount || 0}`);
    }

    // 2. Check septic_sources table
    console.log('\n2️⃣  Checking septic_sources table...\n');

    const { data: sourceData, error: sourceError } = await supabase
      .from('septic_sources')
      .select('*');

    if (sourceError) {
      console.error('❌ Error accessing septic_sources table:', sourceError.message);
    } else {
      console.log(`✅ septic_sources table exists`);
      console.log(`📊 Total sources: ${sourceData?.length || 0}`);

      if (sourceData && sourceData.length > 0) {
        console.log('\n📋 Sources:');
        sourceData.forEach(s => {
          console.log(`   - ${s.name} (${s.county}, ${s.state}): ${s.record_count} records`);
        });
      } else {
        console.log('⚠️  No source metadata found (table is empty)');
      }
    }

    // 3. Check find_nearest_septic_tank RPC function
    console.log('\n3️⃣  Testing find_nearest_septic_tank RPC function...\n');

    const testLat = 25.846351;
    const testLng = -80.21812;

    const { data: rpcData, error: rpcError } = await supabase.rpc('find_nearest_septic_tank', {
      search_lat: testLat,
      search_lng: testLng,
      search_radius_meters: 1000
    });

    if (rpcError) {
      console.error('❌ RPC function error:', rpcError.message);
      console.error('📝 Error code:', rpcError.code);

      if (rpcError.code === 'PGRST202' || rpcError.message?.includes('find_nearest_septic_tank')) {
        console.log('\n🚨 CRITICAL: find_nearest_septic_tank function does NOT exist!');
        console.log('\n📖 You MUST apply the SQL migration:');
        console.log('   1. Open https://supabase.com/dashboard');
        console.log('   2. Select your project');
        console.log('   3. Go to SQL Editor');
        console.log('   4. Copy/paste the SQL from supabase/migrations/004_add_rpc_functions.sql');
        console.log('   5. Click RUN\n');
      }
    } else {
      console.log(`✅ RPC function works!`);
      console.log(`📊 Found ${rpcData?.length || 0} tanks within 1000m of test location`);

      if (rpcData && rpcData.length > 0) {
        console.log(`\n📍 Nearest tank:`);
        const nearest = rpcData[0];
        console.log(`   Address: ${nearest.address || 'N/A'}`);
        console.log(`   County: ${nearest.county}, ${nearest.state}`);
        console.log(`   Distance: ${Math.round(nearest.distance_meters)}m`);
        console.log(`   Coordinates: ${nearest.lat}, ${nearest.lng}`);
      }
    }

    // 4. Test the actual lookup flow
    console.log('\n4️⃣  Testing full lookup flow...\n');

    const { getSepticContextForLocation } = require('../lib/septicLookup');

    console.log(`🔍 Looking up: 1234 NW 79th St, Miami, FL (${testLat}, ${testLng})\n`);

    const context = await getSepticContextForLocation(testLat, testLng);

    console.log('📊 Results:');
    console.log(`   Classification: ${context.classification}`);
    console.log(`   Confidence: ${context.confidence}`);
    console.log(`   Covered: ${context.isCovered}`);
    console.log(`   Tank Found: ${!!context.tankPoint}`);
    console.log(`   Sources: ${context.coverageSources?.length || 0}`);
    console.log(`   Features: ${context.nearestFeatures?.length || 0}`);

    if (context.tankPoint) {
      console.log(`\n✅ Tank coordinates: ${context.tankPoint.lat}, ${context.tankPoint.lng}`);
    } else {
      console.log(`\n⚠️  No tank point found`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Diagnostic complete!\n');

  } catch (error) {
    console.error('\n❌ Diagnostic failed:', error);
    console.error('\nError details:', error.message);
    process.exit(1);
  }
}

diagnose();
