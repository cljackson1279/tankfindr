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

// IMPORTANT: subscription state lives in the `profiles` table (keyed by the
// Supabase auth user id). A previous version of this file wrote to a `users`
// table that DOES NOT EXIST, so every subscription event failed silently and
// no one's paid subscription was ever provisioned. All handlers below write to
// `profiles` using columns that actually exist on that table.

function tsToISO(seconds?: number | null): string | undefined {
  if (!seconds) return undefined
  return new Date(seconds * 1000).toISOString()
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
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
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break
      }
      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      }
      case 'invoice.payment_succeeded': {
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      }
      case 'invoice.payment_failed': {
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      }
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const type = session.metadata?.type
  const supabaseAdmin = getSupabaseAdmin()

  // Compliance report (one-time) — unchanged, writes to the `reports` table.
  if (type === 'compliance_report') {
    const tankId = session.metadata?.tankId
    await supabaseAdmin.from('reports').insert({
      user_id: userId,
      tank_id: tankId,
      report_url: `pending_generation_${session.payment_intent}`,
      stripe_payment_id: session.payment_intent as string,
      price_paid: 2500,
    })
    return
  }

  // Subscription checkout (Pro / Inspector).
  const tier = session.metadata?.tier
  if (!userId || !tier) {
    console.error('Missing user_id/tier metadata in checkout session', session.id)
    return
  }

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
  const subData = subscription as any
  const hasTrial = subscription.trial_start !== null
  const periodEnd = tsToISO(subData.current_period_end) || tsToISO(subData.trial_end)

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      stripe_customer_id: session.customer as string,
      subscription_tier: tier,
      // Trials are 'trialing' — access checks treat trialing as active.
      subscription_status: hasTrial ? 'trialing' : 'active',
      subscription_id: subscription.id,
      stripe_subscription_id: subscription.id,
      current_period_start: tsToISO(subData.current_period_start),
      current_period_end: periodEnd,
      ...(hasTrial
        ? {
            trial_used_at: new Date().toISOString(),
            trial_product: tier === 'inspector' ? 'inspector' : 'pro',
            trial_start: tsToISO(subData.trial_start),
          }
        : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) console.error('Error provisioning subscription on profiles:', error)
}

// Resolve the profile id from subscription metadata.user_id, falling back to
// the Stripe customer id (renewals/updates don't always carry user_id).
async function resolveProfileId(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  userId?: string | null,
  customerId?: string | null
): Promise<string | null> {
  if (userId) return userId
  if (!customerId) return null
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()
  return data?.id ?? null
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const supabaseAdmin = getSupabaseAdmin()
  const subData = subscription as any
  const id = await resolveProfileId(
    supabaseAdmin,
    subscription.metadata?.user_id,
    subscription.customer as string
  )
  if (!id) {
    console.error('Cannot resolve profile for subscription', subscription.id)
    return
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: subscription.status, // active | trialing | past_due | canceled | ...
      subscription_id: subscription.id,
      stripe_subscription_id: subscription.id,
      current_period_start: tsToISO(subData.current_period_start),
      current_period_end: tsToISO(subData.current_period_end) || tsToISO(subData.trial_end),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) console.error('Error updating subscription on profiles:', error)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabaseAdmin = getSupabaseAdmin()
  const id = await resolveProfileId(
    supabaseAdmin,
    subscription.metadata?.user_id,
    subscription.customer as string
  )
  if (!id) {
    console.error('Cannot resolve profile for canceled subscription', subscription.id)
    return
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) console.error('Error canceling subscription on profiles:', error)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const supabaseAdmin = getSupabaseAdmin()

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, subscription_tier')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) return

  // Reset monthly usage at the start of each paid period.
  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'active',
      monthly_locates_used: 0,
      lookups_used: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const supabaseAdmin = getSupabaseAdmin()

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) return

  await supabaseAdmin
    .from('profiles')
    .update({ subscription_status: 'past_due', updated_at: new Date().toISOString() })
    .eq('id', profile.id)
}
