#!/usr/bin/env node

/**
 * Universal Batch Import Script for Priority Data Sources
 * Imports New Mexico, Fairfax County VA, and Sonoma County CA
 */

const { importNewMexico } = require('./import-new-mexico-statewide');
const { importFairfaxCounty } = require('./import-fairfax-county-va');
const { importSonomaCounty } = require('./import-sonoma-county-ca');

async function importAllPrioritySources() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   TankFindr Priority Data Sources Import                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const startTime = Date.now();
  const results = [];

  // Source 1: New Mexico Statewide
  try {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('SOURCE 1 OF 3: New Mexico Statewide');
    console.log('═══════════════════════════════════════════════════════════');
    await importNewMexico();
    results.push({ source: 'New Mexico Statewide', status: 'SUCCESS' });
  } catch (error) {
    console.error('❌ New Mexico import failed:', error.message);
    results.push({ source: 'New Mexico Statewide', status: 'FAILED', error: error.message });
  }

  // Delay between sources
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Source 2: Fairfax County, VA
  try {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('SOURCE 2 OF 3: Fairfax County, Virginia');
    console.log('═══════════════════════════════════════════════════════════');
    await importFairfaxCounty();
    results.push({ source: 'Fairfax County, VA', status: 'SUCCESS' });
  } catch (error) {
    console.error('❌ Fairfax County import failed:', error.message);
    results.push({ source: 'Fairfax County, VA', status: 'FAILED', error: error.message });
  }

  // Delay between sources
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Source 3: Sonoma County, CA
  try {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('SOURCE 3 OF 3: Sonoma County, California');
    console.log('═══════════════════════════════════════════════════════════');
    await importSonomaCounty();
    results.push({ source: 'Sonoma County, CA', status: 'SUCCESS' });
  } catch (error) {
    console.error('❌ Sonoma County import failed:', error.message);
    results.push({ source: 'Sonoma County, CA', status: 'FAILED', error: error.message });
  }

  // Final summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   IMPORT SUMMARY                                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  results.forEach((result, index) => {
    const icon = result.status === 'SUCCESS' ? '✅' : '❌';
    console.log(`${icon} ${result.source}: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  const successCount = results.filter(r => r.status === 'SUCCESS').length;
  const failCount = results.filter(r => r.status === 'FAILED').length;

  console.log(`\n📊 Results: ${successCount} succeeded, ${failCount} failed`);
  console.log(`⏱️  Total time: ${duration} minutes\n`);

  if (failCount > 0) {
    console.log('⚠️  Some imports failed. Check the logs above for details.\n');
    process.exit(1);
  } else {
    console.log('🎉 All imports completed successfully!\n');
  }
}

// Run the batch import
importAllPrioritySources().catch(error => {
  console.error('\n❌ Batch import failed:', error.message);
  process.exit(1);
});
