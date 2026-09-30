-- Promote reviewed staging records into the live septic_tanks table.
-- Run ONE source at a time, after reading data/reports/<source>.md.
-- Wrapped in a transaction: check the counts at the end, then COMMIT or ROLLBACK.
--
--   psql "$DATABASE_URL" -v src=tx_hgac_ossf -f pipeline/sql/002_promote_to_septic_tanks.sql
--   (or paste into the Supabase SQL editor and replace :'src' with 'tx_hgac_ossf')

BEGIN;

INSERT INTO septic_tanks (
  source_id, county, state, parcel_id, address, geom, latitude, longitude,
  data_source, data_quality, quality_source, attributes
)
SELECT
  s.source || ':' || s.source_record_id,
  s.county,
  s.state,
  s.parcel_id,
  NULLIF(concat_ws(', ', s.address, s.city, NULLIF(concat_ws(' ', s.state, s.zip), s.state)), ''),
  s.geom,
  s.latitude,
  s.longitude,
  s.source,
  s.data_quality,
  coalesce(s.source_name, 'pipeline:' || s.source),
  jsonb_strip_nulls(jsonb_build_object(
    -- lib/septicLookup.ts reads these keys for the report (data quality, system info)
    'data_quality', s.data_quality,
    'quality_source', s.source_name,
    'year_built', s.year_built,
    'address_match', s.address_match,
    'record_type', s.record_type,
    'permit_number', s.permit_number,
    'permit_date', s.permit_date,
    'permit_status', s.permit_status,
    'system_type', s.system_type,
    'tank_capacity_gal', s.tank_capacity_gal,
    'location_method', s.location_method,
    'location_confidence', s.location_confidence,
    'source_url', s.source_url,
    'validation_flags', s.validation_flags,
    'validated_at', s.validated_at
  ))
FROM septic_records_staging s
WHERE s.source = :'src'
ON CONFLICT (source_id, county, state) DO UPDATE SET
  parcel_id = EXCLUDED.parcel_id,
  address = EXCLUDED.address,
  geom = EXCLUDED.geom,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  data_quality = EXCLUDED.data_quality,
  attributes = EXCLUDED.attributes,
  updated_at = now();

-- Sanity check before committing: should match the "Clean" number in the report.
SELECT state, county, count(*) FROM septic_tanks WHERE data_source = :'src' GROUP BY 1, 2 ORDER BY 3 DESC;

-- COMMIT;   -- uncomment after checking the counts
-- ROLLBACK; -- or undo everything
