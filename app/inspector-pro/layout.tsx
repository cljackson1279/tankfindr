import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inspector Pro - Unlimited Septic Reports',
  description: 'Get unlimited septic system reports for $79/month. Perfect for home inspectors. Instant GPS coordinates, tank locations, and verified permit data. Save hours on every inspection.',
  keywords: ['home inspector septic', 'septic inspection software', 'septic tank reports', 'home inspection tools', 'septic system inspection'],
  openGraph: {
    title: 'Inspector Pro - Unlimited Septic Reports',
    description: 'Unlimited septic reports for home inspectors. $79/month. GPS coordinates, tank locations, verified data.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://tankfindr.com/inspector-pro',
  },
}

export default function InspectorProLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
