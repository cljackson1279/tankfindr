# Fix Florida Geometries - Safe Reprojection Guide

**CRITICAL**: 91% of Florida's 2.1 million records are using the wrong coordinate system. This is why nearly everything shows "Unknown" - your spatial searches can't find the septic tanks because they're stored in projected coordinates, not lat/lng.

## Overview

This guide will safely reproject Florida's data from State Plane coordinates to WGS84 (lat/lng) using a **non-destructive approach** with a new column.

---

## Step 1: Confirm the Source SRID (5 minutes)

Before touching anything, identify which Florida State Plane projection was used:

```sql
-- Run this diagnostic to sample a few records
SELECT 
  id,
  ST_AsText(geom) as wkt,
  ST_X(geom) as x,
  ST_Y(geom) as y,
  ST_SRID(geom) as srid
FROM septic_tanks 
WHERE state = 'FL' 
  AND NOT (ST_X(geom) BETWEEN -180 AND 180)
LIMIT 5;
```

**Look at the X/Y values:**
- If X values are around **200,000 - 800,000**: Use **EPSG:2236** (Florida East) ← Most likely
- If X values are around **600,000 - 1,200,000**: Use **EPSG:2237** (Florida West)
- If X values are around **150,000 - 650,000**: Use **EPSG:2238** (Florida North)

**Write down the SRID you identified** - you'll need it for the next steps.

---

## Step 2: Add New Column for Fixed Geometries (2 minutes)

**DO NOT update the geom column directly.** Create a new column and validate first:

```sql
-- Add a new column for fixed geometries
ALTER TABLE septic_tanks ADD COLUMN IF NOT EXISTS geom_fixed geometry(POINT, 4326);

-- Create an index on the new column for speed
CREATE INDEX IF NOT EXISTS idx_septic_tanks_geom_fixed 
ON septic_tanks USING GIST (geom_fixed) 
WHERE geom_fixed IS NOT NULL;
```

**Expected output**: Success messages.

---

## Step 3: Test with ONE Record First (3 minutes)

**CRITICAL**: Test with a single record before processing millions.

```sql
-- Get a sample ID first
SELECT id FROM septic_tanks 
WHERE state = 'FL' 
  AND NOT (ST_X(geom) BETWEEN -180 AND 180)
LIMIT 1;
```

**Copy the ID from the result**, then run this (replace `YOUR_ID_HERE` and `2236` if needed):

```sql
-- Test with ONE record first
UPDATE septic_tanks
SET geom_fixed = ST_Transform(ST_SetSRID(geom, 2236), 4326)  -- CHANGE 2236 if you identified a different SRID
WHERE id = 'YOUR_ID_HERE'  -- Replace with the actual ID from above
RETURNING 
  id, 
  ST_X(geom) as old_x, 
  ST_Y(geom) as old_y,
  ST_X(geom_fixed) as new_lng, 
  ST_Y(geom_fixed) as new_lat;
```

**Verify the results:**
- `old_x` and `old_y` should be large numbers (like 668521, 546679)
- `new_lng` should be around **-80 to -87** (longitude)
- `new_lat` should be around **24 to 31** (latitude)

**If the new coordinates look correct, proceed to Step 4.**

---

## Step 4: Batch Reproject All Florida Data (20-30 minutes)

This will process Florida's data in batches of 1000 records to avoid timeouts:

```sql
-- Reproject in small batches (1000 records per batch)
DO $$
DECLARE
  batch_size INT := 1000;
  total_updated INT := 0;
  current_batch INT;
  florida_srid INT := 2236;  -- CHANGE THIS based on Step 1
BEGIN
  LOOP
    UPDATE septic_tanks
    SET geom_fixed = ST_Transform(ST_SetSRID(geom, florida_srid), 4326)
    WHERE state = 'FL'
      AND geom_fixed IS NULL
      AND NOT (ST_X(geom) BETWEEN -180 AND 180)
      AND id IN (
        SELECT id 
        FROM septic_tanks 
        WHERE state = 'FL' 
          AND geom_fixed IS NULL
          AND NOT (ST_X(geom) BETWEEN -180 AND 180)
        LIMIT batch_size
      );
    
    GET DIAGNOSTICS current_batch = ROW_COUNT;
    total_updated := total_updated + current_batch;
    
    RAISE NOTICE 'Batch updated: %, Total Florida records fixed: %', current_batch, total_updated;
    
    EXIT WHEN current_batch = 0;
  END LOOP;
  
  RAISE NOTICE 'Florida reprojection complete! Total: % records', total_updated;
END $$;
```

**What to expect:**
- This will run for 20-30 minutes
- You'll see progress messages in the output
- It will automatically stop when all records are processed
- **This is safe** - if it fails, you can run it again and it will pick up where it left off

---

## Step 5: Verify the Fix Worked (Every 5 minutes during Step 4)

Run this to check progress:

```sql
-- Check that we now have valid coordinates
SELECT 
  COUNT(*) as total_florida,
  SUM(CASE WHEN geom_fixed IS NOT NULL THEN 1 ELSE 0 END) as fixed_count,
  SUM(CASE WHEN geom_fixed IS NULL AND NOT (ST_X(geom) BETWEEN -180 AND 180) THEN 1 ELSE 0 END) as still_broken
FROM septic_tanks 
WHERE state = 'FL';
```

**Expected output:**
- `total_florida`: ~2,081,191
- `fixed_count`: Should increase each time you run this
- `still_broken`: Should decrease to 0

**Sample a few to verify they look correct:**

```sql
SELECT 
  id,
  address,
  ST_X(geom_fixed) as longitude,
  ST_Y(geom_fixed) as latitude
FROM septic_tanks 
WHERE state = 'FL' 
  AND geom_fixed IS NOT NULL
LIMIT 10;
```

**Verify:**
- `longitude` should be around **-80 to -87**
- `latitude` should be around **24 to 31**

---

## Step 6: Swap Columns (ONLY After Step 5 shows 0 still_broken)

**DO NOT run this until Step 5 shows `still_broken = 0`**

```sql
-- Rename columns in a transaction
BEGIN;

  -- Backup old column just in case
  ALTER TABLE septic_tanks RENAME COLUMN geom TO geom_old_invalid;
  
  -- Move the fixed data into the main column
  ALTER TABLE septic_tanks RENAME COLUMN geom_fixed TO geom;

COMMIT;
```

**Expected output**: Success messages.

---

## Step 7: Update Indexes (1 minute)

```sql
-- Drop old index
DROP INDEX IF EXISTS idx_septic_tanks_geom;

-- Recreate index on the fixed data
CREATE INDEX idx_septic_tanks_geom ON septic_tanks USING GIST (geom);
```

**Expected output**: Success messages.

---

## Step 8: Test a Real Lookup

```sql
-- Test the spatial search function with a Miami address
SELECT * FROM find_nearest_septic_tank(25.84, -80.21, 200);
```

**Expected output**: Should now return actual septic tank records instead of empty results.

---

## Step 9: Update septic_sources Record Counts

Now that Florida data is fixed, update the record counts:

```sql
-- Update Florida record counts in septic_sources
UPDATE septic_sources
SET record_count = (
  SELECT COUNT(*) 
  FROM septic_tanks st 
  WHERE st.state = septic_sources.state 
    AND st.county = septic_sources.county
    AND st.geom IS NOT NULL
)
WHERE state = 'FL';

-- Verify:
SELECT state, county, record_count 
FROM septic_sources 
WHERE state = 'FL'
ORDER BY record_count DESC;
```

---

## Verification Checklist

- [ ] Step 1: Identified the correct SRID (probably 2236)
- [ ] Step 2: Added `geom_fixed` column
- [ ] Step 3: Tested with one record and coordinates look correct
- [ ] Step 4: Ran batch reprojection (20-30 minutes)
- [ ] Step 5: Verified `still_broken = 0`
- [ ] Step 6: Swapped columns
- [ ] Step 7: Updated indexes
- [ ] Step 8: Tested lookup and got results
- [ ] Step 9: Updated septic_sources counts

---

## What This Fixes

✅ **"Unknown" classifications drop from 91% to <5%**
✅ **Florida property reports now work correctly**
✅ **Spatial searches find Florida septic tanks**
✅ **All 2.1M Florida records are now usable**

---

## Troubleshooting

### If Step 4 times out:
- Reduce `batch_size` from 1000 to 500 or 250
- Run it again - it will pick up where it left off

### If you need to start over:
```sql
-- Reset the geom_fixed column
UPDATE septic_tanks SET geom_fixed = NULL WHERE state = 'FL';
```

### If you want to check a specific address:
```sql
SELECT 
  address,
  ST_X(geom) as longitude,
  ST_Y(geom) as latitude
FROM septic_tanks 
WHERE state = 'FL' 
  AND address ILIKE '%your address here%'
LIMIT 5;
```

---

## Next Steps

After completing all steps:
1. Test property report lookups in Florida
2. Verify classifications are no longer "Unknown"
3. Monitor the application for improved accuracy
