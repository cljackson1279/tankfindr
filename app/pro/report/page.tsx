'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, MapPin, FileText, Home, Calendar, Droplets, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface ReportData {
  address: string
  tankPoint: { lat: number; lng: number }
  distance: number
  classification: string
  confidence: string
  systemInfo: any
  dataQuality?: 'verified_permit' | 'estimated_inventory'
  qualitySource?: string
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
      const lat = searchParams.get('lat')
      const lng = searchParams.get('lng')
      const tankLat = searchParams.get('tankLat')
      const tankLng = searchParams.get('tankLng')
      const classification = searchParams.get('classification')
      const confidence = searchParams.get('confidence')
      const distance = searchParams.get('distance')

      if (!address || !tankLat || !tankLng) {
        throw new Error('Missing report data')
      }

      // Fetch system info from the tank location
      const response = await fetch('/api/septic-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: parseFloat(tankLat),
          lng: parseFloat(tankLng),
        }),
      })

      const data = await response.json()

      setReport({
        address: address,
        tankPoint: {
          lat: parseFloat(tankLat),
          lng: parseFloat(tankLng),
        },
        distance: distance ? parseFloat(distance) : 0,
        classification: classification || 'unknown',
        confidence: confidence || 'unknown',
        systemInfo: data.systemInfo || {},
        dataQuality: data.systemInfo?.dataQuality,
        qualitySource: data.systemInfo?.qualitySource,
      })

      setLoading(false)
    } catch (err: any) {
      console.error('Error loading report:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  const getDataQualityBadge = () => {
    if (report?.dataQuality === 'verified_permit') {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <div className="font-semibold text-green-900">Verified Permit Data</div>
            <div className="text-sm text-green-700">{report.qualitySource}</div>
          </div>
        </div>
      )
    } else if (report?.dataQuality === 'estimated_inventory') {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <div className="font-semibold text-yellow-900">Estimated Data (2009-2015 Inventory)</div>
            <div className="text-sm text-yellow-700">{report.qualitySource}</div>
          </div>
        </div>
      )
    }
    return null
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

  const { systemInfo } = report

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Septic System Report</h1>
            <p className="text-lg text-gray-600 mb-4">{report.address}</p>
            {getDataQualityBadge()}
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

        {/* System Information */}
        {systemInfo && Object.keys(systemInfo).length > 0 && (
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold">System Information</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {systemInfo.permitNumber && (
                <div>
                  <p className="text-sm text-gray-600">Permit Number</p>
                  <p className="font-semibold">{systemInfo.permitNumber}</p>
                </div>
              )}

              {systemInfo.systemType && (
                <div>
                  <p className="text-sm text-gray-600">System Type</p>
                  <p className="font-semibold">{systemInfo.systemType}</p>
                </div>
              )}

              {systemInfo.capacity && (
                <div>
                  <p className="text-sm text-gray-600">Daily Capacity</p>
                  <p className="font-semibold">{systemInfo.capacity} gallons/day</p>
                </div>
              )}

              {systemInfo.approvalDate && (
                <div>
                  <p className="text-sm text-gray-600">Approval Date</p>
                  <p className="font-semibold">{new Date(systemInfo.approvalDate * 1000).toLocaleDateString()}</p>
                </div>
              )}

              {systemInfo.propertyType && (
                <div>
                  <p className="text-sm text-gray-600">Property Type</p>
                  <p className="font-semibold">{systemInfo.propertyType}</p>
                </div>
              )}

              {systemInfo.lotSize && (
                <div>
                  <p className="text-sm text-gray-600">Lot Size</p>
                  <p className="font-semibold">{systemInfo.lotSize} acres</p>
                </div>
              )}

              {systemInfo.parcelNumber && (
                <div>
                  <p className="text-sm text-gray-600">Parcel Number</p>
                  <p className="font-semibold font-mono text-sm">{systemInfo.parcelNumber}</p>
                </div>
              )}

              {systemInfo.waterSupply && (
                <div>
                  <p className="text-sm text-gray-600">Water Supply</p>
                  <p className="font-semibold">{systemInfo.waterSupply}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Data Quality Warning for Estimated Records */}
        {report.dataQuality === 'estimated_inventory' && (
          <Card className="p-6 mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-2">⚠️ Estimated Inventory Records</h3>
                <p className="text-sm text-yellow-800 mb-2">
                  This data is from the Florida DOH 2009-2015 statewide septic inventory and represents an <strong>estimate</strong> based on property characteristics, not a verified permit.
                </p>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Tank location is approximate (property centroid)</li>
                  <li>System details may be incomplete or outdated</li>
                  <li>Professional field verification recommended</li>
                  <li>Not a substitute for official permit records</li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Disclaimer */}
        <Card className="p-6 bg-gray-50">
          <h3 className="font-bold text-gray-900 mb-2">Professional Use Only</h3>
          <p className="text-sm text-gray-600">
            This report is provided for professional contractor use and preliminary assessment. All data is sourced from public records and may not reflect current conditions. Tank locations should be verified in the field. Always conduct proper site assessment and obtain necessary permits from your local health department.
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
