'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, MapPin, FileText, Home, Calendar, Droplets, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ReportData {
  address: string
  tankPoint: { lat: number; lng: number }
  distance: number
  classification: string
  confidence: string
}

function ProReportContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReport()
  }, [])

  const loadReport = async () => {
    try {
      // Get report data from URL params
      const address = searchParams.get('address')
      const tankLat = searchParams.get('tankLat')
      const tankLng = searchParams.get('tankLng')
      const classification = searchParams.get('classification')
      const confidence = searchParams.get('confidence')
      const distance = searchParams.get('distance')

      if (!address || !tankLat || !tankLng) {
        throw new Error('Missing report data')
      }

      setReport({
        address: address,
        tankPoint: {
          lat: parseFloat(tankLat),
          lng: parseFloat(tankLng),
        },
        distance: distance ? parseFloat(distance) : 0,
        classification: classification || 'unknown',
        confidence: confidence || 'unknown',
      })

      setLoading(false)
    } catch (err: any) {
      console.error('Error loading report:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-center mb-2">Error Loading Report</h2>
          <p className="text-gray-600 text-center mb-4">{error || 'Report not found'}</p>
          <Button onClick={() => router.push('/pro')} className="w-full">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/pro')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Septic Tank Location Report</h1>
            <p className="text-lg text-gray-600">{report.address}</p>
          </div>
        </div>

        {/* Classification Status */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            {report.classification === 'confirmed' || report.classification === 'likely_septic' ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-gray-400" />
            )}
            <div>
              <h2 className="text-2xl font-bold">
                {report.classification === 'confirmed' && 'Septic System Confirmed'}
                {report.classification === 'likely_septic' && 'Likely Septic System'}
                {report.classification === 'sewer' && 'Municipal Sewer System'}
                {!['confirmed', 'likely_septic', 'sewer'].includes(report.classification) && 'Septic Tank Located'}
              </h2>
              <p className="text-gray-600 capitalize">Confidence: {report.confidence}</p>
            </div>
          </div>
        </Card>

        {/* Tank Location Map */}
        {report.tankPoint && (
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold">Tank Location</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">GPS Coordinates</p>
                <p className="font-mono text-lg">
                  {report.tankPoint.lat.toFixed(6)}, {report.tankPoint.lng.toFixed(6)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Distance from Address</p>
                <p className="text-lg font-semibold">
                  {report.distance ? `${Math.round(report.distance * 3.28084)} feet` : 'On property'}
                </p>
              </div>
            </div>

            {/* Satellite Map */}
            <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden mb-4">
              <iframe
                src={`https://www.google.com/maps?q=${report.tankPoint.lat},${report.tankPoint.lng}&z=19&t=k&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => window.open(`https://www.google.com/maps?q=${report.tankPoint.lat},${report.tankPoint.lng}&z=19&t=k`, '_blank')}
                className="flex-1"
              >
                Open in Google Maps
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(`${report.tankPoint.lat}, ${report.tankPoint.lng}`)
                  alert('Coordinates copied to clipboard!')
                }}
              >
                Copy Coordinates
              </Button>
            </div>
          </Card>
        )}

        {/* Information Notice */}
        <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">📍 Tank Location Data</h3>
              <p className="text-sm text-blue-800 mb-2">
                This report shows the GPS coordinates of the septic tank based on county permit records and our database of 2.2+ million septic systems across 13 states.
              </p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Coordinates are from official county permit records where available</li>
                <li>Some locations may be approximate based on property data</li>
                <li>Always verify tank location in the field before excavation</li>
                <li>Use coordinates with GPS device or mapping app for on-site location</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Disclaimer */}
        <Card className="p-6 bg-gray-50">
          <h3 className="font-bold text-gray-900 mb-2">Professional Use Only</h3>
          <p className="text-sm text-gray-600">
            This report is provided for professional contractor use and preliminary assessment. All data is sourced from public records and may not reflect current conditions. Tank locations should be verified in the field before any excavation or work begins. Always conduct proper site assessment and obtain necessary permits from your local health department.
          </p>
        </Card>

        {/* Print/Download Actions */}
        <div className="mt-6 flex gap-4">
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="flex-1"
          >
            <FileText className="w-4 h-4 mr-2" />
            Print Report
          </Button>
          <Button
            onClick={() => router.push('/pro')}
            className="flex-1"
          >
            New Lookup
          </Button>
        </div>

        {/* Data Quality Feedback */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Is this information incorrect?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Help us improve TankFindr's data quality by reporting inaccuracies. Your feedback helps us maintain the most accurate septic system database.
          </p>
          <Button
            onClick={() => {
              const subject = encodeURIComponent(`Data Correction: ${report?.address}`);
              const body = encodeURIComponent(`Property Address: ${report?.address}\n\nCurrent Classification: ${report?.classification}\nCurrent Confidence: ${report?.confidence}\n\nWhat's incorrect:\n[Please describe the issue]\n\nCorrect information:\n[Please provide the correct information]\n\nEvidence (optional):\n[e.g., MLS listing, pump receipt, county permit number]`);
              window.open(`mailto:support@tankfindr.com?subject=${subject}&body=${body}`, '_blank');
            }}
            variant="outline"
            className="w-full sm:w-auto"
          >
            📝 Report Incorrect Data
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ProReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <ProReportContent />
    </Suspense>
  )
}
