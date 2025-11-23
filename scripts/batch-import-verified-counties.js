#!/usr/bin/env node

/**
 * Batch import script for verified counties
 * Imports data from 4 verified county GIS endpoints
 */

const { createClient } = require('@supabase/supabase-js');

const VERIFIED_COUNTIES = [
  {
    name: 'Miami-Dade County',
    state: 'FL',
    url: 'https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services/DOHSepticSystem_gdb/FeatureServer/0',
    idField: 'APNO',
    addressField: 'SYSTADDR',
    parcelField: 'FOLIO',
    cityField: 'CITY',
    zipField: 'ZIPCODE',
    latField: 'LAT',
    lngField: 'LON',
    recordCount: 80835
  },
  {
    name: 'Sonoma County',
    state: 'CA',
    url: 'https://socogis.sonomacounty.ca.gov/map/rest/services/OWTSPublic/Permit_Sonoma_OWTS_Permits/FeatureServer/0',
    idField: 'B1_ALT_ID',
    addressField: 'Situs_Address',
    parcelField: 'B1_PARCEL_NBR',
    latField: 'Y',
    lngField: 'X',
    recordCount: 4201
  },
  {
    name: 'Fairfax County',
    state: 'VA',
    url: 'https://www.fairfaxcounty.gov/euclid/rest/services/Health/Permitted_Septic_Records/MapServer/0',
    idField: 'RECORDID',
    addressField: 'ADDRESS_1',
    parcelField: 'PARCEL_ID',
    cityField: 'CITY',
    zipField: 'ZIP_CODE',
    recordCount: 23930
  },
  {
    name: 'Forsyth County',
    state: 'NC',
    url: 'https://terraweb.co.forsyth.nc.us/arcgis/rest/services/PublicHealth/PH_Collections/FeatureServer/11',
    idField: 'OBJECTID',
    addressField: null, // No address field available
    parcelField: 'State_ID_Number',
    recordCount: 4623
  }
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cijtllcbrvkbvrjriweu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function importCounty(config) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 Importing ${config.name}, ${config.state}`);
  console.log(`📊 Expected records: ${config.recordCount}`);
  console.log('='.repeat(70));

  try {
    // Fetch data in batches
    const batchSize = 1000;
    let offset = 0;
    let totalImported = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let hasMore = true;

    while (hasMore) {
      const queryUrl = `${config.url}/query?where=1=1&outFields=*&f=json&resultOffset=${offset}&resultRecordCount=${batchSize}&outSR=4326`;
      
      console.log(`\n📥 Fetching batch ${Math.floor(offset / batchSize) + 1} (offset ${offset})...`);

      const response = await fetch(queryUrl);
      const data = await response.json();

      if (!data.features || data.features.length === 0) {
        hasMore = false;
        break;
      }

      console.log(`   Retrieved ${data.features.length} records`);

      // Process each feature
      for (const feature of data.features) {
        try {
          let lat, lng;

          // Extract coordinates based on geometry type
          if (feature.geometry) {
            if (feature.geometry.x && feature.geometry.y) {
              // Point geometry (ArcGIS format)
              lng = feature.geometry.x;
              lat = feature.geometry.y;
            } else if (feature.geometry.coordinates) {
              // GeoJSON format
              [lng, lat] = feature.geometry.coordinates;
            }
          }

          // Try to get coordinates from attributes if not in geometry
          if (!lat || !lng) {
            const attrs = feature.attributes;
            if (config.latField && config.lngField) {
              lat = attrs[config.latField];
              lng = attrs[config.lngField];
            }
          }

          // Skip if no valid coordinates
          if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
            totalSkipped++;
            continue;
          }

          const attrs = feature.attributes;

          // Build address string
          let address = attrs[config.addressField] || null;
          if (address && config.cityField && attrs[config.cityField]) {
            address += `, ${attrs[config.cityField]}`;
          }
          if (address && config.zipField && attrs[config.zipField]) {
            address += ` ${attrs[config.zipField]}`;
          }

          const record = {
            source_id: String(attrs[config.idField] || attrs.OBJECTID),
            county: config.name,
            state: config.state,
            parcel_id: attrs[config.parcelField] || null,
            address: address,
            geom: `POINT(${lng} ${lat})`,
            attributes: attrs,
            data_source: 'arcgis_feature_service'
          };

          const { error } = await supabase
            .from('septic_tanks')
            .upsert(record, {
              onConflict: 'source_id,county,state',
              ignoreDuplicates: false
            });

          if (error) {
            totalErrors++;
            if (totalErrors <= 5) {
              console.error(`   ❌ Error: ${error.message}`);
            }
          } else {
            totalImported++;
          }

        } catch (err) {
          totalErrors++;
          if (totalErrors <= 5) {
            console.error(`   ❌ Error processing feature: ${err.message}`);
          }
        }
      }

      console.log(`   ✅ Batch complete: ${totalImported} imported, ${totalSkipped} skipped, ${totalErrors} errors`);

      offset += batchSize;

      // Check if we got fewer records than requested (last batch)
      if (data.features.length < batchSize) {
        hasMore = false;
      }

      // Rate limiting - wait 1 second between batches
      if (hasMore) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    console.log(`\n✅ ${config.name} import complete!`);
    console.log(`   📊 Total imported: ${totalImported}`);
    console.log(`   ⚠️  Total skipped: ${totalSkipped}`);
    console.log(`   ❌ Total errors: ${totalErrors}`);

    // Verify in database
    const { count } = await supabase
      .from('septic_tanks')
      .select('*', { count: 'exact', head: true })
      .eq('county', config.name)
      .eq('state', config.state);

    console.log(`   📍 Records in database: ${count}`);

    return {
      county: config.name,
      state: config.state,
      imported: totalImported,
      skipped: totalSkipped,
      errors: totalErrors,
      inDatabase: count
    };

  } catch (error) {
    console.error(`\n❌ Import failed for ${config.name}:`, error.message);
    return {
      county: config.name,
      state: config.state,
      imported: 0,
      skipped: 0,
      errors: 0,
      error: error.message
    };
  }
}

async function batchImportAll() {
  console.log('\n🚀 Starting Batch Import of Verified Counties');
  console.log(`📊 Total counties: ${VERIFIED_COUNTIES.length}`);
  console.log(`📈 Total expected records: ${VERIFIED_COUNTIES.reduce((sum, c) => sum + c.recordCount, 0).toLocaleString()}\n`);

  const results = [];

  for (const county of VERIFIED_COUNTIES) {
    const result = await importCounty(county);
    results.push(result);

    // Wait 2 seconds between counties
    await new Promise(r => setTimeout(r, 2000));
  }

  // Final summary
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 BATCH IMPORT SUMMARY');
  console.log('='.repeat(70));

  const totalImported = results.reduce((sum, r) => sum + r.imported, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);

  console.log(`\n✅ Total Imported: ${totalImported.toLocaleString()}`);
  console.log(`⚠️  Total Skipped: ${totalSkipped.toLocaleString()}`);
  console.log(`❌ Total Errors: ${totalErrors.toLocaleString()}`);

  console.log('\n📋 County Breakdown:');
  results.forEach(r => {
    if (r.error) {
      console.log(`  ❌ ${r.county}, ${r.state}: FAILED - ${r.error}`);
    } else {
      console.log(`  ✅ ${r.county}, ${r.state}: ${r.inDatabase.toLocaleString()} records`);
    }
  });

  // Get total count in database
  const { count: totalCount } = await supabase
    .from('septic_tanks')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📍 Total records in database: ${totalCount.toLocaleString()}`);
  console.log('\n🎉 Batch import complete!\n');
}

batchImportAll().catch(console.error);
