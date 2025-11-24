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

export default function ProDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [address, setAddress] = useState('')
  const [searching, setSearching] = useState(false)
  const [jobHistory, setJobHistory] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

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
        setJobHistory(historyData.jobs || [])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
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
      const permission = await canPerformLookup(user.id)

      if (!permission.allowed) {
        setError(permission.reason || 'Cannot perform lookup')
        setSearching(false)
        return
      }

      // Perform lookup
      const response = await fetch('/api/pro/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Lookup failed')
      }

      // Show result
      alert(`Found tank at: ${data.result.lat}, ${data.result.lng}\nConfidence: ${data.result.confidence}%`)

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
            <Input
              placeholder="Enter property address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Locate Tank
                </>
              )}
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </Card>

        {/* Job History */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Lookups
          </h2>
          {jobHistory.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No lookups yet. Start by searching for an address above.
            </p>
          ) : (
            <div className="space-y-4">
              {jobHistory.slice(0, 10).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{job.address}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(job.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {job.result?.confidence}% confidence
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
