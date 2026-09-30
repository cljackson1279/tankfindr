import type { Metadata } from 'next'
import { TOTAL_RECORDS_DISPLAY, FEATURED_STATE_COUNT, COVERAGE_CLAIM_LONG } from '@/lib/coverage'

export const metadata: Metadata = {
  title: 'Pro Pricing - Septic Tank Locator for Contractors',
  description: `TankFindr Pro pricing for septic companies and contractors. Plans from $79/month. Locate septic tanks from government permit records. ${COVERAGE_CLAIM_LONG}.`,
  keywords: ['septic company software', 'septic contractor tools', 'septic tank locator pricing', 'septic business software', 'septic tank GPS'],
  openGraph: {
    title: 'Pro Pricing - Septic Tank Locator for Contractors',
    description: 'Professional septic tank locator software. Plans from $79/month. 100-unlimited lookups. GPS coordinates and verified data.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://tankfindr.com/pricing-pro',
  },
}

export default function PricingProLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
