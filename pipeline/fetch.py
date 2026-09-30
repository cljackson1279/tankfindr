#!/usr/bin/env python3
"""Step 1 of the TankFindr data pipeline: FETCH.

Pulls every record from the public sources in sources.json into local staging
files (pipeline/data/raw/<source>/<layer>.ndjson). Never touches the database.

  python3 pipeline/fetch.py                  # all sources
  python3 pipeline/fetch.py tx_hgac_ossf     # one source

- ArcGIS services are paged by OBJECTID (works on every server version) and
  reprojected to WGS84 (outSR=4326) by the server.
- Fields listed in a source's "drop_fields" (e.g. owner names) are removed at
  fetch time so personal data never lands on disk.
- Standard library only; safe to re-run (each run overwrites its raw files).
"""
import json, os, sys, time, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "data", "raw")
PAGE = 2000
UA = {"User-Agent": "TankFindr-data-pipeline/1.0 (+https://tankfindr.com)"}


def get_json(url, params=None, retries=4):
    if params:
        url = f"{url}?{urllib.parse.urlencode(params)}"
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
                data = json.loads(r.read())
            if isinstance(data, dict) and "error" in data:
                raise RuntimeError(data["error"])
            return data
        except Exception as e:  # network blip, 5xx, server-side error
            if attempt == retries - 1:
                raise
            wait = 2 ** attempt * 3
            print(f"    retry in {wait}s ({str(e)[:80]})", flush=True)
            time.sleep(wait)


def arcgis_layers(src):
    if src["layers"] != "all":
        return src["layers"]
    meta = get_json(src["url"], {"f": "json"})
    return [l["id"] for l in meta.get("layers", []) if not l.get("subLayerIds")]


def fetch_arcgis_layer(src, layer_id, out_path):
    base = f"{src['url']}/{layer_id}"
    meta = get_json(base, {"f": "json"})
    oid = next((f["name"] for f in meta.get("fields", []) if f["type"] == "esriFieldTypeOID"), "OBJECTID")
    drop = set(src.get("drop_fields", []))
    n, last = 0, -1
    with open(out_path, "w") as out:
        while True:
            page = get_json(f"{base}/query", {
                "where": f"{oid} > {last}", "orderByFields": f"{oid} ASC",
                "outFields": "*", "returnGeometry": "true", "outSR": 4326,
                "resultRecordCount": PAGE, "f": "json",
            })
            feats = page.get("features", [])
            if not feats:
                break
            for f in feats:
                attrs = {k: v for k, v in f.get("attributes", {}).items() if k not in drop}
                g = f.get("geometry") or {}
                rec = {"_source": src["id"], "_layer": layer_id, "_layer_name": meta.get("name"),
                       "_lon": g.get("x"), "_lat": g.get("y"), **attrs}
                out.write(json.dumps(rec, default=str) + "\n")
                last = max(last, attrs.get(oid, last))
            n += len(feats)
            if len(feats) < PAGE and not page.get("exceededTransferLimit"):
                break
    return meta.get("name"), n


def main(only=None):
    sources = json.load(open(os.path.join(HERE, "sources.json")))
    summary = {}
    for sid, src in sources.items():
        if only and sid not in only:
            continue
        src["id"] = sid
        os.makedirs(os.path.join(RAW, sid), exist_ok=True)
        print(f"== {sid}: {src['name']}", flush=True)
        total = 0
        for lid in arcgis_layers(src):
            path = os.path.join(RAW, sid, f"layer_{lid}.ndjson")
            name, n = fetch_arcgis_layer(src, lid, path)
            print(f"   layer {lid:>3} {name[:40]:<40} {n:>8,}", flush=True)
            total += n
        summary[sid] = {"records": total, "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
        print(f"   total {total:,}\n", flush=True)
    with open(os.path.join(RAW, "_fetch_summary.json"), "w") as f:
        json.dump(summary, f, indent=2)


if __name__ == "__main__":
    main(set(sys.argv[1:]) or None)
