-- Check a specific Florida record that should have been fixed
SELECT 
  id,
  county,
  state,
  ST_X(geom::geometry) as longitude,
  ST_Y(geom::geometry) as latitude,
  attributes->>'PERMIT_NUMBER' as permit,
  attributes->>'SITE_ADDRESS_FULL' as address
FROM septic_tanks
WHERE state = 'FL' 
  AND county = 'Miami-Dade'
  AND attributes->>'PERMIT_NUMBER' = 'AP1267843'
LIMIT 1;
