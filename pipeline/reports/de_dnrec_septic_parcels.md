# Delaware parcel verification (final)

Every cleaned record (63,371) was checked against Delaware FirstMap's statewide parcel layer: the point must fall inside the parcel whose number matches the permit's tax parcel.

- **Inside its own tax parcel: 60,943 (96.2%)**, loaded
- On a different parcel: 2,369 (3.7%), held
- No parcel at the point: 59 (0.1%), held

| County | Verified | Held | Verified % |
|---|---|---|---|
| Sussex County | 35,796 | 1,648 | 95.6% |
| Kent County | 16,989 | 561 | 96.8% |
| New Castle County | 8,158 | 219 | 97.4% |

## Records going live
- 60,943 records
- Location confidence: high 15,329, medium 45,614
- Fields: permit number 100%, permit date 95.9%, system type 100.0%, tank capacity 16.8%, parcel ID 100%, partial street address 22.7%
