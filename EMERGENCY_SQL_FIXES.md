# Emergency SQL Fixes for TankFindr

**IMPORTANT**: These SQL commands must be run in your Supabase SQL Editor to fix the "Unknown" classification issue.

## How to Execute

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `cijtllcbrvkbvrjriweu`
3. Click on **SQL Editor** in the left sidebar
4. Copy and paste each section below into the editor
5. Click **Run** for each section

---

## Step 1: Populate septic_sources Table (HIGHEST PRIORITY)

**What this does**: Creates metadata records for each county/state combination in your database. This enables the coverage check logic.

**Expected result**: Should create 20-50 source records (one for each unique county/state pair).

```sql
-- populate_septic_sources.sql
INSERT INTO septic_sources (
  name,
  state,
  county,
  quality,
  coverage_geom,
  geometry_type,
  record_count
)
SELECT 
  DISTINCT ON (state, county)
  CONCAT(county, ', ', state) AS name,
  state,
  county,
  'high'::text AS quality,
  (SELECT ST_ConvexHull(ST_Collect(geom)) 
   FROM septic_tanks st 
   WHERE st.state = tanks.state AND st.county = tanks.county) AS coverage_geom,
  'POINT'::text AS geometry_type,
  (SELECT COUNT(*) 
   FROM septic_tanks st 
   WHERE st.state = tanks.state AND st.county = tanks.county) AS record_count
FROM septic_tanks tanks
WHERE state IS NOT NULL 
  AND county IS NOT NULL
  AND geom IS NOT NULL;

-- Verify it worked:
SELECT COUNT(*) as sources_created FROM septic_sources;
SELECT state, county, record_count FROM septic_sources ORDER BY record_count DESC LIMIT 20;
```

**Expected output**: You should see a count of sources created (20-50), and a list of counties with their record counts.

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

## Step 3: Fix Florida Geometries (if needed)

**What this does**: Converts Florida records from State Plane coordinates to WGS84 (lat/lng).

**ONLY RUN THIS IF**: Step 2 showed Florida with invalid_records > 0

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

**Expected output**: Florida should now show 100% valid_percent.

---

## Step 4: Re-populate septic_sources (after fixing geometries)

**What this does**: Updates the coverage polygons now that geometries are fixed.

```sql
-- Clear old sources and repopulate with fixed geometries
DELETE FROM septic_sources;

INSERT INTO septic_sources (
  name,
  state,
  county,
  quality,
  coverage_geom,
  geometry_type,
  record_count
)
SELECT 
  DISTINCT ON (state, county)
  CONCAT(county, ', ', state) AS name,
  state,
  county,
  'high'::text AS quality,
  (SELECT ST_ConvexHull(ST_Collect(geom)) 
   FROM septic_tanks st 
   WHERE st.state = tanks.state 
     AND st.county = tanks.county
     AND st.is_valid_geometry = true) AS coverage_geom,
  'POINT'::text AS geometry_type,
  (SELECT COUNT(*) 
   FROM septic_tanks st 
   WHERE st.state = tanks.state 
     AND st.county = tanks.county
     AND st.is_valid_geometry = true) AS record_count
FROM septic_tanks tanks
WHERE state IS NOT NULL 
  AND county IS NOT NULL
  AND geom IS NOT NULL
  AND is_valid_geometry = true;

-- Final verification:
SELECT COUNT(*) as total_sources FROM septic_sources;
SELECT state, county, record_count FROM septic_sources ORDER BY record_count DESC;
```

---

## Verification Checklist

After running all SQL commands:

- [ ] `septic_sources` table has 20-50 records
- [ ] All states show 100% valid_percent in geometry check
- [ ] Coverage polygons are created for each county
- [ ] Record counts match between `septic_tanks` and `septic_sources`

## What This Fixes

✅ **"Unknown" classifications**: The coverage check will now work correctly
✅ **Florida lookups**: Geometries are now in the correct coordinate system
✅ **Property reports**: Will show accurate septic/sewer classifications

## Next Steps

After running these SQL fixes:
1. Test a property report lookup
2. Deploy the frontend changes (I'll handle this next)
3. Integrate real add-on APIs (I'll handle this next)
