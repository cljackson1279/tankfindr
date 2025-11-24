import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

export async function POST(request: NextRequest) {
  try {
    const { address, lat, lng, upsells = [] } = await request.json();

    if (!address || !lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build line items
    const lineItems: any[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'TankFindr Property Report',
            description: `Septic tank location report for ${address}`,
          },
          unit_amount: 1900, // $19.00
        },
        quantity: 1,
      },
    ];

    // Add environmental upsell
    if (upsells.includes('environmental')) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Environmental Risk Add-On',
            description: 'Flood zones, wetlands, soil type, and environmental hazards',
          },
          unit_amount: 900, // $9.00
        },
        quantity: 1,
      });
    }

    // Add well/groundwater upsell
    if (upsells.includes('well')) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Well & Groundwater Risk Add-On',
            description: 'Well locations, water table depth, contamination risk',
          },
          unit_amount: 2900, // $29.00
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/report/view?session_id={CHECKOUT_SESSION_ID}&address=${encodeURIComponent(address)}&lat=${lat}&lng=${lng}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/report?address=${encodeURIComponent(address)}`,
      metadata: {
        type: 'property_report',
        address,
        lat: lat.toString(),
        lng: lng.toString(),
        upsells: JSON.stringify(upsells),
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
