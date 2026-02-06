import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { StructuredData } from '@/components/StructuredData'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Septic Tank Locator | Find Your Septic Tank in Seconds | 2.3M+ Records',
    template: '%s | TankFindr - #1 Septic Tank Locator',
  },
  description: 'Find your septic tank instantly with GPS-accurate locations. Access 2.3M+ verified septic system records across 12 states. Trusted by 10,000+ contractors, inspectors & homeowners. Free coverage check. Where is my septic tank? Find out now.',
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
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Septic Tank Locator | Find Your Septic Tank in Seconds',
    description: '🎯 Find your septic tank instantly with GPS coordinates. 2.3M+ verified records. Trusted by 10,000+ professionals. Free coverage check. Where is my septic tank? Find out now.',
    type: 'website',
    url: 'https://tankfindr.com',
    siteName: 'TankFindr - Septic Tank Locator',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TankFindr - Find Your Septic Tank Instantly'
      },
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'TankFindr Logo'
      }
    ],
    locale: 'en_US'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Your Septic Tank in Seconds | TankFindr',
    description: '🎯 GPS-accurate septic tank locations. 2.3M+ records across 12 states. Trusted by 10,000+ professionals.',
    images: ['/og-image.png'],
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
  },
  other: {
    'google-site-verification': 'nPQS4z3guOL25_XL2QNBNmpx8gZHmdLYKtqbyij3O2o',
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
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css"
          rel="stylesheet"
        />
        {/* Icons auto-detected from app directory: favicon.ico, icon.png, apple-icon.png */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#10B981" />
        
        {/* Additional SEO meta tags */}
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="language" content="English" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.mapbox.com" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
