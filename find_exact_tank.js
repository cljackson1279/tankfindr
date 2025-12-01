const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cijtllcbrvkbvrjriweu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpanRsbGNicnZrYnZyanJpd2V1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzY3NzE2NiwiZXhwIjoyMDc5MjUzMTY2fQ.c2QSUiwxAa5xh1-mzrS1_WyNCUb9CDmOENfkxkDDvz8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findTank() {
  // Use the exact coordinates from the report
  const { data: tanks, error } = await supabase.rpc('find_nearest_septic_tank', {
    search_lat: 25.8504,
    search_lng: -80.2105,
    search_radius_meters: 200
  });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${tanks.length} tanks\n`);

  // The report showed GPS: 25.846175, -80.218080
  // Find the tank with those coordinates
  const reportedTank = tanks.find(t => 
    Math.abs(t.lat - 25.846175) < 0.0001 && 
    Math.abs(t.lng - (-80.218080)) < 0.0001
  );

  if (reportedTank) {
    console.log('=== TANK FROM REPORT (GPS: 25.846175, -80.218080) ===');
    console.log('Distance:', reportedTank.distance_meters, 'meters');
    console.log('County:', reportedTank.county);
    console.log('\nAttributes:');
    console.log(JSON.stringify(reportedTank.attributes, null, 2));
  } else {
    console.log('Could not find exact tank, showing nearest:');
    console.log('\n=== NEAREST TANK ===');
    console.log('Distance:', tanks[0].distance_meters, 'meters');
    console.log('Lat:', tanks[0].lat);
    console.log('Lng:', tanks[0].lng);
    console.log('\nAttributes:');
    console.log(JSON.stringify(tanks[0].attributes, null, 2));
  }
}

findTank().catch(console.error);
