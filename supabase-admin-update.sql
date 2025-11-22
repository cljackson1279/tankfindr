-- TankFindr Admin & Email Update
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. ADD EMAIL COLUMN TO PROFILES
-- ============================================
-- Makes it easier to identify users in Table Editor

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================
-- 2. ADD ADMIN FLAG
-- ============================================
-- Allows admin users to bypass billing and have unlimited access

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- ============================================
-- 3. UPDATE EXISTING PROFILES WITH EMAIL
-- ============================================
-- Sync email from auth.users to profiles table

UPDATE profiles
SET email = auth.users.email
FROM auth.users
WHERE profiles.id = auth.users.id
AND profiles.email IS NULL;

-- ============================================
-- 4. SET YOUR ACCOUNT AS ADMIN
-- ============================================
-- Give cljackson79@gmail.com full admin access

UPDATE profiles
SET is_admin = TRUE
WHERE email = 'cljackson79@gmail.com';

-- If profile doesn't exist yet, create it
INSERT INTO profiles (id, email, is_admin, subscription_status)
SELECT id, email, TRUE, 'active'
FROM auth.users
WHERE email = 'cljackson79@gmail.com'
ON CONFLICT (id) DO UPDATE
SET is_admin = TRUE;

-- ============================================
-- 5. CREATE FUNCTION TO AUTO-SYNC EMAIL
-- ============================================
-- Automatically copy email from auth.users when profile is created

CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Get email from auth.users
  SELECT email INTO NEW.email
  FROM auth.users
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run on profile insert/update
DROP TRIGGER IF EXISTS sync_profile_email_trigger ON profiles;
CREATE TRIGGER sync_profile_email_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.email IS NULL)
  EXECUTE FUNCTION sync_profile_email();

-- ============================================
-- 6. VERIFICATION QUERIES
-- ============================================

-- Check if email column exists
SELECT 'email column added' AS status
WHERE EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_name = 'profiles' 
  AND column_name = 'email'
);

-- Check if admin column exists
SELECT 'is_admin column added' AS status
WHERE EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_name = 'profiles' 
  AND column_name = 'is_admin'
);

-- Check if your account is admin
SELECT 
  email,
  is_admin,
  subscription_status
FROM profiles
WHERE email = 'cljackson79@gmail.com';

-- Show all profiles with emails
SELECT 
  id,
  email,
  is_admin,
  subscription_status,
  subscription_tier,
  trial_locates_used,
  monthly_locates_used
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- DONE!
-- ============================================

-- You should see:
-- ✅ email column added
-- ✅ is_admin column added
-- ✅ Your account (cljackson79@gmail.com) shows is_admin = TRUE
-- ✅ All profiles now show email addresses
