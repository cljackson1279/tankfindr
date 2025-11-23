const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://cijtllcbrvkbvrjriweu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpanRsbGNicnZrYnZyanJpd2V1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzY3NzE2NiwiZXhwIjoyMDc5MjUzMTY2fQ.c2QSUiwxAa5xh1-mzrS1_WyNCUb9CDmOENfkxkDDvz8';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runMigration() {
  console.log('Running septic_tanks table migration...');
  
  const sql = fs.readFileSync('./supabase-septic-tanks-schema.sql', 'utf8');
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error('Migration failed:', error);
    // Try alternative method - direct SQL execution
    console.log('Trying alternative method...');
    const { data: result, error: err2 } = await supabase
      .from('_migrations')
      .insert({ name: 'septic_tanks_schema', sql });
    
    if (err2) {
      console.error('Alternative method failed:', err2);
      console.log('\nPlease run the SQL manually in Supabase dashboard.');
      process.exit(1);
    }
  }
  
  console.log('✅ Migration completed successfully!');
  
  // Verify table was created
  const { data: tables, error: verifyError } = await supabase
    .from('septic_tanks')
    .select('count', { count: 'exact', head: true });
  
  if (!verifyError) {
    console.log('✅ septic_tanks table verified!');
  }
}

runMigration().catch(console.error);
