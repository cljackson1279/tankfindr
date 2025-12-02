/**
 * Proof Examples Configuration
 * 
 * This file contains sample properties used in the TankFindr proof pack
 * for sales/marketing to septic companies.
 * 
 * Usage:
 * - Import into /demo page to show live examples
 * - Import into ProofOnePager component for PDF generation
 * - Add more real examples as you close deals in different counties
 */

export type ProofExample = {
  id: string
  address: string
  county: string
  lat: number
  lng: number
  septicOrSewer: 'Septic' | 'Sewer' | 'LikelySeptic'
  hasPermitData: boolean
  traditionalTimeHours: number
  tankFindrTimeMinutes: number
  notes?: string
  dataSources?: string // e.g., "Miami-Dade DOH permits + parcel data"
}

/**
 * Sample Florida properties for proof deck
 * 
 * TODO: Replace these with real addresses from your database
 * - Use actual customer success stories
 * - Add specific tank locations you've verified
 * - Include diverse counties (Miami-Dade, Broward, Palm Beach, etc.)
 */
export const proofExamples: ProofExample[] = [
  {
    id: 'miami-dade-1',
    address: '12345 SW 88th Street, Miami, FL 33186',
    county: 'Miami-Dade',
    lat: 25.6866,
    lng: -80.3456,
    septicOrSewer: 'Septic',
    hasPermitData: true,
    traditionalTimeHours: 2.5,
    tankFindrTimeMinutes: 3,
    dataSources: 'Miami-Dade DOH permits + parcel data',
    notes: 'Verified permit with exact GPS coordinates from county records',
  },
  {
    id: 'broward-1',
    address: '8765 NW 44th Avenue, Coral Springs, FL 33065',
    county: 'Broward',
    lat: 26.2712,
    lng: -80.2359,
    septicOrSewer: 'LikelySeptic',
    hasPermitData: false,
    traditionalTimeHours: 3,
    tankFindrTimeMinutes: 5,
    dataSources: 'Florida DOH statewide inventory + parcel data',
    notes: 'Estimated location based on property characteristics',
  },
  {
    id: 'palm-beach-1',
    address: '5432 Lake Worth Road, Lake Worth, FL 33463',
    county: 'Palm Beach',
    lat: 26.6156,
    lng: -80.0728,
    septicOrSewer: 'Septic',
    hasPermitData: true,
    traditionalTimeHours: 2,
    tankFindrTimeMinutes: 4,
    dataSources: 'Palm Beach County permits + parcel data',
    notes: 'Active permit with installation date and system specifications',
  },
  {
    id: 'hillsborough-1',
    address: '9876 Tampa Bay Boulevard, Tampa, FL 33619',
    county: 'Hillsborough',
    lat: 27.9506,
    lng: -82.4572,
    septicOrSewer: 'Septic',
    hasPermitData: true,
    traditionalTimeHours: 2.5,
    tankFindrTimeMinutes: 3,
    dataSources: 'Hillsborough County DOH permits',
    notes: 'Recent inspection records available',
  },
  {
    id: 'orange-1',
    address: '3456 Colonial Drive, Orlando, FL 32803',
    county: 'Orange',
    lat: 28.5383,
    lng: -81.3792,
    septicOrSewer: 'LikelySeptic',
    hasPermitData: false,
    traditionalTimeHours: 3,
    tankFindrTimeMinutes: 5,
    dataSources: 'Florida DOH statewide inventory',
    notes: 'Property characteristics indicate septic system',
  },
]

/**
 * Get examples by county
 */
export function getExamplesByCounty(county: string): ProofExample[] {
  return proofExamples.filter(
    (ex) => ex.county.toLowerCase() === county.toLowerCase()
  )
}

/**
 * Get examples with verified permit data only
 */
export function getVerifiedExamples(): ProofExample[] {
  return proofExamples.filter((ex) => ex.hasPermitData)
}

/**
 * Calculate average time savings
 */
export function calculateAverageTimeSavings(): {
  avgTraditionalHours: number
  avgTankFindrMinutes: number
  avgSavingsHours: number
} {
  const avgTraditionalHours =
    proofExamples.reduce((sum, ex) => sum + ex.traditionalTimeHours, 0) /
    proofExamples.length

  const avgTankFindrMinutes =
    proofExamples.reduce((sum, ex) => sum + ex.tankFindrTimeMinutes, 0) /
    proofExamples.length

  const avgSavingsHours = avgTraditionalHours - avgTankFindrMinutes / 60

  return {
    avgTraditionalHours: Math.round(avgTraditionalHours * 10) / 10,
    avgTankFindrMinutes: Math.round(avgTankFindrMinutes * 10) / 10,
    avgSavingsHours: Math.round(avgSavingsHours * 10) / 10,
  }
}
