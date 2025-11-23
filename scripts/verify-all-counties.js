#!/usr/bin/env node

/**
 * Comprehensive County Endpoint Verification Script
 * Tests all county URLs, discovers field names, generates verified-counties.json
 */

const axios = require('axios');
const fs = require('fs');

const COUNTIES_TO_TEST = [
  {
    "name": "Pinal County",
    "state": "AZ",
    "url": "https://services.arcgis.com/VAz0pvmZVDCCvDdg/ArcGIS/rest/services/Onsite_Wastewater_Treatment_Facilities/FeatureServer/0",
    "idField": "FACILITY_ID",
    "addressField": "SITE_ADDRESS",
    "parcelField": "PARCEL_NUM"
  },
  {
    "name": "Clackamas County",
    "state": "OR",
    "url": "https://webmaps.clackamas.us/arcgis/rest/services/Septic/MapServer/0",
    "idField": "OBJECTID",
    "addressField": "ADDRESS",
    "parcelField": "TLID"
  },
  {
    "name": "St. Louis County",
    "state": "MN",
    "url": "https://gis.stlouiscountymn.gov/arcgis/rest/services/Individual_Sewage_Treatment_Systems/MapServer/0",
    "idField": "OBJECTID",
    "addressField": "SiteAddress",
    "parcelField": "ParcelID"
  },
  {
    "name": "Kitsap County",
    "state": "WA",
    "url": "https://gis.kitsapgov.com/arcgis/rest/services/Health/Septic_Systems/MapServer/0",
    "idField": "OBJECTID",
    "addressField": "ADDRESS",
    "parcelField": "PARCEL_NO"
  },
  {
    "name": "Whatcom County",
    "state": "WA",
    "url": "https://gis.whatcomcounty.us/arcgis/rest/services/Health/Septic_Systems/MapServer/0",
    "idField": "OBJECTID",
    "addressField": "FullAddress",
    "parcelField": "ParcelID"
  },
  {
    "name": "Snohomish County",
    "state": "WA",
    "url": "https://gis.snoco.org/arcgis/rest/services/Health/OWTS/MapServer/0",
    "idField": "OBJECTID",
    "addressField": "SiteAddress",
    "parcelField": "ParcelNumber"
  },
  {
    "name": "Thurston County",
    "state": "WA",
    "url": "https://gis.thurstoncountywa.gov/arcgis/rest/services/Health/OSS/MapServer/0",
    "idField": "OBJECTID",
    "addressField": "ADDRESS",
    "parcelField": "PIN"
  },
  {
    "name": "Palm Beach County",
    "state": "FL",
    "url": "https://services.arcgis.com/5T5nSi527N4F7jFC/arcgis/rest/services/Septic_Tanks/FeatureServer/0",
    "idField": "PERMIT_NO",
    "addressField": "ADDRESS",
    "parcelField": "PARCEL_ID"
  },
  {
    "name": "Brevard County",
    "state": "FL",
    "url": "https://gis.brevardcounty.us/arcgis/rest/services/Environment/Septic_Systems/MapServer/0",
    "idField": "OBJECTID",
    "addressField": "ADDRESS",
    "parcelField": "PARCELNO"
  },
  {
    "name": "Martin County",
    "state": "FL",
    "url": "https://mc-gis.martincounty.fl.gov/arcgis/rest/services/Environment/Septic_Systems/MapServer/0",
    "idField": "OBJECTID",
    "addressField": "SITE_ADDRESS",
    "parcelField": "ParcelID"
  },
  {
    "name": "Weld County",
    "state": "CO",
    "url": "https://gisapp.weldgov.com/arcgis/rest/services/Sewage/MapServer/0",
    "idField": "OBJECTID",
    "addressField": "ADDRESS",
    "parcelField": "PARCEL_NO"
  },
  {
    "name": "El Paso County",
    "state": "CO",
    "url": "https://maps.elpasoco.com/arcgis/rest/services/Environmental/Septic_Permits/MapServer/0",
    "idField": "PERMIT_NO",
    "addressField": "ADDRESS",
    "parcelField": "PARCEL_NUMBER"
  },
  {
    "name": "Kootenai County",
    "state": "ID",
    "url": "https://kcgis.maps.arcgis.com/arcgis/rest/services/Septic_Systems/FeatureServer/0",
    "idField": "REQUEST_NO",
    "addressField": "ADDRESS",
    "parcelField": "PARCEL_ID"
  },
  {
    "name": "Sonoma County",
    "state": "CA",
    "url": "https://gis.sonomacounty.ca.gov/arcgis/rest/services/health/Septic_Tank/MapServer/0",
    "idField": "OBJECTID",
    "addressField": "Address",
    "parcelField": "APN"
  },
  {
    "name": "Hennepin County",
    "state": "MN",
    "url": "https://gis.hennepin.us/arcgis/rest/services/Environment/Septic_Systems/MapServer/0",
    "idField": "OBJECTID",
    "addressField": "ADDRESS",
    "parcelField": "PARCELID"
  },
  {
    "name": "Ramsey County",
    "state": "MN",
    "url": "https://gis.ramseycounty.us/arcgis/rest/services/Health/Septic_Systems/MapServer/0",
    "idField": "OBJECTID",
    "addressField": "ADDRESS",
    "parcelField": "PARCELID"
  },
  {
    "name": "Lane County",
    "state": "OR",
    "url": "https://gis.lanecountyor.gov/arcgis/rest/services/Health/Septic_Systems/MapServer/0",
    "idField": "OBJECTID",
    "addressField": "ADDRESS",
    "parcelField": "TAXLOT"
  },
  {
    "name": "Coconino County",
    "state": "AZ",
    "url": "https://coconino.maps.arcgis.com/arcgis/rest/services/Septic_Systems/FeatureServer/0",
    "idField": "OBJECTID",
    "addressField": "ADDRESS",
    "parcelField": "APN"
  },
  {
    "name": "Yavapai County",
    "state": "AZ",
    "url": "https://yavapai.maps.arcgis.com/arcgis/rest/services/Septic_Systems/FeatureServer/0",
    "idField": "OBJECTID",
    "addressField": "ADDRESS",
    "parcelField": "APN"
  }
];

const verifiedCounties = [];
const failedCounties = [];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testEndpoint(county, attempt = 1) {
  const testUrl = `${county.url}/query?where=1=1&outFields=*&f=json&resultRecordCount=5`;
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🔍 Testing: ${county.name}, ${county.state} (Attempt ${attempt}/2)`);
  console.log(`URL: ${county.url}`);
  console.log('='.repeat(70));

  try {
    const response = await axios.get(testUrl, { 
      timeout: 15000,
      headers: {
        'User-Agent': 'TankFindr-Verification/1.0'
      }
    });

    const data = response.data;

    // Check if it's GeoJSON format
    if (data.features && Array.isArray(data.features)) {
      if (data.features.length === 0) {
        console.log('❌ No features returned (empty dataset)');
        return false;
      }

      const feature = data.features[0];
      
      // Verify structure
      const hasGeometry = !!feature.geometry;
      const hasCoordinates = !!feature.geometry?.coordinates;
      const hasProperties = !!feature.properties;
      
      console.log('✅ Response Structure:');
      console.log(`  ${hasGeometry ? '✅' : '❌'} Has geometry`);
      console.log(`  ${hasCoordinates ? '✅' : '❌'} Has coordinates`);
      console.log(`  ${hasProperties ? '✅' : '❌'} Has properties`);
      console.log(`  ✅ Feature count: ${data.features.length}`);

      if (!hasGeometry || !hasCoordinates || !hasProperties) {
        console.log('❌ Invalid feature structure');
        return false;
      }

      // Discover actual field names
      const props = feature.properties;
      const fieldNames = Object.keys(props);

      console.log('\n📋 Available Fields:');
      fieldNames.slice(0, 15).forEach(key => {
        const value = props[key];
        const displayValue = value !== null && value !== undefined 
          ? String(value).slice(0, 40) 
          : 'null';
        console.log(`  - ${key}: ${displayValue}`);
      });

      // Try to find ID field
      const possibleIdFields = ['OBJECTID', 'FID', 'FACILITY_ID', 'PERMIT_NO', 'REQUEST_NO', 'ID'];
      const actualIdField = possibleIdFields.find(f => fieldNames.includes(f)) || fieldNames[0];

      // Try to find address field
      const possibleAddressFields = ['SITE_ADDRESS', 'ADDRESS', 'SiteAddress', 'FullAddress', 'LOCATION', 'Address'];
      const actualAddressField = possibleAddressFields.find(f => fieldNames.includes(f));

      // Try to find parcel field
      const possibleParcelFields = ['PARCEL_NUMBER', 'PARCEL_ID', 'PARCELNO', 'ParcelID', 'PARCEL_NO', 'APN', 'TAXLOT', 'PIN', 'PARCEL_NUM', 'TLID'];
      const actualParcelField = possibleParcelFields.find(f => fieldNames.includes(f));

      console.log('\n🎯 Discovered Field Mappings:');
      console.log(`  ID Field: ${actualIdField}`);
      console.log(`  Address Field: ${actualAddressField || 'NOT FOUND'}`);
      console.log(`  Parcel Field: ${actualParcelField || 'NOT FOUND'}`);

      // Estimate record count
      console.log('\n📊 Estimating total records...');
      const countUrl = `${county.url}/query?where=1=1&returnCountOnly=true&f=json`;
      try {
        const countResponse = await axios.get(countUrl, { timeout: 10000 });
        const recordCount = countResponse.data.count || 'Unknown';
        console.log(`  Total Records: ${recordCount}`);

        verifiedCounties.push({
          name: county.name,
          state: county.state,
          url: county.url,
          idField: actualIdField,
          addressField: actualAddressField,
          parcelField: actualParcelField,
          recordCount: recordCount,
          verified: true
        });

        console.log('\n✅ VERIFIED - County endpoint is working!');
        return true;

      } catch (e) {
        console.log(`  Total Records: Unable to determine`);
        
        verifiedCounties.push({
          name: county.name,
          state: county.state,
          url: county.url,
          idField: actualIdField,
          addressField: actualAddressField,
          parcelField: actualParcelField,
          recordCount: 'Unknown',
          verified: true
        });

        console.log('\n✅ VERIFIED - County endpoint is working!');
        return true;
      }

    } else {
      console.log('❌ Invalid response format (not GeoJSON)');
      return false;
    }

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   → Connection refused (server not accessible)');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   → Domain not found (DNS error)');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('   → Request timed out');
    } else if (error.response) {
      console.log(`   → HTTP ${error.response.status}: ${error.response.statusText}`);
    }

    // Retry once after 5 seconds
    if (attempt === 1) {
      console.log('⏳ Waiting 5 seconds before retry...');
      await sleep(5000);
      return await testEndpoint(county, 2);
    }

    failedCounties.push({
      name: county.name,
      state: county.state,
      url: county.url,
      error: error.message,
      errorCode: error.code || 'UNKNOWN'
    });

    return false;
  }
}

async function verifyAllCounties() {
  console.log('\n🚀 Starting County Endpoint Verification');
  console.log(`📊 Testing ${COUNTIES_TO_TEST.length} counties...\n`);

  for (let i = 0; i < COUNTIES_TO_TEST.length; i++) {
    const county = COUNTIES_TO_TEST[i];
    console.log(`\n[${i + 1}/${COUNTIES_TO_TEST.length}]`);
    
    await testEndpoint(county);
    
    // Wait 2 seconds between requests to avoid rate limiting
    if (i < COUNTIES_TO_TEST.length - 1) {
      await sleep(2000);
    }
  }

  // Generate summary
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Verified Counties: ${verifiedCounties.length}`);
  console.log(`❌ Failed Counties: ${failedCounties.length}`);
  console.log(`📈 Success Rate: ${((verifiedCounties.length / COUNTIES_TO_TEST.length) * 100).toFixed(1)}%`);

  // Save verified counties to JSON
  const outputPath = './verified-counties.json';
  fs.writeFileSync(outputPath, JSON.stringify(verifiedCounties, null, 2));
  console.log(`\n✅ Saved verified counties to: ${outputPath}`);

  // Save failed counties to log
  if (failedCounties.length > 0) {
    const failedPath = './failed-counties.json';
    fs.writeFileSync(failedPath, JSON.stringify(failedCounties, null, 2));
    console.log(`❌ Saved failed counties to: ${failedPath}`);

    console.log('\n⚠️  Failed Counties:');
    failedCounties.forEach(c => {
      console.log(`  - ${c.name}, ${c.state}: ${c.error}`);
    });
  }

  console.log('\n🎉 Verification complete!\n');
}

verifyAllCounties().catch(console.error);
