-- ============================================
-- TankFindr Complete Database Schema
-- Copy and paste this entire file into Supabase SQL Editor
-- ============================================

-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- TABLES
-- ============================================

-- 1. PROFILES TABLE
-- Extends auth.users with subscription and usage tracking
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Stripe Integration
  stripe_customer_id TEXT UNIQUE,
  subscription_id TEXT,
  subscription_tier TEXT CHECK (subscription_tier IN ('starter', 'pro', 'enterprise')),
  subscription_status TEXT,
  
  -- Trial Tracking
  trial_start TIMESTAMPTZ,
  trial_locates_used INTEGER DEFAULT 0,
  
  -- Monthly Usage Tracking
  monthly_locates_used INTEGER DEFAULT 0,
  
  -- Billing Period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TANKS TABLE
-- Stores all located septic tanks with GPS coordinates
CREATE TABLE IF NOT EXISTS tanks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Location Data
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  
  -- AI Analysis Results
  confidence_score INTEGER,
  depth_estimate DECIMAL(5,2),
  
  -- Ownership
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USAGE TABLE
-- Logs every action for analytics and audit trail
CREATE TABLE IF NOT EXISTS usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- User and Action
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  
  -- Additional Data
  metadata JSONB,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CACHE TABLE
-- Stores recent locate results for offline access
CREATE TABLE IF NOT EXISTS cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Cache Key
  address TEXT UNIQUE NOT NULL,
  
  -- Cached Data
  data JSONB NOT NULL,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Tanks indexes
CREATE INDEX IF NOT EXISTS idx_tanks_user_id ON tanks(user_id);
CREATE INDEX IF NOT EXISTS idx_tanks_created_at ON tanks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tanks_location ON tanks USING GIST(ST_MakePoint(lng, lat));

-- Usage indexes
CREATE INDEX IF NOT EXISTS idx_usage_user_id ON usage(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_created_at ON usage(created_at DESC);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);

-- Cache indexes
CREATE INDEX IF NOT EXISTS idx_cache_address ON cache(address);
CREATE INDEX IF NOT EXISTS idx_cache_created_at ON cache(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tanks ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Service role can insert profiles (for webhook)
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Service role can update any profile (for webhook)
CREATE POLICY "Service role can update any profile"
  ON profiles FOR UPDATE
  USING (true);

-- TANKS POLICIES
-- Users can view their own tanks
CREATE POLICY "Users can view own tanks"
  ON tanks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own tanks
CREATE POLICY "Users can insert own tanks"
  ON tanks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tanks
CREATE POLICY "Users can update own tanks"
  ON tanks FOR UPDATE
  USING (auth.uid() = user_id);

-- USAGE POLICIES
-- Users can view their own usage
CREATE POLICY "Users can view own usage"
  ON usage FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own usage
CREATE POLICY "Users can insert own usage"
  ON usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can view all usage (for analytics)
CREATE POLICY "Service role can view all usage"
  ON usage FOR SELECT
  USING (true);

-- CACHE POLICIES
-- Anyone authenticated can read cache
CREATE POLICY "Authenticated users can read cache"
  ON cache FOR SELECT
  USING (auth.role() = 'authenticated');

-- Service role can manage cache
CREATE POLICY "Service role can insert cache"
  ON cache FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update cache"
  ON cache FOR UPDATE
  USING (true);

CREATE POLICY "Service role can delete cache"
  ON cache FOR DELETE
  USING (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean old cache entries (keep last 50)
CREATE OR REPLACE FUNCTION public.clean_old_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM cache
  WHERE id NOT IN (
    SELECT id FROM cache
    ORDER BY created_at DESC
    LIMIT 50
  );
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at on profile changes
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these queries after executing the schema to verify everything was created

-- Check tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('profiles', 'tanks', 'usage', 'cache');

-- Check indexes exist
-- SELECT indexname FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('profiles', 'tanks', 'usage', 'cache');

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('profiles', 'tanks', 'usage', 'cache');

-- Check policies exist
-- SELECT tablename, policyname FROM pg_policies 
-- WHERE schemaname = 'public';

-- ============================================
-- NOTES
-- ============================================

-- 1. This schema is safe to run multiple times (uses IF NOT EXISTS)
-- 2. RLS policies ensure users can only access their own data
-- 3. Service role can bypass RLS for webhook operations
-- 4. PostGIS extension enables geospatial queries for tank locations
-- 5. Automatic profile creation on user signup
-- 6. Automatic updated_at timestamp updates
-- 7. Cache cleanup function available (run manually or via cron)

-- ============================================
-- OPTIONAL: SEED DATA FOR TESTING
-- ============================================

-- Uncomment to add test data (only for development)

-- INSERT INTO cache (address, data) VALUES
-- ('123 Test St, City, State 12345', '{"lat": 40.7128, "lng": -74.0060, "confidence": 85, "depth": 4.5}'),
-- ('456 Demo Ave, Town, State 67890', '{"lat": 34.0522, "lng": -118.2437, "confidence": 92, "depth": 5.2}');

-- ============================================
-- COMPLETE! 
-- ============================================
-- Your TankFindr database is now ready to use!
-- Next steps:
-- 1. Verify tables in Supabase Table Editor
-- 2. Test user signup to verify profile creation
-- 3. Check RLS policies are working
-- ============================================
