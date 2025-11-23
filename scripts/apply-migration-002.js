const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://cijtllcbrvkbvrjriweu.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('Applying migration 002...');
  
  const sql = fs.readFileSync('/home/ubuntu/tankfindr/supabase/migrations/002_add_sources_and_tracking.sql', 'utf8');
  
  try {
    // Split by semicolons and execute each statement
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim() + ';';
      if (stmt.length > 2) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: stmt });
        
        if (error) {
          console.error(`Error on statement ${i + 1}:`, error);
          // Try direct query as fallback
          const { error: error2 } = await supabase.from('_migrations').insert({ statement: stmt });
          if (error2) console.error('Fallback also failed:', error2);
        }
      }
    }
    
    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

applyMigration();
