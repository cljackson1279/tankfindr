# TankFindr Import Scripts Guide

This guide explains how to use the import scripts to populate the `septic_tanks` table in Supabase with data from various county and state GIS sources.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Available Import Scripts](#available-import-scripts)
3. [Running Individual Scripts](#running-individual-scripts)
4. [Running Batch Import](#running-batch-import)
5. [Environment Variables](#environment-variables)
6. [Troubleshooting](#troubleshooting)
7. [Adding New Data Sources](#adding-new-data-sources)

---

## Prerequisites

### Required Environment Variables

Create a `.env.local` file in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Where to find these:**
- **Supabase URL**: Supabase Dashboard → Project Settings → API → Project URL
- **Service Role Key**: Supabase Dashboard → Project Settings → API → `service_role` key (⚠️ Keep this secret!)

### Database Setup

Ensure the `septic_tanks` table exists in your Supabase database. Run this SQL if needed:

```sql
-- Run this in Supabase SQL Editor
\i supabase-septic-tanks-schema.sql
```

Or manually execute the contents of `supabase-septic-tanks-schema.sql`.

### Node.js Dependencies

Install required packages:

```bash
npm install
```

---

## Available Import Scripts

### 1. **New Mexico Statewide** (`import-new-mexico-statewide.js`)

**Data Source**: New Mexico Environment Department - Onsite Wastewater Compliance  
**Coverage**: All of New Mexico  
**Estimated Records**: 60,000+  
**Geometry**: Points

```bash
node scripts/import-new-mexico-statewide.js
```

### 2. **Fairfax County, Virginia** (`import-fairfax-county-va.js`)

**Data Source**: Fairfax County Health Department - Permitted Septic Records  
**Coverage**: Fairfax County, VA  
**Estimated Records**: 20,000+  
**Geometry**: Polygons (parcel boundaries, centroids extracted)

```bash
node scripts/import-fairfax-county-va.js
```

### 3. **Sonoma County, California** (`import-sonoma-county-ca.js`)

**Data Source**: Permit Sonoma - Septic & OWTS Permits  
**Coverage**: Sonoma County, CA  
**Estimated Records**: 5,000+  
**Geometry**: Points  
**Note**: Imports from 2 services (Standard Septic + Non-Standard OWTS)

```bash
node scripts/import-sonoma-county-ca.js
```

### 4. **Batch Import All Priority Sources** (`import-all-priority-sources.js`)

Runs all three imports sequentially with delays between each.

```bash
node scripts/import-all-priority-sources.js
```

---

## Running Individual Scripts

### Basic Usage

```bash
# Navigate to project root
cd /home/ubuntu/tankfindr

# Run a specific import
node scripts/import-new-mexico-statewide.js
```

### With Environment Variables

If you don't have a `.env.local` file, you can pass variables directly:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
node scripts/import-new-mexico-statewide.js
```

### Logging to File

Capture output to a log file:

```bash
node scripts/import-new-mexico-statewide.js 2>&1 | tee logs/nm-import-$(date +%Y%m%d-%H%M%S).log
```

---

## Running Batch Import

The batch import script runs all priority sources in sequence:

```bash
node scripts/import-all-priority-sources.js
```

**What it does:**
1. Imports New Mexico statewide data
2. Waits 5 seconds
3. Imports Fairfax County, VA data
4. Waits 5 seconds
5. Imports Sonoma County, CA data
6. Displays summary report

**Expected Duration**: 10-30 minutes depending on network speed and data volume.

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin access) | `eyJhbGc...` |

### Optional Variables

You can modify these in the script files:

| Variable | Default | Description |
|----------|---------|-------------|
| `BATCH_SIZE` | 1000 | Records per batch |
| `DELAY_MS` | 1000 | Delay between batches (ms) |

---

## Troubleshooting

### Error: "SUPABASE_SERVICE_ROLE_KEY environment variable is required"

**Solution**: Set the environment variable in `.env.local` or pass it directly:

```bash
export SUPABASE_SERVICE_ROLE_KEY="your-key-here"
```

### Error: "HTTP error! status: 500"

**Possible causes:**
- ArcGIS service is down or rate-limiting
- Invalid query parameters
- Network connectivity issues

**Solution**: 
- Wait a few minutes and retry
- Check if the service URL is still valid
- Increase `DELAY_MS` to reduce request rate

### Error: "Database error: duplicate key value violates unique constraint"

**Explanation**: This is normal! The script uses `upsert` to update existing records.

**Solution**: No action needed. The script will continue.

### Import Stops Midway

**Possible causes:**
- Network timeout
- Supabase connection limit
- Script crash

**Solution**:
- Check the log output for the last processed offset
- The script automatically resumes from the next batch
- Re-run the script (upsert prevents duplicates)

### Slow Import Speed

**Optimization tips:**
1. Increase `BATCH_SIZE` (e.g., to 2000)
2. Decrease `DELAY_MS` (but watch for rate limits)
3. Run during off-peak hours
4. Check your network connection

---

## Adding New Data Sources

### Step 1: Create a New Import Script

Copy an existing script as a template:

```bash
cp scripts/import-new-mexico-statewide.js scripts/import-your-county.js
```

### Step 2: Update Configuration

Modify the `COUNTY_CONFIG` object:

```javascript
const COUNTY_CONFIG = {
  name: 'Your County',
  state: 'XX',
  featureServiceUrl: 'https://your-arcgis-url/FeatureServer/0',
  idField: 'OBJECTID', // or PERMIT_NO, FACILITY_ID, etc.
  batchSize: 1000,
  delayMs: 1000
};
```

### Step 3: Customize Field Mappings

Update the record building logic to match your data source:

```javascript
const record = {
  source_id: String(attrs[COUNTY_CONFIG.idField]),
  county: COUNTY_CONFIG.name,
  state: COUNTY_CONFIG.state,
  parcel_id: attrs.PARCEL_ID || attrs.APN || null,
  address: attrs.ADDRESS || attrs.SITE_ADDR || null,
  geom: `POINT(${lng} ${lat})`,
  attributes: attrs,
  data_source: 'your_source_identifier'
};
```

### Step 4: Test the Script

Run with a small batch first:

```javascript
// Temporarily modify for testing
const BATCH_SIZE = 10;
```

### Step 5: Add to Batch Import

Update `import-all-priority-sources.js` to include your new script.

---

## Data Source URLs

### Current Sources

| Source | URL | Type |
|--------|-----|------|
| New Mexico | `https://mercator.env.nm.gov/server/rest/services/ehb/onsite_wastewater_compliance/FeatureServer/0` | Points |
| Fairfax County, VA | `https://www.fairfaxcounty.gov/euclid/rest/services/Health/Permitted_Septic_Records/FeatureServer/0` | Polygons |
| Sonoma County, CA (SEP) | `https://socogis.sonomacounty.ca.gov/map/rest/services/OWTSPublic/Permit_Sonoma_Septic_SEP_Permits/FeatureServer/0` | Points |
| Sonoma County, CA (OWTS) | `https://socogis.sonomacounty.ca.gov/map/rest/services/OWTSPublic/Permit_Sonoma_OWTS_Permits/FeatureServer/0` | Points |

### Verifying URLs

Test if a URL is valid:

```bash
curl "https://your-url/FeatureServer/0?f=json"
```

Should return JSON with service metadata.

---

## Database Schema

### septic_tanks Table Structure

```sql
CREATE TABLE septic_tanks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text NOT NULL,           -- Unique ID from source
  county text NOT NULL,               -- County name
  state text NOT NULL,                -- State abbreviation (2 letters)
  parcel_id text,                     -- Parcel/APN if available
  address text,                       -- Property address
  geom geometry(Point, 4326) NOT NULL, -- PostGIS point (lat/lng)
  attributes jsonb,                   -- Raw source data
  data_source text,                   -- Source identifier
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(source_id, county, state)   -- Prevents duplicates
);
```

### Querying Imported Data

```sql
-- Count by state
SELECT state, COUNT(*) as count 
FROM septic_tanks 
GROUP BY state 
ORDER BY count DESC;

-- Count by county
SELECT county, state, COUNT(*) as count 
FROM septic_tanks 
GROUP BY county, state 
ORDER BY count DESC;

-- Find tanks near a location (200m radius)
SELECT * FROM septic_tanks
WHERE ST_DWithin(
  geom,
  ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography,
  200
);
```

---

## Performance Tips

### Batch Size Optimization

| Records | Recommended Batch Size | Estimated Time |
|---------|------------------------|----------------|
| < 10,000 | 500 | 2-5 minutes |
| 10,000 - 50,000 | 1,000 | 10-20 minutes |
| 50,000 - 100,000 | 2,000 | 30-60 minutes |
| > 100,000 | 2,000-5,000 | 1-3 hours |

### Rate Limiting

Most ArcGIS services have rate limits:
- **Recommended delay**: 1000ms (1 second) between batches
- **Aggressive**: 500ms (may trigger rate limits)
- **Conservative**: 2000ms (slower but safer)

---

## Monitoring Import Progress

### Real-time Monitoring

```bash
# Watch the import in real-time
tail -f logs/import-log.txt

# Check database count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM septic_tanks;"
```

### Supabase Dashboard

1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Select `septic_tanks` table
4. View record count and recent entries

---

## Support

### Common Issues

- **Slow imports**: Check network speed, increase batch size
- **Rate limiting**: Increase delay between batches
- **Missing records**: Verify source URL is still valid
- **Duplicate errors**: Normal with upsert, no action needed

### Getting Help

- Check the logs for detailed error messages
- Verify environment variables are set correctly
- Test the source URL in a browser
- Check Supabase dashboard for database errors

---

## Next Steps

After importing data:

1. **Verify the import**: Check record counts in Supabase
2. **Test the API**: Use the `/api/locate-septic` endpoint
3. **Update the frontend**: Display coverage statistics
4. **Add more sources**: Follow the "Adding New Data Sources" guide

---

## License & Attribution

Data sources are provided by various government agencies and are subject to their respective terms of use. Always check the source's data policy before redistribution.

---

**Last Updated**: November 25, 2025  
**Maintainer**: TankFindr Development Team
