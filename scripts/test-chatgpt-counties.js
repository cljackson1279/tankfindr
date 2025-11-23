#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');

const counties = JSON.parse(fs.readFileSync('./scripts/chatgpt-counties.json', 'utf8'));

async function testEndpoint(county) {
  const testUrl = `${county.url}/query?where=1=1&outFields=*&f=json&resultRecordCount=5`;
  
  console.log(`\n🔍 Testing: ${county.name}, ${county.state}`);

  try {
    const response = await axios.get(testUrl, { timeout: 15000 });
    const data = response.data;

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const attrs = feature.attributes;
      
      console.log(`✅ SUCCESS - Found ${data.features.length} features`);
      
      // Get count
      try {
        const countUrl = `${county.url}/query?where=1=1&returnCountOnly=true&f=json`;
        const countRes = await axios.get(countUrl, { timeout: 10000 });
        const count = countRes.data.count || 'Unknown';
        console.log(`   Total records: ${count}`);

        return {
          ...county,
          verified: true,
          recordCount: count,
          sampleFields: Object.keys(attrs)
        };
      } catch (e) {
        console.log(`   Total records: Unable to determine`);
        return {
          ...county,
          verified: true,
          recordCount: 'Unknown',
          sampleFields: Object.keys(attrs)
        };
      }
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
  console.log('🚀 Testing ChatGPT county list...\n');
  
  const verified = [];
  
  for (const county of counties) {
    const result = await testEndpoint(county);
    if (result) {
      verified.push(result);
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n\n✅ Verified ${verified.length}/${counties.length} counties`);
  
  if (verified.length > 0) {
    fs.writeFileSync('./chatgpt-verified-counties.json', JSON.stringify(verified, null, 2));
    console.log(`\n📁 Saved to chatgpt-verified-counties.json`);
    
    const totalRecords = verified.reduce((sum, c) => {
      const count = typeof c.recordCount === 'number' ? c.recordCount : 0;
      return sum + count;
    }, 0);
    
    console.log(`\n📊 Total records available: ${totalRecords.toLocaleString()}`);
  }
}

testAll();
