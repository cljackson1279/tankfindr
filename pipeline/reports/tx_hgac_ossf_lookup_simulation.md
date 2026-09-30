# Lookup simulation: tx_hgac_ossf

Customer lookups simulated: 200 (address-confirmed records, geocoded with the US Census geocoder).

| Check | Result |
|---|---|
| Old search (200 m, 10 nearest) even contains the right record | 162/200 (81%) |
| Old behaviour (nearest record) picks the right property | 74/200 (37%) |
| New behaviour (address search + street check) picks the right property | 198/200 (99%) |
| Distance, geocoded address to record: median / 90th pct | 88 m / 251 m |

## Resulting classification (new behaviour)
- septic / high: 199
- likely_septic / low: 1

Geocoder could not match: 26 addresses (skipped).
