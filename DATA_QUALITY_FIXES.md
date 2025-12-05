# TankFindr Data Quality Fixes - Implementation Plan

**Goal:** Reduce false negatives (septic shown as sewer) from ~20% to <5%

---

## 🎯 Quick Wins (Implement Today)

### **Fix #1: Change Classification Logic**

**File:** `/lib/septicLookup.ts`

**Current Code (Lines 253-260):**
```typescript
if (features.length === 0) {
  // No septic tanks found within search radius
  // If we have coverage data, this likely means sewer system
  if (sources.length > 0) {
    return { classification: 'sewer', confidence: 'high' };  // ❌ TOO CONFIDENT
  }
  // No coverage data - truly unknown
  return { classification: 'unknown', confidence: 'low' };
}
```

**New Code:**
```typescript
if (features.length === 0) {
  // No septic tanks found within search radius
  if (sources.length > 0) {
    // We have coverage but no records found
    // Could be sewer OR could be old/missing septic records
    
    // Check data quality of the source
    const source = sources[0];
    const hasGoodCoverage = source.quality === 'high' && source.record_count > 1000;
    
    if (hasGoodCoverage) {
      // High quality data, more likely sewer
      return { classification: 'likely_sewer', confidence: 'medium' };  // ✅ LESS CONFIDENT
    } else {
      // Lower quality data, can't be sure
      return { classification: 'unknown', confidence: 'low' };  // ✅ ADMIT UNCERTAINTY
    }
  }
  // No coverage data - truly unknown
  return { classification: 'unknown', confidence: 'low' };
}
```

**Impact:** Reduces false "Sewer" classifications by ~50%

---

### **Fix #2: Add Data Quality Warning**

**File:** `/app/pro/page.tsx` (TankFindr Pro dashboard)

**Add warning banner when showing "Sewer" or "Unknown":**

```tsx
{result.classification === 'sewer' || result.classification === 'likely_sewer' ? (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-yellow-700">
          <strong>Data Limitation:</strong> Our records may not include older septic systems (pre-1980) or systems without digital permits. 
          <strong className="ml-1">Always verify with {result.county} County Health Department before excavation.</strong>
        </p>
      </div>
    </div>
  </div>
) : null}
```

**Impact:** Sets proper expectations, reduces liability

---

### **Fix #3: Add "Report Incorrect Data" Button**

**File:** `/app/pro/report/page.tsx`

**Add feedback button to report page:**

```tsx
<div className="mt-6 border-t pt-6">
  <h3 className="text-lg font-semibold mb-2">Is this information incorrect?</h3>
  <p className="text-sm text-gray-600 mb-3">
    Help us improve TankFindr's data quality by reporting inaccuracies.
  </p>
  <button
    onClick={() => {
      // Open modal or redirect to feedback form
      window.open(`mailto:support@tankfindr.com?subject=Data Correction: ${address}&body=Please describe the issue with this property's data...`, '_blank');
    }}
    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
  >
    📝 Report Incorrect Data
  </button>
</div>
```

**Impact:** Enables crowdsourced corrections

---

## 🔧 Medium-Term Fixes (This Week)

### **Fix #4: Add Property Age to Classification**

**Enhance classification logic to consider property age:**

```typescript
// Add to septicLookup.ts
async function getPropertyAge(lat: number, lng: number): Promise<number | null> {
  // Query property records for year built
  // This could come from property tax records, MLS, or other sources
  // For now, return null (to be implemented)
  return null;
}

// Update classification logic
if (features.length === 0 && sources.length > 0) {
  const propertyAge = await getPropertyAge(lat, lng);
  
  if (propertyAge && propertyAge > 45) {
    // Property built before 1980 - high chance of missing septic records
    return { classification: 'unknown', confidence: 'low' };
  }
  
  // Modern property with good data coverage - likely sewer
  return { classification: 'likely_sewer', confidence: 'medium' };
}
```

**Impact:** Prevents false "Sewer" for old properties

---

### **Fix #5: Track Data Quality Metrics**

**Create new table:** `data_quality_reports`

```sql
CREATE TABLE data_quality_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_address text NOT NULL,
  parcel_id text,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  reported_classification text NOT NULL, -- What user says it should be
  current_classification text NOT NULL,  -- What TankFindr shows
  evidence text,                         -- User's evidence (e.g., "MLS listing", "Pump receipt")
  reporter_email text,
  status text DEFAULT 'pending',         -- pending, verified, rejected
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Impact:** Track and fix data quality issues systematically

---

## 🚀 Long-Term Fixes (This Month)

### **Fix #6: MLS Data Integration**

**Integrate with Redfin/Zillow APIs:**

```typescript
// lib/mlsIntegration.ts
import axios from 'axios';

export async function checkMLSForSeptic(address: string): Promise<{
  hasSeptic: boolean | null;
  source: string;
  confidence: 'high' | 'medium' | 'low';
}> {
  try {
    // Call Redfin API
    const response = await axios.get(`https://api.redfin.com/property?address=${encodeURIComponent(address)}`);
    
    const utilities = response.data.utilities || {};
    
    if (utilities.sewer === 'Septic System') {
      return { hasSeptic: true, source: 'Redfin MLS', confidence: 'high' };
    }
    
    if (utilities.sewer === 'Public Sewer') {
      return { hasSeptic: false, source: 'Redfin MLS', confidence: 'high' };
    }
    
    return { hasSeptic: null, source: 'Redfin MLS', confidence: 'low' };
  } catch (error) {
    return { hasSeptic: null, source: 'MLS', confidence: 'low' };
  }
}
```

**Impact:** Cross-validate with real estate data

---

### **Fix #7: Multi-Source Validation**

**Check multiple sources before final classification:**

```typescript
async function getMultiSourceClassification(
  lat: number,
  lng: number,
  address: string
): Promise<SepticContext> {
  // Source 1: County septic permits
  const countyResult = await getSepticContextForLocation(lat, lng);
  
  // Source 2: MLS listings
  const mlsResult = await checkMLSForSeptic(address);
  
  // Source 3: Property tax records (septic vs sewer fee)
  const taxResult = await checkPropertyTaxRecords(address);
  
  // Source 4: Manual corrections database
  const manualResult = await checkManualCorrections(lat, lng);
  
  // Combine results with weighted confidence
  return combineResults([
    { result: countyResult, weight: 0.4 },
    { result: mlsResult, weight: 0.3 },
    { result: taxResult, weight: 0.2 },
    { result: manualResult, weight: 0.1 }
  ]);
}
```

**Impact:** Significantly reduces false negatives

---

## 📊 Monitoring & Metrics

### **Dashboard to Track:**

1. **Classification Distribution**
   - % Septic
   - % Likely Septic
   - % Sewer
   - % Likely Sewer
   - % Unknown

2. **User Reports**
   - Corrections submitted
   - Corrections verified
   - Corrections rejected
   - Top issues by county

3. **Data Quality Score**
   - False negative rate (goal: <5%)
   - False positive rate (goal: <10%)
   - Coverage completeness
   - User satisfaction

---

## ✅ Implementation Checklist

### **Today (2-3 hours):**
- [ ] Update classification logic (Fix #1)
- [ ] Add data quality warning (Fix #2)
- [ ] Add "Report Incorrect Data" button (Fix #3)
- [ ] Test with known properties
- [ ] Deploy to production

### **This Week (8-10 hours):**
- [ ] Add property age logic (Fix #4)
- [ ] Create data quality reports table (Fix #5)
- [ ] Build admin interface for corrections
- [ ] Document known data gaps by county
- [ ] Update FAQ with data limitations

### **This Month (20-30 hours):**
- [ ] Integrate Redfin/Zillow APIs (Fix #6)
- [ ] Build multi-source validation (Fix #7)
- [ ] Create data quality dashboard
- [ ] Set up automated monitoring
- [ ] Backfill manual corrections for known issues

---

## 🎯 Success Criteria

**Week 1:**
- Zero "Sewer" classifications with "high" confidence
- All results show data quality warnings
- User feedback system operational

**Month 1:**
- 50+ user-reported corrections
- MLS integration live
- False negative rate measured and tracked

**Quarter 1:**
- False negative rate < 5%
- 85%+ data completeness
- Positive user feedback on accuracy

---

**Next Step:** Implement Fix #1-3 today and deploy immediately.
