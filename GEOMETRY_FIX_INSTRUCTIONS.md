# Florida Geometry Fix - Complete Instructions

## 🚨 THE PROBLEM

Your current SQL query updates `geom_fixed` column, but the application reads from `latitude` and `longitude` columns. This is why only Miami works (those records had lat/lng from a different source).

---

## ✅ THE SOLUTION

Use the corrected SQL query that updates ALL THREE columns:
- `geom_fixed` (the transformed geometry)
- `latitude` (extracted Y coordinate)
- `longitude` (extracted X coordinate)

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### Step 1: Stop Current Script

1. Go to your browser console where the JavaScript is running
2. Stop the interval (close the console or refresh the page)
3. The current runs have updated `geom_fixed` but NOT `latitude`/`longitude`

### Step 2: Replace SQL Query

1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. **Delete the old query**
3. **Paste this NEW query:**

```sql
UPDATE septic_tanks
SET 
  geom_fixed = ST_Transform(ST_SetSRID(geom, 2236), 4326),
  latitude = ST_Y(ST_Transform(ST_SetSRID(geom, 2236), 4326)),
  longitude = ST_X(ST_Transform(ST_SetSRID(geom, 2236), 4326))
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

### Step 3: Test Manually First

1. Click "Run" once manually
2. Check the output - should say "UPDATE 500" or similar
3. If you see errors, STOP and report them

### Step 4: Run Automation Script

1. Open browser console (F12)
2. Paste your JavaScript automation script:

```javascript
let count = 0;
const maxRuns = 100;

const interval = setInterval(() => {
  if (count >= maxRuns) {
    clearInterval(interval);
    console.log('✅ Completed 100 runs. Processed ' + (count * 500) + ' records.');
    return;
  }
  
  const buttons = document.querySelectorAll('button');
  let runButton = null;
  
  for (let btn of buttons) {
    if (btn.textContent.includes('Run') || btn.innerText.includes('Run')) {
      runButton = btn;
      break;
    }
  }
  
  if (runButton) {
    runButton.click();
    count++;
    console.log('✓ Run ' + count + '/' + maxRuns + ' completed');
  } else {
    console.error('❌ Run button not found');
    clearInterval(interval);
  }
}, 10000);

console.log('🚀 Started! Will process 50,000 records.');
```

3. Press Enter to start
4. Let it run for ~17 minutes (100 runs × 10 seconds)

### Step 5: Repeat Until Complete

**Total runs needed:** ~4,163 runs (for 2.1M records)

**Options:**
- **Option A:** Run 100 at a time, 42 times (~12 hours total)
- **Option B:** Increase `maxRuns` to 500, run 9 times (~12 hours total)
- **Option C:** Reduce interval to 5 seconds (6 hours total)

---

## 🧪 TESTING AFTER FIRST 100 RUNS

After your first 100 runs complete (50,000 records fixed):

### Test These Addresses:

1. **Miami (Should work):**
   - 1234 NW 79th Street, Miami, FL 33147

2. **Fort Lauderdale (Should work after fix):**
   - 2500 SW 22nd Avenue, Fort Lauderdale, FL 33312

3. **Orlando (Should work after ~200 runs):**
   - 10500 Clarcona Ocoee Road, Orlando, FL 32818

### How to Test:
1. Go to: https://tankfindr.com/inspector-pro/dashboard
2. Enter address
3. Click "Generate Report"
4. Should show "Septic System Confirmed" with verified data

---

## 📊 PROGRESS TRACKING

**After each batch of 100 runs:**
- Records processed: count × 500
- Total processed so far: (total runs) × 500
- Percentage complete: (total runs × 500) / 2,081,191 × 100

**Example:**
- After 100 runs: 50,000 / 2,081,191 = 2.4% complete
- After 500 runs: 250,000 / 2,081,191 = 12% complete
- After 2,000 runs: 1,000,000 / 2,081,191 = 48% complete

---

## ⚠️ IMPORTANT NOTES

1. **Don't close the browser tab** while the script is running
2. **Don't navigate away** from the SQL Editor page
3. **Don't run multiple scripts in parallel** (will cause conflicts)
4. **Check for errors** periodically in the Supabase UI
5. **The database will be slow** while this runs (queries may timeout)

---

## 🎯 EXPECTED RESULTS

**After completion:**
- ✅ All 2.1M Florida records will have correct lat/lng
- ✅ Septic tanks will be findable across entire state
- ✅ Reports will show verified data statewide
- ✅ No more "Municipal Sewer System" for known septic properties

---

## 🆘 TROUBLESHOOTING

**"UPDATE 0" in results:**
- All records with `geom_fixed IS NULL` have been processed
- Check if there are records with invalid coordinates left

**Script stops clicking:**
- Refresh page and restart script
- Progress is saved (uses `geom_fixed IS NULL` condition)

**Errors in SQL Editor:**
- Copy the error message
- Stop the script
- Report the error for help

**Database timeouts:**
- Normal during heavy updates
- Wait a few minutes and try again
- Reduce batch size to 250 if persistent

---

## 📝 SUMMARY

1. ✅ Stop current script
2. ✅ Replace SQL with corrected query
3. ✅ Test manually (1 run)
4. ✅ Run automation script
5. ✅ Repeat until all 4,163 runs complete
6. ✅ Test addresses across Florida
7. ✅ Celebrate statewide coverage! 🎉
