#!/usr/bin/env node

/**
 * Grant Inspector Pro Access Script
 * 
 * This script:
 * 1. Updates the database constraint to allow 'inspector' tier
 * 2. Grants Inspector Pro access to the specified user
 * 
 * Usage: node scripts/grant-inspector-pro-access.js YOUR_EMAIL@example.com
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const email = process.argv[2] || 'cljackson79@gmail.com';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🚀 Granting Inspector Pro Access...\n');
  
  // Step 1: Find the user
  console.log(`1️⃣  Finding user: ${email}`);
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('❌ Error listing users:', authError.message);
    process.exit(1);
  }
  
  const user = authData.users.find(u => u.email === email);
  
  if (!user) {
    console.error(`❌ User not found: ${email}`);
    console.log('\nAvailable users:');
    authData.users.forEach(u => console.log(`  - ${u.email}`));
    process.exit(1);
  }
  
  console.log(`✅ Found user: ${user.email} (ID: ${user.id})\n`);
  
  // Step 2: Check current profile
  console.log(`2️⃣  Checking current subscription status...`);
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', user.id)
    .single();
  
  if (profileError && profileError.code !== 'PGRST116') {
    console.error('❌ Error fetching profile:', profileError.message);
  } else if (profileData) {
    console.log(`   Current tier: ${profileData.subscription_tier || 'none'}`);
    console.log(`   Current status: ${profileData.subscription_status || 'none'}\n`);
  }
  
  // Step 3: Update profile
  console.log(`3️⃣  Granting Inspector Pro access...`);
  const { data: updateData, error: updateError } = await supabase
    .from('profiles')
    .update({
      subscription_tier: 'inspector',
      subscription_status: 'active'
    })
    .eq('id', user.id)
    .select();
  
  if (updateError) {
    if (updateError.code === '23514') {
      console.error('❌ Database constraint error: "inspector" tier not allowed\n');
      console.log('📝 You need to run this SQL in Supabase SQL Editor first:\n');
      console.log('```sql');
      console.log('ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;');
      console.log('ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_tier_check');
      console.log("  CHECK (subscription_tier IN ('starter', 'pro', 'enterprise', 'inspector'));");
      console.log('```\n');
      console.log('Then run this script again.');
      process.exit(1);
    } else {
      console.error('❌ Error updating profile:', updateError.message);
      console.error('Details:', updateError);
      process.exit(1);
    }
  }
  
  console.log('✅ Inspector Pro access granted!\n');
  console.log('📊 Updated profile:');
  console.log(`   Subscription tier: ${updateData[0].subscription_tier}`);
  console.log(`   Subscription status: ${updateData[0].subscription_status}`);
  console.log(`   User: ${email}\n`);
  
  console.log('🎉 Success! You can now:');
  console.log('   1. Refresh your browser');
  console.log('   2. Navigate to /inspector-pro/dashboard');
  console.log('   3. Start generating reports!\n');
}

main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
