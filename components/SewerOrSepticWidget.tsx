'use client'

import { useState } from 'react'
import { Search, Loader2, CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface CheckResult {
  classification: 'septic' | 'sewer' | 'likely_septic' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  isCovered: boolean;
  address: string;
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

      // Then check coverage
      const coverageResponse = await fetch(
        `/api/coverage?lat=${geocodeData.lat}&lng=${geocodeData.lng}`
      )
      const coverageData = await coverageResponse.json()

      if (!coverageResponse.ok) {
        throw new Error('Error checking coverage')
      }

      setResult({
        classification: coverageData.classification,
        confidence: coverageData.confidence,
        isCovered: coverageData.isCovered,
        address: geocodeData.formatted_address || address,
      })
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getClassificationDisplay = () => {
    if (!result) return null

    const configs = {
      septic: {
        icon: <CheckCircle className="w-12 h-12 text-emerald-600" />,
        title: 'Septic System',
        description: 'This property appears to have a septic system.',
        color: 'emerald',
      },
      sewer: {
        icon: <XCircle className="w-12 h-12 text-blue-600" />,
        title: 'Sewer Connection',
        description: 'This property appears to be connected to sewer.',
        color: 'blue',
      },
      likely_septic: {
        icon: <AlertCircle className="w-12 h-12 text-amber-600" />,
        title: 'Likely Septic',
        description: 'This property likely has a septic system, but we don\'t have exact data.',
        color: 'amber',
      },
      unknown: {
        icon: <HelpCircle className="w-12 h-12 text-gray-600" />,
        title: 'Unknown',
        description: 'We don\'t have data for this area yet.',
        color: 'gray',
      },
    }

    const config = configs[result.classification]

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
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold bg-${config.color}-100 text-${config.color}-800`}>
              {result.confidence.charAt(0).toUpperCase() + result.confidence.slice(1)} Confidence
            </span>
          </div>
        )}

        {result.isCovered && (result.classification === 'septic' || result.classification === 'likely_septic') && (
          <div className="space-y-3 mt-6">
            <Link href={`/report?address=${encodeURIComponent(result.address)}`}>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                View Full Septic Report - $19
              </Button>
            </Link>
            <p className="text-sm text-gray-600">
              Get exact tank location, system details, age estimate, and risk assessment
            </p>
          </div>
        )}

        {!result.isCovered && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-3">
              We don't have data for your county yet, but we're adding new areas every week!
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
          <Link href="/pricing" className="text-emerald-600 hover:underline">
            Get unlimited lookups with TankFindr Pro
          </Link>
        </p>
      </div>
    </Card>
  )
}
