const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkTables() {
  // Get all table names
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('All tables in database:')
  console.log(JSON.stringify(data, null, 2))
}

checkTables()
