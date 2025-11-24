# TankFindr Database Migration Instructions

## 🚨 CRITICAL: Apply SQL Migration to Supabase

The TankFindr application requires a PostgreSQL function to search for septic tanks. You need to manually apply this SQL migration to your Supabase database.

---

## Step 1: Access Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project: **cijtllcbrvkbvrjriweu**
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

---

## Step 2: Copy and Execute This SQL

Copy the ENTIRE SQL script below and paste it into the SQL editor, then click **RUN**:

```sql
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
```

---

## Step 3: Verify the Function Works

After running the migration, test it with this query:

```sql
-- Test with Miami, FL coordinates
SELECT * FROM find_nearest_septic_tank(
  25.8512,  -- latitude
  -80.2056, -- longitude
  1000      -- search radius in meters
);
```

You should see results if you have Miami-Dade septic data imported.

---

## Step 4: Check Your Data

Verify you have septic data imported:

```sql
-- Check how many septic tank records you have
SELECT
  county,
  state,
  COUNT(*) as tank_count
FROM septic_tanks
GROUP BY county, state
ORDER BY tank_count DESC
LIMIT 20;

-- Check Miami-Dade specifically
SELECT COUNT(*)
FROM septic_tanks
WHERE county = 'Miami-Dade' AND state = 'FL';
```

---

## Step 5: Check septic_sources Table

The coverage check requires the `septic_sources` table to be populated:

```sql
-- Check septic_sources
SELECT
  name,
  state,
  county,
  quality,
  record_count
FROM septic_sources
ORDER BY state, county;
```

If this table is empty, you need to populate it with metadata about your datasets:

```sql
-- Example: Add Miami-Dade source
INSERT INTO septic_sources (name, state, county, quality, geometry_type, record_count)
VALUES (
  'Miami-Dade County Department of Health',
  'FL',
  'Miami-Dade',
  'high',
  'POINT',
  (SELECT COUNT(*) FROM septic_tanks WHERE county = 'Miami-Dade' AND state = 'FL')
);
```

---

## Troubleshooting

### Error: "relation septic_tanks does not exist"

The `septic_tanks` table hasn't been created yet. Create it:

```sql
CREATE TABLE IF NOT EXISTS septic_tanks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT NOT NULL,
  county TEXT NOT NULL,
  state TEXT NOT NULL,
  parcel_id TEXT,
  address TEXT,
  geom GEOMETRY(POINT, 4326) NOT NULL,
  attributes JSONB,
  data_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_septic_tank UNIQUE (source_id, county, state)
);

CREATE INDEX idx_septic_tanks_geom ON septic_tanks USING GIST (geom);
CREATE INDEX idx_septic_tanks_county_state ON septic_tanks (county, state);
```

### Error: "PostGIS extension not available"

PostGIS might not be enabled. Run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

If this fails, contact Supabase support to enable PostGIS for your project.

---

## After Migration

Once you've applied the SQL migration:

1. ✅ Property Reports will work correctly
2. ✅ Pro Lookup will find tanks and show coordinates
3. ✅ Coverage checks will return accurate results
4. ✅ Admin account will see real data

Test with the Miami address:
- **2169 NW 90th Street, Miami, FL 33147**

This should now return real septic tank data if you have Miami-Dade records imported.

---

## Need Help?

If you encounter errors:
1. Check the Supabase logs (Database → Logs)
2. Verify PostGIS is installed: `SELECT PostGIS_version();`
3. Check table exists: `SELECT * FROM septic_tanks LIMIT 1;`
4. Check data import scripts in `/scripts` folder
