#!/usr/bin/env python3
"""Step 3b (Delaware): PARCEL VERIFICATION against the state parcel layer.

Delaware permits carry the tax parcel number but rarely a usable street address.
Each record's point is checked against Delaware FirstMap's statewide parcel
layer: the point must fall inside the parcel whose PIN matches the permit's tax
parcel number (formats differ by county; see pin_keys). Records that land on a
different parcel are moved to data/held/ and never loaded.

Sample of 300: 96% inside their own parcel (New Castle 100%, Sussex 96%, Kent 95%).

  python3 pipeline/enrich_de_parcels.py [--limit N] [--workers 8]
"""
import collections, concurrent.futures as cf, json, os, random, re, sys, threading, time, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
SID = "de_dnrec_septic"
PARCELS = "https://enterprise.firstmap.delaware.gov/arcgis/rest/services/PlanningCadastre/DE_StateParcels/MapServer/0/query"
UA = {"User-Agent": "TankFindr-data-pipeline/1.0 (+https://tankfindr.com)"}
lock = threading.Lock()


def pin_keys(s):
    """Comparable keys for Delaware parcel numbers across county formats:
    Sussex '2-34-12.14-0066.00' == '234-12.14-66.00' (zero padding),
    New Castle '13-018.40-012' == '1301840012' (digits run together),
    Kent 'SM-00-125.00-01-08.00.000' == '8-00-12500-01-0800-00001' (district letters vs numbers, unit suffix)."""
    s = (s or "").upper()
    groups, digits = re.findall(r"[A-Z]+|\d+", s), re.findall(r"\d+", s)
    keys = set()
    if digits:
        keys.add("A" + "".join(re.findall(r"[A-Z]+", s)) + "".join(str(int(g)) for g in digits))
        keys.add("B" + "".join(digits))
    if len(groups) >= 4:
        keys.add("C" + "".join(g for g in groups[1:-1] if g.isdigit()))
        keys.add("C" + "".join(g for g in groups[1:] if g.isdigit()))
    return keys


def same_pin(a, b):
    return bool(pin_keys(a) & pin_keys(b))


def pins_at(x, y):
    q = urllib.parse.urlencode({"geometry": f"{x},{y}", "geometryType": "esriGeometryPoint", "inSR": 4326,
                                "spatialRel": "esriSpatialRelIntersects", "outFields": "PIN,ACRES",
                                "returnGeometry": "false", "f": "json"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(f"{PARCELS}?{q}", headers=UA), timeout=60) as r:
                d = json.loads(r.read())
            if "error" in d:
                raise RuntimeError(d["error"])
            return [f["attributes"] for f in d.get("features", [])]
        except Exception:
            time.sleep(2 ** attempt)
    return None


def main():
    limit = int(sys.argv[sys.argv.index("--limit") + 1]) if "--limit" in sys.argv else None
    workers = int(sys.argv[sys.argv.index("--workers") + 1]) if "--workers" in sys.argv else 8
    clean_path = os.path.join(DATA, "clean", f"{SID}.ndjson")
    recs = [json.loads(l) for l in open(clean_path)]
    cache_path = os.path.join(DATA, "cache", "de_parcels.ndjson")
    os.makedirs(os.path.dirname(cache_path), exist_ok=True)
    cache = {}
    if os.path.exists(cache_path):
        for l in open(cache_path):
            c = json.loads(l); cache[c["id"]] = c["pins"]
    todo = [r for r in recs if r["source_record_id"] not in cache]
    if limit:
        random.Random(42).shuffle(todo); todo = todo[:limit]
    print(f"{len(recs):,} clean records, {len(cache):,} cached, {len(todo):,} to check", flush=True)
    done = 0
    with open(cache_path, "a") as out, cf.ThreadPoolExecutor(workers) as pool:
        futs = {pool.submit(pins_at, r["longitude"], r["latitude"]): r for r in todo}
        for f in cf.as_completed(futs):
            r, res = futs[f], f.result()
            if res is None:
                continue
            with lock:
                cache[r["source_record_id"]] = res
                out.write(json.dumps({"id": r["source_record_id"], "pins": res}) + "\n")
                done += 1
                if done % 5000 == 0:
                    print(f"  {done:,}/{len(todo):,}", flush=True)

    stats, by_county, live, hold = collections.Counter(), collections.defaultdict(collections.Counter), [], []
    for r in recs:
        pins = cache.get(r["source_record_id"])
        if pins is None:
            if limit:
                continue
            status = "not_checked"
        elif any(same_pin(p["PIN"], r["parcel_id"]) for p in pins):
            status = "parcel_verified"
        elif not pins:
            status = "no_parcel"
        else:
            status = "other_parcel"
        stats[status] += 1; by_county[r["county"]][status] += 1
        r["address_match"] = status
        if status == "parcel_verified":
            acres = next((p.get("ACRES") for p in pins if same_pin(p["PIN"], r["parcel_id"])), None)
            if acres:
                r["lot_acres"] = acres
            live.append(r)
        elif status == "not_checked":
            live.append(r)  # network gap: re-run to verify before loading
        else:
            r["validation_flags"].append("point_outside_own_parcel")
            hold.append(r)
    if not limit:
        os.makedirs(os.path.join(DATA, "held"), exist_ok=True)
        with open(clean_path, "w") as f:
            for r in live:
                f.write(json.dumps(r) + "\n")
        held_path = os.path.join(DATA, "held", f"{SID}.ndjson")
        prior = {}
        if os.path.exists(held_path):  # keep records held by earlier runs
            for l in open(held_path):
                x = json.loads(l); prior[x["source_record_id"]] = x
        for r in hold:
            prior[r["source_record_id"]] = r
        with open(held_path, "w") as f:
            for r in prior.values():
                f.write(json.dumps(r) + "\n")
        hold = list(prior.values())
    n = max(sum(stats.values()), 1)
    lines = [f"# Delaware parcel verification {'(sample)' if limit else ''}", "",
             f"Records checked: {n:,}. Point inside its own tax parcel: **{stats['parcel_verified']:,} ({100*stats['parcel_verified']/n:.1f}%)**.", "",
             f"Going live: **{len(live):,}**. Held for review: **{len(hold):,}** in data/held/.", "",
             "| Outcome | Records | Share |", "|---|---|---|", *[f"| {k} | {v:,} | {100*v/n:.1f}% |" for k, v in stats.most_common()], "",
             "## By county", "| County | verified | other parcel | no parcel |", "|---|---|---|---|",
             *[f"| {c} | {s['parcel_verified']:,} | {s['other_parcel']:,} | {s['no_parcel']:,} |" for c, s in by_county.items()]]
    open(os.path.join(DATA, "reports", f"{SID}_parcels{'_sample' if limit else ''}.md"), "w").write("\n".join(lines) + "\n")
    print("\n".join(lines[:8]))


if __name__ == "__main__":
    main()
