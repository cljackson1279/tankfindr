// Homepage. Server component: all interactive pieces (header, free sewer/septic
// check) are their own client components. Every coverage number on this page
// comes from lib/coverage.ts — do not hardcode counts here.
//
// Prices and checkout destinations are unchanged from the previous homepage:
//   /report ($19 one-time) · /inspector-pro ($69/mo) · /pricing-pro (from $79/mo)

import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import SewerOrSepticWidget from '@/components/SewerOrSepticWidget'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import {
  FEATURED_COVERAGE,
  FEATURED_STATE_COUNT,
  TOTAL_RECORDS_DISPLAY,
} from '@/lib/coverage'

const fmt = (n: number) =>
  n >= 1_000_000 ? `${(Math.floor(n / 100_000) / 10).toFixed(1)}M` : n.toLocaleString('en-US')

const STEPS = [
  {
    n: '01',
    title: 'Enter the property address',
    body: 'We geocode the address and search county and state septic records within the parcel.',
  },
  {
    n: '02',
    title: 'We match government records',
    body: 'Permit files, health-department GIS layers and state septic inventories — never guesses dressed up as data.',
  },
  {
    n: '03',
    title: 'Get the location and the report',
    body: 'GPS coordinates, distance from the house, permit details when on file, and a PDF you can hand to a client or crew.',
  },
]

const QUALITY = [
  {
    label: 'Verified',
    tone: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
    body: 'Taken directly from a permit or official record — permit number, system type, install date, GPS point.',
  },
  {
    label: 'Inferred',
    tone: 'bg-sky-50 text-sky-800 ring-sky-600/20',
    body: 'Calculated from verified fields, such as tank size from permitted capacity or age from permit date.',
  },
  {
    label: 'Estimated',
    tone: 'bg-amber-50 text-amber-800 ring-amber-600/20',
    body: 'From statewide inventories that locate systems at the parcel level. Good for "septic or sewer?" — confirm before digging.',
  },
]

const PLANS = [
  {
    audience: 'Homeowners & realtors',
    name: 'Property Report',
    price: '$19',
    cadence: 'one-time',
    body: 'Is this home on septic, and where is the tank? One address, one downloadable report.',
    points: ['GPS tank location when on file', 'Septic vs. sewer status', 'System age & risk notes'],
    href: '/report',
    cta: 'Get a property report',
    note: 'Instant access · No account required',
    featured: true,
  },
  {
    audience: 'Home inspectors',
    name: 'Inspector Pro',
    price: '$69',
    cadence: 'per month',
    body: 'Unlimited septic reports for your inspections, with every field labeled by confidence.',
    points: ['Unlimited property reports', 'Verified permit & system data', 'Professional PDF reports'],
    href: '/inspector-pro',
    cta: 'Start Inspector Pro',
    note: 'Unlimited reports',
    featured: false,
  },
  {
    audience: 'Septic companies',
    name: 'TankFindr Pro',
    price: 'From $79',
    cadence: 'per month',
    body: 'Send crews to the right spot. Less probing, fewer wasted trips, more jobs per technician.',
    points: ['300–1,500+ lookups per month', 'Job history & analytics', 'Multi-user team access'],
    href: '/pricing-pro',
    cta: 'See Pro plans',
    note: 'Subscription plans',
    featured: false,
  },
]

export default function HomePage() {
  const topStates = FEATURED_COVERAGE

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <SiteHeader />

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="border-b border-slate-200">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Septic tank locator
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Find the septic tank before you dig.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              TankFindr pulls GPS locations and permit details from county and state septic
              records — {TOTAL_RECORDS_DISPLAY} of them — and tells you exactly how confident
              each result is.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/report"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-emerald-700 px-6 text-base font-medium text-white transition-colors hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                Find my septic tank
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/sample-report"
                className="inline-flex h-12 items-center justify-center rounded-md border border-slate-300 px-6 text-base font-medium text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50"
              >
                See a sample report
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              $19 per report · Instant access · No account required
            </p>
          </div>

          {/* Product preview — mirrors the fields on /sample-report */}
          <div className="relative">
            <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.18)]">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Septic property report
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                  Sample data
                </span>
              </div>

              {/* Schematic parcel map */}
              <div className="relative h-44 overflow-hidden border-b border-slate-100 bg-slate-50">
                <svg viewBox="0 0 400 176" className="absolute inset-0 h-full w-full" aria-hidden>
                  <defs>
                    <pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse">
                      <path d="M16 0H0V16" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="400" height="176" fill="url(#grid)" />
                  <path d="M0 150 H400" stroke="#cbd5e1" strokeWidth="18" />
                  <rect x="70" y="18" width="260" height="112" fill="none" stroke="#94a3b8" strokeDasharray="4 4" />
                  <rect x="118" y="58" width="92" height="52" rx="2" fill="#fff" stroke="#64748b" />
                  <line x1="210" y1="84" x2="262" y2="52" stroke="#047857" strokeDasharray="3 3" />
                  <circle cx="268" cy="48" r="16" fill="#047857" fillOpacity="0.12" />
                  <circle cx="268" cy="48" r="5" fill="#047857" />
                </svg>
                <span className="absolute left-[30%] top-[46%] text-[10px] font-medium text-slate-500">House</span>
                <span className="absolute right-[12%] top-[8%] rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 ring-1 ring-emerald-600/20">
                  Tank · 47 ft NE
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-px bg-slate-100 text-sm">
                {[
                  ['Status', 'Septic system', 'Verified'],
                  ['Coordinates', '29.18745, −82.14012', 'Verified'],
                  ['Permit', 'AP1284736', 'Verified'],
                  ['Installed', 'June 2002', 'Verified'],
                  ['Tank size', '1,000–1,250 gal', 'Inferred'],
                  ['System age', '24 years', 'Inferred'],
                ].map(([k, v, q]) => (
                  <div key={k} className="bg-white px-5 py-3">
                    <dt className="text-xs text-slate-500">{k}</dt>
                    <dd className="mt-0.5 flex items-baseline justify-between gap-2">
                      <span className="font-medium tabular-nums text-slate-900">{v}</span>
                      <span className={`text-[10px] font-medium ${q === 'Verified' ? 'text-emerald-700' : 'text-sky-700'}`}>
                        {q}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* Proof strip */}
        <div className="border-t border-slate-200 bg-slate-50/60">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-5 py-8 sm:px-8 md:grid-cols-4">
            {[
              [TOTAL_RECORDS_DISPLAY, 'septic records mapped'],
              [String(FEATURED_STATE_COUNT), 'states with in-depth coverage'],
              ['County & state', 'permit and GIS sources'],
              ['3-level', 'confidence label on every field'],
            ].map(([v, l]) => (
              <div key={l} className="md:border-l md:border-slate-200 md:pl-6 first:md:border-l-0 first:md:pl-0">
                <dt className="sr-only">{l}</dt>
                <dd className="text-2xl font-semibold tracking-tight text-slate-900">{v}</dd>
                <dd className="mt-1 text-sm text-slate-500">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <h2 className="max-w-xl text-3xl font-semibold tracking-tight">
          Where is my septic tank? Answered from the public record.
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="border-t border-slate-900 pt-5">
              <span className="font-mono text-sm text-slate-400">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── Data quality ─────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-slate-50/60">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">We label what we know — and what we don&apos;t.</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Septic records vary wildly by county. Instead of presenting every point as exact,
              each field in a TankFindr report carries one of three labels, so you know when to
              trust it and when to probe first.
            </p>
            <Link href="/about" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-emerald-800 hover:text-emerald-900">
              How we source our data <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {QUALITY.map((q) => (
              <li key={q.label} className="flex flex-col gap-2 p-6 sm:flex-row sm:gap-6">
                <span className={`inline-flex h-fit w-24 shrink-0 justify-center rounded px-2 py-1 text-xs font-semibold ring-1 ring-inset ${q.tone}`}>
                  {q.label}
                </span>
                <p className="leading-relaxed text-slate-600">{q.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── Free check ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 rounded-xl border border-slate-200 p-8 md:p-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Free</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Septic or sewer?</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Check any address in covered areas before you pay for anything. No signup.
            </p>
          </div>
          <div>
            <SewerOrSepticWidget />
          </div>
        </div>
      </section>

      {/* ─── Plans ────────────────────────────────────────────── */}
      <section className="border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <h2 className="text-3xl font-semibold tracking-tight">Pick the plan that fits the job.</h2>
          <div className="mt-12 grid overflow-hidden rounded-xl border border-slate-200 md:grid-cols-3 md:divide-x md:divide-slate-200">
            {PLANS.map((p) => (
              <div key={p.name} className={`flex flex-col border-b border-slate-200 p-8 last:border-b-0 md:border-b-0 ${p.featured ? 'bg-slate-50/70' : 'bg-white'}`}>
                <p className="text-sm text-slate-500">{p.audience}</p>
                <h3 className="mt-1 text-xl font-semibold">{p.name}</h3>
                <p className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
                  <span className="text-sm text-slate-500">{p.cadence}</span>
                </p>
                <p className="mt-4 leading-relaxed text-slate-600">{p.body}</p>
                <ul className="mt-6 space-y-2 text-sm text-slate-700">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex gap-3">
                      <span className="mt-2 h-1 w-3 shrink-0 bg-emerald-700" aria-hidden />
                      {pt}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <Link
                    href={p.href}
                    className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-5 text-sm font-medium transition-colors ${
                      p.featured
                        ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                        : 'border border-slate-300 text-slate-800 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {p.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <p className="mt-3 text-center text-xs text-slate-500">{p.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Coverage ─────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Septic tank locator coverage</h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">
                In-depth records in {FEATURED_STATE_COUNT} states, with smaller datasets in several
                more. Depth varies by county — check the details for your area.
              </p>
            </div>
            <Link href="/coverage" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-emerald-800 hover:text-emerald-900">
              Coverage details by county <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <ul className="mt-10 grid overflow-hidden rounded-xl border-l border-t border-slate-200 bg-white sm:grid-cols-2 lg:grid-cols-3">
            {topStates.map((s) => (
              <li key={s.abbr} className="border-b border-r border-slate-200 bg-white">
                <Link href={`/septic-records/${s.slug}`} className="group flex items-baseline justify-between gap-4 px-5 py-4 hover:bg-slate-50">
                  <span>
                    <span className="font-medium text-slate-900 group-hover:text-emerald-800">{s.state}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{s.areas}</span>
                  </span>
                  <span className="font-mono text-sm tabular-nums text-slate-600">{fmt(s.records)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── Regional detail (SEO) ────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          <article>
            <h2 className="text-lg font-semibold">Septic tank locator — Florida</h2>
            <p className="mt-2 leading-relaxed text-slate-600">
              Statewide coverage across all 67 Florida counties from the state septic inventory,
              plus verified county permit records in Miami-Dade and other counties. Estimated
              inventory locations are always labeled as estimated.
            </p>
          </article>
          <article>
            <h2 className="text-lg font-semibold">Septic or sewer status — New Mexico</h2>
            <p className="mt-2 leading-relaxed text-slate-600">
              Statewide liquid-waste facility records for New Mexico. Check whether a property is on
              septic or sewer and locate the system from state environmental records.
            </p>
          </article>
          <article>
            <h2 className="text-lg font-semibold">Septic permits &amp; tank locations — Sonoma County, California</h2>
            <p className="mt-2 leading-relaxed text-slate-600">
              Permit-based septic locations for Sonoma County with GPS coordinates, system types and
              permit history from the county environmental health department.
            </p>
          </article>
          <article>
            <h2 className="text-lg font-semibold">Septic system data — Fairfax County, Virginia</h2>
            <p className="mt-2 leading-relaxed text-slate-600">
              Mapped septic systems in Fairfax County from Health Department permit records, with GPS
              coordinates for each permitted system.
            </p>
          </article>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
