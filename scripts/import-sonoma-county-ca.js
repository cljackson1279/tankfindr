#!/usr/bin/env node

/**
 * Import Sonoma County, California - Septic Permits
 * Data source: Permit Sonoma - Septic Permits (SEP)
 * URL: https://socogis.sonomacounty.ca.gov/map/rest/services/OWTSPublic/Permit_Sonoma_Septic_SEP_Permits/FeatureServer/0
 * 
 * Also supports OWTS (Non-Standard) Permits:
 * https://socogis.sonomacounty.ca.gov/map/rest/services/OWTSPublic/Permit_Sonoma_OWTS_Permits/FeatureServer/0
 */

const { createClient } = require('@supabase/supabase-js');

const COUNTY_CONFIGS = [
  {
    name: 'Sonoma County',
    state: 'CA',
    featureServiceUrl: 'https://socogis.sonomacounty.ca.gov/map/rest/services/OWTSPublic/Permit_Sonoma_Septic_SEP_Permits/FeatureServer/0',
    idField: 'B1_ALT_ID',
    dataSource: 'permit_sonoma_sep',
    description: 'Standard Septic Permits'
  },
  {
    name: 'Sonoma County',
    state: 'CA',
    featureServiceUrl: 'https://socogis.sonomacounty.ca.gov/map/rest/services/OWTSPublic/Permit_Sonoma_OWTS_Permits/FeatureServer/0',
    idField: 'B1_ALT_ID',
    dataSource: 'permit_sonoma_owts',
    description: 'Non-Standard OWTS Permits'
  }
];

const BATCH_SIZE = 1000;
const DELAY_MS = 1000;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

/**
 * Fetch records in batches from ArcGIS Feature Service
 */
async function fetchBatch(serviceUrl, offset) {
  const queryUrl = `${serviceUrl}/query?` +
    `where=1=1&` +
    `outFields=*&` +
    `f=geojson&` +
    `outSR=4326&` +
    `resultOffset=${offset}&` +
    `resultRecordCount=${BATCH_SIZE}`;

  const response = await fetch(queryUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Get total record count from the service
 */
async function getTotalCount(serviceUrl) {
  const countUrl = `${serviceUrl}/query?where=1=1&returnCountOnly=true&f=json`;
  const response = await fetch(countUrl);
  if (!response.ok) {
    throw new Error(`Failed to get count: ${response.status}`);
  }
  const data = await response.json();
  return data.count || 0;
}

/**
 * Process and import a batch of features
 */
async function importBatch(features, config) {
  const records = [];
  let skipped = 0;

  for (const feature of features) {
    try {
      const coords = feature.geometry.coordinates;
      const [lng, lat] = coords;
      const attrs = feature.properties;

      // Skip if no valid coordinates
      if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
        skipped++;
        continue;
      }

      // Extract address from Situs_Address or other fields
      const address = attrs.Situs_Address || 
                     attrs.B1_WORK_DESC || 
                     attrs.ADDRESS || 
                     null;

      // Build source_id with data source prefix to avoid conflicts
      const sourceId = `${config.dataSource}_${attrs[config.idField] || attrs.OBJECTID || attrs.FID}`;

      // Build the record
      const record = {
        source_id: sourceId,
        county: config.name,
        state: config.state,
        parcel_id: attrs.B1_PARCEL_NBR || attrs.PARCEL_NUMBER || null,
        address: address,
        geom: `POINT(${lng} ${lat})`,
        attributes: {
          ...attrs,
          _permit_type: config.description
        },
        data_source: config.dataSource
      };

      records.push(record);
    } catch (err) {
      console.error(`⚠️  Error processing feature:`, err.message);
      skipped++;
    }
  }

  // Bulk insert with upsert
  if (records.length > 0) {
    const { error } = await supabase
      .from('septic_tanks')
      .upsert(records, {
        onConflict: 'source_id,county,state',
        ignoreDuplicates: false
      });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  return { imported: records.length, skipped };
}

/**
 * Import from a single service
 */
async function importService(config) {
  console.log(`\n📡 Importing ${config.description}...`);
  console.log(`   Source: ${config.featureServiceUrl}`);

  try {
    // Get total count
    const totalCount = await getTotalCount(config.featureServiceUrl);
    console.log(`   ✅ Found ${totalCount.toLocaleString()} records\n`);

    if (totalCount === 0) {
      console.log('   ⚠️  No records found');
      return { imported: 0, skipped: 0, errors: 0 };
    }

    let totalImported = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let offset = 0;

    // Process in batches
    while (offset < totalCount) {
      try {
        const data = await fetchBatch(config.featureServiceUrl, offset);

        if (!data.features || data.features.length === 0) {
          break;
        }

        const { imported, skipped } = await importBatch(data.features, config);
        totalImported += imported;
        totalSkipped += skipped;

        const progress = Math.min(100, ((offset + data.features.length) / totalCount * 100)).toFixed(1);
        console.log(`   📦 Batch ${Math.floor(offset / BATCH_SIZE) + 1}: Imported ${imported} records (${progress}% complete)`);

        offset += BATCH_SIZE;

        // Rate limiting
        if (offset < totalCount) {
          await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
      } catch (err) {
        console.error(`   ❌ Error processing batch at offset ${offset}:`, err.message);
        totalErrors++;
        offset += BATCH_SIZE; // Skip to next batch
      }
    }

    return { imported: totalImported, skipped: totalSkipped, errors: totalErrors };
  } catch (error) {
    console.error(`   ❌ Service import failed:`, error.message);
    return { imported: 0, skipped: 0, errors: 1 };
  }
}

/**
 * Main import function
 */
async function importSonomaCounty() {
  console.log(`\n🚀 Starting import for Sonoma County, CA`);
  console.log(`📋 Importing from ${COUNTY_CONFIGS.length} data sources\n`);

  const stats = {
    totalImported: 0,
    totalSkipped: 0,
    totalErrors: 0
  };

  // Import from each service
  for (const config of COUNTY_CONFIGS) {
    const result = await importService(config);
    stats.totalImported += result.imported;
    stats.totalSkipped += result.skipped;
    stats.totalErrors += result.errors;

    // Delay between services
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n✅ All imports complete!`);
  console.log(`   ✅ Successfully imported: ${stats.totalImported.toLocaleString()}`);
  console.log(`   ⚠️  Skipped (invalid coords): ${stats.totalSkipped.toLocaleString()}`);
  console.log(`   ❌ Errors: ${stats.totalErrors}`);

  // Verify the import
  console.log(`\n🔍 Verifying import...`);
  const { count, error: countError } = await supabase
    .from('septic_tanks')
    .select('*', { count: 'exact', head: true })
    .eq('county', 'Sonoma County')
    .eq('state', 'CA');

  if (!countError) {
    console.log(`✅ Total Sonoma County records in database: ${count.toLocaleString()}\n`);
  } else {
    console.log(`⚠️  Could not verify count: ${countError.message}\n`);
  }
}

// Run the import
if (require.main === module) {
  importSonomaCounty().catch(console.error);
}

module.exports = { importSonomaCounty };
