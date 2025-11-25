-- Fix RPC function to use geometry index instead of geography casting
-- This prevents full table scans on 2.1M records

DROP FUNCTION IF EXISTS find_nearest_septic_tank(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER);

CREATE OR REPLACE FUNCTION find_nearest_septic_tank(
  search_lat DOUBLE PRECISION,
  search_lng DOUBLE PRECISION,
  search_radius_meters INTEGER DEFAULT 200
)
RETURNS TABLE (
  id UUID,
  source_id TEXT,
  county TEXT,
  state TEXT,
  parcel_id TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  distance_meters DOUBLE PRECISION,
  attributes JSONB,
  data_source TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    st.id,
    st.source_id,
    st.county,
    st.state,
    st.parcel_id,
    st.address,
    ST_Y(st.geom) AS lat,
    ST_X(st.geom) AS lng,
    ST_Distance(
      st.geom::geography,
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography
    ) AS distance_meters,
    st.attributes,
    st.data_source
  FROM septic_tanks st
  WHERE ST_DWithin(
    st.geom,
    ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326),
    search_radius_meters / 111320.0  -- Convert meters to degrees (approximate)
  )
  ORDER BY st.geom <-> ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)
  LIMIT 10;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION find_nearest_septic_tank IS 'Find nearest septic tanks within radius using PostGIS geometry index';

-- Ensure index exists
CREATE INDEX IF NOT EXISTS idx_septic_tanks_geom
ON septic_tanks USING GIST (geom);

-- Add regular indexes for common queries
CREATE INDEX IF NOT EXISTS idx_septic_tanks_county_state
ON septic_tanks (county, state);

-- Set statement timeout for this function to 10 seconds
ALTER FUNCTION find_nearest_septic_tank(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER)
SET statement_timeout = '10s';
