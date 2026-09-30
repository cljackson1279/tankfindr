import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { StructuredData } from '@/components/StructuredData'
import { TOTAL_RECORDS_DISPLAY, FEATURED_STATE_COUNT, COVERAGE_CLAIM_LONG } from '@/lib/coverage'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: `Septic Tank Locator | Find Your Septic Tank in Seconds | ${TOTAL_RECORDS_DISPLAY} Records`,
    template: '%s | TankFindr',
  },
  description: `Find your septic tank with GPS locations from government permit records. ${COVERAGE_CLAIM_LONG}, with every result labeled by data quality. Free coverage check.`,
  keywords: [
    // Primary keywords (high volume, high intent)
    'septic tank locator',
    'find septic tank',
    'where is my septic tank',
    'septic tank finder',
    'locate septic tank',
    'septic tank location',
    
    // Long-tail keywords (high conversion)
    'how to find septic tank',
    'find septic tank on property',
    'septic tank location map',
    'septic tank GPS coordinates',
    'septic tank records by address',
    'does my house have a septic tank',
    'septic or sewer',
    
    // Location-based keywords
    'florida septic tank locator',
    'california septic tank finder',
    'septic tank locator near me',
    
    // Professional keywords
    'septic inspection software',
    'septic company software',
    'home inspector septic tool',
    'septic contractor tools',
    
    // Related searches
    'septic system location',
    'septic tank permit records',
    'find my septic tank',
    'septic tank map',
    'septic tank lookup',
  ],
  authors: [{ name: 'TankFindr' }],
  creator: 'TankFindr',
  publisher: 'TankFindr',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tankfindr.com'),
  // NOTE: no root-level canonical. A canonical here is inherited by EVERY page,
  // telling Google all pages (FAQ, blog, pricing…) are duplicates of the
  // homepage. Per-page canonicals are set in each route's metadata.
  openGraph: {
    title: 'Septic Tank Locator | Find Your Septic Tank in Seconds',
    description: `Find your septic tank with GPS coordinates from government permit records. ${COVERAGE_CLAIM_LONG}. Free coverage check.`,
    type: 'website',
    url: 'https://tankfindr.com',
    siteName: 'TankFindr - Septic Tank Locator',
    // og:image comes from app/opengraph-image.png via the Next.js file
    // convention (the previous explicit /og-image.png reference was a 404).
    locale: 'en_US'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Your Septic Tank in Seconds | TankFindr',
    description: `Septic tank locations from government records. ${COVERAGE_CLAIM_LONG}.`,
    // twitter:image comes from app/twitter-image.png via the file convention.
    creator: '@tankfindr'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: 'nPQS4z3guOL25_XL2QNBNmpx8gZHmdLYKtqbyij3O2o'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
        {/* Inter is self-hosted via next/font — the old Google Fonts <link>
            double-loaded the same family on every page. */}
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css"
          rel="stylesheet"
        />
        {/* Icons auto-detected from app directory: favicon.ico, icon.png, apple-icon.png */}
        <meta name="theme-color" content="#10B981" />
        
        {/* Additional SEO meta tags */}
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="language" content="English" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://api.mapbox.com" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
