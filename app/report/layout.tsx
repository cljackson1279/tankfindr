import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Property Septic Report - $29 Detailed Tank Location Report',
  description: 'Get a detailed septic system report for any property for just $29. Includes GPS coordinates, tank location map, permit history, and system details. No record found? Full refund. Instant download.',
  keywords: ['property septic report', 'septic tank report', 'septic system inspection report', 'tank location report', 'septic permit lookup'],
  openGraph: {
    title: 'Property Septic Report - $29',
    description: 'Detailed septic reports with GPS coordinates, tank maps, and permit data. $29 one-time purchase with a no-record full-refund guarantee. Instant results.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://tankfindr.com/report',
  },
}

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
