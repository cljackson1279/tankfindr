'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Search, History, MapPin, Calendar, Download, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { checkSubscription, canPerformLookup, type SubscriptionStatus } from '@/lib/subscription'
import Link from 'next/link'

// Get Mapbox token at module level to avoid runtime issues
const MAPBOX_TOKEN = typeof window !== 'undefined' ? (window as any).__NEXT_DATA__?.props?.pageProps?.env?.NEXT_PUBLIC_MAPBOX_TOKEN : process.env.NEXT_PUBLIC_MAPBOX_TOKEN

export default function ProDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [address, setAddress] = useState('')
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login?redirect=/pro')
      return
    }

    setUser(user)

    // Admin bypass - skip subscription check for admin
    const isAdmin = user.email === 'cljackson79@gmail.com'

    if (isAdmin) {
      // Admin has full access without subscription
      setSubscription({
        isActive: true,
        tier: 'enterprise',
        lookupsUsed: 0,
        lookupsLimit: -1,
        isUnlimited: true,
        billingPeriodStart: null,
        billingPeriodEnd: null,
      })
      await loadDashboardData(user.id)
      setLoading(false)
      return
    }

    // Check subscription status for non-admin users
    const subStatus = await checkSubscription(user.id)
    setSubscription(subStatus)

    if (!subStatus.isActive) {
      // No active subscription - redirect to pricing
      router.push('/pricing-pro?reason=no_subscription')
      return
    }

    await loadDashboardData(user.id)
    setLoading(false)
  }

  const loadDashboardData = async (userId: string) => {
    try {
      // Load job history
      const historyResponse = await fetch(`/api/pro/job-history?userId=${userId}`)
      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        setJobs(historyData.jobs || [])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
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

  const handleSearch = async () => {
    if (!address.trim()) {
      setError('Please enter an address')
      return
    }

    if (!user) return

    setSearching(true)
    setError(null)

    try {
      // Check if user can perform lookup
      console.log('Checking permission for user:', user.id, user.email)
      const permission = await canPerformLookup(user.id, user.email)
      console.log('Permission result:', permission)

      if (!permission.allowed) {
        setError(permission.reason || 'Cannot perform lookup')
        setSearching(false)
        return
      }

      // First geocode the address
      const geocodeResponse = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })

      const geocodeData = await geocodeResponse.json()

      if (!geocodeResponse.ok || !geocodeData.lat || !geocodeData.lng) {
        throw new Error('Failed to geocode address')
      }

      // Perform lookup with geocoded coordinates
      const response = await fetch('/api/pro/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          address,
          lat: geocodeData.lat,
          lng: geocodeData.lng,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Lookup failed')
      }

      // Show result
      const tankInfo = data.tankPoint
        ? `Tank found ${data.distance ? Math.round(data.distance) + 'm away' : 'nearby'}\nConfidence: ${data.confidence}%`
        : `Classification: ${data.classification}\nConfidence: ${data.confidence}%`
      alert(tankInfo)

      // Reload job history
      await loadDashboardData(user.id)

      // Reload subscription to update usage
      const newSub = await checkSubscription(user.id)
      setSubscription(newSub)

      setAddress('')
    } catch (error: any) {
      setError(error.message || 'Failed to perform lookup')
    } finally {
      setSearching(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            TankFindr Pro
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button variant="ghost">Account</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Usage Stats */}
        {subscription && (
          <Card className="p-6 mb-8">
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Plan</p>
                <p className="text-2xl font-bold capitalize">{subscription.tier}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Lookups Used</p>
                <p className="text-2xl font-bold">
                  {subscription.lookupsUsed}
                  {!subscription.isUnlimited && ` / ${subscription.lookupsLimit}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Lookups Remaining</p>
                <p className="text-2xl font-bold">
                  {subscription.isUnlimited
                    ? 'Unlimited'
                    : subscription.lookupsLimit - subscription.lookupsUsed}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Search */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Tank Lookup</h2>
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
                    handleSearch()
                  }
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      <div className="font-medium text-sm">{suggestion.text}</div>
                      <div className="text-xs text-gray-600">{suggestion.place_name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={handleSearch}
              disabled={searching || !address.trim()}
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Locate Tank'}
            </Button>
          </div>
        </Card>

        {/* Job History */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Lookups</h2>
          {jobs.length === 0 ? (
            <p className="text-gray-600">No lookups yet. Start by searching an address above.</p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="border-b pb-4 last:border-b-0">
                  <p className="font-medium">{job.address}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(job.created_at).toLocaleDateString()} at {new Date(job.created_at).toLocaleTimeString()}
                  </p>
                  {job.result_summary && (
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                        {job.result_summary.classification}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
