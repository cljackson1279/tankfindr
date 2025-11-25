import { createClient } from '@/lib/supabase/client';

export interface SubscriptionStatus {
  isActive: boolean;
  tier: 'starter' | 'pro' | 'enterprise' | null;
  lookupsUsed: number;
  lookupsLimit: number;
  isUnlimited: boolean;
  billingPeriodStart: string | null;
  billingPeriodEnd: string | null;
}

export const SUBSCRIPTION_TIERS = {
  starter: {
    name: 'Starter',
    price: 99,
    lookups: 300,
    maxUsers: 1,
    stripeProductId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_STARTER,
  },
  pro: {
    name: 'Pro',
    price: 249,
    lookups: 1500,
    maxUsers: 5,
    stripeProductId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_PRO,
  },
  enterprise: {
    name: 'Enterprise',
    price: 599,
    lookups: -1, // Unlimited
    maxUsers: 10,
    stripeProductId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ENTERPRISE,
  },
};

/**
 * Check if user has an active Pro subscription
 */
export async function checkSubscription(userId: string): Promise<SubscriptionStatus> {
  const supabase = createClient();

  // Get user profile with subscription info
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status, lookups_used, billing_period_start, billing_period_end')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return {
      isActive: false,
      tier: null,
      lookupsUsed: 0,
      lookupsLimit: 0,
      isUnlimited: false,
      billingPeriodStart: null,
      billingPeriodEnd: null,
    };
  }

  const tier = profile.subscription_tier as 'starter' | 'pro' | 'enterprise' | null;
  const isActive = profile.subscription_status === 'active';
  
  if (!isActive || !tier) {
    return {
      isActive: false,
      tier: null,
      lookupsUsed: profile.lookups_used || 0,
      lookupsLimit: 0,
      isUnlimited: false,
      billingPeriodStart: null,
      billingPeriodEnd: null,
    };
  }

  const tierConfig = SUBSCRIPTION_TIERS[tier];
  const isUnlimited = tierConfig.lookups === -1;
  const lookupsLimit = isUnlimited ? -1 : tierConfig.lookups;

  return {
    isActive: true,
    tier,
    lookupsUsed: profile.lookups_used || 0,
    lookupsLimit,
    isUnlimited,
    billingPeriodStart: profile.billing_period_start,
    billingPeriodEnd: profile.billing_period_end,
  };
}

/**
 * Check if user can perform a lookup
 */
export async function canPerformLookup(userId: string, userEmail?: string): Promise<{
  allowed: boolean;
  reason?: string;
  subscription?: SubscriptionStatus;
}> {
  // Admin bypass
  console.log('canPerformLookup called with:', userId, userEmail)
  if (userEmail === 'cljackson79@gmail.com') {
    console.log('Admin bypass activated!')
    return {
      allowed: true,
      subscription: {
        isActive: true,
        tier: 'enterprise',
        lookupsUsed: 0,
        lookupsLimit: -1,
        isUnlimited: true,
        billingPeriodStart: null,
        billingPeriodEnd: null,
      },
    };
  }

  const subscription = await checkSubscription(userId);

  if (!subscription.isActive) {
    return {
      allowed: false,
      reason: 'No active subscription. Please subscribe to TankFindr Pro to access the locator.',
      subscription,
    };
  }

  // Unlimited tier
  if (subscription.isUnlimited) {
    return {
      allowed: true,
      subscription,
    };
  }

  // Check if within limits
  if (subscription.lookupsUsed >= subscription.lookupsLimit) {
    return {
      allowed: false,
      reason: `You've reached your monthly limit of ${subscription.lookupsLimit} lookups. Upgrade your plan or wait for next billing cycle.`,
      subscription,
    };
  }

  return {
    allowed: true,
    subscription,
  };
}

/**
 * Increment lookup count for user
 */
export async function incrementLookupCount(userId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.rpc('increment_lookup_count', {
    user_id: userId,
  });

  return !error;
}

/**
 * Get user role (pro vs consumer)
 */
export async function getUserRole(userId: string): Promise<'pro' | 'consumer'> {
  const subscription = await checkSubscription(userId);
  return subscription.isActive ? 'pro' : 'consumer';
}

/**
 * Check if organization can add more users
 */
export async function canAddUser(organizationId: string, tier: 'starter' | 'pro' | 'enterprise'): Promise<{
  allowed: boolean;
  currentUsers: number;
  maxUsers: number;
  reason?: string;
}> {
  const supabase = createClient();

  // Get current user count for this organization
  const { count: currentUsers, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId);

  if (error) {
    return {
      allowed: false,
      currentUsers: 0,
      maxUsers: SUBSCRIPTION_TIERS[tier].maxUsers,
      reason: 'Error checking user count',
    };
  }

  const maxUsers = SUBSCRIPTION_TIERS[tier].maxUsers;
  const userCount = currentUsers || 0;

  if (userCount >= maxUsers) {
    return {
      allowed: false,
      currentUsers: userCount,
      maxUsers,
      reason: `Your ${tier} plan allows up to ${maxUsers} user${maxUsers > 1 ? 's' : ''}. Please upgrade to add more users.`,
    };
  }

  return {
    allowed: true,
    currentUsers: userCount,
    maxUsers,
  };
}
