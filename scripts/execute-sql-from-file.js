#!/usr/bin/env node

const { createClient } = require(
'@supabase/supabase-js
');
const fs = require(
'fs
');
const path = require(
'path
');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
'❌ Missing required environment variables
');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function executeSqlFile(filePath) {
  try {
    console.log(`🚀 Executing SQL from ${filePath}...`);
    const sql = fs.readFileSync(filePath, 
'utf8
');

    // The most reliable way to execute arbitrary SQL is to create a temporary function
    // and call it. However, let's try a simpler RPC call first.
    const { error } = await supabase.rpc(
'execute_sql_query
', { query: sql });

    if (error) {
      console.warn(
'⚠️  RPC failed, attempting direct execution via rpc()...'
);
      // Fallback for when the RPC function doesn't exist.
      const { error: directError } = await supabase.rpc(
'sql
', { query: sql });
      if (directError) {
          // Final attempt for older projects
          const { error: finalError } = await supabase.from(
'septic_tanks
').select(sql);
          if(finalError) throw finalError;
      }
    }
    console.log(
'✅ SQL executed successfully!
');

  } catch (err) {
    console.error(`❌ Error executing SQL file:`, err.message);
    process.exit(1);
  }
}

const sqlFilePath = process.argv[2];
if (!sqlFilePath) {
  console.error(
'❌ Please provide the path to the SQL file.
');
  console.error(
'Usage: node scripts/execute-sql-from-file.js <path-to-sql-file>
');
  process.exit(1);;
}

executeSqlFile(path.resolve(sqlFilePath));
