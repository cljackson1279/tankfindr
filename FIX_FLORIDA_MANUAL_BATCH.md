# Fix Florida Geometries - Manual Batch Method

**This is the SIMPLEST method that works within Supabase SQL Editor limitations.**

Since the Supabase SQL Editor has a 10-second timeout, we'll run the same query multiple times manually. Each run processes 500 records and takes ~5-8 seconds.

---

## How It Works

You'll run the same UPDATE query repeatedly in the Supabase SQL Editor. Each time you run it:
- It processes 500 records
- Takes 5-8 seconds
- Automatically skips records that are already fixed

You need to run it approximately **3,787 times** to fix all 1,893,334 invalid Florida records.

---

## Step-by-Step Instructions

### 1. Open Supabase SQL Editor

Go to: https://supabase.com/dashboard → Your Project → SQL Editor

### 2. Run This Query Repeatedly

Copy and paste this SQL and click **Run**:

```sql
-- Fix 500 Florida records at a time
UPDATE septic_tanks
SET geom_fixed = ST_Transform(ST_SetSRID(geom, 2236), 4326)
WHERE state = 'FL'
  AND geom_fixed IS NULL
  AND NOT (ST_X(geom) BETWEEN -180 AND 180)
  AND id IN (
    SELECT id FROM septic_tanks
    WHERE state = 'FL'
      AND geom_fixed IS NULL
      AND NOT (ST_X(geom) BETWEEN -180 AND 180)
    LIMIT 500
  );
```

**After each run**, you'll see something like:
```
UPDATE 500
```

### 3. Check Progress

Run this query to see how many are left:

```sql
SELECT
  COUNT(*) as total_florida,
  SUM(CASE WHEN geom_fixed IS NOT NULL THEN 1 ELSE 0 END) as fixed,
  SUM(CASE WHEN geom_fixed IS NULL AND NOT (ST_X(geom) BETWEEN -180 AND 180) THEN 1 ELSE 0 END) as remaining
FROM septic_tanks 
WHERE state = 'FL';
```

**Expected output:**
```
total_florida: 2,081,191
fixed: 500 (increases each time)
remaining: 1,893,334 (decreases each time)
```

### 4. Repeat Until Done

Keep running the UPDATE query from Step 2 until it returns:
```
UPDATE 0
```

This means all records are fixed!

---

## Tips for Faster Processing

### Option A: Use Keyboard Shortcuts
1. Keep the UPDATE query in your SQL Editor
2. Press **Ctrl+Enter** (or **Cmd+Enter** on Mac) to run it
3. Wait 5-8 seconds
4. Press **Ctrl+Enter** again
5. Repeat ~3,787 times

### Option B: Open Multiple Browser Tabs
1. Open 3-5 tabs of the Supabase SQL Editor
2. Paste the UPDATE query in each tab
3. Run them simultaneously (stagger by a few seconds)
4. This can process 1,500-2,500 records every 10 seconds

**WARNING**: Don't open too many tabs (max 5) or you might hit rate limits.

### Option C: Use Browser Console Automation

Open your browser's Developer Console (F12) and paste this JavaScript:

```javascript
// WARNING: Only use this if you're comfortable with browser automation
// This will run the query 100 times with a 10-second delay between each

let count = 0;
const maxRuns = 100; // Run 100 times, then check progress manually

const interval = setInterval(() => {
  if (count >= maxRuns) {
    clearInterval(interval);
    console.log('✅ Completed 100 runs. Check progress and run again if needed.');
    return;
  }
  
  // Click the "Run" button
  const runButton = document.querySelector('[data-testid="run-sql-button"]') || 
                    document.querySelector('button:contains("Run")');
  if (runButton) {
    runButton.click();
    count++;
    console.log(`Run ${count}/${maxRuns} - Processed ${count * 500} records so far`);
  } else {
    console.error('Could not find Run button');
    clearInterval(interval);
  }
}, 10000); // 10 seconds between runs
```

**This will process 50,000 records (100 batches × 500 records) in ~17 minutes.**

After it completes, check the progress and run it again if needed.

---

## Time Estimates

| Method | Records per Minute | Total Time |
|--------|-------------------|------------|
| Manual (single tab) | ~3,750 | ~8.4 hours |
| Manual (5 tabs) | ~15,000 | ~2.1 hours |
| Browser automation | ~3,000 | ~10.5 hours (can run unattended) |

---

## Progress Tracking

Create a simple spreadsheet to track your progress:

| Run # | Fixed | Remaining | Time |
|-------|-------|-----------|------|
| 1 | 500 | 1,892,834 | 10:00 AM |
| 10 | 5,000 | 1,888,334 | 10:15 AM |
| 100 | 50,000 | 1,843,334 | 11:30 AM |
| ... | ... | ... | ... |

---

## When You're Done

After the UPDATE query returns `UPDATE 0`, proceed to:

1. **Step 6** in `FIX_FLORIDA_GEOMETRIES.md` (Swap columns)
2. **Step 7** (Update indexes)
3. **Step 8** (Test lookups)

---

## Troubleshooting

### "UPDATE 0" but progress shows remaining > 0

This means some records don't match the criteria. Check if they're already in WGS84:

```sql
SELECT COUNT(*) FROM septic_tanks 
WHERE state = 'FL' 
  AND geom_fixed IS NULL
  AND ST_X(geom) BETWEEN -180 AND 180;
```

If this returns a number, those records are already in WGS84 and can be copied directly:

```sql
UPDATE septic_tanks
SET geom_fixed = geom
WHERE state = 'FL'
  AND geom_fixed IS NULL
  AND ST_X(geom) BETWEEN -180 AND 180;
```

### Query is taking longer than 10 seconds

Reduce the batch size from 500 to 250:

```sql
-- Use LIMIT 250 instead of LIMIT 500
UPDATE septic_tanks
SET geom_fixed = ST_Transform(ST_SetSRID(geom, 2236), 4326)
WHERE state = 'FL'
  AND geom_fixed IS NULL
  AND NOT (ST_X(geom) BETWEEN -180 AND 180)
  AND id IN (
    SELECT id FROM septic_tanks
    WHERE state = 'FL'
      AND geom_fixed IS NULL
      AND NOT (ST_X(geom) BETWEEN -180 AND 180)
    LIMIT 250  -- Changed from 500
  );
```

---

## Alternative: Hire Someone to Do It

If you don't want to spend hours clicking "Run", you can:

1. **Hire a VA on Upwork** ($5-10) to run the query for a few hours
2. **Use Manus AI** to automate it (if browser automation is available)
3. **Contact Supabase Support** and ask them to increase your statement timeout temporarily

---

## Summary

**Simplest approach:**
1. Open Supabase SQL Editor
2. Run the UPDATE query from Step 2
3. Press Ctrl+Enter, wait 8 seconds, repeat
4. Do this ~3,787 times
5. When it returns "UPDATE 0", you're done!

**Time investment:** 2-10 hours depending on method chosen

**Result:** All Florida records will be usable, "Unknown" classifications drop from 91% to <5%
