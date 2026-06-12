'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, MapPin, FileText, Download, AlertTriangle, CheckCircle, Calendar, Hash, Gauge, Ruler, Droplets, Home, ShieldCheck } from 'lucide-react'
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

// --- Report helpers (shared, consistent across every report) ---

// Friendly, customer-facing data-quality tier. dataQuality comes from the
// lookup pipeline ('verified_permit' | 'estimated_inventory' | 'unknown').
function tierInfo(dataQuality?: string): { label: string; cls: string; desc: string } {
  switch (dataQuality) {
    case 'verified_permit':
      return { label: 'Verified Permit', cls: 'bg-emerald-50 border-emerald-200', desc: 'Backed by an official government permit record.' }
    case 'estimated_inventory':
      return { label: 'Government Inventory', cls: 'bg-amber-50 border-amber-200', desc: 'From a state/county septic inventory — a strong signal at location-level precision.' }
    default:
      return { label: 'Location Record', cls: 'bg-gray-50 border-gray-200', desc: 'Confirmed location and status from government GIS data; no detailed permit on file for this property.' }
  }
}

// Cardinal direction from the searched address to the tank point.
function cardinalDirection(fromLat: number, fromLng: number, toLat: number, toLng: number): string | null {
  if ([fromLat, fromLng, toLat, toLng].some((v) => typeof v !== 'number' || isNaN(v))) return null
  const dLat = toLat - fromLat
  const dLng = (toLng - fromLng) * Math.cos((fromLat * Math.PI) / 180)
  if (dLat === 0 && dLng === 0) return null
  const ang = (Math.atan2(dLng, dLat) * 180) / Math.PI // 0 = North, clockwise
  const dirs = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest']
  return dirs[Math.round((((ang % 360) + 360) % 360) / 45) % 8]
}

const TIER_BADGE: Record<string, { text: string; cls: string }> = {
  verified: { text: '✓ Verified', cls: 'text-emerald-700' },
  inferred: { text: '~ Inferred', cls: 'text-amber-700' },
  reported: { text: '• Reported', cls: 'text-gray-500' },
}

// One labeled system-info field. Renders nothing if the value is absent, so the
// report degrades gracefully when the government record lacks a field.
function InfoRow({ icon: Icon, label, value, tier }: { icon: any; label: string; value?: string | number | null; tier?: 'verified' | 'inferred' | 'reported' }) {
  if (value === undefined || value === null || value === '') return null
  const badge = tier ? TIER_BADGE[tier] : null
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="font-semibold">{value}</p>
        {badge && <span className={`text-xs font-medium ${badge.cls}`}>{badge.text}</span>}
      </div>
    </div>
  )
}

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

      // Admin path — authorization is verified SERVER-SIDE inside
      // /api/generate-report from the session cookie. No admin emails or
      // bypass flags live in the client bundle anymore.
      if (reportId?.startsWith('admin_')) {
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

        // The server validates the caller's session before honoring this
        const response = await fetch('/api/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'admin_bypass',
            address,
            lat,
            lng,
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className={`p-4 rounded-lg border ${
              report.classification === 'septic' ? 'bg-emerald-50 border-emerald-200' :
              report.classification === 'sewer' || report.classification === 'likely_sewer' ? 'bg-blue-50 border-blue-200' :
              report.classification === 'likely_septic' ? 'bg-emerald-50 border-emerald-200' :
              'bg-gray-50 border-gray-200'
            }`}>
              <p className="text-sm text-gray-600 mb-1">Classification</p>
              <p className="text-xl font-bold capitalize">
                {report.classification?.replace(/_/g, ' ') || 'Unknown'}
              </p>
            </div>
            <div className={`p-4 rounded-lg border ${
              report.confidence === 'high' ? 'bg-emerald-50 border-emerald-200' :
              report.confidence === 'medium' ? 'bg-amber-50 border-amber-200' :
              'bg-gray-50 border-gray-200'
            }`}>
              <p className="text-sm text-gray-600 mb-1">Confidence</p>
              <p className="text-xl font-bold capitalize">{report.confidence || 'Low'}</p>
            </div>
            <div className={`p-4 rounded-lg border ${tierInfo(report.dataQuality).cls}`}>
              <p className="text-sm text-gray-600 mb-1">Data Quality</p>
              <p className="text-xl font-bold">{tierInfo(report.dataQuality).label}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">{tierInfo(report.dataQuality).desc}</p>
          <p className="text-gray-700">
            {report.classification === 'septic' && 
              'This property has a septic system based on official county records. The tank location and system details are included in this report.'}
            {report.classification === 'likely_septic' && 
              'This property likely has a septic system based on proximity to known septic tanks, but exact data is limited. Consider a professional inspection for confirmation.'}
            {report.classification === 'sewer' &&
              'This property appears to be connected to municipal sewer. No septic system records were found in the county database, which typically indicates sewer service availability.'}
            {report.classification === 'likely_sewer' &&
              'Septic records exist for this area, but none match this property — it is most likely connected to municipal sewer. If you believe the property is on septic, a professional inspection can confirm.'}
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
            {(report.systemInfo?.county || report.systemInfo?.state) && (
              <p className="text-sm text-gray-600 mb-1">
                Location: {[report.systemInfo?.county && `${report.systemInfo.county} County`, report.systemInfo?.state].filter(Boolean).join(', ')}
              </p>
            )}
            {typeof report.distance === 'number' && (
              <p className="text-sm text-gray-600 mb-4">
                Distance from address: {report.distance.toFixed(1)} m (≈ {Math.round(report.distance * 3.28084)} ft)
                {(() => {
                  const dir = cardinalDirection(report.lat, report.lng, report.tankPoint.lat, report.tankPoint.lng)
                  return dir ? `, ${dir} of the address` : ''
                })()}
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
        {(() => {
          const si = report.systemInfo || {}
          const hasDetail = Boolean(
            si.type || si.permitNumber || si.permitDate || si.finalInspectionDate ||
            si.capacity || si.estimatedTankSize || si.ageEstimate || si.lotSize ||
            si.propertyType || si.waterSupply || si.approvalStatus || si.taxFolio
          )
          return (
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">System Information</h2>
              {hasDetail ? (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InfoRow icon={FileText} label="System Type" value={si.type} tier={si.systemTypeVerified ? 'verified' : 'reported'} />
                    <InfoRow icon={Hash} label="Permit Number" value={si.permitNumber} tier={si.permitNumberVerified ? 'verified' : 'reported'} />
                    <InfoRow icon={Calendar} label="Permit / Approval Date" value={si.permitDate} tier={si.permitDateVerified ? 'verified' : 'reported'} />
                    <InfoRow icon={CheckCircle} label="Final Inspection" value={si.finalInspectionDate} tier="verified" />
                    <InfoRow icon={Gauge} label="Permitted Capacity" value={si.capacity} tier={si.capacityVerified ? 'verified' : 'reported'} />
                    <InfoRow icon={Ruler} label="Estimated Tank Size" value={si.estimatedTankSize} tier="inferred" />
                    <InfoRow icon={Calendar} label="System Age" value={si.ageEstimate} tier="inferred" />
                    <InfoRow icon={Ruler} label="Lot Size" value={si.lotSize} tier={si.lotSizeVerified ? 'verified' : 'reported'} />
                    <InfoRow icon={Home} label="Property Type" value={si.propertyType} tier={si.propertyTypeVerified ? 'verified' : 'reported'} />
                    <InfoRow icon={Droplets} label="Water Supply" value={si.waterSupply} tier={si.waterSupplyVerified ? 'verified' : 'reported'} />
                    <InfoRow icon={CheckCircle} label="Approval Status" value={si.approvalStatus} tier={si.approvalStatusVerified ? 'verified' : 'reported'} />
                    <InfoRow icon={Hash} label="Tax Folio / Parcel" value={si.taxFolio} tier="verified" />
                  </div>
                  <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Fields are labeled by confidence: <span className="text-emerald-700 font-medium">Verified</span> (from the permit record),
                    <span className="text-amber-700 font-medium"> Inferred</span> (calculated), and
                    <span className="text-gray-500 font-medium"> Reported</span> (from the source dataset).
                  </p>
                </>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-1">Confirmed location &amp; status for this property.</p>
                    <p>
                      Detailed permit information (permit number, system type, capacity) isn&apos;t available
                      in the government dataset for this address — common for older systems and areas where
                      only location data has been digitized. The septic/sewer status, location, and data
                      sources above still apply.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )
        })()}

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

        {/* Recommendations / Next Steps — shown on EVERY report for consistent value */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommended Next Steps</h2>
          <ul className="space-y-3 text-gray-700">
            {(report.classification === 'septic' || report.classification === 'likely_septic') && (
              <>
                <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" /><span>Use the GPS location above as your starting point, then confirm the exact lid with a probe or a professional locate before any digging.</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" /><span>Have the tank pumped and inspected every 3–5 years; if you&apos;re buying this home, schedule a septic inspection before closing.</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" /><span>Watch for warning signs: slow drains, odors, or unusually lush grass over the drain field.</span></li>
              </>
            )}
            {(report.classification === 'sewer' || report.classification === 'likely_sewer') && (
              <>
                <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" /><span>This property appears to be on municipal sewer, so routine septic maintenance shouldn&apos;t be needed.</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" /><span>If you have reason to believe there&apos;s a septic system (older home, rural area), confirm with your county health department.</span></li>
              </>
            )}
            {report.classification === 'unknown' && (
              <li className="flex items-start gap-2"><AlertTriangle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" /><span>We couldn&apos;t determine the system type from available records. Contact your county health department for historical permits, or hire a professional locator.</span></li>
            )}
            <li className="flex items-start gap-2"><AlertTriangle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" /><span>Always call 811 (&ldquo;Call Before You Dig&rdquo;) before any excavation, regardless of what this report shows.</span></li>
          </ul>
        </Card>

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
