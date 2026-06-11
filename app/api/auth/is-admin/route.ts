import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Server-side admin check. Replaces the hardcoded admin email that previously
// shipped in the client JavaScript bundle.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'cljackson79@gmail.com')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const isAdmin = Boolean(
      user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())
    );

    return NextResponse.json({ isAdmin });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}
