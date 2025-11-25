-- fix_florida_geometries.sql
-- Reprojects Florida data from State Plane to WGS84

UPDATE septic_tanks
SET geom = ST_Transform(
  ST_SetSRID(geom, 2236),  -- Florida East State Plane
  4326  -- WGS84
)
WHERE state = 'FL' 
  AND is_valid_geometry = false
  AND geom IS NOT NULL;

-- Update the validity flag after fixing
UPDATE septic_tanks
SET is_valid_geometry = true
WHERE state = 'FL' 
  AND ST_X(geom) BETWEEN -180 AND 180 
  AND ST_Y(geom) BETWEEN -90 AND 90;

-- Verify the fix:
SELECT 
  state,
  COUNT(*) as total_records,
  SUM(CASE WHEN is_valid_geometry THEN 1 ELSE 0 END) as valid_records,
  SUM(CASE WHEN NOT is_valid_geometry THEN 1 ELSE 0 END) as invalid_records,
  ROUND(100.0 * SUM(CASE WHEN is_valid_geometry THEN 1 ELSE 0 END) / COUNT(*), 2) as valid_percent
FROM septic_tanks
WHERE state = 'FL'
GROUP BY state;
