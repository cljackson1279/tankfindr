#!/usr/bin/env python3
"""Step 3 of the pipeline: MAP + VALIDATE (deterministic — no LLM here).

Applies pipeline/mappings/<source>.json to the raw records, converts them to
the canonical TankFindr record, and runs validation gates. Outputs:

  data/clean/<source>.ndjson     records that passed (ready to load)
  data/rejected/<source>.ndjson  records that failed, each with reasons
  data/reports/<source>.md       human-readable dry-run report
  data/reports/<source>.json     same numbers, machine-readable

Nothing is written to the database. Loading is a separate, reviewed step.

  python3 pipeline/validate.py [source_id ...]

Gates (reject):  no_coordinates · outside_state · sewer_facility ·
                 duplicate_permit · stacked_geocode · excluded_record_type ·
                 superseded_by_newer_permit (when mapping sets one_per_parcel)
Flags (keep, lower confidence or annotate):  county_reassigned ·
                 attr_coord_mismatch · bad_date · no_address
"""
import collections, datetime, glob, json, os, re, sys, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
STATE_FIPS = {"TX": "48", "DE": "10", "FL": "12", "VA": "51", "CA": "06", "NC": "37", "UT": "49", "SD": "46"}
SEWER_WORDS = re.compile(r"\b(WWTP|WWTF|NPDES|TPDES|KPDES|NJPDES|SEWAGE TREATMENT|TREATMENT PLANT|LIFT STATION|MANHOLE|SANITARY SEWER|SEWER MAIN|FORCE MAIN)\b", re.I)
CONFIDENCE = {"gps_permit": "high", "imagery_interpolation": "high", "parcel_centroid": "medium", "address_geocode": "medium",
              "polygon_centroid": "low", "estimated_inventory": "low", "unknown": "low"}
PLACEHOLDER = re.compile(r"^\s*(no\s*record|none|n/?a|unknown|0+|-+|tbd|pending)\s*$", re.I)
BORDER_TOLERANCE_M = 150  # simplified boundaries can misplace points this close to a line
STACK_LIMIT = 25  # more geocoded records than this on one exact point = geocoder fallback


# ---------- reference data: county boundaries (US Census TIGERweb) ----------
def county_polygons(state):
    path = os.path.join(DATA, "ref", f"counties_{state}.json")
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        q = urllib.parse.urlencode({"where": f"STATE='{STATE_FIPS[state]}'", "outFields": "NAME,GEOID",
                                    "returnGeometry": "true", "outSR": 4326, "maxAllowableOffset": 0.0005, "f": "json"})
        url = f"https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query?{q}"
        with urllib.request.urlopen(url, timeout=180) as r:
            json.dump(json.loads(r.read()), open(path, "w"))
    feats = json.load(open(path))["features"]
    out = []
    for f in feats:
        rings = f["geometry"]["rings"]
        xs = [p[0] for ring in rings for p in ring]; ys = [p[1] for ring in rings for p in ring]
        out.append({"name": f["attributes"]["NAME"], "geoid": f["attributes"]["GEOID"],
                    "bbox": (min(xs), min(ys), max(xs), max(ys)), "rings": rings})
    return out


def in_rings(x, y, rings):
    inside = False
    for ring in rings:  # even-odd rule handles holes and multipart
        j = len(ring) - 1
        for i in range(len(ring)):
            xi, yi = ring[i]; xj, yj = ring[j]
            if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi + 1e-15) + xi:
                inside = not inside
            j = i
    return inside


def dist_to_rings_m(x, y, rings):
    """Approximate distance in meters from a point to the nearest polygon edge."""
    import math
    kx = 111_320 * math.cos(math.radians(y)); ky = 110_540
    best = float("inf")
    for ring in rings:
        for (x1, y1), (x2, y2) in zip(ring, ring[1:]):
            ax, ay, bx, by = (x1 - x) * kx, (y1 - y) * ky, (x2 - x) * kx, (y2 - y) * ky
            dx, dy = bx - ax, by - ay
            t = max(0.0, min(1.0, -(ax * dx + ay * dy) / (dx * dx + dy * dy or 1e-12)))
            best = min(best, math.hypot(ax + t * dx, ay + t * dy))
    return best


def nearest_county_within(x, y, counties, meters):
    pad = meters / 90_000  # degrees, generous
    cands = [c for c in counties if c["bbox"][0] - pad <= x <= c["bbox"][2] + pad and c["bbox"][1] - pad <= y <= c["bbox"][3] + pad]
    scored = sorted(((dist_to_rings_m(x, y, c["rings"]), c) for c in cands), key=lambda t: t[0])
    return scored[0][1] if scored and scored[0][0] <= meters else None


def locate_county(x, y, counties):
    for c in counties:
        b = c["bbox"]
        if b[0] <= x <= b[2] and b[1] <= y <= b[3] and in_rings(x, y, c["rings"]):
            return c
    return None


# ---------- mapping interpreter ----------
def clean_str(v):
    if v is None:
        return None
    s = re.sub(r"\s+", " ", str(v)).strip()
    return s or None


def resolve(spec, rec):
    """A field spec is a field name, or an object with one of:
    field / template / first_of, plus optional map / rules / date / number / upper / title."""
    if spec is None:
        return None
    if isinstance(spec, str):
        return clean_str(rec.get(spec))
    if "const" in spec:
        v = spec["const"]
    elif "template" in spec:
        parts = re.findall(r"\{(\w+)\}", spec["template"])
        if not any(clean_str(rec.get(p)) for p in parts):
            return None
        v = spec["template"]
        for p in parts:
            v = v.replace("{" + p + "}", clean_str(rec.get(p)) or "")
        v = clean_str(v)
    elif "first_of" in spec:
        v = next((clean_str(rec.get(f)) for f in spec["first_of"] if clean_str(rec.get(f))), None)
    else:
        v = rec.get(spec["field"])
        v = v if isinstance(v, (int, float)) and not isinstance(v, bool) else clean_str(v)
    if v is None:
        return spec.get("default")
    if "map" in spec:
        v = spec["map"].get(str(v), spec["map"].get("*", v))
    if "rules" in spec:
        for pattern, value in spec["rules"]:
            if re.search(pattern, str(v), re.I):
                v = value
                break
        else:
            v = spec.get("default", v)
    if spec.get("date"):
        v = parse_date(v, spec.get("formats"))
    if spec.get("number"):
        m = re.search(r"-?\d+(\.\d+)?", str(v))
        v = float(m.group()) if m else None
    if spec.get("upper") and isinstance(v, str):
        v = v.upper()
    if spec.get("title") and isinstance(v, str):
        v = v.title()
    return v


def parse_date(v, formats=None):
    if isinstance(v, (int, float)):  # ArcGIS epoch milliseconds
        try:
            return datetime.datetime.utcfromtimestamp(v / 1000).date().isoformat()
        except (OverflowError, OSError, ValueError):
            return None
    s = str(v).strip()
    for fmt in formats or ["%m/%d/%Y", "%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%m/%d/%y", "%Y"]:
        for candidate in (s, s[:19], s[:10], s.split(" ")[0]):
            try:
                return datetime.datetime.strptime(candidate, fmt).date().isoformat()
            except ValueError:
                continue
    return None


# ---------- main ----------
def run(sid):
    mapping = json.load(open(os.path.join(HERE, "mappings", f"{sid}.json")))
    state = mapping["state"]
    counties = county_polygons(state)
    by_name = {c["name"].lower().replace(" county", ""): c for c in counties}
    F = mapping["fields"]
    stats = collections.Counter()
    reasons, flags = collections.Counter(), collections.Counter()
    per_county = collections.Counter()
    staged = []

    for path in sorted(glob.glob(os.path.join(DATA, "raw", sid, "*.ndjson"))):
        for line in open(path):
            raw = json.loads(line)
            stats["input"] += 1
            rec_reasons, rec_flags = [], []
            x, y = raw.get("_lon"), raw.get("_lat")

            record_type = resolve(F.get("record_type"), raw) or "residential_septic"
            permit = resolve(F.get("permit_number"), raw)
            if permit and PLACEHOLDER.match(permit):
                permit = None
            method = resolve(F.get("location_method"), raw) or "unknown"
            out = {
                "source": sid,
                "source_record_id": f"{raw.get('_layer')}:{resolve(F.get('source_record_id'), raw)}",
                "state": state,
                "county": None, "county_fips": None,
                "record_type": record_type,
                "permit_number": permit,
                "permit_date": resolve(F.get("permit_date"), raw),
                "permit_status": resolve(F.get("permit_status"), raw),
                "system_type": resolve(F.get("system_type"), raw),
                "tank_capacity_gal": resolve(F.get("tank_capacity_gal"), raw),
                "address": resolve(F.get("address"), raw),
                "city": resolve(F.get("city"), raw),
                "zip": resolve(F.get("zip"), raw),
                "parcel_id": resolve(F.get("parcel_id"), raw),
                "latitude": round(y, 7) if isinstance(y, (int, float)) else None,
                "longitude": round(x, 7) if isinstance(x, (int, float)) else None,
                "location_method": method,
                "location_confidence": CONFIDENCE.get(method, "low"),
                "data_quality": mapping.get("data_quality", "verified_permit"),
                "source_name": mapping.get("name", sid),
                "source_url": resolve(F.get("source_url"), raw),
            }

            # --- gates ---
            if record_type in mapping.get("exclude_record_types", []):
                rec_reasons.append("excluded_record_type")
            text_blob = " ".join(str(v) for k, v in raw.items() if isinstance(v, str) and not k.startswith("_") and k not in mapping.get("ignore_text_fields", []))
            for word in mapping.get("sewer_keywords_ignore", []):
                text_blob = re.sub(re.escape(word), " ", text_blob, flags=re.I)
            if SEWER_WORDS.search(text_blob):
                rec_reasons.append("sewer_facility")
            if out["latitude"] is None or out["longitude"] is None or (out["latitude"] == 0 and out["longitude"] == 0):
                rec_reasons.append("no_coordinates")
            else:
                named = resolve(F.get("county"), raw)
                named_c = by_name.get((named or "").lower().replace(" county", "").strip())
                if named_c and in_rings(x, y, named_c["rings"]):
                    hit = named_c
                else:
                    hit = locate_county(x, y, counties)
                    if hit and named_c and hit is not named_c:
                        rec_flags.append("county_reassigned")
                if not hit:
                    hit = nearest_county_within(x, y, counties, BORDER_TOLERANCE_M)
                    if hit:
                        rec_flags.append("near_boundary")
                fb = mapping.get("fallback_coords")
                if not hit and fb:
                    # Primary point is unusable; try the source's secondary coordinate (e.g. parcel centroid).
                    try:
                        fy, fx = float(raw.get(fb[0])), float(raw.get(fb[1]))
                        hit = locate_county(fx, fy, counties) or nearest_county_within(fx, fy, counties, BORDER_TOLERANCE_M)
                    except (TypeError, ValueError):
                        hit = None
                    if hit:
                        x, y = fx, fy
                        out["latitude"], out["longitude"] = round(fy, 7), round(fx, 7)
                        out["location_method"] = fb[2] if len(fb) > 2 else "parcel_centroid"
                        out["location_confidence"] = CONFIDENCE.get(out["location_method"], "low")
                        rec_flags.append("coords_recovered_from_fallback")
                if not hit:
                    rec_reasons.append("outside_state")
                else:
                    out["county"], out["county_fips"] = hit["name"], hit["geoid"]

            # --- flags ---
            ac = mapping.get("attr_coords")
            if ac and out["latitude"] is not None and "coords_recovered_from_fallback" not in rec_flags:
                try:
                    alat, alon = float(raw.get(ac[0])), float(raw.get(ac[1]))
                    if abs(alat - out["latitude"]) > 0.001 or abs(alon - out["longitude"]) > 0.001:  # ~100 m
                        rec_flags.append("attr_coord_mismatch")
                except (TypeError, ValueError):
                    pass
            d = out["permit_date"]
            if d and not ("1950-01-01" <= d <= (datetime.date.today() + datetime.timedelta(days=366)).isoformat()):
                rec_flags.append("bad_date"); out["permit_date"] = None
            if not out["address"]:
                rec_flags.append("no_address")

            out["_reasons"], out["_flags"] = rec_reasons, rec_flags
            staged.append(out)

    # --- dataset-level gates: duplicates and stacked geocodes ---
    seen_permit = {}
    point_count = collections.Counter((r["latitude"], r["longitude"]) for r in staged if not r["_reasons"])
    richness = lambda r: sum(1 for k in ("address", "permit_date", "system_type", "tank_capacity_gal", "parcel_id") if r.get(k))
    for r in staged:
        if r["_reasons"]:
            continue
        if point_count[(r["latitude"], r["longitude"])] > STACK_LIMIT and r["location_method"] == "address_geocode":
            r["_reasons"].append("stacked_geocode")
            continue
        if r["permit_number"]:
            # Agencies reuse numbering schemes, so a permit number is only unique within a county.
            key = (r["state"], r["county"], r["permit_number"])
            prev = seen_permit.get(key)
            if prev is None:
                seen_permit[key] = r
            elif abs(prev["latitude"] - r["latitude"]) > 0.001 or abs(prev["longitude"] - r["longitude"]) > 0.001:
                r["_flags"].append("permit_number_reused")  # same number, different place (>~100 m): keep both
            elif richness(r) > richness(prev):
                prev["_reasons"].append("duplicate_permit"); seen_permit[key] = r
            else:
                r["_reasons"].append("duplicate_permit")

    # --- optional: keep only the newest permit per parcel (replacements supersede originals) ---
    if mapping.get("one_per_parcel"):
        newest = {}
        rank = lambda r: (r["permit_date"] or "", r["permit_number"] or "")
        for r in staged:
            if r["_reasons"] or not r["parcel_id"]:
                continue
            prev = newest.get(r["parcel_id"])
            if prev is None:
                newest[r["parcel_id"]] = r
            elif rank(r) > rank(prev):
                prev["_reasons"].append("superseded_by_newer_permit"); newest[r["parcel_id"]] = r
            else:
                r["_reasons"].append("superseded_by_newer_permit")

    # --- write outputs ---
    for d in ("clean", "rejected", "reports"):
        os.makedirs(os.path.join(DATA, d), exist_ok=True)
    now = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    method_mix, conf_mix, type_mix, fill = collections.Counter(), collections.Counter(), collections.Counter(), collections.Counter()
    with open(os.path.join(DATA, "clean", f"{sid}.ndjson"), "w") as good, open(os.path.join(DATA, "rejected", f"{sid}.ndjson"), "w") as bad:
        for r in staged:
            reasons.update(set(r["_reasons"])); flags.update(set(r["_flags"]))
            if r["_reasons"]:
                stats["rejected"] += 1
                bad.write(json.dumps(r) + "\n")
                continue
            stats["clean"] += 1
            per_county[r["county"]] += 1
            method_mix[r["location_method"]] += 1; conf_mix[r["location_confidence"]] += 1; type_mix[r["record_type"]] += 1
            for k in ("address", "permit_date", "system_type", "tank_capacity_gal", "parcel_id", "zip"):
                fill[k] += bool(r.get(k))
            r["validation_flags"] = r.pop("_flags"); r.pop("_reasons"); r["validated_at"] = now
            good.write(json.dumps(r) + "\n")

    n = max(stats["clean"], 1)
    report = {"source": sid, "generated_at": now, "input": stats["input"], "clean": stats["clean"],
              "rejected": stats["rejected"], "reject_reasons": dict(reasons.most_common()),
              "flags_on_clean_and_rejected": dict(flags.most_common()), "clean_by_county": dict(per_county.most_common()),
              "location_method": dict(method_mix), "location_confidence": dict(conf_mix), "record_type": dict(type_mix),
              "field_fill_pct_clean": {k: round(100 * v / n, 1) for k, v in fill.items()}}
    json.dump(report, open(os.path.join(DATA, "reports", f"{sid}.json"), "w"), indent=2)
    md = [f"# Dry run: {mapping.get('name', sid)}", "", f"Generated {now}. Nothing was written to the database.", "",
          f"| Input | Clean | Rejected |", "|---|---|---|", f"| {stats['input']:,} | {stats['clean']:,} | {stats['rejected']:,} |", "",
          "## Rejected, by reason", *[f"- {k}: {v:,}" for k, v in reasons.most_common()], "",
          "## Flags", *[f"- {k}: {v:,}" for k, v in flags.most_common()], "",
          "## Clean records by county", *[f"- {k}: {v:,}" for k, v in per_county.most_common()], "",
          "## Location confidence (clean)", *[f"- {k}: {v:,}" for k, v in conf_mix.most_common()], "",
          "## Field completeness (clean)", *[f"- {k}: {v}%" for k, v in report["field_fill_pct_clean"].items()]]
    open(os.path.join(DATA, "reports", f"{sid}.md"), "w").write("\n".join(md) + "\n")
    print(f"{sid}: {stats['input']:,} in -> {stats['clean']:,} clean, {stats['rejected']:,} rejected {dict(reasons.most_common(5))}")


if __name__ == "__main__":
    ids = sys.argv[1:] or [os.path.splitext(f)[0] for f in os.listdir(os.path.join(HERE, "mappings")) if f.endswith(".json")]
    for sid in ids:
        run(sid)
