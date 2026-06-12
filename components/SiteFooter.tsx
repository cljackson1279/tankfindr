import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t bg-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/coverage" className="text-gray-600 hover:text-gray-900">Coverage Map</Link></li>
              <li><Link href="/report" className="text-gray-600 hover:text-gray-900">Property Reports</Link></li>
              <li><Link href="/sample-report" className="text-gray-600 hover:text-gray-900">Sample Report</Link></li>
              <li><Link href="/pricing-pro" className="text-gray-600 hover:text-gray-900">For Septic Companies</Link></li>
              <li><Link href="/inspector-pro" className="text-gray-600 hover:text-gray-900">For Home Inspectors</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-600 hover:text-gray-900">About & Our Data</Link></li>
              <li><Link href="/blog" className="text-gray-600 hover:text-gray-900">Blog</Link></li>
              <li><Link href="/faq" className="text-gray-600 hover:text-gray-900">FAQ</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-gray-900">Terms & Conditions</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@tankfindr.com" className="text-gray-600 hover:text-gray-900">
                  support@tankfindr.com
                </a>
              </li>
            </ul>
            <div className="mt-4 flex items-start gap-2 text-sm text-gray-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>Sourced from official government permit records, labeled by confidence.</span>
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-4">TankFindr</h3>
            <p className="text-gray-600 text-sm">
              GPS-accurate septic tank locations sourced from government permit records and
              state environmental databases — with every data point labeled Verified,
              Inferred, or Estimated so you know exactly how confident to be.
            </p>
          </div>
        </div>
        <div className="border-t pt-8 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} TankFindr. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
