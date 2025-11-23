#!/usr/bin/env node

/**
 * Test manually discovered county endpoints from search results
 */

const axios = require('axios');
const fs = require('fs');

const REAL_COUNTIES = [
  {
    name: 'Miami-Dade County',
    state: 'FL',
    url: 'https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services/DOHSepticSystem_gdb/FeatureServer/0'
  },
  {
    name: 'Sonoma County',
    state: 'CA',
    url: 'https://socogis.sonomacounty.ca.gov/map/rest/services/OWTSPublic/Permit_Sonoma_OWTS_Permits/FeatureServer/0'
  },
  {
    name: 'Fairfax County',
    state: 'VA',
    url: 'https://www.fairfaxcounty.gov/euclid/rest/services/Health/Permitted_Septic_Records/MapServer/0'
  },
  {
    name: 'Forsyth County',
    state: 'NC',
    url: 'https://terraweb.co.forsyth.nc.us/arcgis/rest/services/PublicHealth/PH_Collections/FeatureServer/11'
  },
  {
    name: 'Weld County',
    state: 'CO',
    url: 'https://gishub.weldgov.com/server/rest/services/Hosted/Septic_System_Lines/FeatureServer/0'
  }
];

async function testEndpoint(county) {
  const testUrl = `${county.url}/query?where=1=1&outFields=*&f=json&resultRecordCount=5`;
  
  console.log(`\n🔍 Testing: ${county.name}, ${county.state}`);
  console.log(`URL: ${county.url}`);

  try {
    const response = await axios.get(testUrl, { timeout: 15000 });
    const data = response.data;

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const attrs = feature.attributes;
      
      console.log(`✅ SUCCESS - Found ${data.features.length} features`);
      console.log(`\nSample fields:`);
      Object.keys(attrs).slice(0, 10).forEach(key => {
        console.log(`  - ${key}: ${attrs[key]}`);
      });

      // Get count
      const countUrl = `${county.url}/query?where=1=1&returnCountOnly=true&f=json`;
      const countRes = await axios.get(countUrl, { timeout: 10000 });
      const count = countRes.data.count || 'Unknown';
      console.log(`\nTotal records: ${count}`);

      return {
        ...county,
        verified: true,
        recordCount: count,
        sampleFields: Object.keys(attrs)
      };
    } else {
      console.log(`❌ No features returned`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

async function testAll() {
  console.log('🚀 Testing manually discovered counties...\n');
  
  const verified = [];
  
  for (const county of REAL_COUNTIES) {
    const result = await testEndpoint(county);
    if (result) {
      verified.push(result);
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n\n✅ Verified ${verified.length}/${REAL_COUNTIES.length} counties`);
  
  if (verified.length > 0) {
    fs.writeFileSync('./verified-real-counties.json', JSON.stringify(verified, null, 2));
    console.log(`\n📁 Saved to verified-real-counties.json`);
  }
}

testAll();
