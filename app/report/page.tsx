'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, MapPin, FileText, Download, AlertTriangle, CheckCircle, Lock, Shield, Droplet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

// Mapbox token - will be configured in Vercel environment variables
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

function ReportPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [address, setAddress] = useState(searchParams?.get('address') || '')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [selectedUpsells, setSelectedUpsells] = useState<string[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setIsAdmin(user?.email === 'cljackson79@gmail.com')
  }

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    try {
      if (!MAPBOX_TOKEN) {
        console.warn('Mapbox token not configured')
        return
      }
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=US&types=address&limit=5`
      )
      const data = await response.json()
      setSuggestions(data.features || [])
      setShowSuggestions(true)
    } catch (error) {
      console.error('Autocomplete error:', error)
    }
  }

  const selectSuggestion = (suggestion: any) => {
    setAddress(suggestion.place_name)
    setSuggestions([])
    setShowSuggestions(false)
  }

  const UPSELLS = [
    {
      id: 'environmental',
      name: 'Environmental Risk Add-On',
      price: 9,
      description: 'Flood zones, wetlands, soil type, and environmental hazards',
      icon: Shield,
    },
    {
      id: 'well',
      name: 'Well & Groundwater Risk Add-On',
      price: 29,
      description: 'Well locations, water table depth, contamination risk, and aquifer data',
      icon: Droplet,
    },
  ]

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
      const geocodeResponse = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })
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

  const toggleUpsell = (upsellId: string) => {
    setSelectedUpsells((prev) =>
      prev.includes(upsellId)
        ? prev.filter((id) => id !== upsellId)
        : [...prev, upsellId]
    )
  }

  const calculateTotal = () => {
    const basePrice = 19
    const upsellTotal = selectedUpsells.reduce((sum, id) => {
      const upsell = UPSELLS.find((u) => u.id === id)
      return sum + (upsell?.price || 0)
    }, 0)
    return basePrice + upsellTotal
  }

  const handlePurchase = async () => {
    if (!preview) return

    // Admin bypass - go directly to report view
    if (isAdmin) {
      const reportId = `admin_${Date.now()}`
      router.push(`/report/view?id=${reportId}&address=${encodeURIComponent(preview.address)}&lat=${preview.lat}&lng=${preview.lng}`)
      return
    }

    setCheckoutLoading(true)

    try {
      const response = await fetch('/api/create-report-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: preview.address,
          lat: preview.lat,
          lng: preview.lng,
          upsells: selectedUpsells,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error: any) {
      console.error('Purchase error:', error)
      alert(error.message || 'Failed to start checkout. Please try again.')
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-green-600">
            TankFindr
          </Link>
          <Link href="/">
            <Button variant="ghost">Back to Home</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Search Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Property Septic Report
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get instant septic tank location, system details, and property wastewater status
          </p>

          <Card className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Enter property address..."
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value)
                    fetchSuggestions(e.target.value)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !showSuggestions) {
                      handleCheck()
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="text-lg"
                  disabled={loading}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.filter(s => s && s.place_name).map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        onClick={() => selectSuggestion(suggestion)}
                      >
                        <div className="font-medium text-sm">{suggestion.text || 'Unknown'}</div>
                        <div className="text-xs text-gray-600">{suggestion.place_name || ''}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={handleCheck} disabled={loading} size="lg">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5 mr-2" />
                    Check Address
                  </>
                )}
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Preview Section */}
        {preview && (
          <div className="space-y-6">
            {/* Basic Info Preview */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Property Preview</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="text-lg font-medium">{preview.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Wastewater System</p>
                  <p className="text-lg font-bold">
                    {preview.classification === 'septic' ? (
                      <span className="text-orange-600">🟠 Septic System</span>
                    ) : preview.classification === 'sewer' ? (
                      <span className="text-blue-600">🔵 Public Sewer</span>
                    ) : (
                      <span className="text-gray-600">⚪ Unknown</span>
                    )}
                  </p>
                </div>
                {preview.isCovered && (
                  <div>
                    <p className="text-sm text-gray-600">Data Available</p>
                    <p className="text-lg font-medium text-green-600 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      County records available for this property
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Blurred Map Preview */}
            <Card className="p-6 relative">
              <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-10 flex items-center justify-center rounded-lg">
                <div className="text-center p-8">
                  <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Unlock Full Report</h3>
                  <p className="text-gray-600 mb-4">
                    See exact GPS coordinates, interactive map, system details, and more
                  </p>
                </div>
              </div>
              <div className="blur-sm">
                <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-gray-400" />
                </div>
              </div>
            </Card>

            {/* Upsells */}
            <div>
              <h3 className="text-xl font-bold mb-4">Add More Insights (Optional)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {UPSELLS.map((upsell) => {
                  const Icon = upsell.icon
                  const isSelected = selectedUpsells.includes(upsell.id)
                  return (
                    <Card
                      key={upsell.id}
                      className={`p-4 cursor-pointer transition-all ${
                        isSelected ? 'border-2 border-green-600 bg-green-50' : 'hover:border-gray-400'
                      }`}
                      onClick={() => toggleUpsell(upsell.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-green-600' : 'bg-gray-200'}`}>
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold">{upsell.name}</h4>
                            <span className="font-bold text-green-600">+${upsell.price}</span>
                          </div>
                          <p className="text-sm text-gray-600">{upsell.description}</p>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Purchase CTA */}
            <Card className="p-8 bg-gradient-to-r from-green-600 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Get Your Full Report</h3>
                  <p className="text-green-100 mb-4">
                    Instant access • No account required • Downloadable PDF
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Exact GPS coordinates
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Interactive satellite map
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      System type & permit info
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Age estimate & risk assessment
                    </li>
                  </ul>
                </div>
                <div className="text-right">
                  <p className="text-sm mb-2">Total</p>
                  <p className="text-5xl font-bold mb-4">${calculateTotal()}</p>
                  <Button
                    size="lg"
                    onClick={handlePurchase}
                    disabled={checkoutLoading}
                    className="bg-white text-green-600 hover:bg-gray-100"
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Unlock Report
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Trust Signals */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Trusted by homeowners, realtors, and home inspectors
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Government Data</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Instant Access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Secure Payment</span>
            </div>
          </div>
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
