#!/usr/bin/env node

/**
 * Batch 2 Import - Florida Statewide + 6 more sources
 * Total: 2,053,022 records
 */

const { createClient } = require('@supabase/supabase-js');

const BATCH2_COUNTIES = [
  {
    name: 'Florida (Statewide)',
    state: 'FL',
    url: 'https://ca.dep.state.fl.us/arcgis/rest/services/OpenData/SEPTIC_SYSTEMS/MapServer/0',
    idField: 'OBJECTID',
    addressField: 'PHY_ADD1',
    parcelField: 'PARCELNO',
    cityField: 'PHY_CITY',
    zipField: 'PHY_ZIPCD',
    recordCount: 1939334,
    notes: 'All 67 Florida counties'
  },
  {
    name: 'Miami-Dade County (DOH)',
    state: 'FL',
    url: 'https://gisweb.miamidade.gov/arcgis/rest/services/Wasd/DOHSepticSystem_1_v1/MapServer/0',
    idField: 'APNO',
    addressField: null, // No address field
    parcelField: null,
    cityField: 'CITY',
    zipField: 'ZIPCODE',
    recordCount: 80835,
    notes: 'OSTDS point locations'
  },
  {
    name: 'Fairfax County (Septic Tanks)',
    state: 'VA',
    url: 'https://www.fairfaxcounty.gov/gisint1/rest/services/PLUS/EnvHealthMap/MapServer/0',
    idField: 'OBJECTID',
    addressField: null,
    parcelField: 'AP_NUMBER',
    recordCount: 21618,
    notes: 'Actual septic tank points'
  },
  {
    name: 'Allen County',
    state: 'OH',
    url: 'https://gis.allencountyohio.com/arcgis/rest/services/AGOL/AGOL_HealthDepartment/FeatureServer/0',
    idField: 'OBJECTID',
    addressField: null,
    parcelField: 'PermitNo',
    recordCount: 5052,
    notes: 'Septic system points'
  },
  {
    name: 'Rhode Island (Statewide)',
    state: 'RI',
    url: 'https://gisstage.dot.ri.gov/editting/rest/services/SCP/OWTS/FeatureServer/0',
    idField: 'ObjectID',
    addressField: 'Match_addr',
    parcelField: null,
    recordCount: 877,
    notes: 'OWTS points'
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
  console.log(`📊 Expected records: ${config.recordCount.toLocaleString()}`);
  console.log(`📝 ${config.notes}`);
  console.log('='.repeat(70));

  try {
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

      for (const feature of data.features) {
        try {
          let lat, lng;

          // Extract coordinates
          if (feature.geometry) {
            if (feature.geometry.x && feature.geometry.y) {
              lng = feature.geometry.x;
              lat = feature.geometry.y;
            } else if (feature.geometry.coordinates) {
              [lng, lat] = feature.geometry.coordinates;
            }
          }

          if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
            totalSkipped++;
            continue;
          }

          const attrs = feature.attributes;

          // Build address
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

      if (data.features.length < batchSize) {
        hasMore = false;
      }

      // Rate limiting
      if (hasMore) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    console.log(`\n✅ ${config.name} import complete!`);
    console.log(`   📊 Total imported: ${totalImported.toLocaleString()}`);
    console.log(`   ⚠️  Total skipped: ${totalSkipped.toLocaleString()}`);
    console.log(`   ❌ Total errors: ${totalErrors.toLocaleString()}`);

    const { count } = await supabase
      .from('septic_tanks')
      .select('*', { count: 'exact', head: true })
      .eq('county', config.name)
      .eq('state', config.state);

    console.log(`   📍 Records in database: ${count?.toLocaleString() || 0}`);

    return {
      county: config.name,
      state: config.state,
      imported: totalImported,
      skipped: totalSkipped,
      errors: totalErrors,
      inDatabase: count || 0
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
  console.log('\n🚀 Starting Batch 2 Import');
  console.log(`📊 Total sources: ${BATCH2_COUNTIES.length}`);
  console.log(`📈 Total expected records: ${BATCH2_COUNTIES.reduce((sum, c) => sum + c.recordCount, 0).toLocaleString()}\n`);

  const results = [];

  for (const county of BATCH2_COUNTIES) {
    const result = await importCounty(county);
    results.push(result);
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n\n' + '='.repeat(70));
  console.log('📊 BATCH 2 IMPORT SUMMARY');
  console.log('='.repeat(70));

  const totalImported = results.reduce((sum, r) => sum + r.imported, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);

  console.log(`\n✅ Total Imported: ${totalImported.toLocaleString()}`);
  console.log(`⚠️  Total Skipped: ${totalSkipped.toLocaleString()}`);
  console.log(`❌ Total Errors: ${totalErrors.toLocaleString()}`);

  console.log('\n📋 Source Breakdown:');
  results.forEach(r => {
    if (r.error) {
      console.log(`  ❌ ${r.county}, ${r.state}: FAILED - ${r.error}`);
    } else {
      console.log(`  ✅ ${r.county}, ${r.state}: ${r.inDatabase.toLocaleString()} records`);
    }
  });

  const { count: totalCount } = await supabase
    .from('septic_tanks')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📍 Total records in database: ${totalCount?.toLocaleString() || 0}`);
  console.log('\n🎉 Batch 2 import complete!\n');
}

batchImportAll().catch(console.error);
