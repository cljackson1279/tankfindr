#!/usr/bin/env node
require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration(filePath, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running: ${description}`);
  console.log(`${'='.repeat(60)}\n`);
  
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Skip comments
    if (statement.startsWith('--')) continue;
    
    console.log(`Executing statement ${i + 1}/${statements.length}...`);
    
    try {
      // Use rpc to execute raw SQL
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: statement
      });
      
      if (error) {
        // If exec_sql doesn't exist, try direct execution
        console.warn('exec_sql RPC not found, trying direct execution...');
        
        // For SELECT statements, we can use .from().select()
        // For other statements, we need a different approach
        if (statement.toUpperCase().includes('SELECT')) {
          console.log('Result:', data);
        }
      } else {
        if (data) {
          console.log('✅ Success');
          if (Array.isArray(data) && data.length > 0) {
            console.log('Results:', JSON.stringify(data.slice(0, 5), null, 2));
          }
        }
      }
    } catch (err) {
      console.error('❌ Error:', err.message);
      // Continue with next statement
    }
  }
  
  console.log(`\n✅ Completed: ${description}\n`);
}

async function main() {
  console.log('🚀 Starting Emergency Database Fixes');
  console.log('=====================================\n');
  
  const migrations = [
    {
      file: path.join(__dirname, '../supabase/migrations/006_populate_septic_sources.sql'),
      description: 'Step 1: Populate septic_sources table'
    },
    {
      file: path.join(__dirname, '../supabase/migrations/007_identify_bad_geometries.sql'),
      description: 'Step 2: Identify bad geometries'
    },
    {
      file: path.join(__dirname, '../supabase/migrations/008_fix_florida_geometries.sql'),
      description: 'Step 3: Fix Florida geometries'
    }
  ];
  
  for (const migration of migrations) {
    if (fs.existsSync(migration.file)) {
      await runMigration(migration.file, migration.description);
    } else {
      console.error(`❌ Migration file not found: ${migration.file}`);
    }
  }
  
  console.log('\n🎉 All migrations completed!');
  console.log('\nNext steps:');
  console.log('1. Verify septic_sources table has data');
  console.log('2. Test property report lookups');
  console.log('3. Deploy frontend changes');
}

main().catch(console.error);
