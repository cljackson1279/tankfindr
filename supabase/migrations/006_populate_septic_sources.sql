-- populate_septic_sources.sql
-- Copies unique county/state pairs from septic_tanks to septic_sources
-- This fixes the "Unknown" classification issue by enabling coverage checks

INSERT INTO septic_sources (
  name,
  state,
  county,
  quality,
  coverage_geom,
  geometry_type,
  record_count
)
SELECT 
  DISTINCT ON (state, county)
  CONCAT(county, ', ', state) AS name,
  state,
  county,
  'high'::text AS quality,
  -- Create coverage polygon from all points in this county
  (SELECT ST_ConvexHull(ST_Collect(geom)) 
   FROM septic_tanks st 
   WHERE st.state = tanks.state AND st.county = tanks.county) AS coverage_geom,
  'POINT'::text AS geometry_type,
  (SELECT COUNT(*) 
   FROM septic_tanks st 
   WHERE st.state = tanks.state AND st.county = tanks.county) AS record_count
FROM septic_tanks tanks
WHERE state IS NOT NULL 
  AND county IS NOT NULL
  AND geom IS NOT NULL;

-- Verify it worked:
SELECT COUNT(*) as sources_created FROM septic_sources;
SELECT state, county, record_count FROM septic_sources ORDER BY record_count DESC LIMIT 20;
