// Stripe configuration for TankFindr subscriptions

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
};

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 99,
    lookupLimit: 300,
    stripePriceId: process.env.STRIPE_PRICE_ID_STARTER || 'price_starter', // Replace with actual Stripe Price ID
    features: [
      '300 lookups per month',
      'Real county septic records',
      'GPS-accurate tank locations',
      'Basic tank locator',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 249,
    lookupLimit: 1500,
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO || 'price_pro', // Replace with actual Stripe Price ID
    features: [
      '1,500 lookups per month',
      'Up to 5 users',
      'PDF reports',
      'Job history',
      'Priority support',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 599,
    lookupLimit: -1, // -1 means unlimited
    stripePriceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || 'price_enterprise', // Replace with actual Stripe Price ID
    features: [
      'Unlimited lookups',
      'Unlimited users',
      'API access',
      'White label reports',
      'Dedicated support',
    ],
  },
};

// One-time products
export const ONE_TIME_PRODUCTS = {
  propertyReport: {
    id: 'property_report',
    name: 'Property Septic Status & Location Report',
    price: 19,
    stripePriceId: process.env.STRIPE_PRICE_ID_PROPERTY_REPORT || 'price_property_report', // Replace with actual Stripe Price ID
  },
};

// Helper functions
export function getTierByPriceId(priceId: string) {
  return Object.values(SUBSCRIPTION_TIERS).find(
    (tier) => tier.stripePriceId === priceId
  );
}

export function getTierById(tierId: string) {
  return SUBSCRIPTION_TIERS[tierId as keyof typeof SUBSCRIPTION_TIERS];
}

export function getLookupLimit(tierId: string): number {
  const tier = getTierById(tierId);
  return tier?.lookupLimit || 0;
}

export function isUnlimited(tierId: string): boolean {
  const tier = getTierById(tierId);
  return tier?.lookupLimit === -1;
}
