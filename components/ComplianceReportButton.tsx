'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { PDFReportDocument } from './PDFReportDocument'
import { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

interface ButtonProps {
  tankData: {
    address: string
    lat: number
    lng: number
    confidence: number
    depth: number
    technician: string
    license: string
    company: string
  }
  onPurchase: () => Promise<{ sessionId: string }>
}

export default function ComplianceReportButton({ tankData, onPurchase }: ButtonProps) {
  const [loading, setLoading] = useState(false)
  const [purchased, setPurchased] = useState(false)

  const handlePurchase = async () => {
    setLoading(true)
    try {
      const { sessionId } = await onPurchase()
      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      if (stripe) {
        window.location.href = `https://checkout.stripe.com/c/pay/${sessionId}`
      }
    } catch (error) {
      console.error('Report purchase error:', error)
      alert('Failed to start payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (purchased) {
    return (
      <PDFDownloadLink
        document={<PDFReportDocument 
          data={{
            ...tankData,
            date: new Date().toLocaleDateString(),
            mapImageUrl: `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${tankData.lng},${tankData.lat},18,0/800x600?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
          }} 
        />}
        fileName={`septic-tank-report-${Date.now()}.pdf`}
      >
        {({ loading: pdfLoading }) => (
          <button 
            disabled={pdfLoading}
            className="w-full bg-green-600 text-white font-bold min-h-[60px] px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            {pdfLoading ? 'Preparing PDF...' : 'Download Your Report'}
          </button>
        )}
      </PDFDownloadLink>
    )
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="w-full bg-blue-600 text-white font-bold min-h-[60px] px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
    >
      <FileText className="w-5 h-5" />
      {loading ? 'Redirecting to payment...' : 'Download Compliance Report ($25)'}
    </button>
  )
}
