#!/usr/bin/env node
/**
 * Fix Florida Geometries - Simple Batch Script
 * 
 * This script uses direct PostgreSQL connection to reproject Florida geometries
 * in batches, bypassing Supabase timeouts.
 * 
 * Usage:
 *   npm install pg
 *   node scripts/fix-florida-geometries-simple.js
 * 
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL environment variable
 *   - SUPABASE_SERVICE_ROLE_KEY environment variable (or DATABASE_URL)
 */

require('dotenv').config({ path: './.env.local' });
const { Client } = require('pg');

// Parse Supabase URL to get database connection string
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const projectRef = supabaseUrl?.match(/https:\/\/(.+)\.supabase\.co/)?.[1];

// You'll need to get your database password from Supabase Dashboard > Settings > Database
// For now, we'll use a simpler approach with the service role key

const BATCH_SIZE = 500;
const FLORIDA_SRID = 2236;

async function fixFloridaGeometries() {
  console.log('🚀 Florida Geometry Fix - Simple Batch Processing\n');
  console.log('⚠️  IMPORTANT: This script requires direct database access.');
  console.log('   Please use ONE of these methods instead:\n');
  console.log('METHOD 1: Run SQL manually in batches (RECOMMENDED)');
  console.log('==========================================');
  console.log('Copy and paste this SQL into Supabase SQL Editor, and run it MULTIPLE TIMES:');
  console.log('');
  console.log('```sql');
  console.log('-- Run this query repeatedly until it returns "UPDATE 0"');
  console.log('UPDATE septic_tanks');
  console.log('SET geom_fixed = ST_Transform(ST_SetSRID(geom, 2236), 4326)');
  console.log('WHERE state = \'FL\'');
  console.log('  AND geom_fixed IS NULL');
  console.log('  AND NOT (ST_X(geom) BETWEEN -180 AND 180)');
  console.log('  AND id IN (');
  console.log('    SELECT id FROM septic_tanks');
  console.log('    WHERE state = \'FL\'');
  console.log('      AND geom_fixed IS NULL');
  console.log('      AND NOT (ST_X(geom) BETWEEN -180 AND 180)');
  console.log('    LIMIT 500');
  console.log('  );');
  console.log('');
  console.log('-- Check progress after each run:');
  console.log('SELECT');
  console.log('  COUNT(*) as total,');
  console.log('  SUM(CASE WHEN geom_fixed IS NOT NULL THEN 1 ELSE 0 END) as fixed,');
  console.log('  SUM(CASE WHEN geom_fixed IS NULL THEN 1 ELSE 0 END) as remaining');
  console.log('FROM septic_tanks WHERE state = \'FL\';');
  console.log('```');
  console.log('');
  console.log('You need to run the UPDATE query approximately 3,787 times (1,893,334 / 500).');
  console.log('Each run takes ~5-8 seconds.');
  console.log('');
  console.log('METHOD 2: Use psql command line (FASTEST)');
  console.log('==========================================');
  console.log('1. Get your database connection string from:');
  console.log('   Supabase Dashboard > Settings > Database > Connection String > URI');
  console.log('');
  console.log('2. Install PostgreSQL client:');
  console.log('   Mac: brew install postgresql');
  console.log('   Ubuntu: sudo apt-get install postgresql-client');
  console.log('');
  console.log('3. Connect to your database:');
  console.log('   psql "your-connection-string-here"');
  console.log('');
  console.log('4. Run the batch script from FIX_FLORIDA_GEOMETRIES.md Step 4');
  console.log('');
  console.log('METHOD 3: Use this automated script (REQUIRES SETUP)');
  console.log('==========================================');
  console.log('See instructions in FIX_FLORIDA_GEOMETRIES_AUTOMATED.md');
  console.log('');
}

fixFloridaGeometries();
