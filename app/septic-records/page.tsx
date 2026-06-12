import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { STATES, TOTAL_DISPLAY_LOCATIONS, TOTAL_STATES } from '@/lib/stateData'

export const metadata: Metadata = {
  title: 'Septic Records by State — Find Septic Tanks Across the U.S.',
  description: `Browse septic tank records and coverage by state. TankFindr maps ${TOTAL_DISPLAY_LOCATIONS} septic locations across ${TOTAL_STATES} states from government data. Find your septic tank by address.`,
  alternates: { canonical: '/septic-records' },
  openGraph: {
    title: 'Septic Records by State — TankFindr',
    description: `Find septic tank locations and records by state. ${TOTAL_DISPLAY_LOCATIONS} mapped locations across ${TOTAL_STATES} states.`,
    type: 'website',
    url: 'https://tankfindr.com/septic-records',
  },
}

export default function SepticRecordsHub() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tankfindr.com' },
      { '@type': 'ListItem', position: 2, name: 'Septic Records by State', item: 'https://tankfindr.com/septic-records' },
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <SiteHeader />

      <section className="container mx-auto px-4 py-12 text-center max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Septic Records by State</h1>
        <p className="text-lg text-gray-600 mb-6">
          TankFindr maps <strong>{TOTAL_DISPLAY_LOCATIONS}</strong> septic tank locations across{' '}
          <strong>{TOTAL_STATES} states</strong> using government permit and GIS records. Choose your
          state to see coverage, how to find your septic tank, and local records &amp; regulations.
        </p>
        <Link href="/report">
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8">
            Find My Septic Tank <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
        <p className="text-sm text-gray-500 mt-3">$29 per report • Instant access • No account required</p>
      </section>

      <section className="container mx-auto px-4 pb-16 max-w-5xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STATES.map((s) => (
            <Link key={s.slug} href={`/septic-records/${s.slug}`}>
              <Card className="p-5 h-full hover:shadow-lg hover:border-green-500 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-bold text-gray-900">{s.name}</h2>
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">{s.displayLocations}</p>
                <p className="text-sm text-gray-600 mb-2">mapped locations</p>
                <p className="text-xs text-gray-500">{s.coveredAreas.slice(0, 3).join(' • ')}</p>
              </Card>
            </Link>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-8 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Coverage and counts come from official government records and are de-duplicated to distinct locations.
        </p>
      </section>

      <SiteFooter />
    </div>
  )
}
