'use client'

import { useState, useEffect, Suspense } from 'react'
import { Check, Zap, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 79,
    lookups: 100,
    description: 'Perfect for small septic companies or individual contractors',
    features: [
      '100 tank lookups per month',
      'GPS-accurate locations',
      'Job history tracking',
      'Basic reporting',
      'Email support',
      'Mobile-friendly dashboard',
    ],
    cta: 'Start 7-Day Free Trial',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 159,
    lookups: 300,
    description: 'For growing septic businesses with multiple technicians',
    features: [
      '300 tank lookups per month',
      'Everything in Starter, plus:',
      'Priority support',
      'Advanced analytics',
      'Multi-user access (up to 5 users)',
    ],
    cta: 'Start 7-Day Free Trial',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 279,
    lookups: -1,
    description: 'For large septic companies with high-volume needs',
    features: [
      'Unlimited tank lookups',
      'Everything in Pro, plus:',
      'Custom integrations',
      'Up to 10 users',
      'Phone support',
      'Custom reporting',
      'API access',
    ],
    cta: 'Start 7-Day Free Trial',
    popular: false,
  },
]

function PricingProContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    checkAuth()
  }, [])
  
  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    // If user just logged in and there's a plan in URL, auto-trigger checkout
    if (user && searchParams?.get('plan')) {
      const planId = searchParams.get('plan')
      if (planId) {
        handleSubscribe(planId)
      }
    }
  }

  const handleSubscribe = async (planId: string) => {
    // Check if user is logged in
    if (!user) {
      // Redirect to login with plan in URL
      router.push(`/auth/login?redirect=/pricing-pro?plan=${planId}`)
      return
    }
    
    setLoading(planId)

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/create-subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        // If still not authenticated (shouldn't happen), redirect to login
        if (response.status === 401) {
          router.push(`/auth/login?redirect=/pricing-pro?plan=${planId}`)
          return
        }
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error: any) {
      console.error('Subscription error:', error)
      alert(error.message || 'Failed to start subscription. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            TankFindr Pro
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4">
          Locate Septic Tanks <span className="text-blue-600">10x Faster</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          TankFindr Pro gives septic companies instant access to GPS-accurate tank locations from government records. 
          Reduce digging time, increase jobs per day, and boost revenue per technician.
        </p>
        <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span>2.3M+ Tanks Mapped</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span>12 States Covered</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span>Government Data</span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`p-8 relative ${
                plan.popular ? 'border-2 border-blue-600 shadow-xl' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="mb-2">
                  <span className="text-5xl font-bold">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-blue-600 font-semibold text-sm mb-1">7-Day Free Trial</p>
                <p className="text-sm text-gray-600">
                  {plan.lookups === -1
                    ? 'Unlimited lookups'
                    : `${plan.lookups.toLocaleString()} lookups/month`}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                size="lg"
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                variant={plan.popular ? 'default' : 'outline'}
              >
                {loading === plan.id ? 'Loading...' : user ? plan.cta : 'Sign Up & Start Free Trial'}
              </Button>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-gray-600 mt-8">
          Cancel anytime. No long-term contracts required.
        </p>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Septic Companies Choose TankFindr Pro
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Save Time</h3>
            <p className="text-gray-600">
              Reduce tank location time from 30+ minutes to under 2 minutes. More jobs per day.
            </p>
          </div>
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Increase Revenue</h3>
            <p className="text-gray-600">
              Complete 2-3 more jobs per day. ROI in the first week for most companies.
            </p>
          </div>
          <div className="text-center">
            <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Scale Your Business</h3>
            <p className="text-gray-600">
              Multi-user access and job tracking help you manage growing teams efficiently.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to 10x Your Efficiency?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Join hundreds of septic companies using TankFindr Pro
        </p>
        <Button size="lg" onClick={() => handleSubscribe('pro')}>
          Start Free Trial
        </Button>
      </section>
    </div>
  )
}

export default function PricingProPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing...</p>
        </div>
      </div>
    }>
      <PricingProContent />
    </Suspense>
  )
}
