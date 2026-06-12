import type { Metadata } from 'next'
import Link from 'next/link'
import {
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Hash,
  ShieldCheck,
  Eye,
  Gauge,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'Sample Septic Report - See Exactly What You Get for $29',
  description:
    'Preview a real TankFindr property septic report: GPS tank coordinates, system type, permit number, capacity, age estimate, risk assessment, and data sources — every field labeled by confidence.',
  alternates: {
    canonical: '/sample-report',
  },
}

export default function SampleReportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      {/* Intro banner */}
      <div className="bg-emerald-600 text-white">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
          <Eye className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            Sample report with example data — shown for a verified-permit property. The exact
            fields depend on the government record for your address.
          </p>
        </div>
      </div>

      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Property Septic Status &amp; Location Report
            </h1>
            <p className="text-gray-600">1234 Example Lane, Ocala, FL 34470</p>
            <p className="text-sm text-gray-500 mt-2">
              Sample report • Generated for demonstration
            </p>
          </div>

          {/* Classification */}
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Septic Status</h2>
            <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-4">
              <div className="flex-1 p-4 rounded-lg border bg-emerald-50 border-emerald-200">
                <p className="text-sm text-gray-600 mb-1">Classification</p>
                <p className="text-xl font-bold">Septic System</p>
              </div>
              <div className="flex-1 p-4 rounded-lg border bg-emerald-50 border-emerald-200">
                <p className="text-sm text-gray-600 mb-1">Confidence</p>
                <p className="text-xl font-bold">High</p>
              </div>
              <div className="flex-1 p-4 rounded-lg border bg-emerald-50 border-emerald-200">
                <p className="text-sm text-gray-600 mb-1">Data Quality</p>
                <p className="text-xl font-bold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  Verified Permit
                </p>
              </div>
            </div>
            <p className="text-gray-700">
              This property has a septic system based on official county permit records. The tank
              location and system details below come from the verified permit on file.
            </p>
          </Card>

          {/* Tank Location */}
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tank Location</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Latitude</p>
                <p className="font-mono text-lg">29.187452</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Longitude</p>
                <p className="font-mono text-lg">-82.140118</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Distance from home address: 14.2 meters (≈ 47 feet, northeast of the house)
            </p>
            {/* Stylized map placeholder — the real report shows an interactive satellite map */}
            <div className="relative h-72 rounded-lg overflow-hidden border bg-gradient-to-br from-emerald-100 via-green-50 to-emerald-200">
              <div className="absolute inset-0 opacity-30" aria-hidden="true" style={{
                backgroundImage:
                  'linear-gradient(rgba(16,185,129,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.25) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }} />
              <div className="absolute left-1/3 top-1/3 -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="w-20 h-14 bg-white/70 border-2 border-gray-400 rounded-sm mx-auto" />
                <p className="text-xs font-semibold text-gray-700 mt-1">House</p>
              </div>
              <div className="absolute left-[62%] top-[55%] -translate-x-1/2 -translate-y-1/2 text-center">
                <MapPin className="w-10 h-10 text-emerald-700 mx-auto drop-shadow" />
                <p className="text-xs font-bold text-emerald-900 bg-white/80 rounded px-2 py-0.5 mt-1">
                  Septic Tank
                </p>
              </div>
              <div className="absolute bottom-3 right-3 bg-white/90 rounded-lg px-3 py-2 text-xs text-gray-700 shadow">
                Your report includes an interactive satellite map of the exact location
              </div>
            </div>
          </Card>

          {/* System Information */}
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">System Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">System Type</p>
                  <p className="font-semibold">OSTDS Existing</p>
                  <span className="text-xs text-emerald-700 font-medium">✓ Verified</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Hash className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Permit Number</p>
                  <p className="font-semibold">AP1284736</p>
                  <span className="text-xs text-emerald-700 font-medium">✓ Verified</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Permit Approval Date</p>
                  <p className="font-semibold">June 14, 2002</p>
                  <span className="text-xs text-emerald-700 font-medium">✓ Verified</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Gauge className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Permitted Capacity</p>
                  <p className="font-semibold">300 GPD</p>
                  <span className="text-xs text-emerald-700 font-medium">✓ Verified</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Gauge className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Estimated Tank Size</p>
                  <p className="font-semibold">1000–1250 gallons</p>
                  <span className="text-xs text-amber-700 font-medium">~ Inferred from capacity</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">System Age</p>
                  <p className="font-semibold">24 years old</p>
                  <span className="text-xs text-amber-700 font-medium">~ Inferred from permit date</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              This example reflects a verified-permit record. Some properties have fewer fields
              available (for example, location and septic/sewer status without a permit number) —
              your report shows everything on file for your address, clearly labeled by confidence.
            </p>
          </Card>

          {/* Risk Assessment */}
          <Card className="p-6 mb-6 text-amber-600 bg-amber-50 border-amber-200">
            <h2 className="text-2xl font-bold mb-4">Risk Assessment</h2>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 mt-0.5" />
              <div>
                <p className="font-bold text-lg mb-2">Medium Risk</p>
                <p>
                  This system is 15–25 years old. Regular maintenance is recommended — septic
                  tanks should typically be pumped every 3–5 years, and systems of this age
                  benefit from a professional inspection before any property purchase.
                </p>
              </div>
            </div>
          </Card>

          {/* Data Sources */}
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sources</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Marion County Septic Records</p>
                  <p className="text-sm text-gray-600">Marion, FL • high quality</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Florida DOH Permit Records</p>
                  <p className="text-sm text-gray-600">Statewide, FL • verified permits</p>
                </div>
              </li>
            </ul>
          </Card>

          {/* Disclaimer */}
          <Card className="p-6 bg-gray-50 mb-10">
            <h3 className="font-bold text-gray-900 mb-2">Disclaimer</h3>
            <p className="text-sm text-gray-600">
              Reports are based on publicly available government records and are for informational
              purposes only. Tank locations are estimates based on permit records and may not
              reflect current conditions. Always verify with a professional inspection before
              excavation, and call 811 before digging.
            </p>
          </Card>

          {/* CTA */}
          <Card className="p-8 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-center">
            <h2 className="text-3xl font-bold mb-3">Get this report for your property</h2>
            <p className="text-emerald-50 mb-6 max-w-xl mx-auto">
              Instant results, downloadable PDF, no account required. Every data point labeled by
              confidence, so you know exactly what you&apos;re getting.
            </p>
            <Link href="/report">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-gray-100 font-semibold px-10">
                Check My Address — $29
              </Button>
            </Link>
            <p className="text-sm text-emerald-100 mt-4 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              Secure checkout • Instant access
            </p>
          </Card>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
