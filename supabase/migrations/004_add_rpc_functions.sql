-- Create PostGIS extension if not exists
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop existing function if exists
DROP FUNCTION IF EXISTS find_nearest_septic_tank(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER);

-- Create function to find nearest septic tank within radius
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
    ST_Y(st.geom::geometry) AS lat,
    ST_X(st.geom::geometry) AS lng,
    ST_Distance(
      st.geom::geography,
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography
    ) AS distance_meters,
    st.attributes,
    st.data_source
  FROM septic_tanks st
  WHERE ST_DWithin(
    st.geom::geography,
    ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography,
    search_radius_meters
  )
  ORDER BY st.geom::geography <-> ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography
  LIMIT 10;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION find_nearest_septic_tank IS 'Find nearest septic tanks within radius using PostGIS';

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_septic_tanks_geom
ON septic_tanks USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_septic_tanks_county_state
ON septic_tanks (county, state);
