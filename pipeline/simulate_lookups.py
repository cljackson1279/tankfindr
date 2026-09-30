#!/usr/bin/env python3
"""Accuracy check: simulate customer lookups against the cleaned records.

For a random sample of address-confirmed records, geocode the property's
address the way a customer lookup would (US Census geocoder as a stand-in for
Mapbox), then reproduce the site's lookup logic against ALL clean records for
the source:

  - Is the correct record within the 200 m search radius?
  - Nearest-only (old behaviour): is the nearest record the right property?
  - With address matching (new behaviour): is the chosen record the right property?
  - Resulting classification per lib/septicLookup.ts thresholds.

  python3 pipeline/simulate_lookups.py tx_hgac_ossf [--n 150]
"""
import json, math, os, random, sys, urllib.parse, urllib.request, collections, re

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
GEOCODER = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress"
RADIUS = 200


def geocode(addr):
    q = urllib.parse.urlencode({"address": addr, "benchmark": "Public_AR_Current", "format": "json"})
    try:
        with urllib.request.urlopen(f"{GEOCODER}?{q}", timeout=30) as r:
            m = json.loads(r.read())["result"]["addressMatches"]
        return (m[0]["coordinates"]["y"], m[0]["coordinates"]["x"]) if m else None
    except Exception:
        return None


def dist_m(a, b):
    kx = 111_320 * math.cos(math.radians(a[0]))
    return math.hypot((a[0] - b[0]) * 110_540, (a[1] - b[1]) * kx)


NOISE = set("ST STREET RD ROAD DR DRIVE LN LANE AVE AVENUE CT COURT WAY BLVD CIR CIRCLE PL TRL TRAIL PKWY HWY N S E W NE NW SE SW COUNTY CR FM TX FL DE VA CA NC USA US".split())
def house(a):
    m = re.match(r"^\s*0*(\d+)\b", a or ""); return m.group(1) if m else None
def street(a):
    s = re.sub(r"^\s*\d+\S*\s*", "", (a or "").split(",")[0]).upper()
    return {t for t in re.split(r"[^A-Z0-9]+", s) if len(t) >= 2 and t not in NOISE}
def same_property(cust, rec):
    a, b = house(cust), house(rec)
    if not a or not b: return None
    if a != b: return False
    ta, tb = street(cust), street(rec)
    return True if not ta or not tb else bool(ta & tb)


def classify(d):  # verified-permit thresholds from lib/septicLookup.ts
    return ("septic", "high") if d < 30 else ("septic", "medium") if d < 75 else ("likely_septic", "low")


def main():
    sid = sys.argv[1]
    n = int(sys.argv[sys.argv.index("--n") + 1]) if "--n" in sys.argv else 150
    recs = [json.loads(l) for l in open(os.path.join(DATA, "clean", f"{sid}.ndjson"))]
    confirmed = [r for r in recs if r.get("address_match") in ("verified", "relocated") and r.get("address")]
    random.Random(11).shuffle(confirmed)
    grid = collections.defaultdict(list)  # ~1 km cells for fast neighbor search
    for r in recs:
        grid[(int(r["latitude"] * 100), int(r["longitude"] * 100))].append(r)

    out = collections.Counter(); classes = collections.Counter(); dists = []
    tested = 0
    for target in confirmed:
        if tested >= n:
            break
        pt = geocode(target["address"])
        if not pt:
            out["geocoder_no_match"] += 1
            continue
        tested += 1
        cy, cx = int(pt[0] * 100), int(pt[1] * 100)
        wide = sorted(((dist_m(pt, (r["latitude"], r["longitude"])), r) for dy in (-2, -1, 0, 1, 2) for dx in (-2, -1, 0, 1, 2)
                       for r in grid[(cy + dy, cx + dx)]), key=lambda t: t[0])
        old = [(d, r) for d, r in wide if d <= RADIUS][:10]            # find_nearest_septic_tank: 200 m, LIMIT 10
        by_addr = [(d, r) for d, r in wide if d <= 1500 and house(r.get("address")) == house(target["address"])][:25]  # migration 007
        is_target = lambda r: r["source_record_id"] == target["source_record_id"] or r.get("address") == target["address"]
        d_target = next((d for d, r in wide if r["source_record_id"] == target["source_record_id"]), None)
        if d_target is not None: dists.append(d_target)
        if old and is_target(old[0][1]): out["nearest_is_correct_old"] += 1
        if not any(is_target(r) for _, r in old): out["correct_record_outside_old_search"] += 1
        match = next(((d, r) for d, r in by_addr + old if same_property(target["address"], r.get("address")) is True), None)
        chosen = match or (old[0] if old else None)
        if chosen is None:
            out["nothing_found"] += 1; classes[("likely_sewer/unknown", "-")] += 1; continue
        out["chosen_is_correct_new"] += is_target(chosen[1])
        classes[("septic", "high") if match else classify(chosen[0])] += 1
    dists.sort()
    t = max(tested, 1)
    lines = [f"# Lookup simulation: {sid}", "",
             f"Customer lookups simulated: {tested} (address-confirmed records, geocoded with the US Census geocoder).", "",
             "| Check | Result |", "|---|---|",
             f"| Old search (200 m, 10 nearest) even contains the right record | {tested - out['correct_record_outside_old_search']}/{tested} ({100*(tested - out['correct_record_outside_old_search'])/t:.0f}%) |",
             f"| Old behaviour (nearest record) picks the right property | {out['nearest_is_correct_old']}/{tested} ({100*out['nearest_is_correct_old']/t:.0f}%) |",
             f"| New behaviour (address search + street check) picks the right property | {out['chosen_is_correct_new']}/{tested} ({100*out['chosen_is_correct_new']/t:.0f}%) |",
             f"| Distance, geocoded address to record: median / 90th pct | {dists[len(dists)//2]:.0f} m / {dists[int(len(dists)*.9)]:.0f} m |" if dists else "",
             "", "## Resulting classification (new behaviour)",
             *[f"- {a} / {b}: {v}" for (a, b), v in classes.most_common()],
             "", f"Geocoder could not match: {out['geocoder_no_match']} addresses (skipped)."]
    os.makedirs(os.path.join(DATA, "reports"), exist_ok=True)
    open(os.path.join(DATA, "reports", f"{sid}_lookup_simulation.md"), "w").write("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
