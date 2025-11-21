import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

// Pricing tiers configuration
export const TIERS = {
  starter: {
    name: 'Starter',
    price: 99,
    locates: 10,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    overage: 8
  },
  pro: {
    name: 'Pro',
    price: 249,
    locates: 40,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    overage: 6
  },
  enterprise: {
    name: 'Enterprise',
    price: 599,
    locates: 150,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    overage: 4
  }
} as const

export type TierType = keyof typeof TIERS

// Trial configuration
export const TRIAL_CONFIG = {
  freeLocates: 5,
  trialDays: 7
}
