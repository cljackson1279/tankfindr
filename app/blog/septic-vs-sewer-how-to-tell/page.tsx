import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, HelpCircle, FileText, Eye, Droplet } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Septic vs Sewer: 5 Ways to Tell What Your House Has | TankFindr',
  description: 'Is your home on septic or sewer? Learn 5 easy methods to find out, from checking your water bill to inspecting your property. Essential guide for homeowners and buyers.',
  keywords: [
    'septic vs sewer',
    'how to tell if septic or sewer',
    'am i on septic or sewer',
    'septic system identification',
    'sewer connection check',
    'property water system',
  ],
  openGraph: {
    title: 'Septic vs Sewer: 5 Ways to Tell What Your House Has',
    description: 'Learn 5 easy methods to determine if your property uses a septic system or is connected to a municipal sewer line.',
    type: 'article',
    url: 'https://tankfindr.com/blog/septic-vs-sewer-how-to-tell',
  },
  alternates: {
    canonical: '/blog/septic-vs-sewer-how-to-tell',
  },
}

export default function BlogPost() {
  return (
    <div className="bg-white">
      {/* Article Header */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-blue-600 font-semibold mb-2">Homeowner Guide</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Septic vs. Sewer: 5 Easy Ways to Tell What Your House Has
            </h1>
            <p className="text-xl text-gray-600">
              Whether you're buying a new home or just curious about your current one, knowing your wastewater system is essential. This guide will walk you through five simple methods to determine if you're on a private septic system or a public sewer line.
            </p>
            <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
              <span>Published: Feb 6, 2025</span>
              <span>|</span>
              <span>8 min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Body */}
      <article className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto prose lg:prose-xl">
          <p>
            Every home has a wastewater system, but they generally fall into two categories: a private septic system or a connection to a municipal sewer. The type of system you have impacts your maintenance responsibilities, utility bills, and even what you can plant in your yard. Here’s how to find out which one you have.
          </p>

          <h2>Method 1: Check Your Water Bill</h2>
          <p>
            This is often the quickest and most definitive method. Your monthly water utility bill contains detailed line items for the services you receive.
          </p>
          <ul>
            <li><strong>Look for a "Sewer" Charge:</strong> If you see a line item for "sewer service," "wastewater treatment," or something similar, your home is connected to a municipal sewer system.</li>
            <li><strong>No Sewer Charge:</strong> If your bill only shows charges for water usage, you are almost certainly on a septic system. Homeowners with septic systems are responsible for their own wastewater treatment and don't pay a monthly sewer fee.</li>
          </ul>

          <h2>Method 2: Inspect Your Yard for Clues</h2>
          <p>
            A walk around your property can reveal tell-tale signs of a septic system. You're looking for components that wouldn't be present with a sewer connection.
          </p>
          <ul>
            <li><strong>Lids or Covers:</strong> The most obvious sign is one or two concrete or green plastic lids in your yard. These are the access ports for the septic tank.</li>
            <li><strong>Drain Field:</strong> Look for a large, open area of your yard where the grass might look different. This could be the drain field (or leach field), where treated wastewater is dispersed into the soil.</li>
            <li><strong>Vent Pipe:</strong> Sometimes, a vent pipe sticking out of the ground can indicate the end of the drain field.</li>
          </ul>

          <Card className="my-8 p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-4">
              <Eye className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-bold text-lg">Visual Inspection Tip</h3>
                <p className="text-gray-700">
                  Sewer systems are entirely underground and have no visible components in your yard, other than perhaps a small sewer cleanout cap close to your house. If you see large lids or a distinct field, it's a septic system.
                </p>
              </div>
            </div>
          </Card>

          <h2>Method 3: Check Public Records</h2>
          <p>
            Just like finding a septic tank, public records can confirm your wastewater system type. Your local county or city government keeps detailed records on every property.
          </p>
          <ul>
            <li><strong>Property Permit Search:</strong> Search your address in your county's online permit database. Look for a septic system installation permit or an "as-built" diagram.</li>
            <li><strong>Sewer Connection Permit:</strong> Alternatively, you might find a permit for connection to the public sewer line.</li>
            <li><strong>Use a Service:</strong> An online service like <Link href="/">TankFindr</Link> can instantly tell you if a septic permit exists for your address, classifying your property as "Septic," "Sewer," or "Unknown."
            </li>
          </ul>

          <h2>Method 4: Look at Your Neighbors' Properties</h2>
          <p>
            In most neighborhoods, especially those built around the same time, properties will have the same type of wastewater system. 
          </p>
          <ul>
            <li><strong>Urban/Suburban Areas:</strong> If you live in a densely populated city or suburb, you are most likely on a sewer system.</li>
            <li><strong>Rural/Older Areas:</strong> If you live in a rural area or an older neighborhood that was developed before sewer lines were extended, you are likely on a septic system.</li>
            <li><strong>Ask Around:</strong> Simply asking a long-time neighbor is a quick way to get a reliable answer.</li>
          </ul>

          <h2>Method 5: Trace the Main Drain Pipe</h2>
          <p>
            Follow the main sewer line from your house. The destination tells the story.
          </p>
          <ol>
            <li><strong>Find the Pipe:</strong> Locate the 4-inch main drain pipe in your basement or crawlspace.</li>
            <li><strong>Check for a Water Meter:</strong> If the pipe exits your house and goes towards the street, look for a water meter pit near the curb. If you have a water meter for your sewer line, you're on a public system.</li>
            <li><strong>Direction of the Pipe:</strong> If the pipe heads towards an open area of your yard (not towards the street), it's heading to a septic tank.</li>
          </ol>

          <Card className="my-8 p-6 bg-green-50 border-green-200">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-bold text-lg">Why It Matters</h3>
                <p className="text-gray-700">
                  Knowing your system is key to proper home maintenance. Septic systems require regular pumping (every 3-5 years) and care to avoid costly failures. Sewer systems are maintained by the municipality, but you are responsible for the connection line from your house to the street.
                </p>
              </div>
            </div>
          </Card>

        </div>
      </article>
    </div>
  )
}
