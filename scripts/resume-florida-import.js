const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const FLORIDA_CONFIG = {
  name: 'Florida (Statewide)',
  state: 'FL',
  url: 'https://ca.dep.state.fl.us/arcgis/rest/services/OpenData/SEPTIC_SYSTEMS/MapServer/0',
  idField: 'OBJECTID',
  addressField: 'PHY_ADD1',  // Updated field name
  parcelField: 'PARCELNO',   // Updated field name
  recordCount: 1939334
};

const BATCH_SIZE = 1000;
const DELAY_MS = 2000; // 2 seconds between batches to avoid rate limits

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getCurrentCount() {
  const { data, error } = await supabase
    .from('septic_tanks')
    .select('id', { count: 'exact', head: true })
    .eq('county', 'Florida (Statewide)')
    .eq('state', 'FL');
  
  if (error) {
    console.error('Error getting current count:', error);
    return 0;
  }
  
  return data?.length || 0;
}

async function fetchBatch(offset) {
  const url = `${FLORIDA_CONFIG.url}/query?where=1=1&outFields=*&f=json&resultOffset=${offset}&resultRecordCount=${BATCH_SIZE}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.features || [];
}

async function importBatch(features, batchNum, totalBatches) {
  const records = features
    .map(feature => {
      try {
        const props = feature.attributes;
        const geom = feature.geometry;
        
        if (!geom || !geom.x || !geom.y) {
          return null;
        }

        return {
          source_id: String(props[FLORIDA_CONFIG.idField] || props.OBJECTID),
          county: FLORIDA_CONFIG.name,
          state: FLORIDA_CONFIG.state,
          parcel_id: props[FLORIDA_CONFIG.parcelField] || props.PARCEL_ID || null,
          address: props[FLORIDA_CONFIG.addressField] || props.SITE_ADDRESS || null,
          geom: `POINT(${geom.x} ${geom.y})`,
          attributes: props,
          data_source: 'arcgis_feature_service'
        };
      } catch (err) {
        console.error('Error processing feature:', err);
        return null;
      }
    })
    .filter(r => r !== null);

  if (records.length === 0) {
    return { imported: 0, skipped: 0, errors: 0 };
  }

  const { data, error } = await supabase
    .from('septic_tanks')
    .upsert(records, { 
      onConflict: 'source_id,county,state',
      ignoreDuplicates: true 
    });

  if (error) {
    console.error(`❌ Batch ${batchNum}/${totalBatches} error:`, error.message);
    return { imported: 0, skipped: 0, errors: records.length };
  }

  console.log(`✅ Batch ${batchNum}/${totalBatches}: ${records.length} records imported`);
  return { imported: records.length, skipped: 0, errors: 0 };
}

async function main() {
  console.log('🚀 Resuming Florida Statewide Import...\n');
  
  // Check current progress
  const currentCount = await getCurrentCount();
  console.log(`📊 Current Florida records in database: ${currentCount.toLocaleString()}`);
  
  const startOffset = currentCount;
  const totalRecords = FLORIDA_CONFIG.recordCount;
  const remainingRecords = totalRecords - startOffset;
  const totalBatches = Math.ceil(remainingRecords / BATCH_SIZE);
  
  console.log(`📋 Remaining to import: ${remainingRecords.toLocaleString()} records`);
  console.log(`📦 Batches to process: ${totalBatches}`);
  console.log(`⏱️  Estimated time: ${Math.round(totalBatches * 2 / 60)} minutes\n`);
  
  let stats = {
    imported: 0,
    skipped: 0,
    errors: 0
  };
  
  const startTime = Date.now();
  
  for (let i = 0; i < totalBatches; i++) {
    const offset = startOffset + (i * BATCH_SIZE);
    const batchNum = i + 1;
    
    try {
      console.log(`\n📥 Fetching batch ${batchNum}/${totalBatches} (offset: ${offset})...`);
      const features = await fetchBatch(offset);
      
      if (features.length === 0) {
        console.log('✅ No more records to fetch. Import complete!');
        break;
      }
      
      const result = await importBatch(features, batchNum, totalBatches);
      stats.imported += result.imported;
      stats.skipped += result.skipped;
      stats.errors += result.errors;
      
      // Progress update every 10 batches
      if (batchNum % 10 === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = stats.imported / elapsed;
        const remaining = (totalRecords - startOffset - stats.imported) / rate;
        
        console.log(`\n📊 Progress Update:`);
        console.log(`   Imported: ${stats.imported.toLocaleString()} / ${remainingRecords.toLocaleString()}`);
        console.log(`   Rate: ${Math.round(rate)} records/sec`);
        console.log(`   ETA: ${Math.round(remaining / 60)} minutes\n`);
      }
      
      // Delay between batches to avoid rate limits
      await sleep(DELAY_MS);
      
    } catch (error) {
      console.error(`❌ Error in batch ${batchNum}:`, error.message);
      stats.errors += BATCH_SIZE;
      
      // Wait longer on error
      await sleep(DELAY_MS * 2);
    }
  }
  
  const totalTime = (Date.now() - startTime) / 1000;
  
  console.log('\n======================================================================');
  console.log('📊 FLORIDA IMPORT COMPLETE');
  console.log('======================================================================');
  console.log(`✅ Total Imported: ${stats.imported.toLocaleString()}`);
  console.log(`⚠️  Total Skipped: ${stats.skipped.toLocaleString()}`);
  console.log(`❌ Total Errors: ${stats.errors.toLocaleString()}`);
  console.log(`⏱️  Total Time: ${Math.round(totalTime / 60)} minutes`);
  console.log(`📈 Average Rate: ${Math.round(stats.imported / totalTime)} records/sec`);
  
  // Get final count
  const finalCount = await getCurrentCount();
  console.log(`📍 Total Florida records in database: ${finalCount.toLocaleString()}`);
  console.log('🎉 Import complete!');
}

main().catch(console.error);
