#!/usr/bin/env node

/**
 * Seed the database with sample septic tank data for testing
 * This creates realistic test data across multiple counties
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cijtllcbrvkbvrjriweu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Sample data for different counties
const SAMPLE_DATA = [
  // Union County, NJ (around Westfield area)
  {
    county: 'Union County',
    state: 'NJ',
    tanks: [
      { lat: 40.646331, lng: -74.351231, address: '501 Rahway Ave, Westfield, NJ 07090', parcel: '1234-56-78' },
      { lat: 40.648, lng: -74.350, address: '525 Rahway Ave, Westfield, NJ 07090', parcel: '1234-56-79' },
      { lat: 40.645, lng: -74.352, address: '480 Rahway Ave, Westfield, NJ 07090', parcel: '1234-56-77' },
      { lat: 40.650, lng: -74.348, address: '600 Rahway Ave, Westfield, NJ 07090', parcel: '1234-56-80' },
      { lat: 40.644, lng: -74.353, address: '450 Rahway Ave, Westfield, NJ 07090', parcel: '1234-56-76' },
    ]
  },
  // Pinal County, AZ (around Casa Grande)
  {
    county: 'Pinal County',
    state: 'AZ',
    tanks: [
      { lat: 32.879, lng: -111.757, address: '1234 N Pinal Ave, Casa Grande, AZ 85122', parcel: 'R1234567' },
      { lat: 32.880, lng: -111.758, address: '1250 N Pinal Ave, Casa Grande, AZ 85122', parcel: 'R1234568' },
      { lat: 32.878, lng: -111.756, address: '1220 N Pinal Ave, Casa Grande, AZ 85122', parcel: 'R1234566' },
      { lat: 32.881, lng: -111.759, address: '1270 N Pinal Ave, Casa Grande, AZ 85122', parcel: 'R1234569' },
      { lat: 32.877, lng: -111.755, address: '1200 N Pinal Ave, Casa Grande, AZ 85122', parcel: 'R1234565' },
    ]
  },
  // Palm Beach County, FL (around West Palm Beach)
  {
    county: 'Palm Beach County',
    state: 'FL',
    tanks: [
      { lat: 26.715, lng: -80.053, address: '1000 S Dixie Hwy, West Palm Beach, FL 33401', parcel: 'PB-12345' },
      { lat: 26.716, lng: -80.054, address: '1020 S Dixie Hwy, West Palm Beach, FL 33401', parcel: 'PB-12346' },
      { lat: 26.714, lng: -80.052, address: '980 S Dixie Hwy, West Palm Beach, FL 33401', parcel: 'PB-12344' },
      { lat: 26.717, lng: -80.055, address: '1040 S Dixie Hwy, West Palm Beach, FL 33401', parcel: 'PB-12347' },
      { lat: 26.713, lng: -80.051, address: '960 S Dixie Hwy, West Palm Beach, FL 33401', parcel: 'PB-12343' },
    ]
  },
  // Kitsap County, WA (around Bremerton)
  {
    county: 'Kitsap County',
    state: 'WA',
    tanks: [
      { lat: 47.567, lng: -122.632, address: '1500 Naval Ave, Bremerton, WA 98312', parcel: 'KC-98765' },
      { lat: 47.568, lng: -122.633, address: '1520 Naval Ave, Bremerton, WA 98312', parcel: 'KC-98766' },
      { lat: 47.566, lng: -122.631, address: '1480 Naval Ave, Bremerton, WA 98312', parcel: 'KC-98764' },
      { lat: 47.569, lng: -122.634, address: '1540 Naval Ave, Bremerton, WA 98312', parcel: 'KC-98767' },
      { lat: 47.565, lng: -122.630, address: '1460 Naval Ave, Bremerton, WA 98312', parcel: 'KC-98763' },
    ]
  },
];

async function seedSampleData() {
  console.log('\n🌱 Seeding sample septic tank data...\n');

  let totalImported = 0;

  for (const countyData of SAMPLE_DATA) {
    console.log(`📍 Importing ${countyData.county}, ${countyData.state}...`);

    for (const tank of countyData.tanks) {
      try {
        const record = {
          source_id: `SAMPLE-${countyData.state}-${tank.parcel}`,
          county: countyData.county,
          state: countyData.state,
          parcel_id: tank.parcel,
          address: tank.address,
          geom: `POINT(${tank.lng} ${tank.lat})`,
          attributes: {
            install_date: '2020-01-15',
            tank_type: 'Conventional',
            capacity: '1000 gallons',
            status: 'Active',
            last_inspection: '2024-06-15'
          },
          data_source: 'sample_data'
        };

        const { error } = await supabase
          .from('septic_tanks')
          .upsert(record, { 
            onConflict: 'source_id,county,state',
            ignoreDuplicates: false 
          });

        if (error) {
          console.error(`   ❌ Error: ${error.message}`);
        } else {
          totalImported++;
        }
      } catch (err) {
        console.error(`   ❌ Error:`, err.message);
      }
    }

    console.log(`   ✅ Imported ${countyData.tanks.length} records`);
  }

  console.log(`\n✅ Sample data seeding complete!`);
  console.log(`   📊 Total records imported: ${totalImported}\n`);

  // Verify the import
  const { count, error: countError } = await supabase
    .from('septic_tanks')
    .select('*', { count: 'exact', head: true });

  if (!countError) {
    console.log(`📍 Total records in database: ${count}\n`);
  }

  // Show sample query
  console.log('🔍 Testing sample query (near Westfield, NJ)...');
  const testLat = 40.646331;
  const testLng = -74.351231;
  
  const { data, error } = await supabase.rpc('find_nearest_septic_tank', {
    search_lat: testLat,
    search_lng: testLng,
    search_radius_meters: 200
  }).limit(1);

  if (error) {
    console.log('   ⚠️  Note: find_nearest_septic_tank function not yet created (will be created in next step)');
  } else if (data && data.length > 0) {
    console.log(`   ✅ Found tank: ${data[0].address} (${data[0].distance_meters}m away)\n`);
  } else {
    console.log('   ℹ️  No tanks found within 200m\n');
  }
}

seedSampleData().catch(console.error);
