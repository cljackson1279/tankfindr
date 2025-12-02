import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coverage Areas - 13 States, 2.2M+ Septic Records | TankFindr',
  description: 'TankFindr covers 13 states including Florida (2.1M records), California, Virginia, New Mexico, Vermont, and more. Verified permits and estimated inventory data clearly labeled.',
  keywords: ['septic tank database', 'septic records by state', 'Florida septic tanks', 'California septic systems', 'Virginia septic permits'],
  openGraph: {
    title: 'TankFindr Coverage - 13 States, 2.2M+ Records',
    description: 'Comprehensive septic tank data across Florida, California, Virginia, New Mexico, and 9 more states. Verified and estimated records.',
    type: 'website',
  },
}

export default function CoverageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
