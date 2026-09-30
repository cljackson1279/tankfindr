#!/usr/bin/env python3
"""Step 3b (Texas): ADDRESS + PARCEL ENRICHMENT from the TxGIO statewide parcels.

The H-GAC permits carry a house number but no street name. For every clean
record this step asks the Texas Geographic Information Office parcel service
which appraisal-district parcel the point falls in, then checks that parcel's
situs house number against the permit's house number:

  verified         point is inside the parcel whose house number matches the permit
  relocated        point was on a neighboring lot; a parcel within ~60 m has the
                   matching house number (and ZIP when known), so the record is moved
                   to that parcel's centroid
  parcel_only      permit has no house number; the parcel address is used as-is
  parcel_unaddressed  the parcel has no situs house number (vacant/rural), so nothing to verify
  mismatch         parcel found but its house number disagrees and no nearby parcel
                   matches; address left empty, record flagged
  no_parcel        no parcel at the point (county not published, road, water)

Policy: mismatch and no_parcel records (and unaddressed parcels whose point did not
come from permit GPS/imagery) are moved to data/held/ and never loaded, because they
could attach a septic result to the wrong house.

Results are cached in data/cache/txgio_parcels.ndjson so re-runs are free and the
job can be resumed. Rewrites data/clean/tx_hgac_ossf.ndjson in place and writes
data/reports/tx_hgac_ossf_address.md.

  python3 pipeline/enrich_tx_parcels.py [--limit N] [--workers 6]
"""
import concurrent.futures as cf, collections, json, os, re, sys, threading, time, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
SID = "tx_hgac_ossf"
IDENTIFY = "https://feature.geographic.texas.gov/arcgis/rest/services/Parcels/stratmap_land_parcels_48_most_recent/MapServer/identify"
UA = {"User-Agent": "TankFindr-data-pipeline/1.0 (+https://tankfindr.com)"}
KEEP = ("PROP_ID", "SITUS_ADDR", "SITUS_NUM", "SITUS_ST_1", "SITUS_CITY", "SITUS_ZIP", "COUNTY", "YEAR_BUILT", "STAT_LAND_USE")
lock = threading.Lock()


def identify(lon, lat, tolerance_px=0, geometry=False, half=0.002):
    # map extent ±half degrees rendered at 400 px: half=0.002 -> ~1.1 m/px, half=0.004 -> ~2.2 m/px
    q = urllib.parse.urlencode({
        "geometry": f"{lon},{lat}", "geometryType": "esriGeometryPoint", "sr": 4326, "layers": "all:0",
        "tolerance": tolerance_px, "mapExtent": f"{lon-half},{lat-half},{lon+half},{lat+half}",
        "imageDisplay": "400,400,96", "returnGeometry": str(geometry).lower(),
        **({"maxAllowableOffset": 0.0001} if geometry else {}),  # ~10 m simplification: plenty for a centroid, far smaller payload
        "f": "json"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(f"{IDENTIFY}?{q}", headers=UA), timeout=60) as r:
                d = json.loads(r.read())
            if "error" in d:
                raise RuntimeError(d["error"])
            out = []
            for res in d.get("results", []):
                a = {k: (None if str(res["attributes"].get(k) or "").strip() in ("", "Null") else str(res["attributes"][k]).strip()) for k in KEEP}
                if geometry and res.get("geometry", {}).get("rings"):
                    ring = res["geometry"]["rings"][0]
                    a["_cx"] = sum(p[0] for p in ring) / len(ring); a["_cy"] = sum(p[1] for p in ring) / len(ring)
                out.append(a)
            return out
        except Exception:
            time.sleep(2 ** attempt)
    return None  # network failure: leave record untouched, retry on next run


def num(v):
    m = re.match(r"\s*0*(\d+)", str(v or ""))
    return m.group(1) if m else None


def decide(rec, raw):
    permit_no, permit_zip = num(raw.get("Street_Number")), (raw.get("Zip_Code") or "")[:5] or None
    if permit_no == "0":
        permit_no = None  # placeholder, not a real house number
    hits = identify(rec["longitude"], rec["latitude"])
    if hits is None:
        return None
    snapped = False
    if not hits:
        # Point may sit in the street just outside a lot line: look ~11 m around.
        hits = identify(rec["longitude"], rec["latitude"], tolerance_px=10) or []
        if permit_no:
            hits = [h for h in hits if num(h["SITUS_NUM"]) == permit_no] or hits[:0]
        if len(hits) != 1:
            return {"status": "no_parcel"}
        snapped = True
    p = hits[0]
    if snapped:
        return {"status": "verified" if permit_no else "parcel_only", "parcel": p, "how": "snapped_from_road"}
    if not permit_no:
        return {"status": "parcel_only", "parcel": p} if p["SITUS_NUM"] else {"status": "parcel_unaddressed", "parcel": p}
    if num(p["SITUS_NUM"]) == permit_no:
        return {"status": "verified", "parcel": p}
    street = (p["SITUS_ST_1"] or "").strip().upper()
    zip_ok = lambda c: not permit_zip or not c["SITUS_ZIP"] or c["SITUS_ZIP"] == permit_zip
    same_street = lambda c: street and (c["SITUS_ST_1"] or "").strip().upper() == street
    # 1) Tight search (~60 m): matching number on the same street, else in the same ZIP.
    near = identify(rec["longitude"], rec["latitude"], tolerance_px=55, geometry=True) or []
    hits_num = [c for c in near if num(c["SITUS_NUM"]) == permit_no and "_cx" in c]
    same = [c for c in hits_num if same_street(c)]
    if len(same) == 1:
        return {"status": "relocated", "parcel": same[0], "how": "same_street"}
    cands = [c for c in hits_num if zip_ok(c)]
    if len(cands) == 1:
        return {"status": "relocated", "parcel": cands[0], "how": "nearby_zip"}
    # 2) Geocoder put the point on the right street but several lots off: same street + number within ~250 m.
    if street:
        wide = identify(rec["longitude"], rec["latitude"], tolerance_px=115, geometry=True, half=0.004) or []
        same = [c for c in wide if num(c["SITUS_NUM"]) == permit_no and same_street(c) and "_cx" in c]
        if len(same) == 1:
            return {"status": "relocated", "parcel": same[0], "how": "same_street"}
    if not p["SITUS_NUM"]:
        return {"status": "parcel_unaddressed", "parcel": p}
    return {"status": "mismatch", "parcel": p}


def main():
    limit = int(sys.argv[sys.argv.index("--limit") + 1]) if "--limit" in sys.argv else None
    workers = int(sys.argv[sys.argv.index("--workers") + 1]) if "--workers" in sys.argv else 6
    clean_path = os.path.join(DATA, "clean", f"{SID}.ndjson")
    recs = [json.loads(l) for l in open(clean_path)]
    raw = {}
    for fn in os.listdir(os.path.join(DATA, "raw", SID)):
        for l in open(os.path.join(DATA, "raw", SID, fn)):
            r = json.loads(l); raw[f"{r['_layer']}:{r['OBJECTID']}"] = r
    cache_path = os.path.join(DATA, "cache", "txgio_parcels.ndjson")
    os.makedirs(os.path.dirname(cache_path), exist_ok=True)
    cache = {}
    if os.path.exists(cache_path):
        for l in open(cache_path):
            c = json.loads(l); cache[c["id"]] = c["result"]
    todo = [r for r in recs if r["source_record_id"] not in cache]
    if limit:  # random sample across all counties
        import random
        random.Random(42).shuffle(todo); todo = todo[:limit]
    print(f"{len(recs):,} clean records, {len(cache):,} cached, {len(todo):,} to look up", flush=True)
    done = 0
    with open(cache_path, "a") as cf_out, cf.ThreadPoolExecutor(workers) as pool:
        futs = {pool.submit(decide, r, raw.get(r["source_record_id"], {})): r for r in todo}
        for f in cf.as_completed(futs):
            r, res = futs[f], f.result()
            if res is None:
                continue
            with lock:
                cache[r["source_record_id"]] = res
                cf_out.write(json.dumps({"id": r["source_record_id"], "result": res}) + "\n")
                done += 1
                if done % 2000 == 0:
                    print(f"  {done:,}/{len(todo):,}", flush=True)

    stats, by_county = collections.Counter(), collections.defaultdict(collections.Counter)
    out = []
    for r in recs:
        res = cache.get(r["source_record_id"])
        if limit and res is None:
            continue  # sample mode: report only on looked-up records
        status = res["status"] if res else "not_looked_up"
        stats[status] += 1; by_county[r["county"]][status] += 1
        p = (res or {}).get("parcel")
        r["address_match"] = status
        if p and status in ("verified", "relocated", "parcel_only"):
            r["address"] = p["SITUS_ADDR"]
            r["parcel_id"] = p["PROP_ID"]
            r["city"] = (p["SITUS_CITY"] or r.get("city") or "").title() or None
            r["zip"] = p["SITUS_ZIP"] or r.get("zip")
            r["year_built"] = p["YEAR_BUILT"]
            if "no_address" in r["validation_flags"]:
                r["validation_flags"].remove("no_address")
        if status == "relocated":
            r["latitude"], r["longitude"] = round(p["_cy"], 7), round(p["_cx"], 7)
            r["location_method"], r["location_confidence"] = "parcel_centroid", "medium"
            r["validation_flags"].append("relocated_to_matching_parcel")
        if status == "mismatch":
            r["validation_flags"].append("address_mismatch")
        out.append(r)

    HOLD = {"mismatch", "no_parcel"}
    def held(r):
        if r["address_match"] in HOLD:
            return True
        return r["address_match"] == "parcel_unaddressed" and r["location_method"] not in ("gps_permit", "imagery_interpolation")
    live = [r for r in out if not held(r)]
    hold = [r for r in out if held(r)]
    stats["_live"], stats["_held"] = len(live), len(hold)
    if not limit:
        os.makedirs(os.path.join(DATA, "held"), exist_ok=True)
        with open(clean_path, "w") as f:
            for r in live:
                f.write(json.dumps(r) + "\n")
        with open(os.path.join(DATA, "held", f"{SID}.ndjson"), "w") as f:
            for r in hold:
                f.write(json.dumps(r) + "\n")
    live_n, held_n = stats.pop("_live"), stats.pop("_held")
    n = max(sum(stats.values()), 1)
    good = stats["verified"] + stats["relocated"]
    lines = [f"# Texas address enrichment {'(sample)' if limit else ''}", "",
             f"Records checked: {n:,}. Address confirmed by house-number match: **{good:,} ({100*good/n:.1f}%)**.", "",
             f"Going live: **{live_n:,}**. Held for review (possible wrong-property match): **{held_n:,}** in data/held/.", "",
             "| Outcome | Records | Share |", "|---|---|---|",
             *[f"| {k} | {v:,} | {100*v/n:.1f}% |" for k, v in stats.most_common()], "",
             "## By county", "| County | verified | relocated | parcel_only | unaddressed | mismatch | no_parcel |", "|---|---|---|---|---|---|---|",
             *[f"| {c} | {s['verified']:,} | {s['relocated']:,} | {s['parcel_only']:,} | {s['parcel_unaddressed']:,} | {s['mismatch']:,} | {s['no_parcel']:,} |"
               for c, s in sorted(by_county.items(), key=lambda kv: -sum(kv[1].values()))]]
    os.makedirs(os.path.join(DATA, "reports"), exist_ok=True)
    open(os.path.join(DATA, "reports", f"{SID}_address{'_sample' if limit else ''}.md"), "w").write("\n".join(lines) + "\n")
    print("\n".join(lines[:12]))


if __name__ == "__main__":
    main()
