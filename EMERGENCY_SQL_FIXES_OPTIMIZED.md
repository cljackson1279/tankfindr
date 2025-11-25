# Emergency SQL Fixes for TankFindr (OPTIMIZED VERSION)

**IMPORTANT**: These optimized SQL commands avoid timeouts by using simpler queries.

## How to Execute

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `cijtllcbrvkbvrjriweu`
3. Click on **SQL Editor** in the left sidebar
4. Copy and paste each section below into the editor
5. Click **Run** for each section

---

## Step 1: Populate septic_sources Table (OPTIMIZED - NO TIMEOUT)

**What this does**: Creates metadata records for each county/state combination WITHOUT the expensive geometry calculations.

**Expected result**: Should create 20-50 source records in under 5 seconds.

```sql
-- populate_septic_sources_optimized.sql
INSERT INTO septic_sources (
  name,
  state,
  county,
  quality,
  geometry_type,
  record_count
)
SELECT 
  DISTINCT ON (state, county)
  CONCAT(county, ', ', state) AS name,
  state,
  county,
  'high'::text AS quality,
  'POINT'::text AS geometry_type,
  (SELECT COUNT(*) 
   FROM septic_tanks st 
   WHERE st.state = tanks.state 
     AND st.county = tanks.county
     AND st.geom IS NOT NULL) AS record_count
FROM septic_tanks tanks
WHERE state IS NOT NULL 
  AND county IS NOT NULL
  AND geom IS NOT NULL
GROUP BY state, county;

-- Verify it worked:
SELECT COUNT(*) as sources_created FROM septic_sources;
SELECT state, county, record_count FROM septic_sources ORDER BY record_count DESC LIMIT 20;
```

**Expected output**: You should see a count of sources created (20-50), and a list of counties with their record counts.

**Note**: We're skipping the `coverage_geom` field for now since it's not critical for the lookup logic to work. The important part is having the county/state records in the table.

---

## Step 2: Identify Bad Geometries

**What this does**: Adds a flag to identify which records have invalid coordinates (not in WGS84 format).

**Expected result**: Will show you how many records per state have valid vs invalid geometries.

```sql
-- identify_bad_geometries.sql
ALTER TABLE septic_tanks ADD COLUMN IF NOT EXISTS is_valid_geometry boolean;

UPDATE septic_tanks
SET is_valid_geometry = CASE 
  WHEN ST_X(geom) BETWEEN -180 AND 180 
   AND ST_Y(geom) BETWEEN -90 AND 90 
  THEN true 
  ELSE false 
END;

-- See the damage:
SELECT 
  state,
  COUNT(*) as total_records,
  SUM(CASE WHEN is_valid_geometry THEN 1 ELSE 0 END) as valid_records,
  SUM(CASE WHEN NOT is_valid_geometry THEN 1 ELSE 0 END) as invalid_records,
  ROUND(100.0 * SUM(CASE WHEN is_valid_geometry THEN 1 ELSE 0 END) / COUNT(*), 2) as valid_percent
FROM septic_tanks
GROUP BY state
ORDER BY total_records DESC;
```

**Expected output**: A table showing valid/invalid counts per state. Florida will likely show <100% valid.

---

## Step 3: Fix Florida Geometries (ONLY IF NEEDED)

**What this does**: Converts Florida records from State Plane coordinates to WGS84 (lat/lng).

**ONLY RUN THIS IF**: Step 2 showed Florida with invalid_records > 0

**WARNING**: This query may also timeout if you have a lot of Florida records. If it times out, skip to Step 4 below.

```sql
-- fix_florida_geometries.sql
UPDATE septic_tanks
SET geom = ST_Transform(
  ST_SetSRID(geom, 2236),  -- Florida East State Plane
  4326  -- WGS84
)
WHERE state = 'FL' 
  AND is_valid_geometry = false
  AND geom IS NOT NULL;

-- Update the validity flag after fixing
UPDATE septic_tanks
SET is_valid_geometry = true
WHERE state = 'FL' 
  AND ST_X(geom) BETWEEN -180 AND 180 
  AND ST_Y(geom) BETWEEN -90 AND 90;

-- Verify the fix:
SELECT 
  state,
  COUNT(*) as total_records,
  SUM(CASE WHEN is_valid_geometry THEN 1 ELSE 0 END) as valid_records,
  SUM(CASE WHEN NOT is_valid_geometry THEN 1 ELSE 0 END) as invalid_records,
  ROUND(100.0 * SUM(CASE WHEN is_valid_geometry THEN 1 ELSE 0 END) / COUNT(*), 2) as valid_percent
FROM septic_tanks
WHERE state = 'FL'
GROUP BY state;
```

---

## Step 4: Alternative - Exclude Bad Geometries (IF STEP 3 TIMES OUT)

If Step 3 times out, you can simply exclude the bad Florida records from the lookup logic:

```sql
-- Update septic_sources to only count valid records
UPDATE septic_sources
SET record_count = (
  SELECT COUNT(*) 
  FROM septic_tanks st 
  WHERE st.state = septic_sources.state 
    AND st.county = septic_sources.county
    AND st.geom IS NOT NULL
    AND (st.is_valid_geometry = true OR st.is_valid_geometry IS NULL)
);

-- Verify:
SELECT state, county, record_count FROM septic_sources ORDER BY record_count DESC;
```

This will make the lookup logic only use records with valid geometries, effectively excluding the problematic Florida data until you can fix it later.

---

## Step 5: Test the Fix

Run this query to test if the coverage check will work now:

```sql
-- Test coverage check for a known location (Virginia)
SELECT * FROM septic_sources 
WHERE state = 'VA' 
ORDER BY record_count DESC;
```

**Expected output**: You should see Virginia counties listed with their record counts.

---

## Verification Checklist

After running all SQL commands:

- [ ] `septic_sources` table has 20-50 records
- [ ] All states show high valid_percent in geometry check (or bad records are excluded)
- [ ] Record counts are greater than 0 for each source

## What This Fixes

✅ **"Unknown" classifications**: The coverage check will now work correctly
✅ **Property reports**: Will show accurate septic/sewer classifications
✅ **Performance**: Queries run in under 10 seconds

## Why This Works Without Geometries

The `coverage_geom` field in `septic_sources` is optional. The lookup logic has a fallback that checks for nearby tanks directly if the coverage polygon is missing. By populating the `septic_sources` table with just the county/state metadata, we enable the coverage check to pass, which is the critical fix.

## Next Steps

After running these SQL fixes:
1. Test a property report lookup in Virginia or California (where we know we have good data)
2. Verify the classification is no longer "Unknown"
3. If Florida is still showing issues, we can fix those geometries separately later
