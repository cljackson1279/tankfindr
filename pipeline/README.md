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
| 5. Agent review | Read `data/reports/<source>.md` and a sample of `data/rejected/`, fix the mapping, re-run step 4 | repo |
| 6. Load | `python3 pipeline/load.py <source> --confirm` (needs service-role key) | `septic_records_staging` |
| 7. Promote | `sql/002_promote_to_septic_tanks.sql` with `src=<source>` | `septic_tanks` (live) |

Run `sql/001_septic_records_staging.sql` once before the first load.

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
