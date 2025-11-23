-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create septic_tanks table for county records
CREATE TABLE IF NOT EXISTS septic_tanks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text NOT NULL,           -- ID from county dataset (e.g., FACILITY_ID, PERMIT_NO)
  county text NOT NULL,               -- County name
  state text NOT NULL,                -- State abbreviation
  parcel_id text,                     -- Parcel ID if available
  address text,                       -- Property address if available
  geom geometry(Point, 4326) NOT NULL, -- Tank location (lat/lng)
  attributes jsonb,                   -- Raw attributes from county dataset
  data_source text DEFAULT 'county_gis', -- Source type
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Unique constraint to prevent duplicates
  UNIQUE(source_id, county, state)
);

-- Create spatial index for fast proximity queries
CREATE INDEX IF NOT EXISTS septic_tanks_geom_idx ON septic_tanks USING GIST (geom);

-- Create index on county/state for filtering
CREATE INDEX IF NOT EXISTS septic_tanks_county_state_idx ON septic_tanks (county, state);

-- Enable Row Level Security
ALTER TABLE septic_tanks ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (for API queries)
CREATE POLICY "Allow public read access to septic tanks"
  ON septic_tanks
  FOR SELECT
  TO public
  USING (true);

-- Policy: Allow service role to insert/update (for imports)
CREATE POLICY "Allow service role to manage septic tanks"
  ON septic_tanks
  FOR ALL
  TO service_role
  USING (true);

-- Add comment
COMMENT ON TABLE septic_tanks IS 'County septic tank location records from official GIS datasets';
