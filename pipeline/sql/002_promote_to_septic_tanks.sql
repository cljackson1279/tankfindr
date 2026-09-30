-- Promote reviewed staging records into the live septic_tanks table.
-- Run ONE source at a time in the Supabase SQL editor: replace SOURCE_ID below
-- with 'de_dnrec_septic' or 'tx_hgac_ossf'. The INSERT is a single statement,
-- so it either fully succeeds or changes nothing.
--
-- Undo for a source (removes only rows this script added):
--   DELETE FROM septic_tanks WHERE data_source = 'SOURCE_ID';

INSERT INTO septic_tanks (
  source_id, county, state, parcel_id, address, geom, latitude, longitude,
  data_source, data_quality, quality_source, attributes
)
SELECT
  s.source || ':' || s.source_record_id,
  s.county,
  s.state,
  s.parcel_id,
  CASE WHEN s.address IS NULL THEN NULL ELSE  -- no street address: leave empty, never "DE 19950"
  NULLIF(
    regexp_replace(regexp_replace(
      CASE
        -- Parcel addresses (TX) already carry city, state and ZIP
        WHEN s.address ~ ',\s*[A-Za-z]{2}\s+\d{5}' THEN s.address
        ELSE concat_ws(', ', s.address, s.city, NULLIF(concat_ws(' ', s.state, s.zip), s.state))
      END,
    '\s+', ' ', 'g'), '\s+,', ',', 'g'),
  '') END,
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
WHERE s.source = 'SOURCE_ID'
ON CONFLICT (source_id, county, state) DO UPDATE SET
  parcel_id = EXCLUDED.parcel_id,
  address = EXCLUDED.address,
  geom = EXCLUDED.geom,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  data_quality = EXCLUDED.data_quality,
  quality_source = EXCLUDED.quality_source,
  attributes = EXCLUDED.attributes,
  updated_at = now();

-- Check: should match the staged count (TX 105,966 / DE 60,943).
SELECT state, count(*) AS records, count(address) AS with_address
FROM septic_tanks WHERE data_source = 'SOURCE_ID' GROUP BY state;
