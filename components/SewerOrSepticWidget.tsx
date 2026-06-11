'use client'

import { useState, type ReactNode } from 'react'
import { Search, Loader2, CheckCircle, XCircle, AlertCircle, HelpCircle, Droplets, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

type Classification = 'septic' | 'sewer' | 'likely_septic' | 'likely_sewer' | 'unknown'

interface CheckResult {
  classification: Classification;
  confidence: 'high' | 'medium' | 'low';
  isCovered: boolean;
  address: string;
}

interface ClassificationConfig {
  icon: ReactNode;
  title: string;
  description: string;
  badgeClass: string;
}

// Static class maps so Tailwind can compile them (dynamic `bg-${color}-100` never compiles)
const CLASSIFICATION_CONFIGS: Record<Classification, ClassificationConfig> = {
  septic: {
    icon: <CheckCircle className="w-12 h-12 text-emerald-600" />,
    title: 'Septic System Found',
    description: 'A septic system record matches this property in government data.',
    badgeClass: 'bg-emerald-100 text-emerald-800',
  },
  likely_septic: {
    icon: <AlertCircle className="w-12 h-12 text-amber-600" />,
    title: 'Likely Septic',
    description: 'Government records indicate this property likely has a septic system.',
    badgeClass: 'bg-amber-100 text-amber-800',
  },
  sewer: {
    icon: <XCircle className="w-12 h-12 text-blue-600" />,
    title: 'Sewer Connection',
    description: 'This property appears to be connected to municipal sewer.',
    badgeClass: 'bg-blue-100 text-blue-800',
  },
  likely_sewer: {
    icon: <Droplets className="w-12 h-12 text-blue-600" />,
    title: 'Likely Sewer',
    description: 'Septic records exist for this area, but none match this property — it is most likely on municipal sewer.',
    badgeClass: 'bg-blue-100 text-blue-800',
  },
  unknown: {
    icon: <HelpCircle className="w-12 h-12 text-gray-600" />,
    title: 'Unknown',
    description: "We don't have data for this area yet.",
    badgeClass: 'bg-gray-100 text-gray-800',
  },
}

export default function SewerOrSepticWidget() {
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCheck = async () => {
    if (!address.trim()) {
      setError('Please enter an address')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // First geocode the address
      const geocodeResponse = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
      const geocodeData = await geocodeResponse.json()

      if (!geocodeResponse.ok || !geocodeData.lat || !geocodeData.lng) {
        throw new Error('Could not find address. Please try a different format.')
      }

      const resolvedAddress = geocodeData.formatted_address || address

      // Then check coverage — pass the address so record matching can run server-side
      const coverageResponse = await fetch(
        `/api/coverage?lat=${geocodeData.lat}&lng=${geocodeData.lng}&address=${encodeURIComponent(resolvedAddress)}`
      )
      const coverageData = await coverageResponse.json()

      if (!coverageResponse.ok) {
        throw new Error('Error checking coverage')
      }

      setResult({
        classification: coverageData.classification ?? 'unknown',
        confidence: coverageData.confidence ?? 'low',
        isCovered: Boolean(coverageData.isCovered),
        address: resolvedAddress,
      })
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getClassificationDisplay = () => {
    if (!result) return null

    // Defensive fallback: never crash on an unexpected classification value
    const config = CLASSIFICATION_CONFIGS[result.classification] ?? CLASSIFICATION_CONFIGS.unknown
    const showSepticCta = result.isCovered &&
      (result.classification === 'septic' || result.classification === 'likely_septic')
    const showSewerNote = result.classification === 'sewer' || result.classification === 'likely_sewer'

    return (
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {config.icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {config.title}
        </h3>
        <p className="text-gray-600 mb-4">
          {config.description}
        </p>

        {result.confidence && (
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${config.badgeClass}`}>
              {result.confidence.charAt(0).toUpperCase() + result.confidence.slice(1)} Confidence
            </span>
          </div>
        )}

        {showSepticCta && (
          <div className="space-y-3 mt-6">
            <Link href={`/report?address=${encodeURIComponent(result.address)}`}>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                View Full Septic Report - $29
              </Button>
            </Link>
            <p className="text-sm text-gray-600">
              Get exact tank location, system details, age estimate, and risk assessment
            </p>
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              No record found? Automatic full refund.
            </p>
          </div>
        )}

        {showSewerNote && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-3">
              Good news — sewer-connected homes don&apos;t need septic maintenance.
              Think this is wrong? A full report documents what the records show.
            </p>
            <Link href={`/report?address=${encodeURIComponent(result.address)}`}>
              <Button variant="outline" className="w-full">
                Get the Full Report - $29
              </Button>
            </Link>
          </div>
        )}

        {!result.isCovered && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-3">
              We don&apos;t have data for your county yet, but we&apos;re adding new areas every week!
            </p>
            <Link href="/coverage">
              <Button variant="outline" className="w-full">
                See Coverage Areas
              </Button>
            </Link>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Sewer or Septic?
        </h2>
        <p className="text-gray-600">
          Enter any address to check if it has a septic system or sewer connection
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder="Enter address (e.g., 123 Main St, Miami, FL)"
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
            <>
              <Search className="w-4 h-4 mr-2" />
              Check
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg">
          {getClassificationDisplay()}
        </div>
      )}

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          💡 <strong>For septic companies:</strong>{' '}
          <Link href="/pricing-pro" className="text-emerald-600 hover:underline">
            Get unlimited lookups with TankFindr Pro
          </Link>
        </p>
      </div>
    </Card>
  )
}
