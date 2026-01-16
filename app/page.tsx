'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Building2, Home, TrendingUp, Zap, Shield, CheckCircle, ArrowRight, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import SewerOrSepticWidget from '@/components/SewerOrSepticWidget'

const COVERAGE_STATES = [
  {
    name: 'Florida',
    counties: ['Miami-Dade', 'All 67 Counties'],
    records: '2.1M+',
  },
  {
    name: 'New Mexico',
    counties: ['Statewide Coverage'],
    records: '60K+',
  },
  {
    name: 'Virginia',
    counties: ['Fairfax County'],
    records: '44K+',
  },
  {
    name: 'California',
    counties: ['Sonoma County'],
    records: '33K+',
  },
]

export default function HomePage() {
  const [activePath, setActivePath] = useState<'pro' | 'inspector' | 'consumer' | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-green-600">
            TankFindr
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/coverage" className="text-gray-600 hover:text-gray-900">
              Coverage
            </Link>
            <Link href="/pricing-pro" className="text-gray-600 hover:text-gray-900">
              For Contractors
            </Link>
            <Link href="/inspector-pro" className="text-purple-600 hover:text-purple-900 font-medium">
              For Inspectors
            </Link>
            <Link href="/faq" className="text-gray-600 hover:text-gray-900">
              FAQ
            </Link>
            {!isLoggedIn ? (
              <Link href="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            ) : (
              <>
                <Link href="/pro">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/account">
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={async () => {
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    window.location.reload()
                  }}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Septic Tank Locator<br />
          <span className="text-green-600">
            Find Your Septic Tank Instantly
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-4 max-w-4xl mx-auto">
          Looking for a <strong>septic tank locator</strong>? TankFindr is the #1 septic tank finder tool with 2.3M+ verified septic system locations across 12 states. 
        </p>
        <p className="text-lg text-gray-600 mb-8 max-w-4xl mx-auto">
          Whether you're a contractor, home inspector, or homeowner asking <strong>"where is my septic tank?"</strong>, we provide instant GPS coordinates from government permit records. Find your septic tank location in seconds with transparent data quality indicators.
        </p>
        <div className="flex items-center justify-center gap-8 text-sm text-gray-600 mb-12">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>2.3M+ Tanks Mapped</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>12 States Covered</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Transparent Quality Indicators</span>
          </div>
        </div>
      </section>

      {/* Choose Your Path */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Choose Your Path
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Pro Path */}
          <Card
            className={`p-8 cursor-pointer transition-all hover:shadow-xl ${
              activePath === 'pro' ? 'border-2 border-blue-600 shadow-xl' : ''
            }`}
            onMouseEnter={() => setActivePath('pro')}
            onMouseLeave={() => setActivePath(null)}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">For Septic Companies</h3>
              <p className="text-gray-600">Subscription Plans</p>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-center text-gray-700">
                Locate septic tanks faster. Improve job efficiency. Reduce digging time. Increase revenue per technician.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm">300-1,500+ lookups per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm">Job history & analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm">Multi-user team access</span>
                </li>
              </ul>
            </div>

            <Link href="/pricing-pro">
              <Button className="w-full" size="lg">
                Start Pro Subscription
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-center text-sm text-gray-600 mt-4">
              From $79/month
            </p>
          </Card>

          {/* Inspector Pro Path */}
          <Card
            className={`p-8 cursor-pointer transition-all hover:shadow-xl ${
              activePath === 'inspector' ? 'border-2 border-purple-600 shadow-xl' : ''
            }`}
            onMouseEnter={() => setActivePath('inspector')}
            onMouseLeave={() => setActivePath(null)}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">For Home Inspectors</h3>
              <p className="text-gray-600">Unlimited Reports</p>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-center text-gray-700">
                Professional septic reports with clear data quality indicators — verified permits and estimated records.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-sm">Unlimited property reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-sm">Verified permit & system data</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-sm">Professional PDF reports</span>
                </li>
              </ul>
            </div>

            <Link href="/inspector-pro">
              <Button className="w-full bg-purple-600 hover:bg-purple-700" size="lg">
                Start Inspector Pro
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-center text-sm text-gray-600 mt-4">
              $69/month • Unlimited reports
            </p>
          </Card>

          {/* Consumer Path */}
          <Card
            className={`p-8 cursor-pointer transition-all hover:shadow-xl ${
              activePath === 'consumer' ? 'border-2 border-green-600 shadow-xl' : ''
            }`}
            onMouseEnter={() => setActivePath('consumer')}
            onMouseLeave={() => setActivePath(null)}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">For Homeowners & Realtors</h3>
              <p className="text-gray-600">One-Time Reports</p>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-center text-gray-700">
                Is this home on septic? Where is the tank? Unlock the full septic property report instantly.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Exact GPS tank location</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Septic vs sewer status</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">System age & risk assessment</span>
                </li>
              </ul>
            </div>

            <Link href="/report">
              <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                Get Property Report ($19)
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-center text-sm text-gray-600 mt-4">
              No account required • Instant access • Downloadable
            </p>
          </Card>
        </div>
      </section>

      {/* Free Widget */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-r from-blue-50 to-green-50 rounded-3xl my-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Free Quick Check: Sewer or Septic?
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Enter any address to instantly check if it's on septic or sewer — no signup required
          </p>
          <SewerOrSepticWidget />
        </div>
      </section>

      {/* Coverage Section (SEO Optimized) */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">
          Septic Tank Locator Coverage
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          TankFindr provides GPS-accurate septic tank locations, permit data, and septic/sewer status 
          from government records across multiple states and growing.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {COVERAGE_STATES.map((state) => (
            <Card key={state.name} className="p-6">
              <h3 className="text-xl font-bold mb-2">{state.name}</h3>
              <p className="text-3xl font-bold text-blue-600 mb-3">{state.records}</p>
              <p className="text-sm text-gray-600 mb-4">septic systems mapped</p>
              <ul className="space-y-1">
                {state.counties.map((county) => (
                  <li key={county} className="text-sm text-gray-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    {county}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/coverage">
            <Button variant="outline" size="lg">
              View Full Coverage Map
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* SEO Content Blocks */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 rounded-3xl">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Septic Tank Locator – Florida (Miami-Dade, Sarasota, Peace River Basin)
            </h2>
            <p className="text-gray-700">
              TankFindr provides comprehensive septic tank location data for all 67 counties in Florida, 
              including Miami-Dade and statewide coverage. Access 2.1+ million septic 
              system records with GPS coordinates, verified permits, and estimated inventory data (clearly labeled).
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">
              Septic Lookup & Septic/Sewer Status – New Mexico (Statewide)
            </h2>
            <p className="text-gray-700">
              Complete statewide coverage for New Mexico with 60,000+ septic system records. Instantly 
              determine if a property is on septic or sewer, locate tanks, and access permit information 
              from state and county environmental departments.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">
              Septic Permit + Tank Location – California (Sonoma & Sacramento)
            </h2>
            <p className="text-gray-700">
              Access septic tank locations and permit data for Sonoma County and Sacramento County in 
              California. Our database includes GPS-accurate coordinates, system types, and historical 
              permit information from county environmental health departments.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">
              Septic System Data – Fairfax County, Virginia
            </h2>
            <p className="text-gray-700">
              Comprehensive septic tank location data for Fairfax County, Virginia, with 22,000+ mapped 
              systems. Includes exact GPS coordinates, drain field locations, and permit records from 
              the Fairfax County Health Department.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/coverage" className="text-gray-600 hover:text-gray-900">Coverage</Link></li>
                <li><Link href="/pricing-pro" className="text-gray-600 hover:text-gray-900">Pro Pricing</Link></li>
                <li><Link href="/report" className="text-gray-600 hover:text-gray-900">Property Reports</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/faq" className="text-gray-600 hover:text-gray-900">FAQ</Link></li>
                <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-gray-900">Terms & Conditions</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="mailto:support@tankfindr.com" className="text-gray-600 hover:text-gray-900">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">TankFindr</h3>
              <p className="text-gray-600 text-sm">
                GPS-accurate septic tank locations powered by government records and geospatial intelligence.
              </p>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-gray-600 text-sm">
            © 2025 TankFindr. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
