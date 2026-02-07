import { Metadata } from 'next'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Scale, Map, FileText, Waves } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: 'Florida Septic Tank Regulations: 2025 Homeowner Guide | TankFindr',
  description: 'Navigate Florida\'s complex septic system laws, including new 2023 regulations, permit requirements, and inspection schedules. County-specific rules for Miami-Dade, Broward, and more.',
  keywords: [
    'florida septic tank regulations',
    'florida septic system laws',
    'fl dep septic rules',
    'septic permit florida',
    'florida septic inspection requirements',
    'miami-dade septic regulations',
  ],
  openGraph: {
    title: 'Florida Septic Tank Regulations: 2025 Homeowner Guide',
    description: 'Navigate Florida\'s complex septic system laws, including new 2023 regulations, permit requirements, and inspection schedules.',
    type: 'article',
    url: 'https://tankfindr.com/blog/florida-septic-tank-regulations',
  },
  alternates: {
    canonical: '/blog/florida-septic-tank-regulations',
  },
}

export default function BlogPost() {
  return (
    <div className="bg-white">
      <SiteHeader />
      {/* Article Header */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-blue-600 font-semibold mb-2">Florida Regulations</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Florida Septic Tank Regulations: A Homeowner's Guide (2025)
            </h1>
            <p className="text-xl text-gray-600">
              Florida's unique environment means strict rules for septic systems. This guide simplifies the latest state and county regulations, including new laws impacting inspections, maintenance, and system types.
            </p>
            <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
              <span>Published: Feb 6, 2025</span>
              <span>|</span>
              <span>9 min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Body */}
      <article className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto prose lg:prose-xl">
          <p>
            With over 2.5 million septic systems, Florida has some of the most comprehensive regulations in the country to protect its groundwater and sensitive ecosystems. As a homeowner, understanding these rules is essential to avoid fines and ensure your system is functioning properly. This guide covers the key regulations from the Florida Department of Environmental Protection (DEP) and local health departments.
          </p>

          <h2>Statewide Regulations (Chapter 62-6, F.A.C.)</h2>
          <p>
            The primary rules governing septic systems (known as Onsite Sewage Treatment and Disposal Systems or OSTDS) are set by the Florida DEP.
          </p>
          <ul>
            <li><strong>Permitting:</strong> A permit is required for any new installation, modification, or repair of a septic system. Permits are issued by the local county health department.</li>
            <li><strong>Setbacks:</strong> Systems must be installed a minimum distance from buildings, property lines, wells, and surface water bodies. For example, a drain field must be at least 75 feet from a private drinking well.</li>
            <li><strong>System Sizing:</strong> The size of the tank and drain field is determined by the number of bedrooms in the home and the soil type.</li>
          </ul>

          <Card className="my-8 p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-4">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-bold text-lg">Finding Your Permit</h3>
                <p className="text-gray-700">
                  You can find your property's septic permit through your county health department or by using an online database like <Link href="/florida-septic-tank-locator">TankFindr's Florida Locator</Link>, which has over 2.1 million DEP records.
                </p>
              </div>
            </div>
          </Card>

          <h2>New Regulations & The Clean Waterways Act</h2>
          <p>
            The Clean Waterways Act of 2020 introduced significant changes, especially for properties in certain sensitive areas.
          </p>
          <ul>
            <li><strong>Nutrient-Reducing Systems:</strong> In areas with a Basin Management Action Plan (BMAP), new or modified systems may be required to include enhanced nutrient-reducing components to protect springs and estuaries.</li>
            <li><strong>Inspection Requirements:</strong> The act mandates periodic inspections of septic systems in these designated areas, typically every 5 years.</li>
            <li><strong>Transfer of Ownership:</strong> When a property is sold, an inspection is often required to ensure the system is functioning correctly.</li>
          </ul>

          <h2>County-Specific Rules</h2>
          <p>
            While the state sets the minimum standards, many Florida counties have their own, stricter regulations. It's crucial to check with your local health department.
          </p>
          
          <h3>Miami-Dade County</h3>
          <ul>
            <li>Due to its porous limestone geology, Miami-Dade has very strict rules regarding system elevation and setbacks from canals and coastal waters.</li>
            <li>The county is actively working to connect thousands of properties on septic to the municipal sewer system to protect Biscayne Bay.</li>
          </ul>

          <h3>Broward & Palm Beach Counties</h3>
          <ul>
            <li>These counties also have specific local ordinances, often related to lot size, soil conditions, and proximity to the Everglades and other water bodies.</li>
          </ul>

          <Card className="my-8 p-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-4">
              <Waves className="h-8 w-8 text-yellow-600" />
              <div>
                <h3 className="font-bold text-lg">Coastal & Keys Regulations</h3>
                <p className="text-gray-700">
                  Properties in the Florida Keys and other coastal zones are subject to the most stringent regulations, often requiring advanced wastewater treatment systems that significantly reduce nitrogen and phosphorus.
                </p>
              </div>
            </div>
          </Card>

          <h2>Maintenance & Pumping Requirements</h2>
          <p>
            Florida law requires that septic systems be maintained to prevent public health hazards and environmental degradation.
          </p>
          <ul>
            <li><strong>Pumping Frequency:</strong> While there isn't a statewide mandatory pumping schedule, the DEP recommends pumping your tank every 3 to 5 years.</li>
            <li><strong>Who Can Do It:</strong> Only state-licensed septic tank contractors are permitted to pump, repair, or modify septic systems.</li>
            <li><strong>Record Keeping:</strong> Always keep records of your system's maintenance, as you may be required to provide them during a property sale or inspection.</li>
          </ul>

        </div>
      </article>
    </div>
  )
}
