import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Get first day of current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Count lookups this month
    const { data: lookups, error } = await supabase
      .from('septic_lookups')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', firstDayOfMonth.toISOString());

    if (error) {
      throw error;
    }

    return NextResponse.json({
      lookupsThisMonth: lookups || 0,
    });
  } catch (error: any) {
    console.error('Usage stats error:', error);
    return NextResponse.json(
      { error: 'Failed to load usage stats' },
      { status: 500 }
    );
  }
}
