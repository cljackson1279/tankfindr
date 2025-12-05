# TankFindr Data Accuracy Problem - Root Cause Analysis

**Date:** December 5, 2025  
**Issue:** Properties with septic systems incorrectly classified as "Sewer"  
**Impact:** CRITICAL - Undermines core value proposition

---

## 🚨 The Problem

**Case Study: 5155 SW 6 Court, Plantation FL 33317**

- **Actual Status:** Has septic system (confirmed via MLS #RX-10806809)
- **TankFindr Showed:** "Sewer"
- **Why:** No septic permit in Broward County database
- **Root Cause:** System built in 1956, predates digital records

**This is a FALSE NEGATIVE** - the worst type of error for TankFindr because:
1. Contractors trust the "Sewer" classification
2. They don't look for a septic tank
3. They damage the tank during excavation
4. TankFindr gets blamed for bad data
5. Word spreads, no one trusts the site

---

## 🔍 Root Cause Analysis

### **Current Algorithm Logic:**

```typescript
if (features.length === 0) {
  // No septic tanks found within search radius
  if (sources.length > 0) {
    return { classification: 'sewer', confidence: 'high' };  // ❌ PROBLEM
  }
  return { classification: 'unknown', confidence: 'low' };
}
```

**Translation:** If we have coverage data for the area but find NO septic records, we classify as "Sewer" with HIGH confidence.

### **Why This Fails:**

1. **Digital Record Gap** - Systems installed before ~1980 often not digitized
2. **County Variations** - Some counties have poor digital records
3. **Data Import Issues** - Not all county data successfully imported
4. **Manual Systems** - Some properties never got permits (grandfathered)
5. **Lost Records** - Paper records destroyed, never digitized

### **The Fatal Assumption:**

> "If we have coverage data but no septic records, it must be sewer"

This assumption is **WRONG** for:
- Old properties (pre-1980)
- Rural areas with poor record-keeping
- Properties in transition areas
- Grandfathered systems

---

## 📊 Data Coverage vs Data Completeness

**TankFindr Currently Tracks:**

1. **Coverage** (`septic_sources` table) - "Do we have data for this county?"
2. **Records** (`septic_tanks` table) - "What septic systems exist?"

**The Problem:**
- **Coverage = YES** means "We imported data from this county"
- **Coverage ≠ COMPLETE** means "We don't have ALL septic systems"

**Example:**
- Broward County: Coverage = YES
- Broward County: Completeness = ~60% (estimate)
- Missing: 40% of septic systems (old, grandfathered, lost records)

---

## 💡 Why This Matters

### **False Negative Impact:**

| Scenario | Current Behavior | User Experience | Business Impact |
|----------|------------------|-----------------|-----------------|
| Old septic system (1956) | Shows "Sewer" | Contractor doesn't look for tank | Damages tank, blames TankFindr |
| Grandfathered system | Shows "Sewer" | Homebuyer thinks no septic | Discovers septic later, angry |
| Lost permit records | Shows "Sewer" | Inspector doesn't check | Misses septic inspection |

### **False Positive Impact:**

| Scenario | Current Behavior | User Experience | Business Impact |
|----------|------------------|-----------------|-----------------|
| Actually on sewer | Shows "Septic" | Contractor looks for tank | Wastes time, mild annoyance |

**FALSE NEGATIVES ARE WORSE** because they cause real damage and liability.

---

## 🎯 Solution Strategy

### **Principle: "When in doubt, don't rule it out"**

**Better to say:**
- ✅ "Might have septic, verify with county" (safe, useful)
- ❌ "Definitely sewer" (dangerous if wrong)

### **Proposed Changes:**

#### **1. Change Classification Logic**

**Current (WRONG):**
```typescript
if (no records found && has coverage) {
  return 'sewer' with 'high' confidence;  // ❌ Too confident
}
```

**Proposed (BETTER):**
```typescript
if (no records found && has coverage) {
  if (property is in developed urban area) {
    return 'likely_sewer' with 'medium' confidence;  // ✅ More cautious
  } else {
    return 'unknown' with 'low' confidence;  // ✅ Admit uncertainty
  }
}
```

#### **2. Add Data Quality Indicators**

Show users:
- **Data Source:** "Broward County GIS (2024)"
- **Coverage Quality:** "Partial - may not include pre-1980 systems"
- **Last Updated:** "November 2024"
- **Completeness:** "Estimated 60-80% coverage"

#### **3. Add MLS Data Integration**

- Partner with MLS providers
- Cross-reference property listings
- Flag discrepancies for manual review
- Update database with MLS-confirmed septic

#### **4. Crowdsource Corrections**

- Add "Report Incorrect Data" button
- Let contractors submit corrections
- Verify submissions before updating
- Build community trust

#### **5. Multi-Source Validation**

Check multiple sources before classifying as "Sewer":
1. County septic permits
2. MLS listings
3. Property tax records (septic vs sewer fee)
4. Utility billing records
5. Home inspection reports (if available)

---

## 🔧 Immediate Fixes (Priority Order)

### **Priority 1: Change Classification Logic (1 hour)**

**Change "sewer" to "likely_sewer" or "unknown" when:**
- No records found
- Property built before 1980
- Rural or semi-rural area
- Low data quality score

### **Priority 2: Add Data Quality Warnings (2 hours)**

**Show disclaimer:**
> "⚠️ Data may not include older septic systems (pre-1980) or systems without digital permits. Always verify with local county health department before excavation."

### **Priority 3: Add Manual Corrections System (4 hours)**

**Create admin interface to:**
- Add manual septic records (like we just did)
- Flag properties for review
- Track data quality issues
- Update from MLS/user reports

### **Priority 4: Improve Coverage Metadata (2 hours)**

**Track for each county:**
- Date range of records (e.g., "1985-2024")
- Estimated completeness (e.g., "60-80%")
- Known gaps (e.g., "Pre-1980 systems may be missing")
- Last update date

### **Priority 5: MLS Integration (Long-term)**

**Partner with:**
- Redfin API
- Zillow API
- Local MLS providers
- Cross-reference septic/sewer data

---

## 📈 Success Metrics

### **Data Accuracy KPIs:**

1. **False Negative Rate** - Properties with septic shown as sewer
   - Current: Unknown (estimated 10-30%)
   - Target: <5%

2. **False Positive Rate** - Properties with sewer shown as septic
   - Current: Unknown (estimated <5%)
   - Target: <10% (less critical)

3. **User-Reported Corrections** - Crowdsourced data quality
   - Current: 0 (no system)
   - Target: 50+ per month

4. **Data Completeness** - % of actual septic systems in database
   - Current: ~60% (estimated)
   - Target: >85%

### **User Trust Metrics:**

1. **Contractor Retention** - Do they come back?
2. **Word-of-Mouth** - Referrals from satisfied users
3. **Subscription Renewals** - Monthly retention rate
4. **Support Tickets** - "Wrong data" complaints

---

## 🎓 Lessons Learned

### **What Went Wrong:**

1. **Over-confidence in data** - Assumed county data was complete
2. **Binary thinking** - "Septic or Sewer" with no middle ground
3. **No validation** - Didn't cross-check with other sources
4. **No user feedback** - No way for contractors to report errors

### **What to Do Differently:**

1. **Embrace uncertainty** - "Unknown" is better than "Wrong"
2. **Show confidence levels** - Let users decide how much to trust
3. **Multi-source validation** - Never rely on single data source
4. **Crowdsource corrections** - Users know their local areas best
5. **Continuous improvement** - Data quality is ongoing work

---

## 🚀 Recommended Action Plan

### **This Week:**

1. ✅ Change classification logic (less confident when no records)
2. ✅ Add data quality warnings to all results
3. ✅ Create manual correction system (admin only)
4. ✅ Document known data gaps

### **This Month:**

1. ⏳ Build user feedback system ("Report Incorrect Data")
2. ⏳ Improve coverage metadata tracking
3. ⏳ Add property age to classification logic
4. ⏳ Create data quality dashboard

### **This Quarter:**

1. ⏳ Integrate MLS data (Redfin/Zillow APIs)
2. ⏳ Partner with septic contractors for crowdsourced data
3. ⏳ Expand to more counties with better data
4. ⏳ Build ML model to predict septic likelihood

---

## 💰 Business Impact

### **Cost of Poor Data Quality:**

- Lost subscriptions: $500-2,000/month
- Reputation damage: Priceless
- Legal liability: Potential lawsuits
- Support costs: Time spent on complaints

### **Value of High Data Quality:**

- Higher conversion rates (demo → paid)
- Better retention (monthly renewals)
- Word-of-mouth growth (contractor referrals)
- Premium pricing justified
- Competitive moat (best data wins)

---

## ✅ Conclusion

**The Problem:** TankFindr's "Sewer" classification is too confident when data is incomplete.

**The Solution:** Be more cautious, show uncertainty, validate with multiple sources.

**The Priority:** Fix classification logic immediately, then build long-term data quality systems.

**The Goal:** Become the most trusted source for septic data, not just the biggest.

---

**Next Steps:** Implement Priority 1-3 fixes this week, then move to long-term improvements.
