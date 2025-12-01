const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function countFixed() {
  console.log('📊 Counting fixed Florida records...\n');

  // Total Florida records
  const { count: total } = await supabase
    .from('septic_tanks')
    .select('*', { count: 'exact', head: true })
    .eq('state', 'FL');

  console.log(`Total Florida records: ${total?.toLocaleString()}`);

  // Records with valid Florida coordinates (latitude between 24-31)
  const { count: fixed } = await supabase
    .from('septic_tanks')
    .select('*', { count: 'exact', head: true })
    .eq('state', 'FL')
    .gte('latitude', 24)
    .lte('latitude', 31);

  const percent = ((fixed / total) * 100).toFixed(2);
  const remaining = total - fixed;

  console.log(`\n✅ FIXED: ${fixed?.toLocaleString()} records (${percent}%)`);
  console.log(`⏳ REMAINING: ${remaining?.toLocaleString()} records (${(100 - percent).toFixed(2)}%)`);

  // Calculate progress
  const runsCompleted = Math.floor(fixed / 500);
  const totalRuns = Math.ceil(total / 500);
  const runsRemaining = totalRuns - runsCompleted;

  console.log(`\n📈 Progress:`);
  console.log(`   Runs completed: ${runsCompleted.toLocaleString()}`);
  console.log(`   Total runs needed: ${totalRuns.toLocaleString()}`);
  console.log(`   Runs remaining: ${runsRemaining.toLocaleString()}`);

  // Time estimates
  const secondsRemaining = runsRemaining * 10;
  const hoursRemaining = (secondsRemaining / 3600).toFixed(1);
  const minutesRemaining = Math.ceil(secondsRemaining / 60);

  console.log(`\n⏱️  Time estimates:`);
  console.log(`   At 10 seconds per run: ${hoursRemaining} hours (~${minutesRemaining.toLocaleString()} minutes)`);
  console.log(`   At 5 seconds per run: ${(hoursRemaining / 2).toFixed(1)} hours`);
  console.log(`   With 5 parallel scripts: ${(hoursRemaining / 5).toFixed(1)} hours`);
}

countFixed().catch(console.error);
