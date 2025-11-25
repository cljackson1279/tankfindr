#!/usr/bin/env node

/**
 * Import Fairfax County, Virginia - Permitted Septic Records
 * Data source: Fairfax County Health Department
 * URL: https://www.fairfaxcounty.gov/euclid/rest/services/Health/Permitted_Septic_Records/FeatureServer/0
 * 
 * Note: This is polygon data (parcels). We extract the centroid as the tank location.
 */

const { createClient } = require('@supabase/supabase-js');

const COUNTY_CONFIG = {
  name: 'Fairfax County',
  state: 'VA',
  featureServiceUrl: 'https://www.fairfaxcounty.gov/euclid/rest/services/Health/Permitted_Septic_Records/FeatureServer/0',
  idField: 'RECORDID',
  batchSize: 1000,
  delayMs: 1000
};

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
 * Calculate centroid of a polygon
 */
function calculateCentroid(coordinates) {
  // For polygons, coordinates[0] is the outer ring
  const ring = coordinates[0];
  let sumLat = 0, sumLng = 0;
  
  for (const [lng, lat] of ring) {
    sumLng += lng;
    sumLat += lat;
  }
  
  return {
    lng: sumLng / ring.length,
    lat: sumLat / ring.length
  };
}

/**
 * Fetch records in batches from ArcGIS Feature Service
 */
async function fetchBatch(offset) {
  const queryUrl = `${COUNTY_CONFIG.featureServiceUrl}/query?` +
    `where=1=1&` +
    `outFields=*&` +
    `f=geojson&` +
    `outSR=4326&` +
    `resultOffset=${offset}&` +
    `resultRecordCount=${COUNTY_CONFIG.batchSize}`;

  const response = await fetch(queryUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Get total record count from the service
 */
async function getTotalCount() {
  const countUrl = `${COUNTY_CONFIG.featureServiceUrl}/query?where=1=1&returnCountOnly=true&f=json`;
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
async function importBatch(features) {
  const records = [];
  let skipped = 0;

  for (const feature of features) {
    try {
      const attrs = feature.properties;
      let lng, lat;

      // Handle different geometry types
      if (feature.geometry.type === 'Polygon') {
        const centroid = calculateCentroid(feature.geometry.coordinates);
        lng = centroid.lng;
        lat = centroid.lat;
      } else if (feature.geometry.type === 'Point') {
        [lng, lat] = feature.geometry.coordinates;
      } else if (feature.geometry.type === 'MultiPolygon') {
        // Use first polygon's centroid
        const centroid = calculateCentroid(feature.geometry.coordinates[0]);
        lng = centroid.lng;
        lat = centroid.lat;
      } else {
        console.log(`⚠️  Unsupported geometry type: ${feature.geometry.type}`);
        skipped++;
        continue;
      }

      // Skip if no valid coordinates
      if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
        skipped++;
        continue;
      }

      // Build address from available fields
      const addressParts = [
        attrs.ADDRESS_1,
        attrs.ADDRESS_2,
        attrs.CITY,
        attrs.STATE,
        attrs.ZIP_CODE
      ].filter(Boolean);
      const address = addressParts.join(', ') || null;

      // Build the record
      const record = {
        source_id: String(attrs[COUNTY_CONFIG.idField] || attrs.OBJECTID || attrs.FID),
        county: COUNTY_CONFIG.name,
        state: COUNTY_CONFIG.state,
        parcel_id: attrs.PARCEL_ID || null,
        address: address,
        geom: `POINT(${lng} ${lat})`,
        attributes: {
          ...attrs,
          _geometry_type: feature.geometry.type,
          _is_centroid: feature.geometry.type !== 'Point'
        },
        data_source: 'fairfax_health_dept'
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
 * Main import function
 */
async function importFairfaxCounty() {
  console.log(`\n🚀 Starting import for ${COUNTY_CONFIG.name}, ${COUNTY_CONFIG.state}`);
  console.log(`📡 Source: ${COUNTY_CONFIG.featureServiceUrl}\n`);

  try {
    // Get total count
    console.log('🔍 Fetching total record count...');
    const totalCount = await getTotalCount();
    console.log(`✅ Found ${totalCount.toLocaleString()} total records\n`);

    if (totalCount === 0) {
      console.log('⚠️  No records found in the dataset');
      return;
    }

    let totalImported = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let offset = 0;

    // Process in batches
    while (offset < totalCount) {
      try {
        console.log(`📦 Fetching batch at offset ${offset.toLocaleString()}...`);
        const data = await fetchBatch(offset);

        if (!data.features || data.features.length === 0) {
          console.log('   No more features to process');
          break;
        }

        const { imported, skipped } = await importBatch(data.features);
        totalImported += imported;
        totalSkipped += skipped;

        const progress = Math.min(100, ((offset + data.features.length) / totalCount * 100)).toFixed(1);
        console.log(`   ✅ Imported ${imported} records (${progress}% complete)`);

        offset += COUNTY_CONFIG.batchSize;

        // Rate limiting
        if (offset < totalCount) {
          await new Promise(resolve => setTimeout(resolve, COUNTY_CONFIG.delayMs));
        }
      } catch (err) {
        console.error(`❌ Error processing batch at offset ${offset}:`, err.message);
        totalErrors++;
        offset += COUNTY_CONFIG.batchSize; // Skip to next batch
      }
    }

    console.log(`\n✅ Import complete!`);
    console.log(`   📊 Total records found: ${totalCount.toLocaleString()}`);
    console.log(`   ✅ Successfully imported: ${totalImported.toLocaleString()}`);
    console.log(`   ⚠️  Skipped (invalid coords): ${totalSkipped.toLocaleString()}`);
    console.log(`   ❌ Batch errors: ${totalErrors}`);

    // Verify the import
    console.log(`\n🔍 Verifying import...`);
    const { count, error: countError } = await supabase
      .from('septic_tanks')
      .select('*', { count: 'exact', head: true })
      .eq('county', COUNTY_CONFIG.name)
      .eq('state', COUNTY_CONFIG.state);

    if (!countError) {
      console.log(`✅ Total ${COUNTY_CONFIG.name} records in database: ${count.toLocaleString()}\n`);
    } else {
      console.log(`⚠️  Could not verify count: ${countError.message}\n`);
    }

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  importFairfaxCounty().catch(console.error);
}

module.exports = { importFairfaxCounty };
