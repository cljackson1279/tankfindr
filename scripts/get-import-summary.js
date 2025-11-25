#!/usr/bin/env node
require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function getImportSummary() {
  console.log('🚀 Fetching import summary from Supabase...');

  try {
    const { data, error } = await supabase
      .from('septic_tanks')
      .select('state, county');

    if (error) {
      throw error;
    }

    const summary = data.reduce((acc, { state, county }) => {
      if (!acc[state]) {
        acc[state] = { total: 0, counties: new Set() };
      }
      acc[state].total++;
      acc[state].counties.add(county);
      return acc;
    }, {});

    console.log('\n✅ Import Summary:\n');
    console.log('| State | Total Records | Unique Counties |');
    console.log('|-------|---------------|-----------------|');

    let totalRecords = 0;
    for (const state in summary) {
      const { total, counties } = summary[state];
      totalRecords += total;
      console.log(`| ${state.padEnd(5)} | ${total.toLocaleString().padEnd(13)} | ${counties.size.toLocaleString().padEnd(15)} |`);
    }

    console.log('\n----------------------------------');
    console.log(`📊 Total Records Imported: ${totalRecords.toLocaleString()}`);
    console.log('----------------------------------\n');

  } catch (err) {
    console.error(`❌ Error fetching summary:`, err.message);
    process.exit(1);
  }
}

getImportSummary();
getImportSummary();
