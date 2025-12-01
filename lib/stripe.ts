import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover'
})

// Pricing tiers configuration
export const TIERS = {
  starter: {
    name: 'Starter',
    price: 99,
    locates: 300, // 300 lookups per month
    priceId: process.env.STRIPE_PRICE_STARTER!,
    overage: 0 // No overage - hard limit
  },
  pro: {
    name: 'Pro',
    price: 249,
    locates: 1500, // 1,500 lookups per month
    priceId: process.env.STRIPE_PRICE_PRO!,
    overage: 0 // No overage - hard limit
  },
  enterprise: {
    name: 'Enterprise',
    price: 599,
    locates: -1, // Unlimited
    priceId: process.env.STRIPE_PRICE_ENTERPRISE!,
    overage: 0 // No overage for unlimited plan
  },
  inspector: {
    name: 'Inspector Pro',
    price: 79,
    locates: -1, // Unlimited reports
    priceId: process.env.STRIPE_PRICE_INSPECTOR!,
    overage: 0 // No overage for unlimited plan
  }
} as const

export type TierType = keyof typeof TIERS

// Trial configuration
export const TRIAL_CONFIG = {
  freeLocates: 5,
  trialDays: 7
}
