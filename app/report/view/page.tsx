'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, MapPin, FileText, Download, AlertTriangle, CheckCircle, Calendar, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// Dynamically import map to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
})

function ReportViewContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [upsells, setUpsells] = useState<string[]>([])

  useEffect(() => {
    loadReport()
  }, [])

  const loadReport = async () => {
    try {
      const reportId = searchParams?.get('id')
      const sessionId = searchParams?.get('session_id')
      const address = searchParams?.get('address')
      const lat = parseFloat(searchParams?.get('lat') || '')
      const lng = parseFloat(searchParams?.get('lng') || '')

      // Check if admin bypass
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const isAdmin = user?.email === 'cljackson79@gmail.com'

      // Admin bypass - generate report without payment using REAL Supabase data
      if (isAdmin && reportId?.startsWith('admin_')) {
        if (!address || isNaN(lat) || isNaN(lng)) {
          throw new Error('Invalid report parameters')
        }

        // Parse upsells from URL
        const upsellsParam = searchParams?.get('upsells')
        let parsedUpsells: string[] = []
        if (upsellsParam) {
          try {
            parsedUpsells = JSON.parse(decodeURIComponent(upsellsParam))
          } catch (e) {
            console.error('Failed to parse upsells:', e)
          }
        }
        setUpsells(parsedUpsells)

        console.log('ADMIN_REPORT_GENERATION', {
          userEmail: user.email,
          address,
          lat,
          lng,
          dataSource: 'supabase',
          bypassedPayment: true,
          upsells: parsedUpsells
        })

        // Call the same report generation endpoint but with admin flag and upsells
        const response = await fetch('/api/generate-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Bypass': 'true' // Signal to skip payment verification
          },
          body: JSON.stringify({
            sessionId: 'admin_bypass',
            address,
            lat,
            lng,
            adminEmail: user.email,
            upsells: parsedUpsells
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate report')
        }

        console.log('ADMIN_REPORT_LOADED', {
          hasRealData: true,
          classification: data.classification,
          tankFound: !!data.tankPoint,
          sourcesCount: data.sources?.length || 0,
          tablesUsed: ['septic_sources', 'septic_tanks', 'property_reports']
        })

        setReport(data)
        setLoading(false)
        return
      }

      // Regular flow - verify payment
      if (!sessionId || !address || isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid report parameters')
      }

      // Verify payment and generate report
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, address, lat, lng }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report')
      }

      setReport(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!report) return

    try {
      // Show loading state
      const downloadButton = document.querySelector('[data-download-button]') as HTMLButtonElement
      if (downloadButton) {
        downloadButton.disabled = true
        downloadButton.textContent = 'Generating PDF...'
      }

      // Get the report content element
      const reportElement = document.getElementById('report-content')
      if (!reportElement) {
        throw new Error('Report content not found')
      }

      // Hide the download button temporarily
      const buttonsToHide = document.querySelectorAll('.print\\:hidden')
      buttonsToHide.forEach(el => (el as HTMLElement).style.display = 'none')

      // Capture the report as canvas
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      // Show buttons again
      buttonsToHide.forEach(el => (el as HTMLElement).style.display = '')

      // Calculate PDF dimensions
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      let position = 0

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add new pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Generate filename from address
      const filename = `TankFindr-Report-${report.address.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`

      // Download the PDF
      pdf.save(filename)

      // Reset button
      if (downloadButton) {
        downloadButton.disabled = false
        downloadButton.innerHTML = '<svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>Download as PDF'
      }
    } catch (error) {
      console.error('PDF generation error:', error)
      alert('Failed to generate PDF. Please try again or use Print to PDF from your browser.')
    }
  }

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'low': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Generating your report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/report">
            <Button>Try Again</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 print:mb-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 print:text-2xl">
            Property Septic Status & Location Report
          </h1>
          <p className="text-gray-600">{report.address}</p>
          <p className="text-sm text-gray-500 mt-2">
            Generated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Download Button */}
        <div className="mb-6 print:hidden">
          <Button
            onClick={handleDownload}
            data-download-button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download as PDF
          </Button>
        </div>

        {/* Report Content Wrapper for PDF */}
        <div id="report-content">

        {/* Classification */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Septic Status</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className={`flex-1 p-4 rounded-lg border ${
              report.classification === 'septic' ? 'bg-emerald-50 border-emerald-200' : 
              report.classification === 'sewer' ? 'bg-blue-50 border-blue-200' : 
              'bg-gray-50 border-gray-200'
            }`}>
              <p className="text-sm text-gray-600 mb-1">Classification</p>
              <p className="text-xl font-bold capitalize">
                {report.classification?.replace('_', ' ') || 'Unknown'}
              </p>
            </div>
            <div className={`flex-1 p-4 rounded-lg border ${
              report.confidence === 'high' ? 'bg-emerald-50 border-emerald-200' : 
              report.confidence === 'medium' ? 'bg-amber-50 border-amber-200' : 
              'bg-gray-50 border-gray-200'
            }`}>
              <p className="text-sm text-gray-600 mb-1">Confidence</p>
              <p className="text-xl font-bold capitalize">{report.confidence}</p>
            </div>
          </div>
          <p className="text-gray-700">
            {report.classification === 'septic' && 
              'This property has a septic system based on official county records. The tank location and system details are included in this report.'}
            {report.classification === 'likely_septic' && 
              'This property likely has a septic system based on proximity to known septic tanks, but exact data is limited. Consider a professional inspection for confirmation.'}
            {report.classification === 'sewer' && 
              'This property appears to be connected to municipal sewer. No septic system records were found in the county database, which typically indicates sewer service availability.'}
            {report.classification === 'unknown' && 
              'Unable to determine wastewater system type. This area may not have complete data coverage, or records may not be available.'}
          </p>
        </Card>

        {/* Tank Location */}
        {report.tankPoint && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tank Location</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Latitude</p>
                <p className="font-mono text-lg">{report.tankPoint.lat.toFixed(6)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Longitude</p>
                <p className="font-mono text-lg">{report.tankPoint.lng.toFixed(6)}</p>
              </div>
            </div>
            {report.distance && (
              <p className="text-sm text-gray-600 mb-4">
                Distance from address: {report.distance.toFixed(1)} meters
              </p>
            )}
            <div className="print:hidden">
              <MapComponent
                lat={report.tankPoint.lat}
                lng={report.tankPoint.lng}
                searchLat={report.lat}
                searchLng={report.lng}
              />
            </div>
          </Card>
        )}

        {/* System Information */}
        {report.systemInfo && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">System Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {report.systemInfo.type && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">System Type</p>
                    <p className="font-semibold">{report.systemInfo.type}</p>
                  </div>
                </div>
              )}
              {report.systemInfo.permitNumber && (
                <div className="flex items-start gap-3">
                  <Hash className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Permit Number</p>
                    <p className="font-semibold">{report.systemInfo.permitNumber}</p>
                  </div>
                </div>
              )}
              {report.systemInfo.permitDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Permit Date</p>
                    <p className="font-semibold">
                      {new Date(report.systemInfo.permitDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              {report.systemInfo.ageEstimate && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Age Estimate</p>
                    <p className="font-semibold">{report.systemInfo.ageEstimate}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Risk Assessment */}
        {report.riskLevel && (
          <Card className={`p-6 mb-6 ${getRiskColor(report.riskLevel)}`}>
            <h2 className="text-2xl font-bold mb-4">Risk Assessment</h2>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 mt-0.5" />
              <div>
                <p className="font-bold text-lg capitalize mb-2">{report.riskLevel} Risk</p>
                <p>
                  {report.riskLevel === 'high' && 
                    'This system is over 25 years old and may need replacement soon. Consider a professional inspection.'}
                  {report.riskLevel === 'medium' && 
                    'This system is 15-25 years old. Regular maintenance is recommended.'}
                  {report.riskLevel === 'low' && 
                    'This system is relatively new (under 15 years). Continue regular maintenance.'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Environmental Risk Add-On */}
        {upsells.includes('environmental') && !report.environmentalRisk && (
          <Card className="p-6 mb-6 bg-yellow-50 border-yellow-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Environmental Risk Assessment</h2>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-800 font-medium mb-2">
                  ⏳ Environmental Risk Data Coming Soon
                </p>
                <p className="text-sm text-gray-700">
                  Thank you for purchasing this add-on! We're currently integrating with FEMA, USGS, and EPA databases to provide accurate flood zone, wetlands, soil type, and environmental hazard data for your property.
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  You'll receive an email notification when your environmental risk assessment is ready, typically within 24-48 hours.
                </p>
              </div>
            </div>
          </Card>
        )}
        {report.environmentalRisk && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Environmental Risk Assessment</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Flood Zone</p>
                <p className="font-semibold">{report.environmentalRisk.floodZone}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Wetlands</p>
                <p className="font-semibold">{report.environmentalRisk.wetlands}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Soil Type</p>
                <p className="font-semibold">{report.environmentalRisk.soilType}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Environmental Hazards</p>
                <p className="font-semibold">{report.environmentalRisk.hazards}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Well & Groundwater Risk Add-On */}
        {upsells.includes('well') && !report.groundwaterRisk && (
          <Card className="p-6 mb-6 bg-yellow-50 border-yellow-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Well & Groundwater Risk Assessment</h2>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-800 font-medium mb-2">
                  ⏳ Groundwater Risk Data Coming Soon
                </p>
                <p className="text-sm text-gray-700">
                  Thank you for purchasing this add-on! We're currently integrating with USGS, Florida DEP, and EPA databases to provide accurate well locations, water table depth, contamination risk, and aquifer data for your property.
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  You'll receive an email notification when your groundwater risk assessment is ready, typically within 24-48 hours.
                </p>
              </div>
            </div>
          </Card>
        )}
        {report.groundwaterRisk && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Well & Groundwater Risk Assessment</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-cyan-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Nearby Wells</p>
                <p className="font-semibold">{report.groundwaterRisk.nearbyWells}</p>
              </div>
              <div className="bg-cyan-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Water Table Depth</p>
                <p className="font-semibold">{report.groundwaterRisk.waterTableDepth}</p>
              </div>
              <div className="bg-cyan-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Contamination Risk</p>
                <p className="font-semibold">{report.groundwaterRisk.contaminationRisk}</p>
              </div>
              <div className="bg-cyan-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Aquifer</p>
                <p className="font-semibold">{report.groundwaterRisk.aquifer}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Data Sources */}
        {report.sources && report.sources.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sources</h2>
            <ul className="space-y-2">
              {report.sources.map((source: any, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">{source.name}</p>
                    <p className="text-sm text-gray-600">
                      {source.county && `${source.county}, `}{source.state} • {source.quality} quality
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Disclaimer */}
        <Card className="p-6 bg-gray-50">
          <h3 className="font-bold text-gray-900 mb-2">Disclaimer</h3>
          <p className="text-sm text-gray-600">
            This report is based on publicly available county records and should be used for informational 
            purposes only. Tank locations are estimates based on permit records and may not reflect current 
            conditions. Always verify with a professional inspection before excavation. TankFindr is not 
            responsible for any damages resulting from the use of this information.
          </p>
        </Card>

        </div>
        {/* End Report Content */}

        {/* CTA */}
        <div className="mt-8 text-center print:hidden">
          <p className="text-gray-700 mb-4">
            Need reports for multiple properties?
          </p>
          <Link href="/pricing-pro">
            <Button variant="outline">
              View TankFindr Pro Plans
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ReportViewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <ReportViewContent />
    </Suspense>
  )
}
