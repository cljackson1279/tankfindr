import { NextRequest, NextResponse } from 'next/server'
import { stripe, TIERS, TierType } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { tier } = await request.json() as { tier: TierType }
    
    if (!tier || !TIERS[tier]) {
      return NextResponse.json(
        { error: 'Invalid tier selected' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const selectedTier = TIERS[tier]

    // Get site URL from environment or request headers
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      client_reference_id: user.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: selectedTier.priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7, // 7-day trial
        metadata: {
          user_id: user.id,
          tier: tier,
        },
      },
      metadata: {
        user_id: user.id,
        tier: tier,
      },
      success_url: `${siteUrl}/protected?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pricing`,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
