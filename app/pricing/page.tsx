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
    locates: 10,
    overage: 8,
    features: [
      '10 tank locates per month',
      'AI-powered satellite analysis',
      'Confidence scoring system',
      'Google Maps integration',
      'Offline cache (last 50 searches)',
      '$8 per additional locate'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 249,
    locates: 40,
    overage: 6,
    popular: true,
    features: [
      '40 tank locates per month',
      'AI-powered satellite analysis',
      'Confidence scoring system',
      'Google Maps integration',
      'Offline cache (last 50 searches)',
      'Priority support',
      '$6 per additional locate'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 599,
    locates: 150,
    overage: 4,
    features: [
      '150 tank locates per month',
      'AI-powered satellite analysis',
      'Confidence scoring system',
      'Google Maps integration',
      'Offline cache (last 50 searches)',
      'Priority support',
      'Dedicated account manager',
      'Custom integrations',
      '$4 per additional locate'
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
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Find septic tanks in 5 minutes with AI-powered satellite imagery
          </p>
          <p className="text-lg text-emerald-600 font-semibold">
            🎉 Start with 5 free locates OR 7 days free trial - whichever comes first!
          </p>
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
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-5xl font-bold text-gray-900">
                    ${tier.price}
                  </span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <p className="text-sm text-gray-600">
                  {tier.locates} locates included
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

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">How does the trial work?</h3>
              <p className="text-gray-700">
                You get 5 free tank locates OR 7 days of access - whichever comes first. 
                Credit card required at signup, but you won't be charged until your trial ends.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">What happens if I exceed my monthly locates?</h3>
              <p className="text-gray-700">
                You'll be charged per additional locate: $8 for Starter, $6 for Pro, or $4 for Enterprise. 
                You can upgrade anytime to get more included locates and lower overage rates.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-700">
                Yes! Cancel anytime from your account settings. You'll keep access until the end of your billing period.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">How accurate is the AI?</h3>
              <p className="text-gray-700">
                Our AI analyzes high-resolution satellite imagery and provides a confidence score for each locate. 
                High confidence (80%+) results are typically within 3-5 feet of the actual tank location.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
