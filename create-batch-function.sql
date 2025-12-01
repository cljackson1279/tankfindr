-- Create a PostgreSQL function to process batches efficiently
-- This function will be called by the Node.js script

CREATE OR REPLACE FUNCTION fix_florida_geometry_batch(batch_size INTEGER DEFAULT 5000)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Update a batch of records
  UPDATE septic_tanks
  SET 
    geom_fixed = ST_Transform(ST_SetSRID(geom, 2236), 4326),
    latitude = ST_Y(ST_Transform(ST_SetSRID(geom, 2236), 4326)),
    longitude = ST_X(ST_Transform(ST_SetSRID(geom, 2236), 4326))
  WHERE id IN (
    SELECT id 
    FROM septic_tanks
    WHERE state = 'FL'
      AND geom_fixed IS NULL
      AND NOT (ST_X(geom) BETWEEN -180 AND 180)
    LIMIT batch_size
  );
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION fix_florida_geometry_batch(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION fix_florida_geometry_batch(INTEGER) TO service_role;
