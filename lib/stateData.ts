// Source of truth for programmatic state coverage pages.
//
// Counts are DE-DUPLICATED distinct GPS locations (rounded to ~1m) pulled from
// the production database on 2026-06-12 — NOT raw row counts, which double-count
// overlapping imports. Coverage descriptions are deliberately honest: we only
// claim what the data actually supports (statewide GPS vs. specific counties).
//
// regulations / costs / sources are populated from cited .gov / EPA research.
// States without researched regulations still show real coverage stats, an
// accurate "how to find" section, and data sources — never invented rules.

export interface StateCostRange {
  label: string
  range: string
  note?: string
}

export interface StateSource {
  label: string
  url: string
}

export interface CoverageState {
  slug: string
  name: string
  abbr: string
  /** De-duplicated distinct-location count for display, e.g. "2.1M+". */
  displayLocations: string
  /** Raw exact number (for schema / internal use). */
  distinctLocations: number
  /** 'statewide' = broad GPS coverage; 'counties' = specific county datasets. */
  coverageType: 'statewide' | 'counties'
  /** Honest, specific description of what coverage actually exists. */
  coverageNote: string
  /** Named covered areas to list on the page (no inflated per-area counts). */
  coveredAreas: string[]
  /** FL only today: verified-permit subset. */
  verifiedNote?: string
  /** Researched + cited regulatory facts (optional until filled). */
  regulations?: {
    agency: string
    recordsHow: string
    inspectionAtSale: string
    keyRules: string[]
  }
  costs?: StateCostRange[]
  sources?: StateSource[]
}

// Featured states = those with meaningful, real coverage. Tiny datasets
// (WA, AZ at 5 records; and very thin single-county sets) are intentionally
// excluded from dedicated pages so we never publish a thin/embarrassing page.
export const STATES: CoverageState[] = [
  {
    slug: 'florida',
    name: 'Florida',
    abbr: 'FL',
    displayLocations: '2.1M+',
    distinctLocations: 2097858,
    coverageType: 'statewide',
    coverageNote:
      'Statewide GPS coverage from the Florida statewide septic inventory, plus detailed county-level permit records in several major counties.',
    coveredAreas: ['Statewide (GPS)', 'Orange County', 'Miami-Dade County', 'Lake County', 'Hillsborough County'],
    verifiedNote: '157,000+ verified permit records and 113,000+ high-confidence records',
    regulations: {
      agency: 'Florida DEP (lead agency since 2021); county health departments handle most permitting',
      recordsHow:
        "Florida's septic (OSTDS) program has been led by the Dept. of Environmental Protection since July 2021, but most permitting and records are still handled by your county health department. As of January 2025, DEP directly manages 16 Panhandle/North Florida counties. Request records from DEP (in those counties) or your county health department's Environmental Health office.",
      inspectionAtSale:
        'No. Florida law (F.S. 381.00651) prohibits requiring a septic evaluation at the point of sale. Inspections are common but are negotiated by the buyer, not legally mandated.',
      keyRules: [
        'A permit is required before installing or substantially repairing a system (F.A.C. 64E-6).',
        'Setbacks: at least 75 ft from private wells, and typically 75 ft from surface water.',
        'EPA recommends inspection about every 3 years and pumping every 3-5 years.',
      ],
    },
    costs: [
      { label: 'Pumping', range: '$262-$307', note: 'FL contractor survey; estimate' },
      { label: 'Inspection', range: '$250-$1,175', note: 'national range; estimate' },
      { label: 'New/replacement', range: '$7,000-$8,400', note: 'FL conventional; aerobic costs more' },
    ],
    sources: [
      { label: 'Florida DEP — Onsite Sewage Program', url: 'https://floridadep.gov/water/onsite-sewage' },
      { label: 'Florida DOH — Septic Systems', url: 'https://www.floridahealth.gov/environmental-health/onsite-sewage/index.html' },
      { label: 'Florida Statute 381.00651', url: 'https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0300-0399%2F0381%2FSections%2F0381.00651.html' },
      { label: 'US EPA — Care for Your Septic System', url: 'https://www.epa.gov/septic/how-care-your-septic-system' },
    ],
  },
  {
    slug: 'new-mexico',
    name: 'New Mexico',
    abbr: 'NM',
    displayLocations: '45,000+',
    distinctLocations: 45702,
    coverageType: 'statewide',
    coverageNote: 'Statewide coverage of registered liquid-waste (septic) system locations.',
    coveredAreas: ['Statewide'],
    regulations: {
      agency: 'New Mexico Environment Department (NMED), Onsite Wastewater / Liquid Waste Program',
      recordsHow:
        'NMED regulates septic statewide (not by county). You can search pre-2017 permits via NMED’s self-service search; for systems installed in 2017 or later, request records from your local NMED field office (can take up to ~10 business days).',
      inspectionAtSale:
        'Yes. New Mexico requires a septic system evaluation before property transfer (20.7.3.902 NMAC). A qualified evaluator files the report with NMED (a $50 filing fee applies) within 15 days.',
      keyRules: [
        'A construction permit is required before installing or modifying a system; a licensed contractor (or a qualified homeowner) must do the work.',
        'Permits for advanced/alternative systems must be formally transferred to the new owner at sale.',
        'EPA recommends inspection about every 3 years and pumping every 3-5 years.',
      ],
    },
    costs: [
      { label: 'Pumping', range: '$258-$303', note: 'NM market estimate; not a government figure' },
      { label: 'Transfer evaluation', range: '$50 + evaluator fee', note: 'NMED filing fee; evaluator fee is separate' },
      { label: 'New/replacement', range: '$6,950-$8,255', note: 'NM conventional estimate; varies by site' },
    ],
    sources: [
      { label: 'NMED — Onsite Wastewater Program', url: 'https://www.env.nm.gov/septic/' },
      { label: 'NMED — Property Transfer Evaluations', url: 'https://www.env.nm.gov/septic/property-transfer-evaluations/' },
      { label: 'NMED — Information for Homeowners', url: 'https://www.env.nm.gov/septic/information-for-homeowners/' },
      { label: 'US EPA — Care for Your Septic System', url: 'https://www.epa.gov/septic/how-care-your-septic-system' },
    ],
  },
  {
    slug: 'california',
    name: 'California',
    abbr: 'CA',
    displayLocations: '14,000+',
    distinctLocations: 14150,
    coverageType: 'counties',
    coverageNote:
      'Current California coverage is focused on Sonoma County, with detailed onsite wastewater (OWTS) location records.',
    coveredAreas: ['Sonoma County'],
    regulations: {
      agency: 'California State Water Board (statewide OWTS Policy); Permit Sonoma locally',
      recordsHow:
        'California sets statewide OWTS policy through the State Water Board and delegates permitting to local agencies. In Sonoma County, Permit Sonoma’s Well & Septic Division holds permit files — request records via their Well & Septic service form or (707) 565-2849.',
      inspectionAtSale:
        'No single statewide mandate. Sonoma County uses a "Findings Report" for real-estate transactions, and properties within 600 ft of the Russian River (or many tributaries) must have an OWTS inspection every 5 years. Confirm exact requirements with Permit Sonoma before relying on this.',
      keyRules: [
        'A Permit Sonoma construction permit is required before installing, replacing, or significantly repairing a system.',
        'Sonoma uses a risk-based tier system; advanced systems need an Operational Permit with twice-yearly monitoring.',
        'Sonoma’s soils are often poor for septic, so non-standard/advanced systems are common.',
      ],
    },
    costs: [
      { label: 'Pumping', range: '$340-$400', note: 'CA market estimate' },
      { label: 'Inspection', range: '$400-$800', note: 'CA estimate; real-estate inspections higher' },
      { label: 'New/replacement', range: '$9,000-$10,900', note: 'CA conventional est.; advanced $10k-20k+' },
    ],
    sources: [
      { label: 'CA State Water Board — OWTS Policy', url: 'https://www.waterboards.ca.gov/water_issues/programs/owts/owts_policy.html' },
      { label: 'Permit Sonoma — Well & Septic Systems', url: 'https://permitsonoma.org/divisions/engineeringandconstruction/wellandsepticsystems' },
      { label: 'Permit Sonoma — OWTS FAQ', url: 'https://permitsonoma.org/divisions/engineeringandconstruction/wellandsepticsystems/septicsystems(owts)/owtsfrequentlyaskedquestions' },
      { label: 'US EPA — Septic Systems', url: 'https://www.epa.gov/septic' },
    ],
  },
  {
    slug: 'virginia',
    name: 'Virginia',
    abbr: 'VA',
    displayLocations: '43,000+',
    distinctLocations: 43181,
    coverageType: 'counties',
    coverageNote: 'Detailed onsite sewage (septic) location records for Fairfax County, Virginia.',
    coveredAreas: ['Fairfax County'],
    regulations: {
      agency: 'Virginia Department of Health (VDH), Division of Onsite Water & Wastewater Services; Fairfax County Health Dept. locally',
      recordsHow:
        'VDH regulates onsite sewage statewide; in Fairfax County the county Health Department administers permits. Request records via VDH’s records portal (vdh.nextrequest.com) or Fairfax County’s PLUS land-use system.',
      inspectionAtSale:
        'Not a statewide mandate for conventional systems. Alternative (advanced) systems require at least annual licensed inspection, and owners must pass O&M records to buyers. Properties in Chesapeake Bay Preservation Areas must be pumped every 5 years. Confirm specifics with Fairfax County Health (703-246-2201).',
      keyRules: [
        'A VDH construction permit is required before installing or repairing a system.',
        'Alternative onsite systems require at least annual inspection by a licensed operator.',
        'Properties in Chesapeake Bay Preservation Areas must be pumped at least every 5 years.',
      ],
    },
    costs: [
      { label: 'Pumping', range: '$250-$500', note: 'national EPA estimate' },
      { label: 'Inspection', range: 'Varies', note: 'no published VA figure' },
      { label: 'New/replacement', range: '$5,000-$15,000', note: 'national EPA estimate; alternative systems cost more' },
    ],
    sources: [
      { label: 'VDH — Onsite Water & Wastewater Services', url: 'https://www.vdh.virginia.gov/environmental-health/environmental-health-services/onsite-sewage-water-services/' },
      { label: 'VA Alternative Onsite Sewage Regs (12VAC5-613)', url: 'https://law.lis.virginia.gov/admincodefull/title12/agency5/chapter613/partIII/' },
      { label: 'Fairfax County — Sewage & Water', url: 'https://www.fairfaxcounty.gov/health/sewage-and-water' },
      { label: 'US EPA — Why Maintain Your Septic System', url: 'https://www.epa.gov/septic/why-maintain-your-septic-system' },
    ],
  },
  {
    slug: 'vermont',
    name: 'Vermont',
    abbr: 'VT',
    displayLocations: '37,000+',
    distinctLocations: 37655,
    coverageType: 'counties',
    coverageNote: 'Onsite wastewater system location records concentrated in the Chittenden County area.',
    coveredAreas: ['Chittenden County area'],
    regulations: {
      agency: 'Vermont DEC — Wastewater System & Potable Water Supply Program',
      recordsHow:
        'Vermont permits septic statewide through VT DEC regional offices. Search the statewide Wastewater permit database online; older (pre-2007) records may be microfilm-only — for Chittenden County, contact the Northwest Regional Office.',
      inspectionAtSale:
        'No statewide requirement, but Vermont rules let individual towns require time-of-sale inspections — so it varies by municipality. Check with the specific town (e.g., Burlington, South Burlington, Williston).',
      keyRules: [
        'A Wastewater System & Potable Water Supply Permit is required before building, subdividing, or replacing/modifying a system (10 V.S.A. § 1973).',
        'Statewide technical standards apply (local design standards were superseded in 2007).',
        'EPA recommends inspection every 1-3 years and pumping every 3-5 years.',
      ],
    },
    costs: [
      { label: 'Pumping', range: '$250-$500', note: 'national EPA estimate' },
      { label: 'Inspection', range: 'Varies', note: 'no VT-specific figure' },
      { label: 'New/replacement', range: '$5,000-$15,000', note: 'national EPA estimate; difficult sites cost more' },
    ],
    sources: [
      { label: 'VT DEC — Wastewater & Potable Water Supply Program', url: 'https://dec.vermont.gov/drinking-water-and-groundwater-protection/wastewater-system-and-potable-water-supply-program-3' },
      { label: 'VT DEC — Wastewater (Septic) Permit Search', url: 'https://anrweb.vt.gov/DEC/WWDocs/Default.aspx' },
      { label: 'US EPA — Care for Your Septic System', url: 'https://www.epa.gov/septic/how-care-your-septic-system' },
    ],
  },
  {
    slug: 'pennsylvania',
    name: 'Pennsylvania',
    abbr: 'PA',
    displayLocations: '14,000+',
    distinctLocations: 14613,
    coverageType: 'statewide',
    coverageNote: 'Statewide septic system location coverage (location-based; street addresses are limited).',
    coveredAreas: ['Statewide'],
  },
  {
    slug: 'north-carolina',
    name: 'North Carolina',
    abbr: 'NC',
    displayLocations: '9,500+',
    distinctLocations: 9557,
    coverageType: 'counties',
    coverageNote: 'County-level septic location records for Forsyth and Chatham Counties.',
    coveredAreas: ['Forsyth County', 'Chatham County'],
  },
  {
    slug: 'maryland',
    name: 'Maryland',
    abbr: 'MD',
    displayLocations: '11,000+',
    distinctLocations: 11142,
    coverageType: 'counties',
    coverageNote: 'Septic system location records for Garrett County, Maryland.',
    coveredAreas: ['Garrett County'],
  },
  {
    slug: 'iowa',
    name: 'Iowa',
    abbr: 'IA',
    displayLocations: '11,000+',
    distinctLocations: 10969,
    coverageType: 'counties',
    coverageNote: 'Septic system location records for Linn County, Iowa (location-based).',
    coveredAreas: ['Linn County'],
  },
  {
    slug: 'indiana',
    name: 'Indiana',
    abbr: 'IN',
    displayLocations: '3,300+',
    distinctLocations: 3352,
    coverageType: 'counties',
    coverageNote: 'Septic system location records for Hamilton County, Indiana (location-based).',
    coveredAreas: ['Hamilton County'],
  },
  {
    slug: 'kentucky',
    name: 'Kentucky',
    abbr: 'KY',
    displayLocations: '6,300+',
    distinctLocations: 6315,
    coverageType: 'statewide',
    coverageNote: 'Statewide septic system location coverage (location-based).',
    coveredAreas: ['Statewide'],
  },
  {
    slug: 'ohio',
    name: 'Ohio',
    abbr: 'OH',
    displayLocations: '5,000+',
    distinctLocations: 5078,
    coverageType: 'counties',
    coverageNote: 'Septic system location records for Allen County, Ohio.',
    coveredAreas: ['Allen County'],
  },
]

export function getState(slug: string): CoverageState | undefined {
  return STATES.find((s) => s.slug === slug)
}

export const TOTAL_DISPLAY_LOCATIONS = '2.3M+'
export const TOTAL_STATES = 20
