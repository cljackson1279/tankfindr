import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

const PLAN_CONFIG: Record<string, { priceId: string; name: string }> = {
  starter: {
    priceId: process.env.STRIPE_PRICE_STARTER!,
    name: 'TankFindr Pro - Starter',
  },
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO!,
    name: 'TankFindr Pro - Pro',
  },
  enterprise: {
    priceId: process.env.STRIPE_PRICE_ENTERPRISE!,
    name: 'TankFindr Pro - Enterprise',
  },
};

export async function POST(request: NextRequest) {
  try {
    const { planId } = await request.json();

    if (!planId || !PLAN_CONFIG[planId]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Please sign in to subscribe' },
        { status: 401 }
      );
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || profile?.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      customerId = customer.id;

      // Save customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PLAN_CONFIG[planId].priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pro?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing-pro`,
      metadata: {
        supabase_user_id: user.id,
        plan_id: planId,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan_id: planId,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Subscription checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
