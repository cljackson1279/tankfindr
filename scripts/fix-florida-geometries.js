#!/usr/bin/env node
/**
 * Fix Florida Geometries - Batch Reprojection Script
 * 
 * This script reprojects Florida septic tank geometries from State Plane (EPSG:2236)
 * to WGS84 (EPSG:4326) in small batches to avoid timeouts.
 * 
 * Usage:
 *   node scripts/fix-florida-geometries.js
 * 
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL environment variable
 *   - SUPABASE_SERVICE_ROLE_KEY environment variable
 */

require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BATCH_SIZE = 500; // Process 500 records at a time
const FLORIDA_SRID = 2236; // Florida East State Plane
const TARGET_SRID = 4326; // WGS84

let totalFixed = 0;
let batchNumber = 0;

async function fixBatch() {
  try {
    // Get a batch of records that need fixing
    const { data: records, error: selectError } = await supabase
      .from('septic_tanks')
      .select('id')
      .eq('state', 'FL')
      .is('geom_fixed', null)
      .limit(BATCH_SIZE);

    if (selectError) {
      console.error('Error selecting records:', selectError);
      return 0;
    }

    if (!records || records.length === 0) {
      console.log('\n✅ All Florida records have been fixed!');
      return 0;
    }

    batchNumber++;
    console.log(`\n📦 Processing batch ${batchNumber} (${records.length} records)...`);

    // Process each record in the batch
    let successCount = 0;
    let errorCount = 0;

    for (const record of records) {
      try {
        // Use a raw SQL query to transform the geometry
        const { error: updateError } = await supabase.rpc('fix_single_geometry', {
          record_id: record.id,
          source_srid: FLORIDA_SRID,
          target_srid: TARGET_SRID
        });

        if (updateError) {
          // If the RPC doesn't exist, fall back to direct update
          // This uses PostGIS functions directly
          const { error: directError } = await supabase
            .from('septic_tanks')
            .update({
              geom_fixed: supabase.rpc('ST_Transform', {
                geom: supabase.rpc('ST_SetSRID', {
                  geom: record.geom,
                  srid: FLORIDA_SRID
                }),
                srid: TARGET_SRID
              })
            })
            .eq('id', record.id);

          if (directError) {
            errorCount++;
            continue;
          }
        }

        successCount++;
        totalFixed++;

        // Show progress every 100 records
        if (successCount % 100 === 0) {
          console.log(`  ✓ ${successCount}/${records.length} records in this batch...`);
        }
      } catch (err) {
        errorCount++;
        console.error(`  ✗ Error fixing record ${record.id}:`, err.message);
      }
    }

    console.log(`✅ Batch ${batchNumber} complete: ${successCount} fixed, ${errorCount} errors`);
    console.log(`📊 Total fixed so far: ${totalFixed}`);

    return records.length;
  } catch (error) {
    console.error('Error in fixBatch:', error);
    return 0;
  }
}

async function getProgress() {
  try {
    const { data, error } = await supabase
      .from('septic_tanks')
      .select('id, geom_fixed')
      .eq('state', 'FL');

    if (error) {
      console.error('Error getting progress:', error);
      return null;
    }

    const total = data.length;
    const fixed = data.filter(r => r.geom_fixed !== null).length;
    const remaining = total - fixed;

    return { total, fixed, remaining };
  } catch (error) {
    console.error('Error in getProgress:', error);
    return null;
  }
}

async function main() {
  console.log('🚀 Florida Geometry Reprojection Script');
  console.log('========================================\n');
  console.log(`Batch size: ${BATCH_SIZE} records`);
  console.log(`Source SRID: EPSG:${FLORIDA_SRID} (Florida East State Plane)`);
  console.log(`Target SRID: EPSG:${TARGET_SRID} (WGS84)`);
  console.log('');

  // Get initial progress
  console.log('📊 Checking initial status...');
  const initialProgress = await getProgress();
  
  if (initialProgress) {
    console.log(`Total Florida records: ${initialProgress.total.toLocaleString()}`);
    console.log(`Already fixed: ${initialProgress.fixed.toLocaleString()}`);
    console.log(`Remaining: ${initialProgress.remaining.toLocaleString()}`);
    console.log('');
  }

  const startTime = Date.now();
  let processedInBatch = BATCH_SIZE;

  // Process batches until there are no more records to fix
  while (processedInBatch > 0) {
    processedInBatch = await fixBatch();
    
    // Small delay between batches to avoid overwhelming the database
    if (processedInBatch > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const endTime = Date.now();
  const durationMinutes = ((endTime - startTime) / 1000 / 60).toFixed(2);

  console.log('\n========================================');
  console.log('🎉 Reprojection Complete!');
  console.log(`Total records fixed: ${totalFixed.toLocaleString()}`);
  console.log(`Total time: ${durationMinutes} minutes`);
  console.log('========================================\n');

  // Get final progress
  console.log('📊 Final status:');
  const finalProgress = await getProgress();
  
  if (finalProgress) {
    console.log(`Total Florida records: ${finalProgress.total.toLocaleString()}`);
    console.log(`Fixed: ${finalProgress.fixed.toLocaleString()}`);
    console.log(`Remaining: ${finalProgress.remaining.toLocaleString()}`);
    
    if (finalProgress.remaining > 0) {
      console.log('\n⚠️  Some records still need fixing. Run this script again to continue.');
    } else {
      console.log('\n✅ All Florida records have been successfully reprojected!');
      console.log('\nNext steps:');
      console.log('1. Run the column swap SQL from FIX_FLORIDA_GEOMETRIES.md (Step 6)');
      console.log('2. Update indexes (Step 7)');
      console.log('3. Test lookups (Step 8)');
    }
  }
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

// Run the script
main().catch(console.error);
