import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TankFindr - AI Septic Tank Locator | Find Tanks in 5 Minutes',
  description: 'Find septic tanks in 5 minutes with AI-powered satellite imagery analysis. 85% accuracy, confidence scoring, and Google Maps integration. Save 3+ hours per job.',
  keywords: 'septic tank locator, septic service, AI satellite imagery, GPS tank location, septic inspection, septic pumping, tank finder, septic system',
  authors: [{ name: 'TankFindr' }],
  creator: 'TankFindr',
  publisher: 'TankFindr',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'TankFindr - AI Septic Tank Locator',
    description: 'Find septic tanks in 5 minutes with AI-powered satellite imagery. 85% accuracy with confidence scoring.',
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
