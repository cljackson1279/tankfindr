#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Configuration
const BATCH_SIZE = 1000;  // Process 1000 records at a time (reduced to avoid timeouts)
const PARALLEL_WORKERS = 10;  // Run 10 updates simultaneously
const DELAY_BETWEEN_BATCHES = 100;  // 100ms delay to avoid overwhelming DB

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Progress tracking
let totalProcessed = 0;
let totalRecords = 0;
let startTime = Date.now();
let errors = 0;

// Format time
function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// Progress bar
function showProgress() {
  const percent = ((totalProcessed / totalRecords) * 100).toFixed(1);
  const elapsed = Date.now() - startTime;
  const rate = totalProcessed / (elapsed / 1000);
  const remaining = (totalRecords - totalProcessed) / rate * 1000;
  
  const bar = '█'.repeat(Math.floor(percent / 2)) + '░'.repeat(50 - Math.floor(percent / 2));
  
  process.stdout.write(`\r[${bar}] ${percent}% | ${totalProcessed.toLocaleString()}/${totalRecords.toLocaleString()} | ${rate.toFixed(0)}/s | ETA: ${formatTime(remaining)} | Errors: ${errors}  `);
}

// Process a single batch
async function processBatch(batchNumber) {
  try {
    const { data, error } = await supabase.rpc('fix_florida_geometry_batch', {
      batch_size: BATCH_SIZE
    });

    if (error) {
      console.error(`\n❌ Error in batch ${batchNumber}:`, error.message);
      errors++;
      return 0;
    }

    const updated = data || 0;
    totalProcessed += updated;
    showProgress();
    
    return updated;
  } catch (err) {
    console.error(`\n❌ Exception in batch ${batchNumber}:`, err.message);
    errors++;
    return 0;
  }
}

// Main execution
async function main() {
  console.log('🚀 Florida Geometry Fix - Fast Parallel Processing\n');
  console.log('='.repeat(70));
  
  // Get total count
  console.log('\n📊 Counting records to process...');
  const { count } = await supabase
    .from('septic_tanks')
    .select('*', { count: 'exact', head: true })
    .eq('state', 'FL')
    .is('geom_fixed', null);
  
  totalRecords = count || 0;
  
  if (totalRecords === 0) {
    console.log('\n✅ All records already processed!');
    return;
  }
  
  console.log(`\n📍 Found ${totalRecords.toLocaleString()} records to process`);
  console.log(`⚙️  Batch size: ${BATCH_SIZE.toLocaleString()}`);
  console.log(`⚡ Parallel workers: ${PARALLEL_WORKERS}`);
  console.log(`⏱️  Estimated time: ${Math.ceil(totalRecords / (BATCH_SIZE * PARALLEL_WORKERS))} minutes\n`);
  
  console.log('Starting in 3 seconds...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  startTime = Date.now();
  
  // Process batches in parallel
  let batchNumber = 0;
  while (totalProcessed < totalRecords && errors < 10) {
    const workers = [];
    
    // Spawn parallel workers
    for (let i = 0; i < PARALLEL_WORKERS && totalProcessed < totalRecords; i++) {
      workers.push(processBatch(++batchNumber));
    }
    
    // Wait for all workers to complete
    const results = await Promise.all(workers);
    
    // If no records were updated, we're done
    if (results.every(r => r === 0)) {
      break;
    }
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
  }
  
  const totalTime = Date.now() - startTime;
  
  console.log('\n\n' + '='.repeat(70));
  console.log('\n✅ COMPLETED!\n');
  console.log(`📊 Total processed: ${totalProcessed.toLocaleString()} records`);
  console.log(`⏱️  Total time: ${formatTime(totalTime)}`);
  console.log(`⚡ Average rate: ${(totalProcessed / (totalTime / 1000)).toFixed(0)} records/second`);
  console.log(`❌ Errors: ${errors}`);
  
  if (errors > 0) {
    console.log('\n⚠️  Some batches had errors. You may need to run this again.');
  }
  
  console.log('\n🎉 Florida geometry fix complete! All regions should now work.\n');
}

// Run it
main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
