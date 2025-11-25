#!/usr/bin/env node
/**
 * Simple Automated Florida Geometry Fix
 * 
 * Run this once and let it complete in the background (2-3 hours).
 * 
 * Usage:
 *   node scripts/auto-fix-florida-simple.js
 */

require('dotenv').config({ path: './.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing environment variables in .env.local');
  process.exit(1);
}

const BATCH_SIZE = 500;
const DELAY_MS = 2000; // 2 seconds between batches

let totalProcessed = 0;
let batchNumber = 0;
const startTime = Date.now();

/**
 * Call the fix_florida_geometry function for a batch of records
 */
async function fixBatch() {
  try {
    // Get IDs of records that need fixing
    const getResponse = await fetch(
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

    if (!getResponse.ok) {
      throw new Error(`Failed to fetch records: ${getResponse.statusText}`);
    }

    const records = await getResponse.json();

    if (records.length === 0) {
      return 0; // No more records to process
    }

    batchNumber++;
    console.log(`📦 Batch ${batchNumber}: Processing ${records.length} records...`);

    // Fix each record using the SQL function
    let fixed = 0;
    for (const record of records) {
      try {
        const fixResponse = await fetch(
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
              source_srid: 2236,
              target_srid: 4326
            })
          }
        );

        if (fixResponse.ok) {
          fixed++;
        }
      } catch (err) {
        // Continue on individual errors
      }
    }

    totalProcessed += fixed;
    console.log(`   ✓ Fixed ${fixed}/${records.length} | Total: ${totalProcessed.toLocaleString()}`);

    // Calculate time estimate
    const elapsedMin = (Date.now() - startTime) / 1000 / 60;
    if (totalProcessed > 0) {
      const rate = totalProcessed / elapsedMin;
      const estimatedTotal = 1893334; // Approximate total to fix
      const remaining = estimatedTotal - totalProcessed;
      const estMinRemaining = remaining / rate;
      console.log(`   ⏱️  Elapsed: ${elapsedMin.toFixed(1)}m | Est. remaining: ${estMinRemaining.toFixed(1)}m`);
    }

    return records.length;

  } catch (error) {
    console.error(`❌ Error in batch ${batchNumber}:`, error.message);
    return -1; // Error occurred
  }
}

/**
 * Main loop
 */
async function main() {
  console.log('🚀 Automated Florida Geometry Fix (Simple Version)');
  console.log('===================================================\n');
  console.log('⚠️  IMPORTANT: First create the SQL function by running this in Supabase SQL Editor:\n');
  console.log('CREATE OR REPLACE FUNCTION fix_florida_geometry(');
  console.log('  record_id UUID,');
  console.log('  source_srid INTEGER DEFAULT 2236,');
  console.log('  target_srid INTEGER DEFAULT 4326');
  console.log(')');
  console.log('RETURNS VOID AS $$');
  console.log('BEGIN');
  console.log('  UPDATE septic_tanks');
  console.log('  SET geom_fixed = ST_Transform(ST_SetSRID(geom, source_srid), target_srid)');
  console.log('  WHERE id = record_id AND state = \'FL\' AND geom_fixed IS NULL');
  console.log('    AND NOT (ST_X(geom) BETWEEN -180 AND 180);');
  console.log('END;');
  console.log('$$ LANGUAGE plpgsql SECURITY DEFINER;\n');
  console.log('GRANT EXECUTE ON FUNCTION fix_florida_geometry TO service_role;\n');
  console.log('Press Ctrl+C to cancel, or wait 10 seconds to start...\n');

  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log('🔄 Starting processing...\n');

  let processedInBatch = BATCH_SIZE;
  let errorCount = 0;

  while (processedInBatch > 0 && errorCount < 5) {
    processedInBatch = await fixBatch();

    if (processedInBatch === -1) {
      errorCount++;
      console.log(`   ⚠️  Error occurred. Retrying in 5 seconds... (${errorCount}/5)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else if (processedInBatch > 0) {
      errorCount = 0; // Reset error count on success
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  const totalMin = ((Date.now() - startTime) / 1000 / 60).toFixed(2);

  console.log('\n===================================================');
  console.log('🎉 Processing Complete!');
  console.log(`Total records fixed: ${totalProcessed.toLocaleString()}`);
  console.log(`Total time: ${totalMin} minutes`);
  console.log(`Average rate: ${(totalProcessed / parseFloat(totalMin)).toFixed(0)} records/min`);
  console.log('===================================================\n');

  console.log('Next steps:');
  console.log('1. Check progress in Supabase:');
  console.log('   SELECT COUNT(*) as fixed FROM septic_tanks WHERE state = \'FL\' AND geom_fixed IS NOT NULL;');
  console.log('2. If all records are fixed, run Step 6 from FIX_FLORIDA_GEOMETRIES.md');
  console.log('3. Update indexes (Step 7)');
  console.log('4. Test lookups (Step 8)\n');
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Stopped by user');
  console.log(`Processed ${totalProcessed.toLocaleString()} records so far`);
  console.log('Run this script again to continue from where it left off.\n');
  process.exit(0);
});

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
