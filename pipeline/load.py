#!/usr/bin/env python3
"""Step 4 of the pipeline: LOAD validated records into the private staging table.

Dry run by default: prints what would be loaded. Writing requires --confirm and
the service-role key in the environment (never commit it):

  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... python3 pipeline/load.py tx_hgac_ossf --confirm

Upserts on (source, source_record_id), so re-running is safe. This only fills
septic_records_staging; the live site is untouched until you run
sql/002_promote_to_septic_tanks.sql.
"""
import json, os, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
BATCH = 1000
COLUMNS = ["source", "source_record_id", "state", "county", "county_fips", "record_type", "permit_number",
           "permit_date", "permit_status", "system_type", "tank_capacity_gal", "address", "city", "zip",
           "parcel_id", "latitude", "longitude", "location_method", "location_confidence", "data_quality",
           "source_url", "validation_flags", "validated_at"]


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    confirm = "--confirm" in sys.argv
    if not args:
        sys.exit(__doc__)
    sid = args[0]
    path = os.path.join(HERE, "data", "clean", f"{sid}.ndjson")
    rows = [{k: r.get(k) for k in COLUMNS} for r in map(json.loads, open(path))]
    report = json.load(open(os.path.join(HERE, "data", "reports", f"{sid}.json")))
    print(f"{sid}: {len(rows):,} validated records (report says {report['clean']:,} clean, "
          f"{report['rejected']:,} rejected, generated {report['generated_at']})")
    if not confirm:
        print("Dry run only. Re-run with --confirm to write to septic_records_staging.")
        return
    url, key = os.environ["SUPABASE_URL"].rstrip("/"), os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    headers = {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json",
               "Prefer": "resolution=merge-duplicates,return=minimal"}
    for i in range(0, len(rows), BATCH):
        req = urllib.request.Request(f"{url}/rest/v1/septic_records_staging?on_conflict=source,source_record_id",
                                     data=json.dumps(rows[i:i + BATCH]).encode(), headers=headers, method="POST")
        urllib.request.urlopen(req, timeout=120).read()
        print(f"  loaded {min(i + BATCH, len(rows)):,}/{len(rows):,}", flush=True)
    print("Done. Review, then run sql/002_promote_to_septic_tanks.sql for this source.")


if __name__ == "__main__":
    main()
