import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coverage Areas - 13 States, 2.2M+ Septic Records',
  description: 'TankFindr covers 13 states with 2.2M+ verified septic records. Verified permits and estimated inventory data clearly labeled.',
  keywords: ['septic tank database', 'septic records by state', 'septic tank coverage', 'septic system records', 'septic permit records'],
  openGraph: {
    title: 'Coverage Areas - 13 States, 2.2M+ Septic Records',
    description: 'Comprehensive septic tank data across 13 states with 2.2M+ verified and estimated records.',
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
