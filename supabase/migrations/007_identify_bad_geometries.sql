-- identify_bad_geometries.sql
-- Flags records that aren't in WGS84 (lat/lng) format

ALTER TABLE septic_tanks ADD COLUMN IF NOT EXISTS is_valid_geometry boolean;

UPDATE septic_tanks
SET is_valid_geometry = CASE 
  WHEN ST_X(geom) BETWEEN -180 AND 180 
   AND ST_Y(geom) BETWEEN -90 AND 90 
  THEN true 
  ELSE false 
END;

-- See the damage:
SELECT 
  state,
  COUNT(*) as total_records,
  SUM(CASE WHEN is_valid_geometry THEN 1 ELSE 0 END) as valid_records,
  SUM(CASE WHEN NOT is_valid_geometry THEN 1 ELSE 0 END) as invalid_records,
  ROUND(100.0 * SUM(CASE WHEN is_valid_geometry THEN 1 ELSE 0 END) / COUNT(*), 2) as valid_percent
FROM septic_tanks
GROUP BY state
ORDER BY total_records DESC;
