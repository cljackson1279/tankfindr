-- populate_septic_sources_optimized.sql
-- Optimized version that avoids expensive convex hull calculations
-- This version populates septic_sources without geometry (we'll add that later if needed)

INSERT INTO septic_sources (
  name,
  state,
  county,
  quality,
  geometry_type,
  record_count
)
SELECT 
  DISTINCT ON (state, county)
  CONCAT(county, ', ', state) AS name,
  state,
  county,
  'high'::text AS quality,
  'POINT'::text AS geometry_type,
  (SELECT COUNT(*) 
   FROM septic_tanks st 
   WHERE st.state = tanks.state 
     AND st.county = tanks.county
     AND st.geom IS NOT NULL) AS record_count
FROM septic_tanks tanks
WHERE state IS NOT NULL 
  AND county IS NOT NULL
  AND geom IS NOT NULL
GROUP BY state, county;

-- Verify it worked:
SELECT COUNT(*) as sources_created FROM septic_sources;
SELECT state, county, record_count FROM septic_sources ORDER BY record_count DESC LIMIT 20;
