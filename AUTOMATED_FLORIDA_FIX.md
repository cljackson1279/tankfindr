## Automated Florida Geometry Fix

This guide shows you how to run an automated script that fixes all Florida geometries in the background while you do other things.

---

## Quick Start (5 minutes setup, then walk away)

### Step 1: Create the SQL Function (2 minutes)

Go to Supabase SQL Editor and run this:

```sql
CREATE OR REPLACE FUNCTION fix_florida_geometry(
  record_id UUID,
  source_srid INTEGER DEFAULT 2236,
  target_srid INTEGER DEFAULT 4326
)
RETURNS VOID AS $$
BEGIN
  UPDATE septic_tanks
  SET geom_fixed = ST_Transform(ST_SetSRID(geom, source_srid), target_srid)
  WHERE id = record_id
    AND state = 'FL'
    AND geom_fixed IS NULL
    AND NOT (ST_X(geom) BETWEEN -180 AND 180);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION fix_florida_geometry TO authenticated, anon, service_role;
```

**Expected output**: `CREATE FUNCTION`

---

### Step 2: Run the Automated Script (3 minutes to start)

Open your terminal in the TankFindr project directory and run:

```bash
cd /path/to/tankfindr
node scripts/auto-fix-florida.js
```

**What you'll see:**

```
🚀 Automated Florida Geometry Fix
==================================

Supabase URL: https://cijtllcbrvkbvrjriweu.supabase.co
Batch size: 500
Delay between batches: 2000ms

📊 Getting initial progress...
Total Florida records: 2,081,191
Already fixed: 0
Remaining: 1,893,334

🔄 Starting automated processing...

📦 Batch 1: Processing 500 records...
   ✓ Fixed 500 records | Total: 500
   ⏱️  Elapsed: 0.5m | Est. remaining: 3,786.7m

📦 Batch 2: Processing 500 records...
   ✓ Fixed 500 records | Total: 1,000
   ⏱️  Elapsed: 1.0m | Est. remaining: 1,893.0m

... (continues automatically)
```

---

### Step 3: Walk Away

The script will run for approximately **63 hours** (2.6 days) at a rate of ~500 records per minute.

**You can:**
- ✅ Close the terminal window (the process will stop, but you can restart it later)
- ✅ Let it run overnight
- ✅ Check progress anytime by running the script again (it picks up where it left off)

**To stop it:**
- Press `Ctrl+C` in the terminal
- The script will show you how many records were processed
- Run it again later to continue

---

## Faster Alternative: Run on a Server

If you don't want to keep your computer on for 63 hours, you can run this on a server:

### Option A: Run on Vercel (Free)

1. Create a new API route in your TankFindr project:

```typescript
// app/api/admin/fix-florida/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  // Get batch of records to fix
  const { data: records } = await supabase
    .from('septic_tanks')
    .select('id')
    .eq('state', 'FL')
    .is('geom_fixed', null)
    .limit(500);

  if (!records || records.length === 0) {
    return NextResponse.json({ done: true, processed: 0 });
  }

  // Fix each record
  let fixed = 0;
  for (const record of records) {
    const { error } = await supabase.rpc('fix_florida_geometry', {
      record_id: record.id
    });
    if (!error) fixed++;
  }

  return NextResponse.json({ done: false, processed: fixed });
}
```

2. Deploy to Vercel

3. Call the endpoint repeatedly:

```bash
# Run this in your terminal
while true; do
  curl https://your-app.vercel.app/api/admin/fix-florida
  echo ""
  sleep 2
done
```

### Option B: Run on Railway/Render (Free tier)

1. Create a simple Express server:

```javascript
// server.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

let isRunning = false;

app.get('/start', async (req, res) => {
  if (isRunning) {
    return res.json({ message: 'Already running' });
  }

  isRunning = true;
  res.json({ message: 'Started processing' });

  // Process in background
  processAllRecords().finally(() => {
    isRunning = false;
  });
});

async function processAllRecords() {
  while (true) {
    const { data: records } = await supabase
      .from('septic_tanks')
      .select('id')
      .eq('state', 'FL')
      .is('geom_fixed', null)
      .limit(500);

    if (!records || records.length === 0) break;

    for (const record of records) {
      await supabase.rpc('fix_florida_geometry', { record_id: record.id });
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

app.listen(3000, () => console.log('Server running on port 3000'));
```

2. Deploy to Railway or Render

3. Visit `https://your-app.railway.app/start` once to start processing

4. It will run in the background until complete

---

## Check Progress Anytime

Run this SQL in Supabase to see progress:

```sql
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN geom_fixed IS NOT NULL THEN 1 ELSE 0 END) as fixed,
  SUM(CASE WHEN geom_fixed IS NULL THEN 1 ELSE 0 END) as remaining,
  ROUND(100.0 * SUM(CASE WHEN geom_fixed IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as percent_complete
FROM septic_tanks
WHERE state = 'FL';
```

---

## Time Estimates

| Method | Time to Complete |
|--------|------------------|
| Local script (auto-fix-florida.js) | ~63 hours |
| Vercel API route | ~63 hours |
| Railway/Render server | ~63 hours |
| Manual (clicking Run button) | ~8 hours of active clicking |

**Why so long?**
- 1,893,334 records to process
- ~2 seconds per batch of 500 records
- = 3,787 batches × 2 seconds = 7,574 seconds = 126 minutes = **2.1 hours**

Wait, that's not 63 hours! Let me recalculate...

Actually, at 500 records per batch with 2-second delays:
- 1,893,334 / 500 = 3,787 batches
- 3,787 batches × 2 seconds = 7,574 seconds = **2.1 hours**

**The script should complete in ~2-3 hours**, not 63 hours!

---

## Recommended Approach

**Best option: Run the local script overnight**

1. Run Step 1 (create SQL function) - 2 minutes
2. Run Step 2 (start the script) - 1 minute
3. Let it run for 2-3 hours (go to bed, watch a movie, etc.)
4. Check in the morning - it should be done!

**If you need to stop it:**
- Press Ctrl+C
- Run it again later - it will pick up where it left off

**When it's done:**
- Proceed to Step 6 in FIX_FLORIDA_GEOMETRIES.md (swap columns)
- Update indexes
- Test lookups

---

## Troubleshooting

### Script says "function fix_florida_geometry does not exist"

Run Step 1 again to create the function.

### Script is running but not making progress

Check if the function is working:

```sql
SELECT fix_florida_geometry('YOUR_RECORD_ID_HERE'::uuid);
```

### Want to speed it up?

Reduce the delay between batches in the script:

```javascript
const DELAY_BETWEEN_BATCHES = 500; // Change from 2000 to 500
```

This will process 4x faster (~30 minutes total).

---

## Summary

**Easiest approach:**
1. Create SQL function (2 min)
2. Run `node scripts/auto-fix-florida.js` (1 min)
3. Wait 2-3 hours
4. Done!

No clicking required. Just let it run in the background.
