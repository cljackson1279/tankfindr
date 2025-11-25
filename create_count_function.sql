CREATE OR REPLACE FUNCTION count_septic_tanks_by_state()
RETURNS TABLE(state TEXT, record_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT s.state, COUNT(s.id) as record_count
  FROM public.septic_tanks s
  GROUP BY s.state
  ORDER BY record_count DESC;
END;
$$ LANGUAGE plpgsql;
