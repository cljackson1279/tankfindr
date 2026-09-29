// Single source of truth for every coverage claim on the site.
//
// Homepage, metadata, FAQ, structured data, the Coverage page and PDF copy all
// read from here, so the numbers can never drift apart again. When you import
// a new county or state, update lib/stateData.ts (featured states) or
// PARTIAL_COVERAGE below and every page picks it up.
//
// Counts audited against production `septic_tanks` on 2026-09-29.
// Featured-state counts are de-duplicated distinct locations (see stateData.ts).
// Raw row count (~2.58M) is NOT used in marketing copy because it double-counts
// overlapping imports.

import { STATES } from './stateData'

export type DataQuality = 'High' | 'Medium' | 'Mixed'

export interface CoverageRow {
  state: string
  abbr: string
  areas: string
  records: number
  quality: DataQuality
  notes: string
  /** Links to /septic-records/[slug] when a dedicated state page exists. */
  slug?: string
}

/** Quality + notes for the featured (in-depth) states, keyed by stateData slug. */
const FEATURED_DETAILS: Record<string, { quality: DataQuality; notes: string }> = {
  florida: {
    quality: 'Mixed',
    notes:
      'Statewide FDOH septic inventory (estimated locations) plus verified permit records in Miami-Dade and other counties. Every result is labeled.',
  },
  'new-mexico': { quality: 'Medium', notes: 'Statewide liquid-waste (septic) facility records.' },
  virginia: { quality: 'High', notes: 'Fairfax County permit records with GPS coordinates.' },
  vermont: { quality: 'High', notes: 'OWTS permit locations in the Chittenden County area.' },
  california: { quality: 'High', notes: 'Sonoma County permit records with GPS coordinates.' },
  maryland: { quality: 'Medium', notes: 'Garrett County septic application parcels.' },
  iowa: { quality: 'Medium', notes: 'Linn County septic system locations.' },
  'north-carolina': { quality: 'High', notes: 'Forsyth and Chatham County septic locations.' },
  ohio: { quality: 'Medium', notes: 'Allen County septic system records.' },
  indiana: { quality: 'Medium', notes: 'Hamilton County septic system locations.' },
}

/**
 * stateData entries whose "statewide" dataset turned out NOT to be residential
 * septic data (audit 2026-09-29): PA = DEP sewage-treatment-plant facilities,
 * KY = KPDES sewer infrastructure (manholes, lift stations). They still have
 * state pages for regulations content, but are not counted as septic coverage.
 */
const NON_SEPTIC_DATASETS = new Set(['pennsylvania', 'kentucky'])

/** States with in-depth septic coverage — each has a dedicated state page. */
export const FEATURED_COVERAGE: CoverageRow[] = STATES.filter((s) => !NON_SEPTIC_DATASETS.has(s.slug)).map((s) => ({
  state: s.name,
  abbr: s.abbr,
  areas: s.coveredAreas.join(', '),
  records: s.distinctLocations,
  quality: FEATURED_DETAILS[s.slug]?.quality ?? 'Medium',
  notes: FEATURED_DETAILS[s.slug]?.notes ?? s.coverageNote,
  slug: s.slug,
})).sort((a, b) => b.records - a.records)

/**
 * Smaller datasets: real records, but not deep enough to market as full
 * coverage. Shown on the Coverage page, never counted in the headline.
 * Intentionally excluded (audit 2026-09-29):
 *  - AZ, WA: 5 `sample_data` test rows each
 *  - UT, SD, MT: imports missing from the database (re-import pending)
 *  - NJ, NY, OK: wastewater discharge / treatment-plant facilities, not septic
 *  - MS: "Lincoln County" rows actually have Wyoming coordinates (mislabeled)
 */
export const PARTIAL_COVERAGE: CoverageRow[] = [
  { state: 'Massachusetts', abbr: 'MA', areas: "Dukes County (Martha's Vineyard)", records: 1194, quality: 'Medium', notes: 'County septic system records.' },
  { state: 'Rhode Island', abbr: 'RI', areas: 'Scattered statewide', records: 805, quality: 'High', notes: 'OWTS permit locations with GPS coordinates.' },
  { state: 'Oregon', abbr: 'OR', areas: 'Marion County', records: 518, quality: 'Medium', notes: 'County septic system records.' },
]

const sum = (rows: CoverageRow[]) => rows.reduce((n, r) => n + r.records, 0)

export const TOTAL_RECORDS = sum(FEATURED_COVERAGE) + sum(PARTIAL_COVERAGE)
export const FEATURED_STATE_COUNT = FEATURED_COVERAGE.length
export const TOTAL_STATE_COUNT = FEATURED_COVERAGE.length + PARTIAL_COVERAGE.length
export const COUNTY_DATASET_COUNT = new Set(
  [...FEATURED_COVERAGE, ...PARTIAL_COVERAGE].flatMap((r) => r.areas.split(', '))
).size

/** Rounded down to one decimal so the claim is always conservative, e.g. "2.3M+". */
export const TOTAL_RECORDS_DISPLAY = `${Math.floor(TOTAL_RECORDS / 100_000) / 10}M+`

/** Canonical phrasing for copy, metadata and structured data. */
export const COVERAGE_CLAIM = `${TOTAL_RECORDS_DISPLAY} septic records, ${FEATURED_STATE_COUNT} states in depth`
export const COVERAGE_CLAIM_LONG = `${TOTAL_RECORDS_DISPLAY} septic system records with in-depth coverage in ${FEATURED_STATE_COUNT} states`
