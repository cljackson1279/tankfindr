-- Staging table for validated pipeline output. Nothing here is read by the live
-- site until you run 002_promote_to_septic_tanks.sql after reviewing it.
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS septic_records_staging (
  source               text        NOT NULL,           -- e.g. tx_hgac_ossf
  source_record_id     text        NOT NULL,           -- "<layer>:<objectid>"
  state                text        NOT NULL,
  county               text,
  county_fips          text,
  record_type          text        NOT NULL,           -- residential_septic | commercial_septic | septic_unconfirmed | septic_unclassified
  permit_number        text,
  permit_date          date,
  permit_status        text,
  system_type          text,
  tank_capacity_gal    numeric,
  address              text,
  city                 text,
  zip                  text,
  parcel_id            text,
  latitude             double precision NOT NULL,
  longitude            double precision NOT NULL,
  geom                 geometry(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)) STORED,
  location_method      text        NOT NULL,           -- gps_permit | imagery_interpolation | parcel_centroid | address_geocode | unknown
  location_confidence  text        NOT NULL,           -- high | medium | low
  data_quality         text        NOT NULL,
  source_url           text,
  validation_flags     text[]      DEFAULT '{}',
  validated_at         timestamptz NOT NULL,
  loaded_at            timestamptz DEFAULT now(),
  PRIMARY KEY (source, source_record_id)
);

CREATE INDEX IF NOT EXISTS septic_records_staging_geom_idx ON septic_records_staging USING GIST (geom);
CREATE INDEX IF NOT EXISTS septic_records_staging_state_county_idx ON septic_records_staging (state, county);

-- Staging is private: only the service role (the loader) can touch it.
ALTER TABLE septic_records_staging ENABLE ROW LEVEL SECURITY;
