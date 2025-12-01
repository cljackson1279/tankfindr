import { NextResponse } from 'next/server'
import { getSepticContextForLocation } from '@/lib/septicLookup'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  console.log('🚀 Inspector Report API v2 - Fresh endpoint')
  
  try {
    const body = await request.json()
    const { lat, lng, address } = body
    
    // Validate inputs
    if (!lat || !lng || !address) {
      console.error('❌ Missing required fields:', { lat, lng, address })
      return NextResponse.json(
        { error: 'Missing required fields: lat, lng, address' },
        { status: 400 }
      )
    }

    console.log('📍 Generating report for:', { lat, lng, address })

    // Get septic context using the existing lookup function
    const septicContext = await getSepticContextForLocation(
      parseFloat(lat),
      parseFloat(lng),
      200 // search radius in meters
    )

    console.log('✅ Septic context retrieved:', {
      classification: septicContext.classification,
      confidence: septicContext.confidence,
      isCovered: septicContext.isCovered,
      nearestFeaturesCount: septicContext.nearestFeatures?.length || 0,
      hasSystemInfo: !!septicContext.systemInfo,
      systemInfo: septicContext.systemInfo
    })

    // Return the full septic context
    return NextResponse.json({
      success: true,
      ...septicContext,
      generatedAt: new Date().toISOString(),
      apiVersion: 'v2'
    })

  } catch (error: any) {
    console.error('💥 Inspector Report API error:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate report',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
