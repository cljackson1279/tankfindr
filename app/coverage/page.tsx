// Coverage page. All numbers come from lib/coverage.ts (audited against the
// production septic_tanks table). Do not hardcode states or counts here.

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import {
  FEATURED_COVERAGE,
  PARTIAL_COVERAGE,
  FEATURED_STATE_COUNT,
  TOTAL_STATE_COUNT,
  TOTAL_RECORDS_DISPLAY,
  COUNTY_DATASET_COUNT,
  type CoverageRow,
  type DataQuality,
} from '@/lib/coverage'

const QUALITY_TONE: Record<DataQuality, string> = {
  High: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  Mixed: 'bg-sky-50 text-sky-800 ring-sky-600/20',
  Medium: 'bg-amber-50 text-amber-800 ring-amber-600/20',
}

function CoverageTable({ rows }: { rows: CoverageRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th scope="col" className="px-5 py-3 font-medium">State</th>
            <th scope="col" className="px-5 py-3 font-medium">Coverage area</th>
            <th scope="col" className="px-5 py-3 text-right font-medium">Records</th>
            <th scope="col" className="px-5 py-3 font-medium">Quality</th>
            <th scope="col" className="px-5 py-3 font-medium">Source notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.abbr} className="align-top hover:bg-slate-50/70">
              <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                {r.slug ? (
                  <Link href={`/septic-records/${r.slug}`} className="hover:text-emerald-800 hover:underline">
                    {r.state}
                  </Link>
                ) : (
                  r.state
                )}
              </td>
              <td className="px-5 py-4 text-slate-700">{r.areas}</td>
              <td className="whitespace-nowrap px-5 py-4 text-right font-mono tabular-nums text-slate-900">
                {r.records.toLocaleString('en-US')}
              </td>
              <td className="px-5 py-4">
                <span className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${QUALITY_TONE[r.quality]}`}>
                  {r.quality}
                </span>
              </td>
              <td className="px-5 py-4 text-slate-600">{r.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function CoveragePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <SiteHeader />

      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Coverage</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Where our septic records come from</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            Every record is sourced from a county health department, state environmental agency or
            state septic inventory. Coverage depth varies a lot by area, so we list it exactly.
          </p>
          <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              [TOTAL_RECORDS_DISPLAY, 'septic records'],
              [String(FEATURED_STATE_COUNT), 'states in depth'],
              [String(TOTAL_STATE_COUNT), 'states with any data'],
              [String(COUNTY_DATASET_COUNT), 'county & state datasets'],
            ].map(([v, l]) => (
              <div key={l}>
                <dd className="text-3xl font-semibold tracking-tight">{v}</dd>
                <dt className="mt-1 text-sm text-slate-500">{l}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <h2 className="text-2xl font-semibold tracking-tight">In-depth coverage</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          States with substantial record sets. Each has its own state page with regulations and
          record-lookup guidance.
        </p>
        <div className="mt-6">
          <CoverageTable rows={FEATURED_COVERAGE} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8">
        <h2 className="text-2xl font-semibold tracking-tight">Partial coverage</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Real records, but limited in size or area. A lookup here may return septic/sewer status
          without a precise tank location.
        </p>
        <div className="mt-6">
          <CoverageTable rows={PARTIAL_COVERAGE} />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
          {[
            ['High', 'Permit records with GPS points recorded by the county — typically the most precise locations available.'],
            ['Mixed', 'A blend of verified permits and estimated inventory. Each result in your report says which one it is.'],
            ['Medium', 'Parcel- or area-level locations. Reliable for septic vs. sewer; confirm the exact tank spot before digging.'],
          ].map(([q, body]) => (
            <div key={q}>
              <span className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${QUALITY_TONE[q as DataQuality]}`}>
                {q}
              </span>
              <p className="mt-3 leading-relaxed text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="flex flex-col justify-between gap-6 rounded-xl border border-slate-200 p-8 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Don&apos;t see your county?</h2>
            <p className="mt-2 max-w-xl text-slate-600">
              Tell us where you need records. Requests directly decide which counties we add next.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:support@tankfindr.com?subject=County%20Coverage%20Request"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-700 px-5 text-sm font-medium text-white hover:bg-emerald-800"
            >
              Request your county <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <Link
              href="/pricing-pro"
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
