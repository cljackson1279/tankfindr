#!/usr/bin/env python3
"""Step 2 of the pipeline: PROFILE.

Summarizes each fetched source into pipeline/data/profile/<source>.json —
field fill rates, top values, numeric ranges and 25 sample records. This is
the compact input the cleaning agent reads to write (or revise) the source's
mapping file in pipeline/mappings/. It is small enough to paste into an LLM
prompt, so the agent never needs to read millions of raw rows.

  python3 pipeline/profile.py [source_id ...]
"""
import collections, glob, json, os, random, sys

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "data", "raw")
OUT = os.path.join(HERE, "data", "profile")


def profile(sid):
    fill, top, nums, total = collections.Counter(), collections.defaultdict(collections.Counter), {}, 0
    reservoir, rng = [], random.Random(7)
    for path in sorted(glob.glob(os.path.join(RAW, sid, "*.ndjson"))):
        for line in open(path):
            r = json.loads(line)
            total += 1
            if len(reservoir) < 25:
                reservoir.append(r)
            elif rng.random() < 25 / total:
                reservoir[rng.randrange(25)] = r
            for k, v in r.items():
                if v in (None, "", " ") or (isinstance(v, str) and not v.strip()):
                    continue
                fill[k] += 1
                if isinstance(v, (int, float)) and not isinstance(v, bool):
                    lo, hi = nums.get(k, (v, v))
                    nums[k] = (min(lo, v), max(hi, v))
                if len(top[k]) < 5000:  # cap memory on high-cardinality fields
                    top[k][str(v)[:80]] += 1
    fields = {}
    for k in sorted(set(fill) | set(top)):
        fields[k] = {
            "fill_pct": round(100 * fill[k] / max(total, 1), 1),
            "distinct_seen": len(top[k]),
            "top_values": top[k].most_common(8),
            **({"range": nums[k]} if k in nums else {}),
        }
    os.makedirs(OUT, exist_ok=True)
    out = {"source": sid, "records": total, "fields": fields, "samples": reservoir}
    json.dump(out, open(os.path.join(OUT, f"{sid}.json"), "w"), indent=1, default=str)
    print(f"{sid}: {total:,} records, {len(fields)} fields -> data/profile/{sid}.json")


if __name__ == "__main__":
    ids = sys.argv[1:] or [d for d in os.listdir(RAW) if os.path.isdir(os.path.join(RAW, d))]
    for sid in ids:
        profile(sid)
