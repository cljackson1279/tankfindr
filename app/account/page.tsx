'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, User, CreditCard, LogOut, AlertCircle, CheckCircle, ArrowUpCircle, ArrowDownCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { checkSubscription, type SubscriptionStatus } from '@/lib/subscription'
import Link from 'next/link'

export default function AccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [canceling, setCanceling] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadAccountData()
  }, [])

  const loadAccountData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login?redirect=/account')
      return
    }

    setUser(user)

    // Check subscription status
    const subStatus = await checkSubscription(user.id)
    setSubscription(subStatus)
    setLoading(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to TankFindr Pro features at the end of your current billing period.')) {
      return
    }

    setCanceling(true)
    setMessage(null)

    try {
      const response = await fetch('/api/pro/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      setMessage({ type: 'success', text: 'Subscription cancelled. You will retain access until the end of your billing period.' })

      // Reload subscription data
      await loadAccountData()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to cancel subscription' })
    } finally {
      setCanceling(false)
    }
  }

  const handleUpgradeDowngrade = (targetTier: string) => {
    // Redirect to pricing page with current tier info
    router.push(`/pricing-pro?current=${subscription?.tier}&target=${targetTier}`)
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
            TankFindr
          </Link>
          <div className="flex items-center gap-4">
            {subscription?.isActive && (
              <Link href="/pro">
                <Button variant="ghost">Pro Dashboard</Button>
              </Link>
            )}
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg border flex items-start gap-2 ${
            message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </p>
          </div>
        )}

        {/* User Info */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Account Information</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </Card>

        {/* Subscription Info */}
        {subscription?.isActive ? (
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold">Subscription</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Current Plan</p>
                <p className="text-xl font-bold capitalize">{subscription.tier}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-xl font-bold text-green-600">Active</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Lookups Used</p>
                <p className="text-xl font-bold">
                  {subscription.lookupsUsed}
                  {!subscription.isUnlimited && ` / ${subscription.lookupsLimit}`}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Remaining</p>
                <p className="text-xl font-bold">
                  {subscription.isUnlimited ? 'Unlimited' : subscription.lookupsLimit - subscription.lookupsUsed}
                </p>
              </div>
            </div>

            {/* Upgrade/Downgrade Options */}
            <div className="space-y-3 mb-6">
              <h3 className="font-semibold text-gray-900">Change Plan</h3>

              {subscription.tier !== 'pro' && (
                <Button
                  onClick={() => handleUpgradeDowngrade('pro')}
                  variant="outline"
                  className="w-full justify-start border-blue-200 hover:bg-blue-50"
                >
                  <ArrowUpCircle className="w-4 h-4 mr-2 text-blue-600" />
                  {subscription.tier === 'starter' ? 'Upgrade to Pro ($249/mo)' : 'Change to Pro ($249/mo)'}
                </Button>
              )}

              {subscription.tier !== 'enterprise' && (
                <Button
                  onClick={() => handleUpgradeDowngrade('enterprise')}
                  variant="outline"
                  className="w-full justify-start border-purple-200 hover:bg-purple-50"
                >
                  <ArrowUpCircle className="w-4 h-4 mr-2 text-purple-600" />
                  {subscription.tier === 'pro' ? 'Upgrade to Enterprise ($599/mo)' : 'Upgrade to Enterprise ($599/mo)'}
                </Button>
              )}

              {subscription.tier !== 'starter' && (
                <Button
                  onClick={() => handleUpgradeDowngrade('starter')}
                  variant="outline"
                  className="w-full justify-start border-gray-200 hover:bg-gray-50"
                >
                  <ArrowDownCircle className="w-4 h-4 mr-2 text-gray-600" />
                  Downgrade to Starter ($99/mo)
                </Button>
              )}
            </div>

            {/* Cancel Subscription */}
            <Button
              onClick={handleCancelSubscription}
              disabled={canceling}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              {canceling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Canceling...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Subscription
                </>
              )}
            </Button>
          </Card>
        ) : (
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-6 h-6 text-gray-400" />
              <h2 className="text-xl font-bold">Subscription</h2>
            </div>
            <p className="text-gray-600 mb-4">You don't have an active subscription.</p>
            <Link href="/pricing-pro">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                View Pro Plans
              </Button>
            </Link>
          </Card>
        )}

        {/* Professional Profile Link */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-2">Professional Profile</h2>
          <p className="text-gray-600 mb-4">
            Add your certification info to generate professional compliance reports.
          </p>
          <Link href="/profile">
            <Button variant="outline" className="w-full">
              Edit Profile
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
