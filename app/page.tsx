import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, MapPin, Zap, Shield } from 'lucide-react'

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              TF
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TankFindr</h1>
              <p className="text-xs text-gray-500">AI Septic Tank Locator</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Find Septic Tanks in{' '}
          <span className="text-emerald-600">5 Minutes</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Stop wasting 3+ hours searching for buried septic tanks. Our AI-powered
          satellite imagery analysis delivers accurate locations with confidence
          scoring in minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/auth/sign-up">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-6"
            >
              Start Free Trial
            </Button>
          </Link>
          <Link href="/pricing">
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6"
            >
              View Pricing
            </Button>
          </Link>
        </div>
        <p className="text-emerald-600 font-semibold">
          🎉 5 free locates OR 7 days free - No credit card required for trial
        </p>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why TankFindr?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Lightning Fast
            </h3>
            <p className="text-gray-600">
              Get results in 5 minutes instead of spending 3+ hours manually
              searching. Save time and increase your daily job capacity.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              85% Accuracy
            </h3>
            <p className="text-gray-600">
              AI-powered analysis with confidence scoring. Green/Yellow/Red
              indicators help you assess reliability before you dig.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Field-Ready
            </h3>
            <p className="text-gray-600">
              One-tap Google Maps navigation. Offline cache for last 50
              searches. Glove-friendly UI designed for field work.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Enter Address
              </h3>
              <p className="text-gray-600">
                Simply type in the property address where you need to locate a
                septic tank.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                AI Analysis
              </h3>
              <p className="text-gray-600">
                Our AI analyzes satellite imagery to identify the most likely
                tank location.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Navigate & Dig
              </h3>
              <p className="text-gray-600">
                Get GPS coordinates with confidence score. One-tap navigation to
                the exact location.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Ready to Save 3 Hours Per Job?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Join septic professionals who are already using TankFindr
        </p>
        <Link href="/auth/sign-up">
          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-6"
          >
            Start Free Trial Now
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              TF
            </div>
            <span className="text-xl font-bold">TankFindr</span>
          </div>
          <p className="text-gray-400">
            © 2024 TankFindr. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
