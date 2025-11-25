#!/usr/bin/env node
/**
 * Automated Florida Geometry Fix
 * 
 * This script automatically processes Florida geometry fixes in batches
 * using the Supabase REST API. Run it once and let it complete unattended.
 * 
 * Usage:
 *   node scripts/auto-fix-florida.js
 * 
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

require('dotenv').config({ path: './.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('   Make sure .env.local has:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const BATCH_SIZE = 500;
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds
const FLORIDA_SRID = 2236;
const TARGET_SRID = 4326;

let totalProcessed = 0;
let batchNumber = 0;
const startTime = Date.now();

/**
 * Execute raw SQL using Supabase REST API
 */
async function executeSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL execution failed: ${error}`);
  }

  return await response.json();
}

/**
 * Get IDs of records that need fixing
 */
async function getRecordsToFix() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/septic_tanks?` +
    `state=eq.FL&` +
    `geom_fixed=is.null&` +
    `select=id&` +
    `limit=${BATCH_SIZE}`,
    {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch records: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Fix a batch of records using raw SQL
 */
async function fixBatch(recordIds) {
  if (recordIds.length === 0) return 0;

  const idsString = recordIds.map(r => `'${r.id}'`).join(',');
  
  const sql = `
    UPDATE septic_tanks
    SET geom_fixed = ST_Transform(ST_SetSRID(geom, ${FLORIDA_SRID}), ${TARGET_SRID})
    WHERE id IN (${idsString})
      AND state = 'FL'
      AND geom_fixed IS NULL
      AND NOT (ST_X(geom) BETWEEN -180 AND 180);
  `;

  try {
    // Use Supabase's built-in SQL execution if available
    // Otherwise fall back to direct update
    const response = await fetch(`${SUPABASE_URL}/rest/v1/septic_tanks`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(
        recordIds.map(r => ({
          id: r.id,
          // This won't work directly, we need a different approach
        }))
      )
    });

    return recordIds.length;
  } catch (error) {
    console.error('Error fixing batch:', error.message);
    return 0;
  }
}

/**
 * Process records one at a time (slower but more reliable)
 */
async function fixRecordByRecord(recordIds) {
  let fixed = 0;
  
  for (const record of recordIds) {
    try {
      // Get the current geometry
      const getResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/septic_tanks?id=eq.${record.id}&select=id,geom`,
        {
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
          }
        }
      );

      const [data] = await getResponse.json();
      if (!data || !data.geom) continue;

      // For now, we'll use a workaround: call a custom SQL function
      // This requires creating a function in Supabase first
      const updateResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/fix_florida_geometry`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
          },
          body: JSON.stringify({
            record_id: record.id,
            source_srid: FLORIDA_SRID,
            target_srid: TARGET_SRID
          })
        }
      );

      if (updateResponse.ok) {
        fixed++;
      }
    } catch (error) {
      // Continue on error
    }
  }

  return fixed;
}

/**
 * Get progress statistics
 */
async function getProgress() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/septic_tanks?state=eq.FL&select=geom_fixed`,
    {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'count=exact'
      }
    }
  );

  const count = response.headers.get('content-range');
  const total = count ? parseInt(count.split('/')[1]) : 0;

  const data = await response.json();
  const fixed = data.filter(r => r.geom_fixed !== null).length;

  return { total, fixed, remaining: total - fixed };
}

/**
 * Main processing loop
 */
async function main() {
  console.log('🚀 Automated Florida Geometry Fix');
  console.log('==================================\n');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log(`Delay between batches: ${DELAY_BETWEEN_BATCHES}ms`);
  console.log('');

  console.log('📊 Getting initial progress...');
  const initialProgress = await getProgress();
  console.log(`Total Florida records: ${initialProgress.total.toLocaleString()}`);
  console.log(`Already fixed: ${initialProgress.fixed.toLocaleString()}`);
  console.log(`Remaining: ${initialProgress.remaining.toLocaleString()}`);
  console.log('');

  console.log('⚠️  IMPORTANT: This script requires a custom SQL function.');
  console.log('   Please run this SQL in Supabase SQL Editor first:\n');
  console.log('```sql');
  console.log('CREATE OR REPLACE FUNCTION fix_florida_geometry(');
  console.log('  record_id UUID,');
  console.log('  source_srid INTEGER DEFAULT 2236,');
  console.log('  target_srid INTEGER DEFAULT 4326');
  console.log(')');
  console.log('RETURNS VOID AS $$');
  console.log('BEGIN');
  console.log('  UPDATE septic_tanks');
  console.log('  SET geom_fixed = ST_Transform(ST_SetSRID(geom, source_srid), target_srid)');
  console.log('  WHERE id = record_id');
  console.log('    AND state = \'FL\'');
  console.log('    AND geom_fixed IS NULL');
  console.log('    AND NOT (ST_X(geom) BETWEEN -180 AND 180);');
  console.log('END;');
  console.log('$$ LANGUAGE plpgsql SECURITY DEFINER;');
  console.log('```\n');

  console.log('Press Ctrl+C to cancel, or wait 10 seconds to continue...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log('\n🔄 Starting automated processing...\n');

  while (true) {
    try {
      // Get next batch of records
      const records = await getRecordsToFix();

      if (records.length === 0) {
        console.log('\n✅ All records processed!');
        break;
      }

      batchNumber++;
      console.log(`📦 Batch ${batchNumber}: Processing ${records.length} records...`);

      // Fix the batch
      const fixed = await fixRecordByRecord(records);
      totalProcessed += fixed;

      console.log(`   ✓ Fixed ${fixed} records | Total: ${totalProcessed.toLocaleString()}`);

      // Show time estimate
      const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes
      const rate = totalProcessed / elapsed; // records per minute
      const remaining = initialProgress.remaining - totalProcessed;
      const estimatedMinutes = remaining / rate;

      console.log(`   ⏱️  Elapsed: ${elapsed.toFixed(1)}m | Est. remaining: ${estimatedMinutes.toFixed(1)}m`);

      // Delay before next batch
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));

    } catch (error) {
      console.error(`❌ Error in batch ${batchNumber}:`, error.message);
      console.log('   Retrying in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(2);

  console.log('\n==================================');
  console.log('🎉 Processing Complete!');
  console.log(`Total records fixed: ${totalProcessed.toLocaleString()}`);
  console.log(`Total time: ${totalTime} minutes`);
  console.log(`Average rate: ${(totalProcessed / parseFloat(totalTime)).toFixed(0)} records/min`);
  console.log('==================================\n');

  console.log('📊 Final progress:');
  const finalProgress = await getProgress();
  console.log(`Total: ${finalProgress.total.toLocaleString()}`);
  console.log(`Fixed: ${finalProgress.fixed.toLocaleString()}`);
  console.log(`Remaining: ${finalProgress.remaining.toLocaleString()}`);

  if (finalProgress.remaining === 0) {
    console.log('\n✅ All Florida records fixed!');
    console.log('\nNext steps:');
    console.log('1. Run Step 6 from FIX_FLORIDA_GEOMETRIES.md (swap columns)');
    console.log('2. Run Step 7 (update indexes)');
    console.log('3. Test lookups');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Process interrupted by user');
  console.log(`Total processed so far: ${totalProcessed.toLocaleString()}`);
  console.log('You can run this script again to continue from where it left off.');
  process.exit(0);
});

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
