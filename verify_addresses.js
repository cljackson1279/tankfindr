const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyAddresses() {
  console.log('🔍 Checking septic data near test addresses...\n');

  // Tallahassee - 3456 Centerville Road, Tallahassee, FL 32309
  // Approximate coordinates: 30.5089, -84.2533
  console.log('📍 TALLAHASSEE (3456 Centerville Road):');
  console.log('Coordinates: 30.5089, -84.2533');
  const { data: tallahassee } = await supabase.rpc('find_nearest_septic_tank', {
    search_lat: 30.5089,
    search_lng: -84.2533,
    radius_meters: 500
  });
  
  if (tallahassee && tallahassee.length > 0) {
    console.log(`✅ Found ${tallahassee.length} tanks within 500m`);
    console.log(`Nearest: ${Math.round(tallahassee[0].distance)}m away`);
    console.log(`Permit: ${tallahassee[0].attributes?.APNO || 'N/A'}`);
  } else {
    console.log('❌ No septic tanks found within 500m');
  }

  // Ocala - 8245 NW 115th Avenue, Ocala, FL 34482
  // Approximate coordinates: 29.2108, -82.2239
  console.log('\n📍 OCALA (8245 NW 115th Avenue):');
  console.log('Coordinates: 29.2108, -82.2239');
  const { data: ocala } = await supabase.rpc('find_nearest_septic_tank', {
    search_lat: 29.2108,
    search_lng: -82.2239,
    radius_meters: 500
  });
  
  if (ocala && ocala.length > 0) {
    console.log(`✅ Found ${ocala.length} tanks within 500m`);
    console.log(`Nearest: ${Math.round(ocala[0].distance)}m away`);
    console.log(`Permit: ${ocala[0].attributes?.APNO || 'N/A'}`);
  } else {
    console.log('❌ No septic tanks found within 500m');
  }

  // Homestead - 24500 SW 187th Avenue, Homestead, FL 33031
  // Approximate coordinates: 25.5365, -80.5207
  console.log('\n📍 HOMESTEAD (24500 SW 187th Avenue):');
  console.log('Coordinates: 25.5365, -80.5207');
  const { data: homestead } = await supabase.rpc('find_nearest_septic_tank', {
    search_lat: 25.5365,
    search_lng: -80.5207,
    radius_meters: 500
  });
  
  if (homestead && homestead.length > 0) {
    console.log(`✅ Found ${homestead.length} tanks within 500m`);
    console.log(`Nearest: ${Math.round(homestead[0].distance)}m away`);
    console.log(`Permit: ${homestead[0].attributes?.APNO || 'N/A'}`);
  } else {
    console.log('❌ No septic tanks found within 500m');
  }

  // Now let's find actual addresses with septic tanks in those counties
  console.log('\n\n🔍 Finding actual addresses with septic systems...\n');

  // Leon County (Tallahassee area)
  console.log('📍 LEON COUNTY (Tallahassee area):');
  const { data: leon } = await supabase
    .from('septic_tanks')
    .select('*')
    .eq('county', 'Leon County (DOH)')
    .not('attributes->>SYSTADDR', 'is', null)
    .not('attributes->>APNO', 'is', null)
    .limit(3);
  
  if (leon && leon.length > 0) {
    leon.forEach((r, i) => {
      console.log(`\n${i + 1}. Address: ${r.attributes.SYSTADDR}`);
      console.log(`   Permit: ${r.attributes.APNO}`);
      console.log(`   Coordinates: ${r.latitude}, ${r.longitude}`);
    });
  } else {
    console.log('No records found with addresses');
  }

  // Marion County (Ocala area)
  console.log('\n\n📍 MARION COUNTY (Ocala area):');
  const { data: marion } = await supabase
    .from('septic_tanks')
    .select('*')
    .eq('county', 'Marion County (DOH)')
    .not('attributes->>SYSTADDR', 'is', null)
    .not('attributes->>APNO', 'is', null)
    .limit(3);
  
  if (marion && marion.length > 0) {
    marion.forEach((r, i) => {
      console.log(`\n${i + 1}. Address: ${r.attributes.SYSTADDR}`);
      console.log(`   Permit: ${r.attributes.APNO}`);
      console.log(`   Coordinates: ${r.latitude}, ${r.longitude}`);
    });
  } else {
    console.log('No records found with addresses');
  }
}

verifyAddresses().catch(console.error);
