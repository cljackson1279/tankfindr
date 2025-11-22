'use client'

import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { 
    padding: 40, 
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#1F2937'
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#10B981',
    textAlign: 'center'
  },
  section: { 
    marginBottom: 15,
    borderBottom: '1pt solid #E5E7EB',
    paddingBottom: 8
  },
  label: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#374151',
    marginBottom: 4
  },
  value: { 
    fontSize: 12, 
    marginBottom: 3,
    fontWeight: 'medium'
  },
  warningBox: { 
    backgroundColor: '#FEF3C7', 
    padding: 12, 
    borderRadius: 4, 
    marginVertical: 10,
    border: '1pt solid #F59E0B'
  },
  warningText: { 
    color: '#B45309',
    fontSize: 11,
    fontWeight: 'bold'
  },
  footer: { 
    position: 'absolute', 
    bottom: 30, 
    left: 30, 
    right: 30, 
    fontSize: 9, 
    color: '#6B7280',
    textAlign: 'center',
    borderTop: '1pt solid #E5E7EB',
    paddingTop: 10
  },
  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  column: {
    width: '48%'
  },
  mapImage: {
    width: '100%',
    height: 300,
    marginVertical: 15,
    objectFit: 'cover'
  }
})

interface ReportData {
  address: string
  lat: number
  lng: number
  confidence: number
  depth: number
  date: string
  technician: string
  license: string
  company: string
  mapImageUrl: string
}

export function PDFReportDocument({ data }: { data: ReportData }) {
  const getConfidenceStatus = () => {
    if (data.confidence >= 85) return { text: 'HIGH ACCURACY - SUITABLE FOR INSPECTION', color: '#10B981' }
    if (data.confidence >= 70) return { text: 'MEDIUM ACCURACY - MANUAL VERIFICATION REQUIRED', color: '#F59E0B' }
    return { text: 'LOW ACCURACY - EXTENSIVE VERIFICATION REQUIRED', color: '#EF4444' }
  }

  const confidence = getConfidenceStatus()

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>SEPTIC TANK LOCATION REPORT</Text>
        
        <View style={styles.section}>
          <Text style={styles.label}>PROPERTY INFORMATION</Text>
          <Text style={styles.value}>{data.address}</Text>
        </View>

        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <Text style={styles.label}>GPS COORDINATES</Text>
            <Text style={styles.value}>Latitude: {data.lat.toFixed(6)}</Text>
            <Text style={styles.value}>Longitude: {data.lng.toFixed(6)}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>INSPECTION DATE</Text>
            <Text style={styles.value}>{data.date}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>AI CONFIDENCE SCORE</Text>
          <Text style={styles.value}>{data.confidence}%</Text>
          <View style={{ ...styles.warningBox, backgroundColor: confidence.color + '20', borderColor: confidence.color }}>
            <Text style={{ ...styles.warningText, color: confidence.color }}>{confidence.text}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>ESTIMATED DEPTH</Text>
          <Text style={styles.value}>{data.depth} feet below ground surface</Text>
        </View>

        {data.mapImageUrl && (
          <View style={styles.section}>
            <Text style={styles.label}>SATELLITE IMAGERY</Text>
            <Image src={data.mapImageUrl} style={styles.mapImage} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>METHODOLOGY</Text>
          <Text style={styles.value}>
            Location derived from 30cm satellite imagery analyzed by convolutional neural network trained on verified septic tank installations. Confidence score indicates model certainty based on visual indicators including soil disturbance patterns, vegetation stress analysis, and proximity to property structures.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>VERIFICATION GUIDELINES</Text>
          {data.confidence >= 85 ? (
            <Text style={styles.value}>
              • Probe primary marker location first{"\n"}
              • Tank typically 2-4 ft deep{"\n"}
              • Look for 4-6 ft wide concrete/fiberglass structure
            </Text>
          ) : data.confidence >= 70 ? (
            <Text style={styles.value}>
              • Probe primary marker location{"\n"}
              • Check 50ft radius around marker{"\n"}
              • Inspect inlet/outlet pipes for guidance{"\n"}
              • Verify with property owner knowledge
            </Text>
          ) : (
            <Text style={styles.value}>
              • Probe 100ft radius systematically{"\n"}
              • Check county permit records{"\n"}
              • Inspect property for visual clues (green stripes, depressions){"\n"}
              • Consider professional locating service for verification
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>INSPECTOR CERTIFICATION</Text>
          <Text style={styles.value}>Technician: {data.technician}</Text>
          <Text style={styles.value}>License #: {data.license}</Text>
          <Text style={styles.value}>Company: {data.company}</Text>
        </View>

        <Text style={styles.footer}>
          This report is generated by TankFindr AI and is intended as a locating aid only. Actual tank location should be verified by physical inspection. TankFindr is not liable for excavation costs or property damage resulting from reliance on this report. Report ID: {Date.now()}
        </Text>
      </Page>
    </Document>
  )
}
