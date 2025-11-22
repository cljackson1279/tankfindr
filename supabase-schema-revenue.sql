-- Compliance Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  tank_id UUID REFERENCES tanks(id),
  report_url TEXT NOT NULL,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  price_paid INTEGER NOT NULL
);

-- Add technician info to profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS technician_name TEXT,
  ADD COLUMN IF NOT EXISTS license_number TEXT,
  ADD COLUMN IF NOT EXISTS digital_signature_url TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Add payment type tracking
ALTER TABLE usage 
  ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'subscription';

-- Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own reports" ON reports;
CREATE POLICY "Users read own reports" ON reports FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert reports" ON reports;
CREATE POLICY "Users insert reports" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access to reports" ON reports;
CREATE POLICY "Service role full access to reports" ON reports FOR ALL USING (true);
