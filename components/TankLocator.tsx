'use client'

import { useState, useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { AlertCircle, CheckCircle, Navigation, Loader2, TrendingUp, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import ComplianceReportButton from './ComplianceReportButton'

interface TankResult {
  lat: number
  lng: number
  confidence: number
  depth: number
  tankId?: string
}

const TIERS = {
  starter: { name: 'Starter', locates: 10, overage: 8, price: 99 },
  pro: { name: 'Pro', locates: 40, overage: 6, price: 249 },
  enterprise: { name: 'Enterprise', locates: 150, overage: 4, price: 599 }
}

export default function TankLocator() {
  const [address, setAddress] = useState('')
  const [result, setResult] = useState<TankResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [showOverageWarning, setShowOverageWarning] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
    
    // Check if returning from successful report purchase
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('report') === 'success') {
      // Could show a success message here
    }
  }, [])

  useEffect(() => {
    if (!mapContainerRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [-98.5795, 39.8283], // Center of USA
      zoom: 4
    })

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    return () => {
      mapRef.current?.remove()
    }
  }, [])

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .single()

    if (!error && data) {
      setProfile(data)
    }
  }

  const getUsageInfo = () => {
    if (!profile) return null

    if (profile.subscription_status === 'trialing') {
      const used = profile.trial_locates_used || 0
      const limit = 5
      return {
        used,
        limit,
        remaining: limit - used,
        isOverage: false,
        isTrial: true,
        hasSubscription: false
      }
    }

    const tier = TIERS[profile.subscription_tier as keyof typeof TIERS]
    if (!tier) return null

    const used = profile.monthly_locates_used || 0
    const limit = tier.locates
    
    return {
      used,
      limit,
      remaining: Math.max(0, limit - used),
      isOverage: used >= limit,
      isTrial: false,
      tierName: tier.name,
      overageRate: tier.overage,
      hasSubscription: profile.subscription_status === 'active'
    }
  }

  const getNextTier = () => {
    if (!profile) return null
    
    const currentTier = profile.subscription_tier
    if (currentTier === 'starter') return { tier: 'pro', ...TIERS.pro }
    if (currentTier === 'pro') return { tier: 'enterprise', ...TIERS.enterprise }
    return null
  }

  const handleLocate = async (confirmOverage = false) => {
    if (!address.trim()) {
      setError('Please enter an address')
      return
    }

    const usage = getUsageInfo()
    
    // If trial user hits limit, redirect to pricing
    if (usage && usage.isTrial && usage.used >= usage.limit) {
      setError('You\'ve used all 5 free trial locates. Please subscribe to continue.')
      setTimeout(() => {
        window.location.href = '/pricing'
      }, 2000)
      return
    }
    
    // Check if user is about to go into overage
    if (usage && usage.isOverage && !confirmOverage && !usage.isTrial) {
      setShowOverageWarning(true)
      return
    }

    setLoading(true)
    setError('')
    setShowOverageWarning(false)

    try {
      const response = await fetch('/api/locate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to locate tank')
      }

      setResult({ ...data, tankId: data.tankId })

      // Update map
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [data.lng, data.lat],
          zoom: 18,
          duration: 2000
        })

        // Remove old marker if exists
        if (markerRef.current) {
          markerRef.current.remove()
        }

        // Add new marker
        markerRef.current = new mapboxgl.Marker({ color: '#10B981' })
          .setLngLat([data.lng, data.lat])
          .addTo(mapRef.current)
      }

      // Refresh profile to update counts
      await fetchProfile()
    } catch (err: any) {
      setError(err.message || 'Failed to locate tank')
    } finally {
      setLoading(false)
    }
  }

  const openGoogleMaps = () => {
    if (result) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${result.lat},${result.lng}`
      window.open(url, '_blank')
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High Confidence'
    if (confidence >= 60) return 'Medium Confidence'
    return 'Low Confidence'
  }

  const usage = getUsageInfo()
  const nextTier = getNextTier()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Usage Stats */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">TankFindr</h1>
            <div className="flex gap-3">
              <Link href="/profile">
                <Button variant="outline">Profile</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline">Manage Subscription</Button>
              </Link>
            </div>
          </div>

          {/* Usage Counter */}
          {usage && (
            <Card className="p-4 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {usage.isTrial ? 'Trial Locates' : `${usage.tierName} Plan Locates`}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {usage.used} / {usage.limit}
                    {usage.isOverage && (
                      <span className="text-lg text-orange-600 ml-2">
                        (+{usage.used - usage.limit} overage)
                      </span>
                    )}
                  </p>
                  {!usage.isTrial && usage.isOverage && (
                    <p className="text-sm text-orange-600 mt-1">
                      ${usage.overageRate} per additional locate
                    </p>
                  )}
                </div>
                
                {usage.remaining > 0 && usage.remaining <= 3 && !usage.isTrial && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {usage.remaining} locate{usage.remaining !== 1 ? 's' : ''} remaining
                    </span>
                  </div>
                )}

                {usage.isOverage && nextTier && (
                  <Link href="/pricing">
                    <Button variant="default" className="gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Upgrade to {nextTier.name}
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Overage Warning Modal */}
        {showOverageWarning && usage && (
          <Card className="mb-6 p-6 bg-orange-50 border-orange-200">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  You've reached your monthly limit
                </h3>
                <p className="text-gray-700 mb-4">
                  You've used all {usage.limit} locates included in your {usage.tierName} plan. 
                  Continuing will charge <strong>${usage.overageRate}</strong> per additional locate.
                </p>
                
                {nextTier && (
                  <div className="bg-white p-4 rounded-lg mb-4 border border-orange-200">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>💡 Save money:</strong> Upgrade to {nextTier.name} for:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• {nextTier.locates} locates per month</li>
                      <li>• Only ${nextTier.overage} per overage (vs ${usage.overageRate})</li>
                      <li>• ${nextTier.price}/month</li>
                    </ul>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleLocate(true)}
                    variant="default"
                    disabled={loading}
                  >
                    Continue & Charge ${usage.overageRate}
                  </Button>
                  {nextTier && (
                    <Link href="/pricing">
                      <Button variant="outline">
                        Upgrade to {nextTier.name}
                      </Button>
                    </Link>
                  )}
                  <Button
                    onClick={() => setShowOverageWarning(false)}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Search and Results */}
          <div className="space-y-6">
            {/* Search Card */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Locate Septic Tank</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Address
                  </label>
                  <Input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, City, State ZIP"
                    className="input-field"
                    onKeyPress={(e) => e.key === 'Enter' && handleLocate()}
                  />
                </div>

                <Button
                  onClick={() => handleLocate()}
                  disabled={loading || !address.trim()}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing Satellite Imagery...
                    </>
                  ) : (
                    'Locate Tank'
                  )}
                </Button>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Results Card */}
            {result && (
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Tank Located!</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Confidence Score</p>
                      <p className={`text-2xl font-bold ${getConfidenceColor(result.confidence)}`}>
                        {result.confidence}%
                      </p>
                      <p className={`text-sm ${getConfidenceColor(result.confidence)}`}>
                        {getConfidenceLabel(result.confidence)}
                      </p>
                    </div>
                    {result.confidence >= 80 ? (
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    ) : (
                      <AlertCircle className="h-12 w-12 text-yellow-600" />
                    )}
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Estimated Depth</p>
                    <p className="text-xl font-bold text-gray-900">{result.depth} feet</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">GPS Coordinates</p>
                    <p className="text-sm font-mono text-gray-900">
                      {result.lat.toFixed(6)}, {result.lng.toFixed(6)}
                    </p>
                  </div>

                  <Button
                    onClick={openGoogleMaps}
                    className="btn-primary w-full gap-2"
                  >
                    <Navigation className="h-5 w-5" />
                    Navigate with Google Maps
                  </Button>

                  {/* Compliance Report Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <ComplianceReportButton
                      tankData={{
                        address,
                        lat: result.lat,
                        lng: result.lng,
                        confidence: result.confidence,
                        depth: result.depth,
                        technician: profile?.technician_name || 'Certified Technician',
                        license: profile?.license_number || 'Pending',
                        company: profile?.company_name || 'Your Company'
                      }}
                      onPurchase={async () => {
                        const { data: { user } } = await supabase.auth.getUser()
                        if (!user) throw new Error('Not authenticated')
                        
                        const response = await fetch('/api/report/generate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            userId: user.id,
                            tankId: result.tankId,
                            address,
                            lat: result.lat,
                            lng: result.lng,
                            confidence: result.confidence,
                            depth: result.depth
                          })
                        })
                        
                        return await response.json()
                      }}
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Map */}
          <div className="lg:sticky lg:top-6 h-[600px]">
            <Card className="p-0 h-full overflow-hidden">
              <div ref={mapContainerRef} className="w-full h-full" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
