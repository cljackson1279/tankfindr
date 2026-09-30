# TankFindr data pipeline

Pulls public septic permit data, cleans it into one standard record, validates
it, and stages it for review. Nothing reaches the live site without two
explicit steps from you (load, then promote).

```
fetch.py  ->  profile.py  ->  [agent writes mappings/<source>.json]  ->  validate.py  ->  load.py  ->  sql/002 promote
  raw          summary          field mapping + cleaning rules           clean/rejected   staging      live table
```

Standard library Python only. Data files live in `pipeline/data/` (git-ignored).

## Steps

| Step | Command | Writes to |
|---|---|---|
| 1. Fetch | `python3 pipeline/fetch.py [source]` | `data/raw/<source>/` |
| 2. Profile | `python3 pipeline/profile.py [source]` | `data/profile/<source>.json` |
| 3. Map (agent) | Read the profile, write or revise `mappings/<source>.json` | repo |
| 4. Validate | `python3 pipeline/validate.py [source]` | `data/clean`, `data/rejected`, `data/reports` |
| 4b. Texas addresses | `python3 pipeline/enrich_tx_parcels.py` | rewrites `data/clean/tx_hgac_ossf.ndjson`, moves unconfirmed records to `data/held/` |
| 4c. Delaware parcels | `python3 pipeline/enrich_de_parcels.py` | rewrites `data/clean/de_dnrec_septic.ndjson`, moves off-parcel records to `data/held/` |
| 4d. Accuracy check | `python3 pipeline/simulate_lookups.py <source>` | `data/reports/<source>_lookup_simulation.md` |
| 5. Agent review | Read `data/reports/<source>.md` and a sample of `data/rejected/`, fix the mapping, re-run step 4 | repo |
| 6. Load | `python3 pipeline/load.py <source> --confirm` (needs service-role key) | `septic_records_staging` |
| 7. Promote | `sql/002_promote_to_septic_tanks.sql` with `src=<source>` | `septic_tanks` (live) |

Run `sql/001_septic_records_staging.sql` once before the first load.

## Texas addresses (enrich_tx_parcels.py)

H-GAC permits have a house number but no street name, and TankFindr lookups
start from the customer's typed address, so every Texas record is matched to
its appraisal-district parcel through the free TxGIO statewide parcel service:

- **verified**: the point is inside the parcel whose house number equals the permit's.
- **relocated**: the point was a few lots off (usually a street-geocoding error); the
  parcel with the same house number on the same street within ~250 m (or within
  ~60 m in the same ZIP) is used, and the record moves to that parcel.
- **parcel_only**: the permit has no house number; the parcel's address is used, flagged.
- **held** (not loaded): house numbers disagree with no nearby match, no parcel at the
  point, or an unaddressed parcel with a geocoded point. These could put a septic
  result on the wrong house, so they wait in `data/held/` for review.

Sample of 1,500: 70.5% confirmed by house number, 77% eligible to load, 23% held.

## Delaware parcels (enrich_de_parcels.py)

Delaware permits carry the tax parcel number but rarely a street address, so each
record's point is checked against the state parcel layer: it must fall inside the
parcel with the same number (formats differ by county; `pin_keys` normalizes them).
Sample of 300: 96% inside their own parcel. The rest are held. At lookup time the
site matches the customer's geocoded address to their parcel the same way.

## Lookup matching (lib/septicLookup.ts + supabase/migrations/007)

The site previously used the nearest record within 200 m (10 results). Simulated on
120 Texas addresses, that picked the right property 32% of the time, because Texas
lots are large and neighbors' records are often closer than the customer's own.
The lookup now searches by house number within 1.5 km and confirms the street
(Texas and any source with addresses), or by tax parcel (Delaware), before falling
back to distance: 97% right property in the same simulation.

## Where the agent fits

The agent works **per source, not per record**. It reads the ~50 KB profile
(fill rates, top values, 25 samples), writes the mapping, then reviews the
rejects and adjusts. Every decision is written into the mapping's
`_agent_notes`, so the cleaning is reproducible and reviewable in a pull
request. Plain code applies the mapping to every record, identically each run.

## Validation gates

Rejected (with reason, kept in `data/rejected/`):
- `no_coordinates`, `outside_state` (point-in-county check against US Census boundaries, 150 m border tolerance)
- `sewer_facility` (WWTP, NPDES, manhole, treatment plant... per-source ignore list)
- `excluded_record_type` (never built, abandoned, proposed, county-marked duplicate)
- `duplicate_permit` (same permit number, same county, within ~100 m; the richer record wins)
- `stacked_geocode` (more than 25 geocoded records on one exact point = geocoder fallback)
- `superseded_by_newer_permit` (when a mapping sets `one_per_parcel`)

Flagged but kept: `county_reassigned`, `near_boundary`, `coords_recovered_from_fallback`,
`attr_coord_mismatch`, `permit_number_reused`, `bad_date`, `no_address`.

## Location confidence

| location_method | confidence | meaning |
|---|---|---|
| gps_permit | high | coordinates recorded on the permit |
| imagery_interpolation | high | placed on the system from aerial imagery |
| parcel_centroid | medium | center of the property parcel |
| address_geocode | medium | address matched to a street network |
| unknown | low | source doesn't say |

## Adding a source

1. Add an entry to `sources.json` (ArcGIS MapServer/FeatureServer URL, layers, any personal-data fields to drop).
2. Fetch and profile it.
3. Have the agent write `mappings/<source>.json` (copy an existing one as a template).
4. Validate, review, repeat until the report looks right.
5. Add the state/county to `lib/coverage.ts` after promoting, so the site's numbers update.

Only residential onsite-system data belongs here. Treatment plants, discharge
permits and sewer assets are sewer infrastructure and must not be imported as septic.

## Current sources (dry run 2026-09-30)

| Source | Input | Clean | Main rejections |
|---|---|---|---|
| tx_hgac_ossf (16 TX counties) | 137,075 | 135,080 | 1,703 duplicates, 261 stacked geocodes |
| de_dnrec_septic (statewide DE) | 88,171 | 63,371 | 17,431 superseded permits, 4,703 not built/abandoned/proposed, 2,657 duplicates |
