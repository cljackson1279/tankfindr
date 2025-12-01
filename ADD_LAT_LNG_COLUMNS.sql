-- Step 1: Add latitude and longitude columns to septic_tanks table
-- Run this ONCE before running the geometry fix

-- Add latitude column (stores Y coordinate in WGS84)
ALTER TABLE septic_tanks 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;

-- Add longitude column (stores X coordinate in WGS84)
ALTER TABLE septic_tanks 
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Create indexes for faster spatial queries
CREATE INDEX IF NOT EXISTS idx_septic_tanks_latitude ON septic_tanks(latitude);
CREATE INDEX IF NOT EXISTS idx_septic_tanks_longitude ON septic_tanks(longitude);
CREATE INDEX IF NOT EXISTS idx_septic_tanks_lat_lng ON septic_tanks(latitude, longitude);

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'septic_tanks' 
  AND column_name IN ('latitude', 'longitude');
