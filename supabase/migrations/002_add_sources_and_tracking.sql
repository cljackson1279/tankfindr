-- Add septic_sources table for territory-agnostic coverage
CREATE TABLE IF NOT EXISTS septic_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  county TEXT,
  coverage_geom GEOMETRY(MultiPolygon, 4326),
  quality TEXT CHECK (quality IN ('high', 'medium', 'low')),
  geometry_type TEXT CHECK (geometry_type IN ('POINT', 'POLYGON')),
  rest_url TEXT,
  record_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add spatial index for coverage checks
CREATE INDEX IF NOT EXISTS idx_septic_sources_coverage_geom 
ON septic_sources USING GIST (coverage_geom);

-- Add B-tree index for state/county lookups
CREATE INDEX IF NOT EXISTS idx_septic_sources_state_county 
ON septic_sources (state, county);

-- Add source_id to septic_tanks if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'septic_tanks' AND column_name = 'source_id'
  ) THEN
    ALTER TABLE septic_tanks ADD COLUMN source_id UUID REFERENCES septic_sources(id);
    CREATE INDEX idx_septic_tanks_source_id ON septic_tanks(source_id);
  END IF;
END $$;

-- Add lookup logging table for analytics and abuse prevention
CREATE TABLE IF NOT EXISTS septic_lookups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  ip_address INET,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  classification TEXT,
  confidence TEXT,
  result_summary JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for lookups table
CREATE INDEX IF NOT EXISTS idx_septic_lookups_user_id ON septic_lookups(user_id);
CREATE INDEX IF NOT EXISTS idx_septic_lookups_created_at ON septic_lookups(created_at);
CREATE INDEX IF NOT EXISTS idx_septic_lookups_ip_address ON septic_lookups(ip_address);

-- Add job history table for Pro users
CREATE TABLE IF NOT EXISTS septic_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  result_summary JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for jobs table
CREATE INDEX IF NOT EXISTS idx_septic_jobs_user_id ON septic_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_septic_jobs_created_at ON septic_jobs(created_at DESC);

-- Add property reports table for $19 one-time purchases
CREATE TABLE IF NOT EXISTS property_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  report_data JSONB NOT NULL,
  stripe_payment_id TEXT,
  amount_paid INTEGER, -- in cents
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for reports table
CREATE INDEX IF NOT EXISTS idx_property_reports_email ON property_reports(email);
CREATE INDEX IF NOT EXISTS idx_property_reports_stripe_payment_id ON property_reports(stripe_payment_id);

-- Add user metadata columns if not exists (for roles and usage tracking)
DO $$ 
BEGIN
  -- This assumes you have a users table from auth
  -- Adjust table name if different
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
      ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'default';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_tier') THEN
      ALTER TABLE users ADD COLUMN subscription_tier TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_customer_id') THEN
      ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_subscription_id') THEN
      ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'monthly_lookup_count') THEN
      ALTER TABLE users ADD COLUMN monthly_lookup_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'lookup_reset_date') THEN
      ALTER TABLE users ADD COLUMN lookup_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- Function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_ip_address INET,
  p_limit INTEGER,
  p_window_minutes INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  lookup_count INTEGER;
BEGIN
  -- Count lookups in the time window
  SELECT COUNT(*) INTO lookup_count
  FROM septic_lookups
  WHERE (user_id = p_user_id OR ip_address = p_ip_address)
    AND created_at > NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  RETURN lookup_count < p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE septic_sources IS 'Metadata about each septic dataset source with coverage geometry';
COMMENT ON TABLE septic_lookups IS 'Log of all septic tank lookups for analytics and abuse prevention';
COMMENT ON TABLE septic_jobs IS 'Job history for Pro users';
COMMENT ON TABLE property_reports IS 'Purchased property reports ($19 one-time)';
