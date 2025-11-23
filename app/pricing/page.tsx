'use client'

import { useState, useEffect } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const tiers = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    locates: 300,
    description: 'For small septic companies (1 truck)',
    features: [
      '300 lookups per month',
      'Real county septic records',
      'GPS-accurate tank locations',
      'Confidence scoring system',
      'Google Maps integration',
      'Basic tank locator',
      '"Likely location" estimates'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 249,
    locates: 1500,
    popular: true,
    description: 'For companies with multiple trucks',
    features: [
      '1,500 lookups per month',
      'Real county septic records',
      'GPS-accurate tank locations',
      'Up to 5 users',
      'PDF tank location reports',
      'Job history tracking',
      'Confidence scoring',
      'Priority support'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 599,
    locates: 'Unlimited',
    description: 'For regional multi-county operators',
    features: [
      'Unlimited lookups',
      'Real county septic records',
      'GPS-accurate tank locations',
      'Unlimited technicians',
      'Multi-county coverage',
      'API access (future)',
      'White label reports',
      'On-site field support',
      'Dedicated account manager'
    ]
  }
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)
  }

  const handleSubscribe = async (tierId: string) => {
    setLoading(tierId)

    try {
      // Check if user is authenticated
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Redirect to sign up with return URL
        router.push(`/auth/sign-up?redirect=/pricing&tier=${tierId}`)
        return
      }

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect directly to Stripe Checkout URL
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Failed to start checkout')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            TankFindr Pro for Septic Companies
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Real county septic records • GPS-accurate locations • 2M+ tanks mapped
          </p>
          <p className="text-lg text-emerald-600 font-semibold">
            🎉 Try 1-2 free lookups before subscribing!
          </p>
        </div>

        {/* Coverage Badge */}
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-6 py-3">
            <p className="text-blue-900 font-semibold">
              📍 Now covering: Florida (all 67 counties), California, Virginia, New Mexico, North Carolina, and 7 more states
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {tiers.map((tier) => (
            <Card
              key={tier.id}
              className={`p-8 relative ${
                tier.popular
                  ? 'border-2 border-emerald-600 shadow-xl'
                  : 'border border-gray-200'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {tier.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {tier.description}
                </p>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-5xl font-bold text-gray-900">
                    ${tier.price}
                  </span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <p className="text-sm text-gray-600">
                  {typeof tier.locates === 'number' 
                    ? `${tier.locates} lookups/month` 
                    : tier.locates}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(tier.id)}
                disabled={loading !== null}
                className="w-full min-h-[60px] text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading === tier.id ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Start ${tier.name} Plan`
                )}
              </Button>
            </Card>
          ))}
        </div>

        {/* Value Proposition */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">
            Why Septic Companies Choose TankFindr
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold mb-2">Save Time</h3>
              <p className="text-gray-600">
                Find tanks in seconds, not hours. No more digging blind or calling county offices.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-bold mb-2">Reduce Costs</h3>
              <p className="text-gray-600">
                Less time digging = more jobs per day. ROI in the first week for most companies.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-bold mb-2">Real Data</h3>
              <p className="text-gray-600">
                GPS coordinates from actual county records, not AI guesses. 90%+ accuracy.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">How does this work with real county data?</h3>
              <p className="text-gray-700">
                We've integrated official county GIS databases with 2M+ septic tank records. When you search an address, 
                we query these databases and return the exact GPS coordinates from county permit records.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">What if my county isn't covered?</h3>
              <p className="text-gray-700">
                We're adding new counties every week! Request your county and we'll prioritize it. 
                Currently covering Florida (all 67 counties), California, Virginia, and 9 more states.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-700">
                Yes! Cancel anytime from your account settings. You'll keep access until the end of your billing period.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">How accurate are the locations?</h3>
              <p className="text-gray-700">
                High confidence locations (from county tank surveys) are accurate to within 5-15 meters. 
                Medium confidence (parcel-based) are within 30-50 meters. We show confidence level for every result.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">What about unlimited lookups on Enterprise?</h3>
              <p className="text-gray-700">
                Enterprise includes unlimited lookups because we monitor usage and work directly with you. 
                Perfect for large companies doing 200+ lookups per day across multiple counties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
