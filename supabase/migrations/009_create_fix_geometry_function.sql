-- Create a function to fix individual Florida geometries
-- This function is called by the automated fix script

CREATE OR REPLACE FUNCTION fix_florida_geometry(
  record_id UUID,
  source_srid INTEGER DEFAULT 2236,
  target_srid INTEGER DEFAULT 4326
)
RETURNS VOID AS $$
BEGIN
  UPDATE septic_tanks
  SET geom_fixed = ST_Transform(ST_SetSRID(geom, source_srid), target_srid)
  WHERE id = record_id
    AND state = 'FL'
    AND geom_fixed IS NULL
    AND NOT (ST_X(geom) BETWEEN -180 AND 180);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION fix_florida_geometry TO authenticated, anon, service_role;
