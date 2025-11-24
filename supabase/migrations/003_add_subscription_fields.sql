-- Add subscription fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT CHECK (subscription_tier IN ('starter', 'pro', 'enterprise'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lookups_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS billing_period_start TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS billing_period_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Remove old trial fields (conflicts with Pro model)
ALTER TABLE profiles DROP COLUMN IF EXISTS trial_locates_used;
ALTER TABLE profiles DROP COLUMN IF EXISTS trial_started_at;

-- Create function to increment lookup count
CREATE OR REPLACE FUNCTION increment_lookup_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET lookups_used = lookups_used + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset monthly lookups (call this via cron)
CREATE OR REPLACE FUNCTION reset_monthly_lookups()
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET lookups_used = 0
  WHERE subscription_status = 'active'
    AND billing_period_end < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for faster subscription queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles(subscription_status, subscription_tier);
