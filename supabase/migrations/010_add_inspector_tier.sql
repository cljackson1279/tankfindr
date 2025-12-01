-- Add 'inspector' to the allowed subscription tiers

-- Drop the old constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

-- Add new constraint with 'inspector' included
ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_tier_check 
  CHECK (subscription_tier IN ('starter', 'pro', 'enterprise', 'inspector'));
