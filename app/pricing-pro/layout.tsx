import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TankFindr Pro Pricing - Septic Tank Locator for Contractors | TankFindr',
  description: 'TankFindr Pro pricing for septic companies and contractors. Plans from $79/month. Find septic tanks 10x faster with GPS-accurate locations. 2.2M+ records across 13 states.',
  keywords: ['septic company software', 'septic contractor tools', 'septic tank locator pricing', 'septic business software', 'septic tank GPS'],
  openGraph: {
    title: 'TankFindr Pro Pricing - For Septic Contractors',
    description: 'Professional septic tank locator software. Plans from $79/month. 100-unlimited lookups. GPS coordinates and verified data.',
    type: 'website',
  },
}

export default function PricingProLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
