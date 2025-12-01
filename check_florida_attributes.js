const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cijtllcbrvkbvrjriweu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpanRsbGNicnZrYnZyanJpd2V1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzY3NzE2NiwiZXhwIjoyMDc5MjUzMTY2fQ.c2QSUiwxAa5xh1-mzrS1_WyNCUb9CDmOENfkxkDDvz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAttributes() {
  // Get the nearest tanks to our test address
  const { data: tanks, error } = await supabase.rpc('find_nearest_septic_tank', {
    search_lat: 25.8504,
    search_lng: -80.2105,
    search_radius_meters: 500
  });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${tanks.length} tanks near test address\n`);

  // Show the first 3 tanks with their full attributes
  tanks.slice(0, 3).forEach((tank, i) => {
    console.log(`\n=== Tank ${i + 1} (${tank.distance_meters.toFixed(1)}m away) ===`);
    console.log('County:', tank.county);
    console.log('State:', tank.state);
    console.log('Data Source:', tank.data_source);
    console.log('\nAttributes:');
    console.log(JSON.stringify(tank.attributes, null, 2));
  });
}

checkAttributes().catch(console.error);
