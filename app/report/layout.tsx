import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Property Septic Report - $19 Detailed Tank Location Report | TankFindr',
  description: 'Get a detailed septic system report for any property for just $19. Includes GPS coordinates, tank location map, permit history, and system details. Instant download.',
  keywords: ['property septic report', 'septic tank report', 'septic system inspection report', 'tank location report', 'septic permit lookup'],
  openGraph: {
    title: 'Property Septic Report - $19 | TankFindr',
    description: 'Detailed septic reports with GPS coordinates, tank maps, and permit data. $19 one-time purchase. Instant results.',
    type: 'website',
  },
}

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
