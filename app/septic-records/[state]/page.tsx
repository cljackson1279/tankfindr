import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, CheckCircle, FileText, Scale, DollarSign, ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { STATES, getState } from '@/lib/stateData'

export function generateStaticParams() {
  return STATES.map((s) => ({ state: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state: slug } = await params
  const s = getState(slug)
  if (!s) return { title: 'Septic Records' }
  const title = `${s.name} Septic Tank Locator — Find Septic Records by Address`
  const description = `Find septic tank locations and records in ${s.name}. ${s.coverageNote} Search ${s.displayLocations} mapped septic locations from government data. Instant property reports.`
  return {
    title,
    description,
    keywords: [
      `${s.name.toLowerCase()} septic tank locator`,
      `${s.name.toLowerCase()} septic records`,
      `find septic tank ${s.name.toLowerCase()}`,
      `septic records by address ${s.name.toLowerCase()}`,
      `where is my septic tank ${s.name.toLowerCase()}`,
    ],
    alternates: { canonical: `/septic-records/${s.slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://tankfindr.com/septic-records/${s.slug}`,
    },
  }
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state: slug } = await params
  const s = getState(slug)
  if (!s) notFound()

  const otherStates = STATES.filter((x) => x.slug !== s.slug)

  // Per-state FAQ (also emitted as FAQPage schema below so it stays in sync)
  const faqs: { q: string; a: string }[] = [
    {
      q: `How do I find my septic tank in ${s.name}?`,
      a: `Enter your ${s.name} property address into TankFindr. We search ${s.displayLocations} mapped septic locations from government records and return the GPS location, septic-vs-sewer status, and any permit details on file for the property.`,
    },
    {
      q: `Does TankFindr cover my county in ${s.name}?`,
      a: `${s.coverageNote} You can run a free address check to see exactly what we have for a specific property before purchasing a report.`,
    },
    ...(s.regulations
      ? [{
          q: `Who keeps septic records in ${s.name}?`,
          a: s.regulations.recordsHow,
        }]
      : []),
  ]

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Septic Tank Locator — ${s.name}`,
    serviceType: 'Septic tank location and records lookup',
    description: `Find septic tank locations and government records by address in ${s.name}.`,
    provider: { '@type': 'Organization', name: 'TankFindr', url: 'https://tankfindr.com' },
    areaServed: { '@type': 'State', name: s.name },
    url: `https://tankfindr.com/septic-records/${s.slug}`,
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tankfindr.com' },
      { '@type': 'ListItem', position: 2, name: 'Septic Records by State', item: 'https://tankfindr.com/septic-records' },
      { '@type': 'ListItem', position: 3, name: s.name, item: `https://tankfindr.com/septic-records/${s.slug}` },
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        {' / '}
        <Link href="/septic-records" className="hover:text-gray-700">Septic Records by State</Link>
        {' / '}
        <span className="text-gray-700">{s.name}</span>
      </div>

      {/* Hero */}
      <section className="container mx-auto px-4 py-10 text-center max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {s.name} Septic Tank Locator
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Find your septic tank and septic records by address in {s.name}. {s.coverageNote}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <Link href="/report">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8">
              Find My Septic Tank <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/sample-report">
            <Button size="lg" variant="outline">See a Sample Report</Button>
          </Link>
        </div>
        <p className="text-sm text-gray-500">$29 per report • Instant access • No account required</p>
      </section>

      {/* Coverage stats */}
      <section className="container mx-auto px-4 pb-6 max-w-4xl">
        <Card className="p-6">
          <div className="grid sm:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-4xl font-bold text-green-600">{s.displayLocations}</p>
              <p className="text-gray-600">mapped septic locations in {s.name}</p>
              {s.verifiedNote && (
                <p className="text-sm text-emerald-700 mt-2 flex items-start gap-1">
                  <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" /> {s.verifiedNote}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Coverage includes:</p>
              <ul className="space-y-1">
                {s.coveredAreas.map((area) => (
                  <li key={area} className="flex items-center gap-2 text-gray-800">
                    <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" /> {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </section>

      {/* How to find */}
      <section className="container mx-auto px-4 py-6 max-w-3xl">
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><FileText className="w-6 h-6 text-green-600" /> How to find your septic tank in {s.name}</h2>
          <ol className="space-y-3 text-gray-700 list-decimal list-inside">
            <li>Search your property address with TankFindr to check {s.name} government records instantly.</li>
            <li>Review the septic-vs-sewer status, GPS location, and any permit details on file.</li>
            {s.regulations
              ? <li>For official copies, request records from the agency listed under Records &amp; Regulations below.</li>
              : <li>For official copies, contact your county or state environmental health department.</li>}
            <li>Confirm the exact lid location on-site with a probe before digging — and always call 811 first.</li>
          </ol>
        </Card>
      </section>

      {/* Records & Regulations (only when researched + cited) */}
      {s.regulations && (
        <section className="container mx-auto px-4 py-6 max-w-3xl">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Scale className="w-6 h-6 text-green-600" /> Septic records &amp; regulations in {s.name}</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <p className="font-semibold text-gray-900">Who regulates &amp; keeps records</p>
                <p>{s.regulations.recordsHow}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Inspection at sale</p>
                <p>{s.regulations.inspectionAtSale}</p>
              </div>
              {s.regulations.keyRules.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-900">Key requirements</p>
                  <ul className="list-disc list-inside space-y-1">
                    {s.regulations.keyRules.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </section>
      )}

      {/* Costs (only when researched + cited) */}
      {s.costs && s.costs.length > 0 && (
        <section className="container mx-auto px-4 py-6 max-w-3xl">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><DollarSign className="w-6 h-6 text-green-600" /> Typical septic costs in {s.name}</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {s.costs.map((c) => (
                <div key={c.label} className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">{c.label}</p>
                  <p className="text-lg font-bold text-gray-900">{c.range}</p>
                  {c.note && <p className="text-xs text-gray-500 mt-1">{c.note}</p>}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">Ranges are typical estimates and vary by property, system, and contractor.</p>
          </Card>
        </section>
      )}

      {/* FAQ */}
      <section className="container mx-auto px-4 py-6 max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">{s.name} septic FAQ</h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <Card key={f.q} className="p-6">
              <p className="font-semibold text-gray-900 mb-1">{f.q}</p>
              <p className="text-gray-700">{f.a}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Sources (only when present) */}
      {s.sources && s.sources.length > 0 && (
        <section className="container mx-auto px-4 py-6 max-w-3xl">
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-3">Official {s.name} sources</h2>
            <ul className="space-y-2">
              {s.sources.map((src) => (
                <li key={src.url}>
                  <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline inline-flex items-center gap-1">
                    {src.label} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {/* CTA */}
      <section className="container mx-auto px-4 py-10 max-w-3xl text-center">
        <Card className="p-8 bg-gradient-to-r from-emerald-600 to-green-600 text-white">
          <h2 className="text-2xl font-bold mb-3">Find your septic tank in {s.name} now</h2>
          <p className="text-emerald-50 mb-6">Instant report with GPS location, system status, and any records on file.</p>
          <Link href="/report">
            <Button size="lg" className="bg-white text-emerald-700 hover:bg-gray-100 font-semibold px-10">
              Check My Address — $29
            </Button>
          </Link>
        </Card>
      </section>

      {/* Internal links to other states */}
      <section className="container mx-auto px-4 pb-12 max-w-4xl">
        <h2 className="text-lg font-bold mb-4">Septic records in other states</h2>
        <div className="flex flex-wrap gap-2">
          {otherStates.map((x) => (
            <Link key={x.slug} href={`/septic-records/${x.slug}`} className="text-sm px-3 py-1.5 bg-white border rounded-full text-gray-700 hover:border-green-500 hover:text-green-700">
              {x.name}
            </Link>
          ))}
          <Link href="/coverage" className="text-sm px-3 py-1.5 bg-white border rounded-full text-gray-700 hover:border-green-500 hover:text-green-700">
            Full coverage map
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
