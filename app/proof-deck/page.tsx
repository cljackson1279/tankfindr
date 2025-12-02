/**
 * Proof Deck Page - Printable One-Pager
 * 
 * This page renders the ProofOnePager component for PDF export.
 * 
 * How to use:
 * 1. Visit https://tankfindr.com/proof-deck in your browser
 * 2. Press Cmd/Ctrl + P to open Print dialog
 * 3. Select "Save as PDF" as destination
 * 4. Click Save
 * 5. Email the PDF to septic companies
 * 
 * The page is optimized for Letter/A4 paper size.
 */

import ProofOnePager from '@/components/ProofOnePager'

export default function ProofDeckPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <ProofOnePager
        contactEmail="chris@tankfindr.com"
        contactPhone="(555) 123-4567"
        websiteUrl="https://tankfindr.com"
      />
      
      {/* Instructions (hidden when printing) */}
      <div className="max-w-[8.5in] mx-auto mt-8 print:hidden">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">📄 How to Export as PDF</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Press <kbd className="px-2 py-1 bg-white rounded border border-blue-300 font-mono text-xs">Cmd+P</kbd> (Mac) or <kbd className="px-2 py-1 bg-white rounded border border-blue-300 font-mono text-xs">Ctrl+P</kbd> (Windows)</li>
            <li>Select "Save as PDF" as the destination</li>
            <li>Click "Save" and choose a location</li>
            <li>Email the PDF to septic companies</li>
          </ol>
          <p className="text-xs text-blue-600 mt-4">
            💡 Tip: Update contact info in <code className="bg-white px-1 rounded">/app/proof-deck/page.tsx</code>
          </p>
        </div>
      </div>
    </div>
  )
}
