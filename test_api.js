// Simulate what the dashboard does when generating a report
const testAddress = '1234 NW 79th Street, Miami, FL 33147';
const testLat = 25.8504;
const testLng = -80.2105;

// Import the getSepticContextForLocation function directly
const { getSepticContextForLocation } = require('./lib/septicLookup.ts');

async function testAPI() {
  console.log('Testing getSepticContextForLocation...');
  console.log('Address:', testAddress);
  console.log('Coordinates:', testLat, testLng);
  console.log('');

  try {
    const result = await getSepticContextForLocation(testLat, testLng, 200);
    
    console.log('=== RESULT ===');
    console.log('Classification:', result.classification);
    console.log('Confidence:', result.confidence);
    console.log('Is Covered:', result.isCovered);
    console.log('Coverage Sources:', result.coverageSources.length);
    console.log('Nearest Features:', result.nearestFeatures.length);
    console.log('');
    
    if (result.systemInfo) {
      console.log('=== SYSTEM INFO ===');
      console.log(JSON.stringify(result.systemInfo, null, 2));
    } else {
      console.log('⚠️  No system info extracted');
    }
    
    if (result.nearestFeatures.length > 0) {
      console.log('\n=== NEAREST FEATURE ===');
      const nearest = result.nearestFeatures[0];
      console.log('Distance:', nearest.distance_meters, 'meters');
      console.log('County:', nearest.county);
      console.log('Attributes:', JSON.stringify(nearest.attributes, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();
