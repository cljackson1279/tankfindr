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

    // Check if user has already used a trial
    const { data: profile } = await supabase
      .from('profiles')
      .select('trial_used_at, trial_product')
      .eq('id', user.id)
      .single()

    if (profile?.trial_used_at) {
      return NextResponse.json(
        { 
          error: 'Trial already used',
          message: `You've already used your free trial for ${profile.trial_product === 'inspector' ? 'Inspector Pro' : 'TankFindr Pro'}. Please subscribe to continue.`
        },
        { status: 403 }
      )
    }

    // Check Stripe for previous trials with this email
    const existingCustomers = await stripe.customers.list({
      email: user.email!,
      limit: 10
    })

    for (const customer of existingCustomers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 100
      })
      
      const hadTrial = subscriptions.data.some(sub => sub.trial_start !== null)
      
      if (hadTrial) {
        return NextResponse.json(
          { 
            error: 'Trial already used',
            message: 'This email address has already been used for a free trial. Please subscribe to continue.'
          },
          { status: 403 }
        )
      }
    }

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
        trial_settings: {
          end_behavior: {
            missing_payment_method: 'cancel' // Cancel if no payment method
          }
        },
        metadata: {
          user_id: user.id,
          tier: tier,
          trial_start: new Date().toISOString(),
        },
      },
      payment_method_collection: 'always', // Require credit card
      metadata: {
        user_id: user.id,
        tier: tier,
      },
      success_url: tier === 'inspector' 
        ? `${siteUrl}/inspector-pro/dashboard?session_id={CHECKOUT_SESSION_ID}`
        : `${siteUrl}/pro?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: tier === 'inspector'
        ? `${siteUrl}/inspector-pro`
        : `${siteUrl}/pricing-pro`,
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
