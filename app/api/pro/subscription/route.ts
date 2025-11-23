import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // TODO: Get user subscription from users table or Stripe
    // For now, return mock data
    return NextResponse.json({
      tier: 'pro',
      lookupLimit: 1500,
      renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error: any) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to load subscription' },
      { status: 500 }
    );
  }
}
