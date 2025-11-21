'use client'

import { useState, useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { AlertCircle, CheckCircle, Navigation, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TankResult {
  lat: number
  lng: number
  confidence: number
  depth: number
}

export default function TankLocator() {
  const [address, setAddress] = useState('')
  const [result, setResult] = useState<TankResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!error && data) {
      setProfile(data)
    }
  }

  const handleLocate = async () => {
    if (!address.trim()) {
      setError('Please enter an address')
      return
    }

    setLoading(true)
    setError('')

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

      setResult(data)

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
    if (!result) return
    const url = `https://www.google.com/maps/dir/?api=1&destination=${result.lat},${result.lng}`
    window.open(url, '_blank')
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getConfidenceMessage = (score: number) => {
    if (score >= 90) return 'High accuracy - trust this location'
    if (score >= 70) return 'Medium accuracy - probe suggested area'
    return 'Low accuracy - manual verification needed'
  }

  const getUsageDisplay = () => {
    if (!profile) return 'Loading...'
    
    if (profile.subscription_status === 'trialing') {
      return `${profile.trial_locates_used || 0}/5 free locates used`
    }
    
    const tier = profile.subscription_tier
    const tiers: any = {
      starter: 10,
      pro: 40,
      enterprise: 150
    }
    
    const limit = tiers[tier] || 10
    const used = profile.monthly_locates_used || 0
    
    return `${used}/${limit} locates used this month`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              TF
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TankFindr</h1>
              <p className="text-xs text-gray-500">AI Septic Tank Locator</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {getUsageDisplay()}
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 mx-4 mt-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0" />
      </div>

      {/* Controls */}
      <div className="bg-white p-4 border-t border-gray-200 space-y-4">
        <Input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter property address..."
          className="input-field text-lg min-h-[60px]"
          onKeyDown={(e) => e.key === 'Enter' && handleLocate()}
        />

        <Button
          onClick={handleLocate}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Locating...
            </>
          ) : (
            'LOCATE TANK'
          )}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white border-t-2 border-emerald-600 p-4 space-y-4">
          <div className={`card border-2 ${getConfidenceColor(result.confidence)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {result.confidence >= 90 ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <AlertCircle className="w-6 h-6" />
                )}
                <span className="font-bold">Confidence Score</span>
              </div>
              <span className="text-2xl font-bold">{result.confidence}%</span>
            </div>
            <p className="text-sm mt-2">
              {getConfidenceMessage(result.confidence)}
            </p>
          </div>

          <div className="card space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Depth Estimate</span>
              <span className="font-bold">{result.depth.toFixed(1)} ft</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Coordinates</span>
              <span className="font-mono text-sm">
                {result.lat.toFixed(5)}, {result.lng.toFixed(5)}
              </span>
            </div>
          </div>

          <Button
            onClick={openGoogleMaps}
            className="btn-secondary w-full flex items-center justify-center gap-2"
            variant="secondary"
          >
            <Navigation className="w-5 h-5" />
            Open in Google Maps
          </Button>
        </div>
      )}
    </div>
  )
}
