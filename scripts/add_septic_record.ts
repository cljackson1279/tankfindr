import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSepticRecord() {
  console.log('🔧 Adding septic record for 5155 SW 6 Court...\n');

  const record = {
    source_id: 'manual-504112100250',
    county: 'Broward',
    state: 'FL',
    parcel_id: '504112100250',
    address: '5155 SW 6 Court, Plantation, FL 33317',
    geom: `POINT(-80.2173350 26.1130728)`,
    attributes: {
      system_type: 'Septic System',
      year_built: 1956,
      lot_size_sqft: 10739,
      subdivision: 'Lauderdale Golf Estates 2nd Addition',
      verified_source: 'MLS #RX-10806809',
      verified_date: '2022-07-12',
      confidence: 'verified',
      notes: 'Confirmed via MLS listing from 2022 sale. Property has septic system despite TankFindr initially showing sewer.'
    },
    data_source: 'MLS Manual Entry'
  };

  console.log('Record to insert:', JSON.stringify(record, null, 2));
  console.log('\n');

  // First, check if record already exists
  const { data: existing, error: checkError } = await supabase
    .from('septic_tanks')
    .select('*')
    .eq('source_id', record.source_id)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('❌ Error checking for existing record:', checkError);
    process.exit(1);
  }

  if (existing) {
    console.log('📝 Record already exists, updating...\n');
    const { data, error } = await supabase
      .from('septic_tanks')
      .update({
        address: record.address,
        geom: record.geom,
        attributes: record.attributes,
        updated_at: new Date().toISOString()
      })
      .eq('source_id', record.source_id)
      .select();

    if (error) {
      console.error('❌ Error updating record:', error);
      process.exit(1);
    }

    console.log('✅ Successfully updated septic record!');
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log('➕ Inserting new record...\n');
    const { data, error } = await supabase
      .from('septic_tanks')
      .insert([record])
      .select();

    if (error) {
      console.error('❌ Error inserting record:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      process.exit(1);
    }

    console.log('✅ Successfully added septic record!');
    console.log(JSON.stringify(data, null, 2));
  }

  // Verify the record can be found
  console.log('\n🔍 Verifying record can be found...\n');
  
  const { data: verified, error: verifyError } = await supabase.rpc('find_nearest_septic_tank', {
    search_lat: 26.1130728,
    search_lng: -80.2173350,
    search_radius_meters: 100
  });

  if (verifyError) {
    console.error('❌ Error verifying record:', verifyError);
  } else if (verified && verified.length > 0) {
    console.log('✅ Record found in search!');
    console.log(JSON.stringify(verified, null, 2));
  } else {
    console.log('⚠️  Record not found in search - may need to wait for database index update');
  }

  process.exit(0);
}

addSepticRecord();
