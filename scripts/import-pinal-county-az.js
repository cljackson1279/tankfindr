#!/usr/bin/env node

/**
 * Import Pinal County, AZ septic tank data from ArcGIS Feature Service
 * Data source: https://services.arcgis.com/VAz0pvmZVDCCvDdg/ArcGIS/rest/services/Onsite_Wastewater_Treatment_Facilities/FeatureServer/0
 */

const { createClient } = require('@supabase/supabase-js');

const COUNTY_CONFIG = {
  name: 'Pinal County',
  state: 'AZ',
  featureServiceUrl: 'https://services.arcgis.com/VAz0pvmZVDCCvDdg/ArcGIS/rest/services/Onsite_Wastewater_Treatment_Facilities/FeatureServer/0',
  idField: 'FACILITY_ID'
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cijtllcbrvkbvrjriweu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function importPinalCounty() {
  console.log(`\n🚀 Starting import for ${COUNTY_CONFIG.name}, ${COUNTY_CONFIG.state}...`);
  console.log(`📡 Fetching data from: ${COUNTY_CONFIG.featureServiceUrl}\n`);

  try {
    // Fetch data from ArcGIS Feature Service
    const queryUrl = `${COUNTY_CONFIG.featureServiceUrl}/query?where=1=1&outFields=*&f=geojson&outSR=4326`;
    console.log('🔍 Querying ArcGIS Feature Service...');
    
    const response = await fetch(queryUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      console.log('⚠️  No features found in the dataset');
      return;
    }

    console.log(`✅ Found ${data.features.length} septic tank records\n`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // Import each feature
    for (const feature of data.features) {
      try {
        const coords = feature.geometry.coordinates;
        const [lng, lat] = coords;
        const attrs = feature.properties;

        // Skip if no valid coordinates
        if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
          console.log(`⚠️  Skipping record with invalid coordinates: ${attrs[COUNTY_CONFIG.idField]}`);
          skipped++;
          continue;
        }

        // Prepare the record
        const record = {
          source_id: String(attrs[COUNTY_CONFIG.idField] || attrs.OBJECTID || attrs.FID),
          county: COUNTY_CONFIG.name,
          state: COUNTY_CONFIG.state,
          parcel_id: attrs.PARCEL_NUMBER || attrs.PARCEL_ID || attrs.APN || null,
          address: attrs.SITE_ADDRESS || attrs.ADDRESS || attrs.LOCATION || null,
          geom: `POINT(${lng} ${lat})`,
          attributes: attrs,
          data_source: 'arcgis_feature_service'
        };

        // Insert or update the record
        const { error } = await supabase
          .from('septic_tanks')
          .upsert(record, { 
            onConflict: 'source_id,county,state',
            ignoreDuplicates: false 
          });

        if (error) {
          console.error(`❌ Error importing record ${record.source_id}:`, error.message);
          errors++;
        } else {
          imported++;
          if (imported % 100 === 0) {
            console.log(`   Imported ${imported} records...`);
          }
        }
      } catch (err) {
        console.error(`❌ Error processing feature:`, err.message);
        errors++;
      }
    }

    console.log(`\n✅ Import complete!`);
    console.log(`   📊 Total records: ${data.features.length}`);
    console.log(`   ✅ Imported: ${imported}`);
    console.log(`   ⚠️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}\n`);

    // Verify the import
    const { count, error: countError } = await supabase
      .from('septic_tanks')
      .select('*', { count: 'exact', head: true })
      .eq('county', COUNTY_CONFIG.name)
      .eq('state', COUNTY_CONFIG.state);

    if (!countError) {
      console.log(`📍 Total ${COUNTY_CONFIG.name} records in database: ${count}\n`);
    }

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run the import
importPinalCounty().catch(console.error);
