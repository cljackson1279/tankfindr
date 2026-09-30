# Dry run: Delaware DNREC Septic Permits

Generated 2026-09-30T01:37:06Z. Nothing was written to the database.

| Input | Clean | Rejected |
|---|---|---|
| 88,171 | 63,371 | 24,800 |

## Rejected, by reason
- superseded_by_newer_permit: 17,431
- excluded_record_type: 4,703
- duplicate_permit: 2,657
- outside_state: 9

## Flags
- no_address: 68,294
- coords_recovered_from_fallback: 597
- attr_coord_mismatch: 31
- county_reassigned: 19
- near_boundary: 16
- bad_date: 4
- permit_number_reused: 2

## Clean records by county
- Sussex County: 37,444
- Kent County: 17,550
- New Castle County: 8,377

## Location confidence (clean)
- medium: 47,437
- high: 15,934

## Field completeness (clean)
- address: 22.6%
- permit_date: 95.9%
- system_type: 100.0%
- tank_capacity_gal: 16.7%
- parcel_id: 100.0%
- zip: 99.1%
