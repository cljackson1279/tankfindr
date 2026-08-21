import type { Metadata } from 'next'

// /demo is a client component, so it cannot export metadata itself.
// This layout supplies it. The page is public and listed in the sitemap.
export const metadata: Metadata = {
  title: 'Live Demo - See Real Septic Tank Lookup Results',
  description:
    'See real TankFindr septic tank lookups on actual Florida properties. View GPS coordinates, tank locations, permit records, and data quality labels before you buy.',
  keywords: [
    'septic tank lookup example',
    'septic tank locator demo',
    'septic report example',
    'septic tank records sample',
  ],
  alternates: {
    canonical: 'https://tankfindr.com/demo',
  },
  openGraph: {
    title: 'Live Demo - Real Septic Tank Lookup Results | TankFindr',
    description:
      'Real septic tank lookups on actual properties. GPS coordinates, permit records, and transparent data quality labels.',
    type: 'website',
    url: 'https://tankfindr.com/demo',
  },
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
