import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { userId, address } = await req.json()
    
    if (!userId || !address) {
      return NextResponse.json({ error: 'Missing userId or address' }, { status: 400 })
    }

    // Create Stripe Checkout Session for one-time payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Pay-Per-Locate',
              description: 'Single tank location search',
            },
            unit_amount: 1500, // $15.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/protected?payment=success&address=${encodeURIComponent(address)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/protected`,
      metadata: {
        userId,
        address,
        type: 'pay_per_locate'
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Pay-per-locate error:', error)
    return NextResponse.json({ error: 'Failed to create payment session' }, { status: 500 })
  }
}
