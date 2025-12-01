import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's subscription from database
    const { data: user, error: subError } = await supabase
      .from('users')
      .select('stripe_subscription_id, stripe_customer_id, subscription_status')
      .eq('id', userId)
      .single();

    if (subError || !user || !user.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }
    
    if (user.subscription_status !== 'active') {
      return NextResponse.json(
        { error: 'Subscription is not active' },
        { status: 400 }
      );
    }

    // Cancel the subscription in Stripe (at period end)
    const stripeSubscription = await stripe.subscriptions.update(
      user.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    );

    // Update subscription status in database
    await supabase
      .from('users')
      .update({
        subscription_status: 'canceling', // Mark as canceling but still active until period end
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
      cancelAt: stripeSubscription.cancel_at,
    });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
