'use client'

import { CheckCircle, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const coverageData = [
  {
    state: 'Florida',
    counties: 'All 67 counties',
    records: '1,939,334',
    quality: 'High',
    notes: 'Statewide parcel-level septic classification',
  },
  {
    state: 'Virginia',
    counties: 'Fairfax, James City',
    records: '28,951',
    quality: 'High',
    notes: 'GPS-surveyed tank locations',
  },
  {
    state: 'California',
    counties: 'Sonoma, Santa Cruz',
    records: '4,883',
    quality: 'High',
    notes: 'Permit-based tank locations',
  },
  {
    state: 'North Carolina',
    counties: 'Forsyth, Chatham, Pitt',
    records: '9,472',
    quality: 'Medium',
    notes: 'Approved septic areas and districts',
  },
  {
    state: 'New Mexico',
    counties: 'Statewide',
    records: '60,642',
    quality: 'Medium',
    notes: 'Liquid waste management facilities',
  },
  {
    state: 'Ohio',
    counties: 'Greene, Allen',
    records: '9,988',
    quality: 'High',
    notes: 'Septic tank GPS coordinates',
  },
  {
    state: 'Iowa',
    counties: 'Pottawattamie, Linn',
    records: '16,164',
    quality: 'Medium',
    notes: 'Septic system polygons',
  },
  {
    state: 'Utah',
    counties: 'Weber, Central Utah (multi-county)',
    records: '7,364',
    quality: 'High',
    notes: 'Onsite wastewater systems',
  },
  {
    state: 'South Dakota',
    counties: 'Minnehaha',
    records: '926',
    quality: 'High',
    notes: 'Septic system locations',
  },
  {
    state: 'Montana',
    counties: 'Flathead',
    records: '6',
    quality: 'Medium',
    notes: 'Limited coverage',
  },
  {
    state: 'Rhode Island',
    counties: 'Statewide',
    records: '877',
    quality: 'High',
    notes: 'OWTS point locations',
  },
  {
    state: 'Maryland',
    counties: 'Garrett',
    records: '11,148',
    quality: 'Medium',
    notes: 'Septic application parcels',
  },
  {
    state: 'Vermont',
    counties: 'Chittenden Area',
    records: '38,775',
    quality: 'High',
    notes: 'OWTS permit locations',
  },
]

export default function CoveragePage() {
  const totalRecords = coverageData.reduce(
    (sum, item) => sum + parseInt(item.records.replace(/,/g, '')),
    0
  )

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Coverage Areas
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Real county septic records across {coverageData.length} states
          </p>
          <div className="inline-flex items-center gap-6 bg-white rounded-lg shadow-sm px-8 py-4">
            <div>
              <p className="text-3xl font-bold text-emerald-600">
                {totalRecords.toLocaleString()}+
              </p>
              <p className="text-sm text-gray-600">Septic Tanks Mapped</p>
            </div>
            <div className="w-px h-12 bg-gray-200"></div>
            <div>
              <p className="text-3xl font-bold text-emerald-600">
                {coverageData.length}
              </p>
              <p className="text-sm text-gray-600">States Covered</p>
            </div>
            <div className="w-px h-12 bg-gray-200"></div>
            <div>
              <p className="text-3xl font-bold text-emerald-600">
                85+
              </p>
              <p className="text-sm text-gray-600">Counties</p>
            </div>
          </div>
        </div>

        {/* Coverage Table */}
        <Card className="p-6 mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    State
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Counties
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Records
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">
                    Quality
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {coverageData.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold">{item.state}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{item.counties}</td>
                    <td className="py-3 px-4 text-right font-mono text-gray-900">
                      {item.records}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          item.quality === 'High'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.quality}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {item.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quality Explanation */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-3">
              High Quality Data
            </h3>
            <p className="text-gray-700 mb-3">
              GPS-surveyed tank locations from county permit records. Accuracy within 5-15 meters.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Exact GPS coordinates from field surveys</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>System type and permit information</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Installation dates and age estimates</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-3">
              Medium Quality Data
            </h3>
            <p className="text-gray-700 mb-3">
              Parcel-based or area-based septic classifications. Accuracy within 30-50 meters.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Parcel centroid or address-based locations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Septic classification from county records</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Useful for initial property assessment</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Request Coverage */}
        <Card className="p-8 text-center bg-gradient-to-br from-emerald-50 to-white">
          <MapPin className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Don't See Your County?
          </h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            We're adding new counties every week! Request your county and we'll prioritize it.
            Most counties can be added within 1-2 weeks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="mailto:support@tankfindr.com?subject=County Coverage Request">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Request Your County
              </Button>
            </Link>
            <Link href="/pricing-pro">
              <Button variant="outline">
                View Pricing
              </Button>
            </Link>
          </div>
        </Card>

        {/* Coming Soon */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">
            <strong>Coming Soon:</strong> Washington, Oregon, Colorado, Nebraska, and 20+ more states
          </p>
          <p className="text-sm text-gray-500">
            We're actively expanding coverage nationwide. Check back soon!
          </p>
        </div>
      </div>
    </div>
  )
}
