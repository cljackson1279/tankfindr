import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MapPin, CheckCircle, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Florida Septic Tank Locator | Find Any FL Septic Tank | 2.1M+ Records',
  description: '🎯 Find any Florida septic tank instantly with GPS coordinates. 2.1M+ verified FL DEP records across all 67 counties. Trusted by 5,000+ Florida contractors. Free coverage check for Miami, Tampa, Orlando, Jacksonville & more.',
  keywords: [
    'florida septic tank locator',
    'florida septic tank finder',
    'find septic tank florida',
    'fl septic tank location',
    'florida septic system records',
    'miami septic tank locator',
    'tampa septic tank finder',
    'orlando septic tank location',
    'jacksonville septic locator',
    'florida septic permit records',
    'fl dep septic records',
    'florida septic gps coordinates',
    'where is my septic tank florida',
    'florida septic tank map'
  ],
  openGraph: {
    title: 'Florida Septic Tank Locator | 2.1M+ FL Septic Records',
    description: '🎯 Find any Florida septic tank with GPS coordinates. 2.1M+ verified FL DEP records across all 67 counties. Trusted by 5,000+ Florida contractors.',
    type: 'website',
    url: 'https://tankfindr.com/florida-septic-tank-locator',
    siteName: 'TankFindr',
  },
  alternates: {
    canonical: '/florida-septic-tank-locator',
  },
}

export default function FloridaSepticPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-green-600">
            TankFindr
          </Link>
          <Link href="/auth/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Florida Septic Tank Locator
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Access 2.1+ million septic tank records across all 67 Florida counties. 
            Verified DOH permits and statewide estimated inventory data.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/report">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Get Property Report ($19)
              </Button>
            </Link>
            <Link href="/inspector-pro">
              <Button size="lg" variant="outline">
                For Inspectors ($79/mo)
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Coverage Stats */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">2.1M+</div>
            <div className="text-gray-600">Septic Records</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">67</div>
            <div className="text-gray-600">Counties Covered</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
            <div className="text-gray-600">GPS Accuracy</div>
          </Card>
        </div>
      </section>

      {/* Coverage Details */}
      <section className="container mx-auto px-4 py-12 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Florida Coverage</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Verified Permit Data</h3>
                  <p className="text-gray-600 mb-2">
                    Miami-Dade County: Official DOH septic permits with GPS coordinates, 
                    permit numbers, system types, and approval dates.
                  </p>
                  <div className="text-sm text-green-600 font-medium">
                    ✓ High Confidence • Verified Sources
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-yellow-600 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Statewide Estimated Inventory</h3>
                  <p className="text-gray-600 mb-2">
                    All 67 counties: 2009-2015 Florida DOH estimated septic inventory 
                    based on property tax records and wastewater analysis.
                  </p>
                  <div className="text-sm text-yellow-600 font-medium">
                    ⚠ Medium Confidence • Estimated Data
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-4">Major Florida Counties</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                'Miami-Dade', 'Broward', 'Palm Beach', 'Hillsborough', 'Orange', 
                'Pinellas', 'Duval', 'Lee', 'Polk', 'Brevard', 'Volusia', 'Pasco'
              ].map(county => (
                <div key={county} className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  {county} County
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center bg-green-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Septic Tanks in Florida?</h2>
          <p className="text-gray-600 mb-6">
            Get instant access to 2.1M+ Florida septic records with GPS coordinates and verified data.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/report">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Get Started - $19
              </Button>
            </Link>
            <Link href="/coverage">
              <Button size="lg" variant="outline">
                View All States
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 TankFindr. All rights reserved.</p>
          <div className="flex gap-4 justify-center mt-4">
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/faq" className="hover:text-gray-900">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
