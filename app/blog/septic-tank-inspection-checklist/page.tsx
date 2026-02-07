import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckSquare, AlertTriangle, FileText, DollarSign } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Septic Tank Inspection Checklist for Home Buyers | TankFindr',
  description: 'A complete pre-purchase septic inspection guide. Learn what inspectors check, red flags to watch for, and how to negotiate repairs. Save thousands on your home purchase.',
  keywords: [
    'septic tank inspection checklist',
    'septic inspection for home purchase',
    'what to look for in septic inspection',
    'septic system red flags',
    'septic inspection cost',
    'home buying septic system',
  ],
  openGraph: {
    title: 'Septic Tank Inspection Checklist for Home Buyers',
    description: 'A complete pre-purchase septic inspection guide. Learn what inspectors check, red flags to watch for, and how to negotiate repairs.',
    type: 'article',
    url: 'https://tankfindr.com/blog/septic-tank-inspection-checklist',
  },
  alternates: {
    canonical: '/blog/septic-tank-inspection-checklist',
  },
}

export default function BlogPost() {
  return (
    <div className="bg-white">
      {/* Article Header */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-blue-600 font-semibold mb-2">Home Buyer Guide</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              The Ultimate Septic Inspection Checklist for Home Buyers
            </h1>
            <p className="text-xl text-gray-600">
              Buying a home with a septic system? Don't get stuck with a failing system that costs thousands to replace. This checklist covers everything you need to know about a pre-purchase septic inspection.
            </p>
            <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
              <span>Published: Feb 6, 2025</span>
              <span>|</span>
              <span>10 min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Body */}
      <article className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto prose lg:prose-xl">
          <p>
            A standard home inspection rarely covers the septic system in detail. Given that a new septic system can cost anywhere from $15,000 to $40,000, a specialized septic inspection is one of the most important investments you can make when buying a property with an on-site wastewater system. This guide will break down what a comprehensive inspection should cover.
          </p>

          <h2>Part 1: Document Review</h2>
          <p>
            The inspection should begin before the inspector even steps on the property. A thorough review of public records provides a baseline for the system's age, type, and history.
          </p>
          <ul>
            <li><strong>Permit & As-Built Diagram:</strong> The inspector should pull the original installation permit and the "as-built" diagram from the county health department. This shows the system's location, size, and design.</li>
            <li><strong>Maintenance Records:</strong> Ask the seller for all maintenance records, including pumping receipts and repair invoices. A lack of records is a major red flag.</li>
            <li><strong>Online Database Check:</strong> Use a service like <Link href="/">TankFindr</Link> to cross-reference the property address with millions of public records for any additional permits or historical data.</li>
          </ul>

          <h2>Part 2: The Visual Inspection (Inside the Home)</h2>
          <p>
            The inspector will check for signs of system stress from inside the house.
          </p>
          <ul>
            <li><strong>Plumbing Fixtures:</strong> Run faucets and flush toilets to check for slow drains or gurgling sounds, which can indicate a blockage or a full tank.</li>
            <li><strong>Previous Backups:</strong> Look for water stains or damage around floor drains in the basement, which could signal past sewage backups.</li>
          </ul>

          <h2>Part 3: The Physical Inspection (Outside)</h2>
          <p>
            This is the core of the inspection, where the inspector locates and examines the physical components of the system.
          </p>
          
          <h3>The Septic Tank</h3>
          <ul>
            <li><strong>Locate the Tank:</strong> The inspector will find the tank and excavate the lids.</li>
            <li><strong>Check Sludge & Scum Levels:</strong> The inspector will measure the layers of sludge (solids at the bottom) and scum (fats and grease at the top). Excessive levels indicate the tank needs pumping.</li>
            <li><strong>Inspect Tank Integrity:</strong> The tank walls will be checked for cracks, corrosion, or leaks.</li>
            <li><strong>Check Baffles:</strong> The inlet and outlet baffles will be inspected to ensure they are intact and functioning correctly. Damaged baffles can lead to drain field failure.</li>
          </ul>

          <h3>The Drain Field (Leach Field)</h3>
          <ul>
            <li><strong>Walk the Field:</strong> The inspector will walk the entire drain field area, looking for signs of failure.</li>
            <li><strong>Look for Wet Spots:</strong> Spongy grass or standing water (effluent) on the surface is a sign of a failing drain field.</li>
            <li><strong>Check for Odors:</strong> Sewage odors in the yard are a clear indicator of problems.</li>
            <li><strong>Probe the Soil:</strong> The inspector may use a soil probe to check for excessive moisture levels underground.</li>
          </ul>

          <Card className="my-8 p-6 bg-red-50 border-red-200">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="font-bold text-lg">Major Red Flags to Watch For</h3>
                <ul className="list-disc pl-5 text-gray-700">
                  <li>Standing water or lush green stripes over the drain field.</li>
                  <li>Sewage odors inside or outside the home.</li>
                  <li>History of frequent backups.</li>
                  <li>No maintenance records.</li>
                  <li>Cracks in the septic tank or damaged baffles.</li>
                </ul>
              </div>
            </div>
          </Card>

          <h2>Part 4: The Inspection Report</h2>
          <p>
            You should receive a detailed written report within 24-48 hours. It should include:
          </p>
          <ul>
            <li>A diagram of the system's location.</li>
            <li>Photos of all components inspected.</li>
            <li>Measurements of sludge and scum levels.</li>
            <li>A description of the system's overall condition.</li>
            <li>Recommendations for any necessary repairs or maintenance, with cost estimates.</li>
          </ul>

          <Card className="my-8 p-6 bg-green-50 border-green-200">
            <div className="flex items-start gap-4">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-bold text-lg">Negotiating Repairs</h3>
                <p className="text-gray-700">
                  If the inspection uncovers problems, use the report to negotiate with the seller. You can ask them to make the repairs before closing, or request a credit to cover the cost of future repairs. A detailed report from a certified inspector gives you significant leverage.
                </p>
              </div>
            </div>
          </Card>

        </div>
      </article>
    </div>
  )
}
