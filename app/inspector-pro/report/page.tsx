'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'
import { Loader2, MapPin, FileText, Download, CheckCircle, AlertTriangle, Info, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function InspectorReport() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [reportData, setReportData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const address = searchParams.get('address')

  useEffect(() => {
    if (lat && lng && address) {
      checkAuthAndGenerateReport()
    } else {
      setError('Missing required parameters')
      setLoading(false)
    }
  }, [lat, lng, address])

  const checkAuthAndGenerateReport = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login?redirect=/inspector-pro/dashboard')
      return
    }

    setUser(user)

    // Check subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', user.id)
      .single()

    if (!profile || profile.subscription_tier !== 'inspector' || profile.subscription_status !== 'active') {
      router.push('/inspector-pro')
      return
    }

    // Generate the report
    await generateReport()
  }

  const generateReport = async () => {
    try {
      // Call the septic lookup API
      const response = await fetch('/api/pro/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          lat: parseFloat(lat!),
          lng: parseFloat(lng!),
          address: address,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      setReportData(data)

      // Log the usage (with error handling)
      try {
        const supabase = createClient()
        const { error: usageError } = await supabase.from('usage').insert({
          user_id: user.id,
          action: 'inspector_report',
          payment_type: 'subscription',
          metadata: {
            lat: parseFloat(lat!),
            lng: parseFloat(lng!),
          address: address,
            classification: data.classification,
          },
        })
        
        if (usageError) {
          console.warn('Usage tracking failed (non-critical):', usageError.message)
          // Don't throw - this shouldn't block the user
        }
      } catch (usageErr) {
        console.error('Unexpected error in usage tracking:', usageErr)
        // Continue anyway - don't block report generation
      }

      setLoading(false)
    } catch (error) {
      console.error('Error generating report:', error)
      setError('Failed to generate report. Please try again.')
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    // TODO: Implement PDF generation
    alert('PDF download coming soon!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Generating your report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Generating Report</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/inspector-pro/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const systemInfo = reportData?.systemInfo || {}
  const classification = reportData?.classification || 'unknown'
  const confidence = reportData?.confidence || 'low'
  const tankPoint = reportData?.tankPoint

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/inspector-pro/dashboard">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Header */}
        <Card className="p-8 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Septic System Report
            </h1>
            <p className="text-gray-600">{address}</p>
            <p className="text-sm text-gray-500 mt-2">
              Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
          </div>

          {/* Classification Badge */}
          <div className="flex justify-center">
            {classification === 'septic' && (
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Septic System Confirmed</span>
                <span className="text-sm">({confidence} confidence)</span>
              </div>
            )}
            {classification === 'sewer' && (
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-6 py-3 rounded-full">
                <Info className="w-5 h-5" />
                <span className="font-semibold">Municipal Sewer System</span>
              </div>
            )}
            {classification === 'likely_septic' && (
              <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-6 py-3 rounded-full">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Likely Septic System</span>
                <span className="text-sm">({confidence} confidence)</span>
              </div>
            )}
            {classification === 'unknown' && (
              <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-6 py-3 rounded-full">
                <Info className="w-5 h-5" />
                <span className="font-semibold">Status Unknown</span>
              </div>
            )}
          </div>
        </Card>

        {/* Verified Information */}
        {(classification === 'septic' || classification === 'likely_septic') && systemInfo && (
          <>
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold">Verified Information</h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                The following information comes from official county permit records and state GIS databases.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {systemInfo.type && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">System Type</p>
                    <p className="text-lg">{systemInfo.type}</p>
                    {systemInfo.systemTypeVerified && (
                      <p className="text-xs text-green-600 mt-1">✓ Verified from permit records</p>
                    )}
                  </div>
                )}

                {systemInfo.permitNumber && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Permit Number</p>
                    <p className="text-lg font-mono">{systemInfo.permitNumber}</p>
                    {systemInfo.permitNumberVerified && (
                      <p className="text-xs text-green-600 mt-1">✓ Verified from permit records</p>
                    )}
                  </div>
                )}

                {systemInfo.approvalDate && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Approval Date</p>
                    <p className="text-lg">{systemInfo.approvalDate}</p>
                    {systemInfo.permitDateVerified && (
                      <p className="text-xs text-green-600 mt-1">✓ Verified from permit records</p>
                    )}
                  </div>
                )}

                {systemInfo.capacity && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">System Capacity</p>
                    <p className="text-lg">{systemInfo.capacity}</p>
                    {systemInfo.capacityVerified && (
                      <p className="text-xs text-green-600 mt-1">✓ Verified from permit records</p>
                    )}
                  </div>
                )}

                {systemInfo.lotSize && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Lot Size</p>
                    <p className="text-lg">{systemInfo.lotSize}</p>
                    {systemInfo.lotSizeVerified && (
                      <p className="text-xs text-green-600 mt-1">✓ Verified from tax records</p>
                    )}
                  </div>
                )}

                {systemInfo.propertyType && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Property Type</p>
                    <p className="text-lg">{systemInfo.propertyType}</p>
                    {systemInfo.propertyTypeVerified && (
                      <p className="text-xs text-green-600 mt-1">✓ Verified from permit records</p>
                    )}
                  </div>
                )}

                {systemInfo.waterSupply && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Water Supply</p>
                    <p className="text-lg">{systemInfo.waterSupply}</p>
                    {systemInfo.waterSupplyVerified && (
                      <p className="text-xs text-green-600 mt-1">✓ Verified from permit records</p>
                    )}
                  </div>
                )}

                {systemInfo.approvalStatus && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Approval Status</p>
                    <p className="text-lg">{systemInfo.approvalStatus}</p>
                    {systemInfo.approvalStatusVerified && (
                      <p className="text-xs text-green-600 mt-1">✓ Verified from permit records</p>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Inferred Information */}
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Inferred Information</h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                The following information is calculated or estimated based on verified data and industry standards.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {systemInfo.estimatedTankSize && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Estimated Tank Size</p>
                    <p className="text-lg">{systemInfo.estimatedTankSize}</p>
                    <p className="text-xs text-blue-600 mt-1">ℹ Estimated from system capacity</p>
                  </div>
                )}

                {systemInfo.ageEstimate && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">System Age</p>
                    <p className="text-lg">{systemInfo.ageEstimate}</p>
                    <p className="text-xs text-blue-600 mt-1">ℹ Calculated from approval date</p>
                  </div>
                )}

                {tankPoint && (
                  <>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">GPS Coordinates</p>
                      <p className="text-lg font-mono">{tankPoint.lat.toFixed(6)}, {tankPoint.lng.toFixed(6)}</p>
                      <p className="text-xs text-green-600 mt-1">✓ From county GIS data</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Distance from Address</p>
                      <p className="text-lg">
                        {reportData.nearestFeatures?.[0]?.distance_meters 
                          ? `${Math.round(reportData.nearestFeatures[0].distance_meters * 3.28084)} feet`
                          : 'Unknown'}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">ℹ Calculated from GPS coordinates</p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Map */}
            {tankPoint && (
              <Card className="p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">Tank Location</h2>
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/pin-l-marker+ff0000(${tankPoint.lng},${tankPoint.lat})/${tankPoint.lng},${tankPoint.lat},17,0/800x600@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
                    alt="Tank Location Map"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Red marker indicates the approximate location of the septic tank based on county GIS data.
                </p>
              </Card>
            )}
          </>
        )}

        {/* Disclaimer */}
        <Card className="p-6 bg-gray-50 border-gray-300">
          <h3 className="font-bold mb-2">Important Disclaimer</h3>
          <p className="text-sm text-gray-700">
            This report is provided for informational purposes only and should not be considered a substitute for a professional septic system inspection. 
            All data is sourced from public records and may not reflect current conditions. Tank locations are approximate and should be verified in the field. 
            TankFindr makes no warranties regarding the accuracy or completeness of this information.
          </p>
        </Card>
      </div>
    </div>
  )
}
