cat > lib/supabase/client.ts <<'EOF'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

export const createClient = () => createClientComponentClient<Database>()
export const supabaseClient = createClient()
EOF