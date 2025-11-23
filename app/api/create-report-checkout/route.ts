import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ONE_TIME_PRODUCTS } from '@/lib/stripe/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { address, lat, lng } = await request.json();

    if (!address || !lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: ONE_TIME_PRODUCTS.propertyReport.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/report/view?session_id={CHECKOUT_SESSION_ID}&address=${encodeURIComponent(address)}&lat=${lat}&lng=${lng}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/report?address=${encodeURIComponent(address)}`,
      metadata: {
        type: 'property_report',
        address,
        lat: lat.toString(),
        lng: lng.toString(),
      },
      customer_email: undefined, // Let them enter email at checkout
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
