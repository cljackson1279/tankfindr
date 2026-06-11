import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coverage Areas - 20 States, 2.5M+ Septic Records',
  description: 'TankFindr has 2.5M+ septic records across 20 states, with the deepest coverage in Florida, New Mexico, California, Virginia, and Vermont. Verified permits and estimated inventory data clearly labeled.',
  keywords: ['septic tank database', 'septic records by state', 'septic tank coverage', 'septic system records', 'septic permit records'],
  openGraph: {
    title: 'Coverage Areas - 20 States, 2.5M+ Septic Records',
    description: 'Comprehensive septic tank data across 20 states with 2.5M+ verified and estimated records.',
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
