'use client'

/**
 * Demo Page - Live Examples of TankFindr Results
 * 
 * This page shows real Florida properties with TankFindr lookup results.
 * Use this link in sales emails to give prospects a live preview.
 * 
 * URL to share: https://tankfindr.com/demo
 * 
 * TODO: Later you can replace hard-coded examples with live Supabase data
 */

import { useState } from 'react'
import { proofExamples, type ProofExample } from '@/lib/proofExamples'
import { MapPin, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function DemoPage() {
  const [selectedExample, setSelectedExample] = useState<ProofExample | null>(
    proofExamples[0]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-emerald-600">
              TankFindr
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/pricing-pro">
                <Button variant="outline">View Pricing</Button>
              </Link>
              <Link href="/auth/login">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Live Demo
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Florida Septic Properties
            <br />
            <span className="text-emerald-600">Mapped by TankFindr</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how TankFindr helps septic professionals locate tanks in minutes instead of hours.
            These are real Florida properties from our database of 2.2+ million septic systems.
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center bg-white">
            <div className="text-4xl font-bold text-emerald-600 mb-2">2.2M+</div>
            <div className="text-gray-600 font-medium">Florida Septic Records</div>
          </Card>
          <Card className="p-6 text-center bg-white">
            <div className="text-4xl font-bold text-purple-600 mb-2">3-5min</div>
            <div className="text-gray-600 font-medium">Average Locate Time</div>
          </Card>
          <Card className="p-6 text-center bg-white">
            <div className="text-4xl font-bold text-emerald-600 mb-2">2+ hrs</div>
            <div className="text-gray-600 font-medium">Time Saved Per Job</div>
          </Card>
        </div>

        {/* Example List */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Example List */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Sample Properties
            </h2>
            <div className="space-y-3">
              {proofExamples.map((example) => (
                <Card
                  key={example.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedExample?.id === example.id
                      ? 'border-emerald-500 border-2 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                  onClick={() => setSelectedExample(example)}
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm mb-1">
                        {example.county} County
                      </div>
                      <div className="text-xs text-gray-600 mb-2 truncate">
                        {example.address}
                      </div>
                      <div className="flex items-center gap-2">
                        {example.hasPermitData ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                            <AlertCircle className="w-3 h-3" />
                            Estimated
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {example.tankFindrTimeMinutes}min
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Content - Selected Example Details */}
          <div className="lg:col-span-2">
            {selectedExample && (
              <div className="space-y-6">
                {/* Property Header */}
                <Card className="p-6 bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedExample.county} County Property
                      </h3>
                      <p className="text-gray-600">{selectedExample.address}</p>
                    </div>
                    {selectedExample.hasPermitData ? (
                      <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg font-semibold">
                        <CheckCircle className="w-5 h-5" />
                        Verified Permit
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg font-semibold">
                        <AlertCircle className="w-5 h-5" />
                        Estimated Data
                      </span>
                    )}
                  </div>

                  {/* Time Comparison */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">
                          Traditional Method
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {selectedExample.traditionalTimeHours}h
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Calling county, searching property, trial and error
                      </div>
                    </div>

                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">
                          With TankFindr
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-emerald-600">
                        {selectedExample.tankFindrTimeMinutes}min
                      </div>
                      <div className="text-xs text-emerald-700 mt-1">
                        Instant GPS coordinates, permit data, and property info
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Map Placeholder */}
                <Card className="p-6 bg-white">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    Tank Location Map
                  </h4>
                  
                  {/* TODO: Replace with actual MapView component when ready */}
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 font-medium">
                        Map View: {selectedExample.lat.toFixed(6)}, {selectedExample.lng.toFixed(6)}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {/* TODO: Plug in your existing <MapView /> component here */}
                        {/* <MapView lat={selectedExample.lat} lng={selectedExample.lng} /> */}
                        Satellite view with tank marker
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps?q=${selectedExample.lat},${selectedExample.lng}&z=19&t=k`,
                          '_blank'
                        )
                      }
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in Google Maps
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${selectedExample.lat}, ${selectedExample.lng}`
                        )
                        alert('Coordinates copied!')
                      }}
                    >
                      Copy GPS
                    </Button>
                  </div>
                </Card>

                {/* Property Details */}
                <Card className="p-6 bg-white">
                  <h4 className="font-bold text-gray-900 mb-4">Property Details</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">System Type</div>
                      <div className="font-semibold text-gray-900">
                        {selectedExample.septicOrSewer}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Data Quality</div>
                      <div className="font-semibold text-gray-900">
                        {selectedExample.hasPermitData
                          ? 'Verified County Permit'
                          : 'Estimated from State Inventory'}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-600 mb-1">Data Sources</div>
                      <div className="font-semibold text-gray-900">
                        {selectedExample.dataSources}
                      </div>
                    </div>
                    {selectedExample.notes && (
                      <div className="md:col-span-2">
                        <div className="text-sm text-gray-600 mb-1">Notes</div>
                        <div className="text-gray-700">{selectedExample.notes}</div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="p-8 bg-gradient-to-r from-emerald-600 to-purple-600 text-white max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Save 2+ Hours Per Job?
            </h2>
            <p className="text-emerald-50 text-lg mb-6">
              Start your 7-day free trial and see results on your first septic job.
              No credit card required.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/pricing-pro">
                <Button
                  size="lg"
                  className="bg-white text-emerald-600 hover:bg-emerald-50"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/coverage">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Check Coverage
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
