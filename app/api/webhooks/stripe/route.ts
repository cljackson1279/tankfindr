import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Lazy initialize Supabase admin client
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const type = session.metadata?.type
  const supabaseAdmin = getSupabaseAdmin()

  // Handle Compliance Report
  if (type === 'compliance_report') {
    const tankId = session.metadata?.tankId
    await supabaseAdmin.from('reports').insert({
      user_id: userId,
      tank_id: tankId,
      report_url: `pending_generation_${session.payment_intent}`,
      stripe_payment_id: session.payment_intent as string,
      price_paid: 2500
    })
    return
  }

  // Handle Subscription Checkout
  const tier = session.metadata?.tier
  if (!userId || !tier) {
    console.error('Missing metadata in checkout session')
    return
  }

  // Get subscription to check if it has a trial
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
  const hasTrial = subscription.trial_start !== null

  // Update user with subscription info
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      stripe_customer_id: session.customer as string,
      subscription_tier: tier,
      subscription_status: hasTrial ? 'trialing' : 'active',
      subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user:', error)
  }

  // Record trial usage in profiles table
  if (hasTrial) {
    await supabaseAdmin
      .from('profiles')
      .update({
        trial_used_at: new Date().toISOString(),
        trial_product: tier === 'inspector' ? 'inspector' : 'pro',
        stripe_customer_id: session.customer as string
      })
      .eq('id', userId)
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('Missing user_id in subscription metadata')
    return
  }

  const subData = subscription as any
  const updateData: any = {
    subscription_status: subscription.status,
    subscription_id: subscription.id,
    updated_at: new Date().toISOString()
  }

  // Add period dates if they exist
  if (subData.current_period_start) {
    updateData.current_period_start = new Date(subData.current_period_start * 1000).toISOString()
  }
  if (subData.current_period_end) {
    updateData.current_period_end = new Date(subData.current_period_end * 1000).toISOString()
  }

  const supabaseAdmin = getSupabaseAdmin()
  
  // Map to users table columns
  const userData: any = {
    subscription_status: subscription.status,
    stripe_subscription_id: subscription.id,
    updated_at: new Date().toISOString()
  }
  
  // Add subscription end date
  if (subData.current_period_end) {
    userData.subscription_end_date = new Date(subData.current_period_end * 1000).toISOString()
  }
  
  const { error } = await supabaseAdmin
    .from('users')
    .update(userData)
    .eq('id', userId)

  if (error) {
    console.error('Error updating subscription:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('Missing user_id in subscription metadata')
    return
  }

  const supabaseAdmin = getSupabaseAdmin()
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      subscription_status: 'canceled',
      stripe_subscription_id: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error canceling subscription:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Reset monthly locate count on successful payment
  const customerId = invoice.customer as string
  const supabaseAdmin = getSupabaseAdmin()

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, subscription_tier')
    .eq('stripe_customer_id', customerId)
    .single()

  if (user) {
    // Reset lookups based on tier
    const tier = user.subscription_tier
    let lookupsRemaining = 0
    
    if (tier === 'starter') lookupsRemaining = 300
    else if (tier === 'pro') lookupsRemaining = 1500
    else if (tier === 'enterprise' || tier === 'inspector') lookupsRemaining = -1 // Unlimited
    
    await supabaseAdmin
      .from('users')
      .update({
        lookups_remaining: lookupsRemaining,
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const supabaseAdmin = getSupabaseAdmin()

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (user) {
    await supabaseAdmin
      .from('users')
      .update({
        subscription_status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
  }
}
