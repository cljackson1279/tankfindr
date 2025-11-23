-- Create PostgreSQL function to find nearest septic tank within radius
-- Uses PostGIS ST_DWithin and ST_Distance for efficient spatial queries

CREATE OR REPLACE FUNCTION find_nearest_septic_tank(
  search_lat double precision,
  search_lng double precision,
  search_radius_meters integer DEFAULT 200
)
RETURNS TABLE (
  id uuid,
  source_id text,
  county text,
  state text,
  parcel_id text,
  address text,
  lat double precision,
  lng double precision,
  attributes jsonb,
  data_source text,
  distance_meters double precision
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id,
    st.source_id,
    st.county,
    st.state,
    st.parcel_id,
    st.address,
    ST_Y(st.geom::geometry) as lat,
    ST_X(st.geom::geometry) as lng,
    st.attributes,
    st.data_source,
    ST_Distance(
      st.geom::geography,
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography
    ) as distance_meters
  FROM septic_tanks st
  WHERE ST_DWithin(
    st.geom::geography,
    ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography,
    search_radius_meters
  )
  ORDER BY distance_meters ASC
  LIMIT 1;
END;
$$;

-- Grant execute permission to public (for API access)
GRANT EXECUTE ON FUNCTION find_nearest_septic_tank TO public;

-- Add comment
COMMENT ON FUNCTION find_nearest_septic_tank IS 'Finds the nearest septic tank within a specified radius using PostGIS spatial queries';
