-- Address-first septic lookup.
--
-- find_nearest_septic_tank returns the 10 nearest records within 200 m. On large
-- rural lots the customer's own record can be farther than 200 m from where the
-- geocoder puts the street address, and in dense subdivisions it can fall outside
-- the 10 nearest. This function finds records near the customer that carry the
-- customer's house number; lib/septicLookup.ts then confirms the street name.
--
-- Safe to run anytime: the app falls back to the old behaviour if this function
-- does not exist.

CREATE OR REPLACE FUNCTION find_septic_by_address(
  search_lat DOUBLE PRECISION,
  search_lng DOUBLE PRECISION,
  house_number TEXT,
  search_radius_meters INTEGER DEFAULT 1500
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
  IF house_number IS NULL OR house_number !~ '^[0-9]+$' THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT
    st.id, st.source_id, st.county, st.state, st.parcel_id, st.address,
    ST_Y(st.geom) AS lat,
    ST_X(st.geom) AS lng,
    ST_Distance(st.geom::geography, ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography) AS distance_meters,
    st.attributes,
    st.data_source
  FROM septic_tanks st
  WHERE ST_DWithin(st.geom, ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326), search_radius_meters / 111320.0)
    AND st.address ~ ('^\s*0*' || house_number || '\M')
  ORDER BY st.geom <-> ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)
  LIMIT 25;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION find_septic_by_address IS 'Records near a point whose address starts with the given house number (street is confirmed in the app).';

-- Wider candidate search used for parcel matching (Delaware permits carry the tax
-- parcel number): up to 50 records within the radius instead of the 10 nearest.
CREATE OR REPLACE FUNCTION find_septic_candidates(
  search_lat DOUBLE PRECISION,
  search_lng DOUBLE PRECISION,
  search_radius_meters INTEGER DEFAULT 600,
  max_rows INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID, source_id TEXT, county TEXT, state TEXT, parcel_id TEXT, address TEXT,
  lat DOUBLE PRECISION, lng DOUBLE PRECISION, distance_meters DOUBLE PRECISION,
  attributes JSONB, data_source TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT st.id, st.source_id, st.county, st.state, st.parcel_id, st.address,
         ST_Y(st.geom), ST_X(st.geom),
         ST_Distance(st.geom::geography, ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography),
         st.attributes, st.data_source
  FROM septic_tanks st
  WHERE ST_DWithin(st.geom, ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326), search_radius_meters / 111320.0)
  ORDER BY st.geom <-> ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)
  LIMIT LEAST(max_rows, 200);
END;
$$ LANGUAGE plpgsql STABLE;
