'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Search, History, MapPin, Calendar, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ProDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [address, setAddress] = useState('')
  const [searching, setSearching] = useState(false)
  const [jobHistory, setJobHistory] = useState<any[]>([])
  const [usageStats, setUsageStats] = useState<any>(null)

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

      // Load usage stats
      const statsResponse = await fetch(`/api/pro/usage-stats?userId=${userId}`)
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setUsageStats(statsData)
      }

      // Load subscription info
      const subResponse = await fetch(`/api/pro/subscription?userId=${userId}`)
      if (subResponse.ok) {
        const subData = await subResponse.json()
        setSubscription(subData)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const handleSearch = async () => {
    if (!address.trim()) return

    setSearching(true)

    try {
      // Geocode
      const geocodeResponse = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
      const geocodeData = await geocodeResponse.json()

      if (!geocodeResponse.ok) {
        throw new Error('Could not find address')
      }

      // Perform lookup
      const lookupResponse = await fetch('/api/pro/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          address: geocodeData.formatted_address || address,
          lat: geocodeData.lat,
          lng: geocodeData.lng,
        }),
      })

      const lookupData = await lookupResponse.json()

      if (!lookupResponse.ok) {
        throw new Error(lookupData.error || 'Lookup failed')
      }

      // Refresh job history
      await loadDashboardData(user.id)

      // Navigate to results
      router.push(`/pro/result?jobId=${lookupData.jobId}`)
    } catch (error: any) {
      alert(error.message || 'Search failed')
    } finally {
      setSearching(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            TankFindr Pro Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.email}
          </p>
        </div>

        {/* Usage Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-sm text-gray-600 mb-2">Lookups This Month</h3>
            <p className="text-3xl font-bold text-gray-900">
              {usageStats?.lookupsThisMonth || 0}
            </p>
            {subscription?.tier && subscription.tier !== 'enterprise' && (
              <p className="text-sm text-gray-600 mt-2">
                of {subscription.lookupLimit} included
              </p>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-sm text-gray-600 mb-2">Subscription</h3>
            <p className="text-2xl font-bold text-gray-900 capitalize">
              {subscription?.tier || 'None'}
            </p>
            {subscription?.renewsAt && (
              <p className="text-sm text-gray-600 mt-2">
                Renews {new Date(subscription.renewsAt).toLocaleDateString()}
              </p>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-sm text-gray-600 mb-2">Total Jobs</h3>
            <p className="text-3xl font-bold text-gray-900">
              {jobHistory.length}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              All time
            </p>
          </Card>
        </div>

        {/* Quick Search */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quick Tank Lookup
          </h2>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter property address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
              disabled={searching}
            />
            <Button
              onClick={handleSearch}
              disabled={searching || !address.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
            >
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Job History */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5" />
              Recent Jobs
            </h2>
          </div>

          {jobHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No jobs yet. Start by searching for an address above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobHistory.slice(0, 10).map((job: any) => (
                <Link
                  key={job.id}
                  href={`/pro/result?jobId=${job.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <p className="font-semibold text-gray-900">{job.address}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                        {job.result_summary?.classification && (
                          <span className="capitalize">
                            {job.result_summary.classification.replace('_', ' ')}
                          </span>
                        )}
                        {job.result_summary?.confidence && (
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            job.result_summary.confidence === 'high' ? 'bg-emerald-100 text-emerald-800' :
                            job.result_summary.confidence === 'medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {job.result_summary.confidence}
                          </span>
                        )}
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Upgrade CTA */}
        {!subscription && (
          <Card className="p-6 mt-8 bg-emerald-50 border-emerald-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Upgrade to TankFindr Pro
            </h3>
            <p className="text-gray-700 mb-4">
              Get unlimited lookups, job history, and priority support
            </p>
            <Link href="/pricing">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                View Plans
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
