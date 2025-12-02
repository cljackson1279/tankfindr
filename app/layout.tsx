import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { StructuredData } from '@/components/StructuredData'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'TankFindr - Find Septic Tanks Instantly with GPS-Accurate Locations',
    template: '%s | TankFindr',
  },
  description: 'Locate septic tanks 10x faster with TankFindr. Access 2.2M+ verified and estimated septic tank locations from government records across 13 states. Perfect for septic companies, home inspectors, and homeowners. Does my house have a septic tank or sewer? Find out instantly.',
  keywords: [
    'septic tank location',
    'find septic tank',
    'septic system',
    'septic tank finder',
    'where is my septic tank',
    'septic tank GPS',
    'septic tank map',
    'does my house have a septic tank',
    'septic or sewer',
    'septic inspection',
    'home inspection septic',
    'septic company software',
    'septic tank records',
    'septic tank permit',
    'septic system location',
    'find my septic tank',
  ],
  authors: [{ name: 'TankFindr' }],
  creator: 'TankFindr',
  publisher: 'TankFindr',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'TankFindr - Find Septic Tanks Instantly',
    description: 'Locate septic tanks 10x faster with GPS-accurate locations from government records. 2.2M+ tanks mapped across 13 states including Florida, California, Virginia, and more.',
    type: 'website',
    url: 'https://tankfindr.com',
    siteName: 'TankFindr',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TankFindr - AI Septic Tank Locator'
      }
    ],
    locale: 'en_US'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TankFindr - AI Septic Tank Locator',
    description: 'Find septic tanks in 5 minutes with AI-powered satellite imagery',
    images: ['/og-image.jpg']
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
    // Add Google Search Console verification here when available
    // google: 'your-verification-code'
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#10B981" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
