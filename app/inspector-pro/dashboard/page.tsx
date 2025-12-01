'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Search, FileText, MapPin, Calendar, Download, AlertCircle, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// Mapbox token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export default function InspectorDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [address, setAddress] = useState('')
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentReports, setRecentReports] = useState<any[]>([])

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login?redirect=/inspector-pro/dashboard')
      return
    }

    setUser(user)

    // Check subscription status
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile || profile.subscription_tier !== 'inspector' || profile.subscription_status !== 'active') {
      // Not subscribed to Inspector Pro
      router.push('/inspector-pro')
      return
    }

    setSubscription(profile)

    // Load recent reports (temporarily disabled)
    // loadRecentReports(user.id)

    setLoading(false)
  }

  const loadRecentReports = async (userId: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('usage')
        .select('*')
        .eq('user_id', userId)
        .eq('action', 'inspector_report')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.warn('Failed to load recent reports:', error.message)
        setRecentReports([])
        return
      }

      if (data) {
        setRecentReports(data)
      }
    } catch (err) {
      console.error('Error loading recent reports:', err)
      setRecentReports([])
    }
  }

  const handleAddressSearch = async (query: string) => {
    setAddress(query)
    
    if (query.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${MAPBOX_TOKEN}&` +
        `country=US&` +
        `types=address&` +
        `limit=5&` +
        `autocomplete=true`
      )

      const data = await response.json()
      
      if (data.features) {
        setSuggestions(data.features)
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }

  const handleSelectAddress = (feature: any) => {
    setAddress(feature.place_name)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleGenerateReport = async () => {
    if (!address) {
      setError('Please enter an address')
      return
    }

    setSearching(true)
    setError(null)

    try {
      // Geocode the address
      const geocodeResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?` +
        `access_token=${MAPBOX_TOKEN}&` +
        `country=US&` +
        `types=address&` +
        `limit=1`
      )

      const geocodeData = await geocodeResponse.json()

      if (!geocodeData.features || geocodeData.features.length === 0) {
        setError('Address not found. Please try a different address.')
        setSearching(false)
        return
      }

      const [lng, lat] = geocodeData.features[0].center
      const fullAddress = geocodeData.features[0].place_name

      // Generate the report
      router.push(`/inspector-pro/report?lat=${lat}&lng=${lng}&address=${encodeURIComponent(fullAddress)}`)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to generate report. Please try again.')
      setSearching(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
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
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inspector Pro Dashboard</h1>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/profile">
                <Button variant="outline">Manage Subscription</Button>
              </Link>
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <Card className="p-8 mb-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Generate Septic System Report</h2>
            
            <div className="relative mb-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Enter property address (e.g., 123 Main St, Miami, FL 33147)"
                    value={address}
                    onChange={(e) => handleAddressSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleGenerateReport()}
                    className="pl-10 py-6 text-lg"
                  />
                </div>
                <Button
                  onClick={handleGenerateReport}
                  disabled={searching || !address}
                  className="px-8 py-6 text-lg bg-blue-600 hover:bg-blue-700"
                >
                  {searching ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>

              {/* Address Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectAddress(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                        <div className="text-sm">{suggestion.place_name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <p className="text-sm text-gray-600 text-center mt-4">
              Enter any Florida address to generate a professional septic system report with verified permit data.
            </p>
          </div>
        </Card>

        {/* Recent Reports - Temporarily disabled */}
        {false && (
        <div>
          <h2 className="text-xl font-bold mb-4">Recent Reports</h2>
          
          {recentReports.length === 0 ? (
            <Card className="p-8 text-center text-gray-600">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No reports generated yet. Start by entering an address above.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recentReports.map((report) => (
                <Card key={report.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{report.metadata?.address || 'Unknown Address'}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Link href={`/inspector-pro/report?lat=${report.metadata?.lat}&lng=${report.metadata?.lng}&address=${encodeURIComponent(report.metadata?.address || '')}`}>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        View Report
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  )
}
