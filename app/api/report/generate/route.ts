import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { userId, tankId, address, lat, lng, confidence, depth } = await req.json()
    
    if (!userId || !tankId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create Stripe Checkout Session for compliance report
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Compliance Report',
              description: 'Professional PDF report with GPS coordinates and satellite imagery',
            },
            unit_amount: 2500, // $25.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/protected?report=success&tankId=${tankId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/protected`,
      metadata: {
        userId,
        tankId,
        address,
        lat: lat.toString(),
        lng: lng.toString(),
        confidence: confidence.toString(),
        depth: depth.toString(),
        type: 'compliance_report'
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json({ error: 'Failed to create payment session' }, { status: 500 })
  }
}
