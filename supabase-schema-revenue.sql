-- TankFindr Compliance Reports Database Schema
-- Run this in Supabase SQL Editor after the main schema

-- ============================================
-- 1. CREATE REPORTS TABLE
-- ============================================
-- Stores compliance report purchases and metadata

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tank_id UUID REFERENCES tanks(id) ON DELETE SET NULL,
  report_url TEXT NOT NULL,
  stripe_payment_id TEXT UNIQUE,
  price_paid INTEGER NOT NULL, -- in cents (2500 = $25.00)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_tank_id ON reports(tank_id);
CREATE INDEX IF NOT EXISTS idx_reports_stripe_payment_id ON reports(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- ============================================
-- 2. UPDATE PROFILES TABLE
-- ============================================
-- Add technician certification fields for compliance reports

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS technician_name TEXT,
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert reports (via webhook)
DROP POLICY IF EXISTS "Service role can insert reports" ON reports;
CREATE POLICY "Service role can insert reports"
  ON reports FOR INSERT
  WITH CHECK (true);

-- Users can update their own reports
DROP POLICY IF EXISTS "Users can update own reports" ON reports;
CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS reports_updated_at ON reports;
CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_reports_updated_at();

-- ============================================
-- 5. VERIFICATION QUERIES
-- ============================================

-- Verify reports table exists
SELECT 'reports table created' AS status 
WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'reports'
);

-- Verify new columns in profiles
SELECT 'technician fields added' AS status
WHERE EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_name = 'profiles' 
  AND column_name = 'technician_name'
);

-- ============================================
-- DONE!
-- ============================================

-- You should see:
-- ✅ reports table created
-- ✅ technician fields added
-- ✅ RLS policies enabled
-- ✅ Triggers created
