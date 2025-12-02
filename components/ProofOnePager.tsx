'use client'

/**
 * ProofOnePager Component
 * 
 * A printable one-page proof deck for TankFindr sales/marketing.
 * 
 * Usage:
 * 1. Import this component into a page (e.g., /proof-deck)
 * 2. Open the page in browser
 * 3. Use browser Print → Save as PDF (Cmd/Ctrl + P)
 * 4. Email the PDF to septic companies
 * 
 * Brand colors:
 * - Green: emerald-600 (#059669)
 * - Purple: purple-600 (#9333ea)
 * - White/Light: gray-50
 */

import { proofExamples, calculateAverageTimeSavings } from '@/lib/proofExamples'
import { CheckCircle, Clock, MapPin, Zap } from 'lucide-react'

interface ProofOnePagerProps {
  contactEmail?: string
  contactPhone?: string
  websiteUrl?: string
}

export default function ProofOnePager({
  contactEmail = 'chris@tankfindr.com',
  contactPhone = '(555) 123-4567',
  websiteUrl = 'https://tankfindr.com',
}: ProofOnePagerProps) {
  const stats = calculateAverageTimeSavings()
  
  // Use first 3 examples for the proof deck
  const examples = proofExamples.slice(0, 3)

  return (
    <div className="max-w-[8.5in] mx-auto bg-white p-8 print:p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-emerald-600 mb-2">
          TankFindr
        </h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          How TankFindr Helps Florida Septic Pros Locate Tanks in Minutes
        </h2>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Stop wasting 2-3 hours per job searching for septic tanks. TankFindr combines county permit data, 
          parcel records, and GPS coordinates from 2.2+ million Florida septic systems to give your techs 
          a precise starting point—before they even arrive on site.
        </p>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-purple-50 rounded-lg p-6 mb-8 border border-emerald-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-emerald-600">
              {stats.avgTraditionalHours}h
            </div>
            <div className="text-sm text-gray-600 font-medium">Traditional Locate Time</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600">
              {stats.avgTankFindrMinutes}min
            </div>
            <div className="text-sm text-gray-600 font-medium">With TankFindr</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-600">
              {stats.avgSavingsHours}h
            </div>
            <div className="text-sm text-gray-600 font-medium">Time Saved Per Job</div>
          </div>
        </div>
      </div>

      {/* Real Examples Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Real Florida Examples
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          {examples.map((example) => (
            <div
              key={example.id}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-gray-900 text-sm">
                    {example.county} County
                  </div>
                  <div className="text-xs text-gray-600 leading-tight">
                    {example.address}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Traditional:</span>
                  <span className="font-semibold text-gray-900">
                    {example.traditionalTimeHours}h
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">TankFindr:</span>
                  <span className="font-semibold text-emerald-600">
                    {example.tankFindrTimeMinutes}min
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Data Sources:</div>
                <div className="text-xs text-gray-800 font-medium leading-tight">
                  {example.dataSources}
                </div>
              </div>

              {example.hasPermitData && (
                <div className="mt-2 flex items-center gap-1 text-xs text-emerald-700">
                  <CheckCircle className="w-3 h-3" />
                  <span className="font-medium">Verified Permit</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          How It Works
        </h3>
        
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-emerald-600">1</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Enter Address</h4>
            <p className="text-sm text-gray-600">
              Your tech types in the property address on their phone or tablet
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-purple-600">2</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Get Tank Location</h4>
            <p className="text-sm text-gray-600">
              TankFindr pulls septic/sewer status, permit data, and GPS coordinates instantly
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-emerald-600">3</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Start Digging</h4>
            <p className="text-sm text-gray-600">
              Tech uses coordinates as a head start, then confirms with camera and locator gear
            </p>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
          Why Septic Pros Choose TankFindr
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-gray-900 text-sm">Save 2+ Hours Per Job</div>
              <div className="text-xs text-gray-600">
                Get GPS coordinates before your tech arrives on site
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-gray-900 text-sm">2.2M+ Florida Records</div>
              <div className="text-xs text-gray-600">
                County permits, DOH data, and parcel records statewide
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-gray-900 text-sm">Book More Jobs Per Day</div>
              <div className="text-xs text-gray-600">
                Finish inspections faster, fit more appointments in your schedule
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-gray-900 text-sm">Works on Any Device</div>
              <div className="text-xs text-gray-600">
                Mobile-friendly dashboard, no app download required
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-purple-600 text-white rounded-lg p-6 text-center">
        <h3 className="text-2xl font-bold mb-2">
          Start Your 7-Day Risk-Free Trial
        </h3>
        <p className="text-emerald-50 mb-4">
          No credit card required. Cancel anytime. See results on your first job.
        </p>
        
        <div className="flex items-center justify-center gap-8 text-sm">
          <div>
            <div className="font-semibold mb-1">Visit</div>
            <div className="text-emerald-100">{websiteUrl}</div>
          </div>
          <div>
            <div className="font-semibold mb-1">Email</div>
            <div className="text-emerald-100">{contactEmail}</div>
          </div>
          <div>
            <div className="font-semibold mb-1">Call</div>
            <div className="text-emerald-100">{contactPhone}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-500">
        TankFindr • Septic Tank Location Intelligence for Florida Professionals
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          @page {
            margin: 0.5in;
            size: letter;
          }
          
          .print\\:p-6 {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}
