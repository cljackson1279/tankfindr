import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { locateTank } from '@/lib/skyfi'
import { TIERS, TRIAL_CONFIG } from '@/lib/stripe'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
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

    // Admin bypass: Check email directly (works even without database migration)
    const isAdmin = user.email === 'cljackson79@gmail.com'

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    // Check if user can perform locate
    const canLocate = await checkLocatePermission(profile, isAdmin)

    if (!canLocate.allowed) {
      return NextResponse.json(
        { error: canLocate.reason },
        { status: 403 }
      )
    }

    // Perform tank location
    const result = await locateTank(address)

    // Save to database
    const { error: insertError } = await supabase
      .from('tanks')
      .insert({
        address,
        lat: result.lat,
        lng: result.lng,
        confidence_score: result.confidence,
        depth_estimate: result.depth,
        user_id: user.id
      })

    if (insertError) {
      console.error('Error saving tank location:', insertError)
    }

    // Track usage
    await supabase.from('usage').insert({
      user_id: user.id,
      action: 'locate',
      metadata: { address, confidence: result.confidence }
    })

    // Update locate counts (skip for admin)
    if (!canLocate.isAdmin) {
      await updateLocateCounts(profile, supabase)
      
      // Check if overage charge is needed
      if (canLocate.isOverage) {
        await chargeOverage(profile, address)
      }
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error locating tank:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to locate tank' },
      { status: 500 }
    )
  }
}

async function checkLocatePermission(profile: any, isAdminByEmail: boolean = false) {
  // Admin users have unlimited access (check both email and database flag)
  if (isAdminByEmail || profile.is_admin === true) {
    return { allowed: true, isOverage: false, isAdmin: true }
  }
  
  const now = new Date()
  
  // Check if user is in trial
  if (profile.subscription_status === 'trialing') {
    const trialStart = new Date(profile.trial_start)
    const daysSinceTrialStart = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24))
    
    // Check if trial period expired
    if (daysSinceTrialStart >= TRIAL_CONFIG.trialDays) {
      return {
        allowed: false,
        reason: 'Trial period expired. Please complete your subscription setup.'
      }
    }
    
    // Check if free locates used up
    if (profile.trial_locates_used >= TRIAL_CONFIG.freeLocates) {
      return {
        allowed: false,
        reason: 'Free trial locates used up. Your subscription will start now.'
      }
    }
    
    return { allowed: true, isOverage: false }
  }

  // Check if user has active subscription
  if (!profile.subscription_status || profile.subscription_status === 'canceled') {
    return {
      allowed: false,
      reason: 'No active subscription. Please subscribe to continue.'
    }
  }

  if (profile.subscription_status === 'past_due') {
    return {
      allowed: false,
      reason: 'Payment failed. Please update your payment method.'
    }
  }

  // Check if user has exceeded monthly limit
  const tier = TIERS[profile.subscription_tier as keyof typeof TIERS]
  if (!tier) {
    return {
      allowed: false,
      reason: 'Invalid subscription tier.'
    }
  }

  const monthlyUsed = profile.monthly_locates_used || 0
  
  // Allow with overage charge
  if (monthlyUsed >= tier.locates) {
    return { allowed: true, isOverage: true }
  }

  return { allowed: true, isOverage: false }
}

async function updateLocateCounts(profile: any, supabase: any) {
  if (profile.subscription_status === 'trialing') {
    await supabase
      .from('profiles')
      .update({
        trial_locates_used: (profile.trial_locates_used || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
  } else {
    await supabase
      .from('profiles')
      .update({
        monthly_locates_used: (profile.monthly_locates_used || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
  }
}

async function chargeOverage(profile: any, address: string) {
  const tier = TIERS[profile.subscription_tier as keyof typeof TIERS]
  
  if (!tier || !profile.stripe_customer_id) {
    console.error('Cannot charge overage: missing tier or customer ID')
    return
  }

  try {
    // Create an invoice item for the overage
    await stripe.invoiceItems.create({
      customer: profile.stripe_customer_id,
      amount: tier.overage * 100, // Convert to cents
      currency: 'usd',
      description: `Overage locate: ${address}`,
    })

    // Create and finalize invoice
    const invoice = await stripe.invoices.create({
      customer: profile.stripe_customer_id,
      auto_advance: true, // Auto-finalize and attempt payment
    })

    await stripe.invoices.finalizeInvoice(invoice.id)
  } catch (error) {
    console.error('Error charging overage:', error)
  }
}
