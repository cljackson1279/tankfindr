#!/usr/bin/env node

/**
 * Apply migration 004: Add RPC functions for septic tank lookups
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cijtllcbrvkbvrjriweu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function applyMigration() {
  console.log('\n🚀 Applying migration 004: Add RPC functions...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/004_add_rpc_functions.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL:');
    console.log('─'.repeat(80));
    console.log(sql);
    console.log('─'.repeat(80));
    console.log('\n🔧 Executing migration...\n');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Try direct execution if exec_sql doesn't exist
      console.log('⚠️  exec_sql RPC not available, trying direct execution...');

      // Split SQL into individual statements and execute
      const statements = sql.split(';').filter(s => s.trim());

      for (const statement of statements) {
        if (!statement.trim()) continue;

        const { error: stmtError } = await supabase.rpc('exec', {
          query: statement.trim() + ';'
        });

        if (stmtError) {
          console.error(`❌ Error executing statement:`, stmtError);
          throw stmtError;
        }
      }
    }

    console.log('✅ Migration applied successfully!\n');

    // Test the function
    console.log('🧪 Testing find_nearest_septic_tank function...\n');

    const testLat = 25.8512;
    const testLng = -80.2056;

    const { data: testData, error: testError } = await supabase.rpc('find_nearest_septic_tank', {
      search_lat: testLat,
      search_lng: testLng,
      search_radius_meters: 1000
    });

    if (testError) {
      console.error('❌ Test failed:', testError);
    } else {
      console.log(`✅ Function test successful! Found ${testData?.length || 0} tanks`);
      if (testData && testData.length > 0) {
        console.log('\nSample result:');
        console.log(JSON.stringify(testData[0], null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
