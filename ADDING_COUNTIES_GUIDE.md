# Quick Start Guide: Adding New Counties

## 🎯 Goal
Add real county septic tank data to TankFindr in 15-30 minutes per county.

---

## Step 1: Find the County Data Source

### Method A: Search ArcGIS Hub (Fastest)

1. Go to https://hub.arcgis.com/search
2. Search for: `[County Name] septic` or `[County Name] OWTS`
3. Look for **Feature Layers** or **Map Services**
4. Click on the result and find the **REST URL**

**Example:**
```
Search: "Palm Beach County septic"
Result: "Septic Tank Locations"
REST URL: https://services.arcgis.com/.../FeatureServer/0
```

### Method B: Google Search

```
site:arcgis.com "[County Name]" "septic" "FeatureServer"
site:gov "[County Name]" "septic" "GIS"
```

### Method C: County GIS Portal

1. Google: `[County Name] GIS open data`
2. Look for "Environment", "Health", or "Wastewater" datasets
3. Find download links or REST endpoints

---

## Step 2: Verify the Data Source

### For ArcGIS Feature Services:

Open the REST URL in your browser:
```
https://gis.county.gov/arcgis/rest/services/Septic/MapServer/0
```

Check for:
- ✅ **Geometry Type:** Point or Multipoint
- ✅ **Fields:** Look for address, parcel ID, coordinates
- ✅ **Query capability:** Should allow `where=1=1`

Test query:
```
https://[URL]/query?where=1=1&outFields=*&f=json&resultRecordCount=1
```

If you get JSON with features → **You're good to go!**

---

## Step 3: Create Import Script

### Option A: Copy Template

```bash
cd /home/ubuntu/tankfindr/scripts
cp import-pinal-county-az.js import-[county-name]-[state].js
```

### Option B: Create from Scratch

```javascript
#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const COUNTY_CONFIG = {
  name: 'Your County Name',
  state: 'ST',
  featureServiceUrl: 'https://gis.county.gov/.../FeatureServer/0',
  idField: 'OBJECTID' // Check the REST endpoint for the ID field name
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cijtllcbrvkbvrjriweu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function importCounty() {
  console.log(`🚀 Importing ${COUNTY_CONFIG.name}, ${COUNTY_CONFIG.state}...`);

  const queryUrl = `${COUNTY_CONFIG.featureServiceUrl}/query?where=1=1&outFields=*&f=geojson&outSR=4326`;
  
  const response = await fetch(queryUrl);
  const data = await response.json();

  console.log(`✅ Found ${data.features.length} records`);

  let imported = 0;

  for (const feature of data.features) {
    const [lng, lat] = feature.geometry.coordinates;
    const attrs = feature.properties;

    if (!lng || !lat) continue;

    const record = {
      source_id: String(attrs[COUNTY_CONFIG.idField] || attrs.OBJECTID),
      county: COUNTY_CONFIG.name,
      state: COUNTY_CONFIG.state,
      parcel_id: attrs.PARCEL_NUMBER || attrs.PARCEL_ID || attrs.APN || null,
      address: attrs.SITE_ADDRESS || attrs.ADDRESS || attrs.LOCATION || null,
      geom: `POINT(${lng} ${lat})`,
      attributes: attrs,
      data_source: 'arcgis_feature_service'
    };

    const { error } = await supabase
      .from('septic_tanks')
      .upsert(record, { onConflict: 'source_id,county,state' });

    if (!error) {
      imported++;
      if (imported % 100 === 0) console.log(`   ${imported} records...`);
    }
  }

  console.log(`✅ Imported ${imported} records`);
}

importCounty().catch(console.error);
```

---

## Step 4: Configure Field Mappings

Different counties use different field names. Update these in your script:

| Common Field | Possible Names |
|--------------|----------------|
| ID | `OBJECTID`, `FID`, `FACILITY_ID`, `PERMIT_NO`, `REQUEST_NO` |
| Parcel | `PARCEL_NUMBER`, `PARCEL_ID`, `APN`, `TAXLOT` |
| Address | `SITE_ADDRESS`, `ADDRESS`, `SITUS_ADDR`, `LOCATION` |

**How to find field names:**
1. Open the REST URL in browser
2. Scroll to "Fields" section
3. Note the field names
4. Update your script

---

## Step 5: Run the Import

```bash
cd /home/ubuntu/tankfindr

# Set environment variable
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run import
node scripts/import-[county-name]-[state].js
```

**Expected output:**
```
🚀 Importing Palm Beach County, FL...
🔍 Querying ArcGIS Feature Service...
✅ Found 1,234 septic tank records

   Imported 100 records...
   Imported 200 records...
   ...
   
✅ Import complete!
   📊 Total records: 1,234
   ✅ Imported: 1,234
   ⚠️  Skipped: 0
   ❌ Errors: 0

📍 Total Palm Beach County records in database: 1,234
```

---

## Step 6: Verify Import

### Check Database

```bash
# Using Supabase MCP
manus-mcp-cli tool call execute_sql --server supabase --input '{
  "project_id": "cijtllcbrvkbvrjriweu",
  "query": "SELECT county, state, COUNT(*) FROM septic_tanks GROUP BY county, state ORDER BY county"
}'
```

### Test on Website

1. Go to your TankFindr app
2. Enter an address in the county you just imported
3. Click "Locate Tank"
4. Should show the nearest tank with confidence score!

---

## Step 7: Update Marketing

Add the county to your coverage list:

```markdown
Currently supports:
- Union County, NJ
- Pinal County, AZ
- Palm Beach County, FL
- Kitsap County, WA
- [Your New County], [State] ✨ NEW!
```

---

## 🚀 Batch Import Multiple Counties

### Create a batch script:

```javascript
const COUNTIES = [
  { name: 'Palm Beach County', state: 'FL', url: 'https://...', idField: 'PERMIT_NO' },
  { name: 'Brevard County', state: 'FL', url: 'https://...', idField: 'OBJECTID' },
  { name: 'Martin County', state: 'FL', url: 'https://...', idField: 'OBJECTID' },
];

async function batchImport() {
  for (const county of COUNTIES) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Importing ${county.name}, ${county.state}`);
    console.log('='.repeat(60));
    
    // Run import logic here...
  }
}

batchImport();
```

---

## 🔍 Troubleshooting

### Error: "HTTP 400"
- The URL might be wrong
- Try removing `/query` from the end
- Check if it's a MapServer vs FeatureServer

### Error: "No features found"
- The dataset might be empty
- Try a different query: `where=OBJECTID>0`
- Check if authentication is required

### Error: "Invalid coordinates"
- Some records might have NULL coordinates
- The script skips these automatically
- Check the "Skipped" count in output

### Error: "Duplicate key violation"
- Records already exist in database
- The upsert will update them
- This is normal on re-runs

---

## 📊 Expected Results

| County Size | Records | Import Time |
|-------------|---------|-------------|
| Small | 100-500 | 1-2 min |
| Medium | 500-2,000 | 3-5 min |
| Large | 2,000-10,000 | 10-20 min |
| Very Large | 10,000+ | 30+ min |

---

## ✅ Checklist

- [ ] Found county data source (ArcGIS/CSV/Shapefile)
- [ ] Verified data format (Point geometry, has coordinates)
- [ ] Created import script with correct field mappings
- [ ] Set SUPABASE_SERVICE_ROLE_KEY environment variable
- [ ] Ran import script successfully
- [ ] Verified records in database
- [ ] Tested on website with real address
- [ ] Updated marketing/coverage list

---

## 🎯 Goal: 50 Counties in 72 Hours

**Day 1 (27 Tier 1 counties):**
- 15 min per county = 6.75 hours
- Focus on ArcGIS Feature Services

**Day 2 (18 Tier 2 counties):**
- 30 min per county = 9 hours
- CSV/Shapefile downloads

**Day 3 (Testing & Launch):**
- Verify all imports
- Test random addresses
- Update marketing
- Launch announcement!

You've got this! 🚀
