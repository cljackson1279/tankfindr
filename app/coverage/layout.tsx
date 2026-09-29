import type { Metadata } from 'next'
import { TOTAL_RECORDS_DISPLAY, FEATURED_STATE_COUNT, COVERAGE_CLAIM_LONG } from '@/lib/coverage'

export const metadata: Metadata = {
  title: `Coverage Areas - ${TOTAL_RECORDS_DISPLAY} Septic Records, ${FEATURED_STATE_COUNT} States in Depth`,
  description: `TankFindr has ${COVERAGE_CLAIM_LONG}, led by Florida, New Mexico, Virginia, Vermont and California. Verified permits and estimated inventory are clearly labeled.`,
  keywords: ['septic tank database', 'septic records by state', 'septic tank coverage', 'septic system records', 'septic permit records'],
  openGraph: {
    title: `Coverage Areas - ${TOTAL_RECORDS_DISPLAY} Septic Records, ${FEATURED_STATE_COUNT} States in Depth`,
    description: `${COVERAGE_CLAIM_LONG}. Record counts and data quality by state and county.`,
    type: 'website',
  },
  alternates: {
    canonical: 'https://tankfindr.com/coverage',
  },
}

export default function CoverageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
