'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, MapPin, FileText, Download, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

function ReportPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [address, setAddress] = useState(searchParams?.get('address') || '')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    if (searchParams?.get('address')) {
      handleCheck()
    }
  }, [])

  const handleCheck = async () => {
    if (!address.trim()) {
      setError('Please enter an address')
      return
    }

    setLoading(true)
    setError(null)
    setPreview(null)

    try {
      // Geocode address
      const geocodeResponse = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
      const geocodeData = await geocodeResponse.json()

      if (!geocodeResponse.ok || !geocodeData.lat || !geocodeData.lng) {
        throw new Error('Could not find address. Please try a different format.')
      }

      // Check coverage
      const coverageResponse = await fetch(
        `/api/coverage?lat=${geocodeData.lat}&lng=${geocodeData.lng}`
      )
      const coverageData = await coverageResponse.json()

      if (!coverageResponse.ok) {
        throw new Error('Error checking coverage')
      }

      setPreview({
        address: geocodeData.formatted_address || address,
        lat: geocodeData.lat,
        lng: geocodeData.lng,
        isCovered: coverageData.isCovered,
        classification: coverageData.classification,
        confidence: coverageData.confidence,
        sources: coverageData.sources,
      })
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!preview) return

    setCheckoutLoading(true)

    try {
      const response = await fetch('/api/create-report-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: preview.address,
          lat: preview.lat,
          lng: preview.lng,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout')
      setCheckoutLoading(false)
    }
  }

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'low': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Property Septic Status & Location Report
          </h1>
          <p className="text-xl text-gray-600">
            Get detailed septic system information for any property - $19
          </p>
        </div>

        {/* Address Search */}
        <Card className="p-6 mb-8">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter property address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
              className="flex-1"
              disabled={loading}
            />
            <Button
              onClick={handleCheck}
              disabled={loading || !address.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check Address'
              )}
            </Button>
          </div>
        </Card>

        {/* Error */}
        {error && (
          <Card className="p-6 mb-8 bg-red-50 border-red-200">
            <p className="text-red-800">{error}</p>
          </Card>
        )}

        {/* Preview */}
        {preview && preview.isCovered && (
          <Card className="p-8 mb-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                We Found Septic Data for This Property!
              </h2>
              <p className="text-gray-600">{preview.address}</p>
            </div>

            {/* Preview Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Classification</h3>
                <p className="text-lg capitalize">
                  {preview.classification.replace('_', ' ')}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Confidence</h3>
                <p className="text-lg capitalize">{preview.confidence}</p>
              </div>
            </div>

            {/* What You'll Get */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                Your Full Report Includes:
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <MapPin className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Exact GPS coordinates of septic tank location</span>
                </li>
                <li className="flex items-start">
                  <FileText className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>System type, permit number, and installation date</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Age estimate and risk assessment</span>
                </li>
                <li className="flex items-start">
                  <Download className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Downloadable PDF report</span>
                </li>
              </ul>
            </div>

            {/* Purchase Button */}
            <Button
              onClick={handlePurchase}
              disabled={checkoutLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Loading Checkout...
                </>
              ) : (
                <>
                  Get Full Report - $19
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-600 mt-4">
              One-time payment • Instant access • No subscription required
            </p>
          </Card>
        )}

        {/* Not Covered */}
        {preview && !preview.isCovered && (
          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Area Not Yet Covered
            </h2>
            <p className="text-gray-600 mb-6">
              We don't have data for this county yet, but we're adding new areas every week!
            </p>
            <Link href="/coverage">
              <Button variant="outline">
                See Coverage Areas
              </Button>
            </Link>
          </Card>
        )}

        {/* For Septic Companies */}
        <div className="text-center mt-8 p-6 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-700 mb-3">
            <strong>Septic company?</strong> Get unlimited lookups with TankFindr Pro
          </p>
          <Link href="/pricing">
            <Button variant="outline">
              View Pro Plans
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <ReportPageContent />
    </Suspense>
  )
}
