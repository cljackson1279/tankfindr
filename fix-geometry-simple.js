#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Configuration
const BATCH_SIZE = 500;  // Small batches to avoid timeout
const DELAY_MS = 500;  // Half second between batches

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let totalProcessed = 0;
let startTime = Date.now();
let errors = 0;

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

async function processBatch() {
  try {
    // Get IDs of records to update
    const { data: records, error: fetchError } = await supabase
      .from('septic_tanks')
      .select('id')
      .eq('state', 'FL')
      .is('geom_fixed', null)
      .limit(BATCH_SIZE);

    if (fetchError) {
      console.error('\n❌ Fetch error:', fetchError.message);
      errors++;
      return 0;
    }

    if (!records || records.length === 0) {
      return 0;
    }

    const ids = records.map(r => r.id);

    // Use raw SQL for the update
    const { error: updateError } = await supabase.rpc('execute_sql', {
      query: `
        UPDATE septic_tanks
        SET 
          geom_fixed = ST_Transform(ST_SetSRID(geom, 2236), 4326),
          latitude = ST_Y(ST_Transform(ST_SetSRID(geom, 2236), 4326)),
          longitude = ST_X(ST_Transform(ST_SetSRID(geom, 2236), 4326))
        WHERE id = ANY($1)
      `,
      params: [ids]
    });

    if (updateError) {
      // Try direct update without RPC
      const { error: directError } = await supabase
        .from('septic_tanks')
        .update({ geom_fixed: supabase.rpc('ST_Transform', [supabase.rpc('ST_SetSRID', ['geom', 2236]), 4326]) })
        .in('id', ids);
      
      if (directError) {
        console.error('\n❌ Update error:', updateError.message);
        errors++;
        return 0;
      }
    }

    totalProcessed += records.length;
    return records.length;

  } catch (err) {
    console.error('\n❌ Exception:', err.message);
    errors++;
    return 0;
  }
}

async function main() {
  console.log('🚀 Florida Geometry Fix - Simple Sequential Processing\n');
  console.log('='.repeat(70));
  
  // Get total count
  console.log('\n📊 Counting records to process...');
  const { count } = await supabase
    .from('septic_tanks')
    .select('*', { count: 'exact', head: true })
    .eq('state', 'FL')
    .is('geom_fixed', null);
  
  const totalRecords = count || 0;
  
  if (totalRecords === 0) {
    console.log('\n✅ All records already processed!');
    return;
  }
  
  console.log(`\n📍 Found ${totalRecords.toLocaleString()} records to process`);
  console.log(`⚙️  Batch size: ${BATCH_SIZE.toLocaleString()}`);
  console.log(`⏱️  Estimated time: ${Math.ceil((totalRecords / BATCH_SIZE) * (DELAY_MS / 1000 / 60))} minutes\n`);
  
  console.log('Starting in 2 seconds...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  startTime = Date.now();
  let batchNum = 0;
  
  while (totalProcessed < totalRecords && errors < 20) {
    batchNum++;
    const updated = await processBatch();
    
    if (updated === 0 && errors === 0) {
      break; // No more records
    }
    
    // Progress
    const percent = ((totalProcessed / totalRecords) * 100).toFixed(1);
    const elapsed = Date.now() - startTime;
    const rate = totalProcessed / (elapsed / 1000);
    const remaining = (totalRecords - totalProcessed) / rate * 1000;
    
    process.stdout.write(`\r✓ Batch ${batchNum} | ${totalProcessed.toLocaleString()}/${totalRecords.toLocaleString()} (${percent}%) | ${rate.toFixed(0)}/s | ETA: ${formatTime(remaining)} | Errors: ${errors}  `);
    
    // Delay between batches
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  }
  
  const totalTime = Date.now() - startTime;
  
  console.log('\n\n' + '='.repeat(70));
  console.log('\n✅ COMPLETED!\n');
  console.log(`📊 Total processed: ${totalProcessed.toLocaleString()} records`);
  console.log(`⏱️  Total time: ${formatTime(totalTime)}`);
  console.log(`⚡ Average rate: ${(totalProcessed / (totalTime / 1000)).toFixed(0)} records/second`);
  console.log(`❌ Errors: ${errors}`);
  
  console.log('\n🎉 Done!\n');
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
