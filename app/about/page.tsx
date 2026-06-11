import type { Metadata } from 'next'
import Link from 'next/link'
import { Database, MapPin, ShieldCheck, FileSearch, Scale, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'About TankFindr - Where Our Septic Data Comes From',
  description:
    'TankFindr aggregates millions of septic system records from government permit databases — Florida DEP, county health departments, and state GIS systems — and labels every data point Verified, Inferred, or Estimated.',
  alternates: {
    canonical: '/about',
  },
}

const DATA_SOURCES = [
  {
    name: 'Florida DEP / DOH OSTDS databases',
    detail:
      'Statewide onsite sewage treatment and disposal system records, including permit applications, approvals, and the state septic inventory.',
  },
  {
    name: 'County health departments',
    detail:
      'Permit records and as-built drawings from county environmental health offices, including Fairfax County (VA), Sonoma County (CA), and dozens of Florida counties.',
  },
  {
    name: 'State GIS and environmental agencies',
    detail:
      'Geographic data layers published by state agencies, including New Mexico statewide records and county GIS systems.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
      <SiteHeader />

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          We believe you shouldn&apos;t have to dig holes to find public records
        </h1>
        <p className="text-xl text-gray-600">
          Every septic system in America was permitted by a government agency. That paperwork
          exists — it&apos;s just scattered across thousands of county offices, PDF scans, and
          GIS portals. TankFindr brings it into one search box.
        </p>
      </section>

      {/* The problem / story */}
      <section className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-4">Why TankFindr exists</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Roughly one in five American homes runs on a septic system — and most owners have
              no idea where their tank is. Finding out the old way means calling the county and
              waiting days for records, paying $100–$200 for a professional locate, or probing
              the yard with a metal rod and hoping.
            </p>
            <p>
              We built TankFindr in 2024 to make that answer instant. We aggregate millions of
              government septic records, geocode them, and put them behind a single address
              search — so homeowners, home inspectors, realtors, and septic companies can find
              tanks in seconds instead of days.
            </p>
          </div>
        </Card>
      </section>

      {/* Data sources */}
      <section className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-emerald-600" />
            <h2 className="text-2xl font-bold">Where our data comes from</h2>
          </div>
          <ul className="space-y-4">
            {DATA_SOURCES.map((source) => (
              <li key={source.name} className="flex items-start gap-3">
                <FileSearch className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">{source.name}</p>
                  <p className="text-sm text-gray-600">{source.detail}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-600 mt-6">
            See exactly which counties and states are covered — including record counts and
            data quality — on our{' '}
            <Link href="/coverage" className="text-emerald-700 underline hover:text-emerald-900">
              coverage page
            </Link>
            .
          </p>
        </Card>
      </section>

      {/* Honesty / methodology */}
      <section className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Scale className="w-8 h-8 text-emerald-600" />
            <h2 className="text-2xl font-bold">Our honesty policy: labeled confidence</h2>
          </div>
          <div className="space-y-4 text-gray-700">
            <p>
              Government records are imperfect — some are decades old, some were digitized from
              paper, and some locations were estimated by the agencies themselves. Most data
              companies hide that. We label it.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 my-6">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="font-bold text-emerald-800 mb-1">Verified</p>
                <p className="text-sm text-emerald-900">
                  Backed by an official permit record with a permit number
                </p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <p className="font-bold text-amber-800 mb-1">Inferred</p>
                <p className="text-sm text-amber-900">
                  Calculated from verified data (e.g. tank size from permitted capacity)
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="font-bold text-gray-800 mb-1">Estimated</p>
                <p className="text-sm text-gray-700">
                  From state inventory data — useful signal, lower precision
                </p>
              </div>
            </div>
            <p>
              Every report tells you which tier each data point belongs to. And if we find no
              record at all for a property you paid to check,{' '}
              <strong>you get an automatic full refund</strong> — that&apos;s the deal.
            </p>
          </div>
        </Card>
      </section>

      {/* Accuracy expectations */}
      <section className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-8 h-8 text-emerald-600" />
            <h2 className="text-2xl font-bold">What to expect from GPS accuracy</h2>
          </div>
          <p className="text-gray-700">
            Verified permit locations are typically accurate to within 10–20 feet — close enough
            to put a shovel in the right part of the yard, not a guarantee of the exact lid
            position. Always confirm with a probe or professional locate before excavation, and
            call 811 before any digging. TankFindr gets you to the right spot in seconds; it
            doesn&apos;t replace eyes on the ground.
          </p>
        </Card>
      </section>

      {/* Contact + CTA */}
      <section className="container mx-auto px-4 py-12 max-w-3xl text-center">
        <div className="flex items-center justify-center gap-2 text-gray-700 mb-8">
          <Mail className="w-5 h-5" />
          <span>
            Questions? Reach us at{' '}
            <a href="mailto:support@tankfindr.com" className="text-emerald-700 underline hover:text-emerald-900">
              support@tankfindr.com
            </a>
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/report">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Find Your Septic Tank
            </Button>
          </Link>
          <Link href="/sample-report">
            <Button size="lg" variant="outline">
              See a Sample Report
            </Button>
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-4 flex items-center justify-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          $29 per report • No record found? Automatic full refund
        </p>
      </section>

      <SiteFooter />
    </div>
  )
}
