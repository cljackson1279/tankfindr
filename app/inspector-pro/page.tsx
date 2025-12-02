'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, FileText, MapPin, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function InspectorProPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/auth/login?redirect=/inspector-pro')
      return
    }

    setLoading(true)

    try {
      // Create Stripe checkout session for Inspector Pro
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: 'inspector',
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        alert(error)
        setLoading(false)
        return
      }

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url
      } else {
        alert('Failed to create checkout session')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            TankFindr Inspector Pro
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional septic system reports for home inspectors. Unlimited searches with transparent data quality indicators — verified permits and estimated records clearly labeled.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto mb-16">
          <Card className="p-8 border-2 border-blue-500 shadow-xl">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                $79
                <span className="text-2xl text-gray-600 font-normal">/month</span>
              </div>
              <p className="text-blue-600 font-semibold mb-1">7-Day Free Trial</p>
              <p className="text-gray-600 text-sm">Then $79/month • Unlimited Reports • Cancel Anytime</p>
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold mb-6"
            >
              {loading ? 'Loading...' : user ? 'Start 7-Day Free Trial' : 'Sign Up & Start Free Trial'}
            </Button>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Unlimited Septic Reports</p>
                  <p className="text-sm text-gray-600">Generate as many reports as you need</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Transparent Data Quality</p>
                  <p className="text-sm text-gray-600">Verified permits where available, estimated records for comprehensive coverage</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Tank Location Maps</p>
                  <p className="text-sm text-gray-600">GPS coordinates with accuracy indicators</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Flood Zone Information</p>
                  <p className="text-sm text-gray-600">FEMA flood zone data for every property</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Professional PDF Reports</p>
                  <p className="text-sm text-gray-600">Client-ready reports with your logo</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Comprehensive Coverage</p>
                  <p className="text-sm text-gray-600">2.1M+ septic records with quality indicators across multiple states</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6">
            <FileText className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Verified Data</h3>
            <p className="text-gray-600">
              All data comes from official county permit records and state GIS databases. Every field is labeled as Verified, Inferred, or Estimated.
            </p>
          </Card>

          <Card className="p-6">
            <MapPin className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Precise Locations</h3>
            <p className="text-gray-600">
              GPS coordinates from county GIS data help you locate septic tanks quickly during inspections.
            </p>
          </Card>

          <Card className="p-6">
            <Zap className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Instant Reports</h3>
            <p className="text-gray-600">
              Generate professional PDF reports in seconds. Perfect for including in your inspection deliverables.
            </p>
          </Card>
        </div>

        {/* What's Included Section */}
        <div className="bg-white rounded-lg p-8 shadow-lg mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">What's Included in Every Report</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3 text-blue-600">✓ Verified Information</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Septic system presence confirmation</li>
                <li>• System type (OSTDS, Repair, Abandonment, etc.)</li>
                <li>• Permit number and approval date</li>
                <li>• System capacity (GPD rating)</li>
                <li>• Property address and parcel ID</li>
                <li>• GPS coordinates (latitude/longitude)</li>
                <li>• Lot size and property type</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3 text-blue-600">✓ Inferred Information</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Estimated tank size (based on GPD)</li>
                <li>• System age (calculated from permit date)</li>
                <li>• Flood zone classification (FEMA data)</li>
                <li>• Water supply type</li>
                <li>• Distance from property address</li>
                <li>• Cardinal direction from home</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to streamline your inspections?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join home inspectors nationwide who trust TankFindr for accurate septic data.
          </p>
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-lg font-semibold"
          >
            {loading ? 'Loading...' : 'Start Your Subscription'}
          </Button>
        </div>
      </div>
    </div>
  )
}
