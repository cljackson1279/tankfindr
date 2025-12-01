-- CORRECTED Florida Geometry Fix Query
-- This updates latitude and longitude columns that the app actually uses

UPDATE septic_tanks
SET 
  geom_fixed = ST_Transform(ST_SetSRID(geom, 2236), 4326),
  latitude = ST_Y(ST_Transform(ST_SetSRID(geom, 2236), 4326)),
  longitude = ST_X(ST_Transform(ST_SetSRID(geom, 2236), 4326))
WHERE state = 'FL'
  AND geom_fixed IS NULL
  AND NOT (ST_X(geom) BETWEEN -180 AND 180)
  AND id IN (
    SELECT id FROM septic_tanks
    WHERE state = 'FL'
      AND geom_fixed IS NULL
      AND NOT (ST_X(geom) BETWEEN -180 AND 180)
    LIMIT 500
  );

-- EXPLANATION:
-- 1. ST_Transform(ST_SetSRID(geom, 2236), 4326) - Transforms from Florida State Plane to WGS84
-- 2. ST_Y(...) extracts the latitude (Y coordinate)
-- 3. ST_X(...) extracts the longitude (X coordinate)
-- 4. Updates all three columns: geom_fixed, latitude, longitude
-- 5. Processes 500 records at a time to avoid timeouts

-- USAGE:
-- 1. Stop your current script
-- 2. Replace the SQL in Supabase SQL Editor with this query
-- 3. Run your JavaScript automation script again (100 runs = 50,000 records)
-- 4. Total runs needed: ~4,163 (for 2.1M records)
