import { Metadata } from 'next'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { MapPin, Target, CheckCircle, HardHat } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Using GPS Coordinates to Locate Septic Tanks | TankFindr',
  description: 'A professional guide to GPS-based septic tank location. Learn how contractors use coordinates, accuracy requirements, and how to mark your tank permanently for future access.',
  keywords: [
    'septic tank gps coordinates',
    'gps septic tank locator',
    'septic tank mapping',
    'latitude longitude septic tank',
    'professional septic location',
    'septic tank finder tool',
  ],
  openGraph: {
    title: 'Using GPS Coordinates to Locate Septic Tanks',
    description: 'A professional guide to GPS-based septic tank location. Learn how contractors use coordinates, accuracy requirements, and how to mark your tank permanently.',
    type: 'article',
    url: 'https://tankfindr.com/blog/septic-tank-gps-coordinates-guide',
  },
  alternates: {
    canonical: '/blog/septic-tank-gps-coordinates-guide',
  },
}

export default function BlogPost() {
  return (
    <div className="bg-white">
      {/* Article Header */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-blue-600 font-semibold mb-2">Professional Tips</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              A Contractor's Guide to Using GPS for Septic Tank Location
            </h1>
            <p className="text-xl text-gray-600">
              Move beyond probing and guesswork. This guide covers how professionals leverage GPS coordinates for fast, accurate septic tank location, improving efficiency and customer satisfaction.
            </p>
            <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
              <span>Published: Feb 6, 2025</span>
              <span>|</span>
              <span>7 min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Body */}
      <article className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto prose lg:prose-xl">
          <p>
            For septic professionals, time is money. Wasting an hour searching for a tank lid eats into profits and can frustrate clients. While traditional methods like probing have their place, leveraging GPS technology is a game-changer for the modern contractor. This guide explains how to effectively use GPS coordinates to locate septic systems.
          </p>

          <h2>Why Use GPS Coordinates?</h2>
          <ul>
            <li><strong>Efficiency:</strong> Walk directly to the tank's location instead of spending time on a grid search.</li>
            <li><strong>Accuracy:</strong> Sub-meter accuracy is often possible, getting you within a few feet of the lid every time.</li>
            <li><strong>Professionalism:</strong> Arriving on-site with the exact location impresses clients and demonstrates expertise.</li>
            <li><strong>Record Keeping:</strong> Build your own database of client tank locations for future service calls.</li>
          </ul>

          <h2>Sources for Septic Tank GPS Data</h2>
          <p>
            The first step is obtaining the coordinates. While not all records include them, many modern permits and online databases do.
          </p>
          <ul>
            <li><strong>Online Permit Databases:</strong> Services like <Link href="/pro">TankFindr Pro</Link> provide GPS coordinates for millions of septic records. This is the fastest and most efficient source.</li>
            <li><strong>County GIS Websites:</strong> Many counties have public Geographic Information System (GIS) websites where you can find parcel data that may include septic system layers.</li>
            <li><strong>As-Built Diagrams:</strong> Newer "as-built" diagrams filed with the county may include GPS coordinates recorded by the installer.</li>
          </ul>

          <Card className="my-8 p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-4">
              <HardHat className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-bold text-lg">The Contractor's Advantage</h3>
                <p className="text-gray-700">
                  A subscription to a professional database is a small investment that pays for itself quickly. The ability to pull up GPS data for any address before you even leave the office streamlines your entire workflow.
                </p>
              </div>
            </div>
          </Card>

          <h2>Tools for Navigating to GPS Coordinates</h2>
          <p>
            Once you have the latitude and longitude, you need a tool to navigate to that exact spot.
          </p>
          <ol>
            <li><strong>Smartphone Apps:</strong> The easiest method. Apps like Google Maps or specialized apps like "GPS Status & Toolbox" allow you to enter coordinates and will guide you to the location.</li>
            <li><strong>Handheld GPS Units:</strong> Devices from Garmin or Trimble offer higher accuracy and durability, making them ideal for rugged field use.</li>
            <li><strong>Survey-Grade Equipment:</strong> For the highest precision (sub-inch accuracy), survey-grade GPS/GNSS receivers are used, though this is typically overkill for septic location.</li>
          </ol>

          <h2>Understanding Accuracy and Datums</h2>
          <p>
            Not all GPS coordinates are created equal. It's important to understand the potential for error.
          </p>
          <ul>
            <li><strong>Coordinate Systems:</strong> Most data uses the WGS 84 datum (the standard for GPS). Be aware if a record uses a different system like NAD83, as you may need to convert it.</li>
            <li><strong>Accuracy Levels:</strong> Consumer-grade GPS (like in your phone) is typically accurate to within 10-15 feet. This is usually close enough to find a tank with minimal probing.</li>
            <li><strong>Source of the Data:</strong> Was the coordinate recorded by a surveyor, or was it estimated from an aerial map? The source impacts the reliability.</li>
          </ul>

          <Card className="my-8 p-6 bg-green-50 border-green-200">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-bold text-lg">Best Practice: Record Your Own Coordinates</h3>
                <p className="text-gray-700">
                  Every time you service a tank, use your GPS device to record the coordinates of the main access lid. Store this in your client records. The next time you're called for service, you'll have your own verified location data, making the job even faster.
                </p>
              </div>
            </div>
          </Card>

        </div>
      </article>
    </div>
  )
}
