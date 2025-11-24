# Dual Paywall System - Test Checklist

## ✅ Homepage Tests

### Dual Path Display
- [ ] Homepage shows "Choose Your Path" section
- [ ] Pro path card (blue) displays correctly
- [ ] Consumer path card (green) displays correctly
- [ ] Hover effects work on both cards
- [ ] CTAs link to correct pages (`/pricing-pro` and `/report`)

### Free Widget
- [ ] "Sewer or Septic?" widget displays on homepage
- [ ] Address input works
- [ ] Coverage check returns results
- [ ] Results show septic/sewer classification
- [ ] CTAs to paid options display

### SEO Content
- [ ] Coverage stats display (2.3M+ tanks, 12 states)
- [ ] State-specific content blocks visible
- [ ] Footer links work (Privacy, Terms, FAQ, Coverage)

---

## ✅ Pro Subscription Flow Tests

### Pricing Page (`/pricing-pro`)
- [ ] Page loads without errors
- [ ] Three plans display (Starter, Pro, Enterprise)
- [ ] Pricing shows correctly ($99, $249, $599)
- [ ] Lookup limits display (300, 1500, unlimited)
- [ ] "Start Subscription" buttons work
- [ ] Redirects to Stripe Checkout

### Stripe Checkout
- [ ] Checkout session creates successfully
- [ ] Correct plan details display in Stripe
- [ ] Test card (4242 4242 4242 4242) works
- [ ] Success URL redirects to `/pro`
- [ ] Cancel URL returns to `/pricing-pro`

### Pro Dashboard (`/pro`)
- [ ] **WITHOUT subscription**: Redirects to `/pricing-pro`
- [ ] **WITH subscription**: Dashboard loads
- [ ] Usage stats display correctly
- [ ] Quick search input works
- [ ] Lookup performs and returns results
- [ ] Job history updates after lookup
- [ ] Lookup count increments
- [ ] **At limit**: Shows error message
- [ ] **Over limit**: Prevents lookup (Enterprise unlimited)

### Subscription Gating
- [ ] Logged out user → redirects to `/auth/login`
- [ ] Logged in, no subscription → redirects to `/pricing-pro`
- [ ] Logged in, active subscription → access granted
- [ ] Cancelled subscription → redirects to `/pricing-pro`

---

## ✅ One-Time Report Flow Tests

### Report Page (`/report`)
- [ ] Page loads without login required
- [ ] Address input works
- [ ] "Check Address" button performs geocoding
- [ ] Preview displays address and classification
- [ ] Map preview shows (blurred)
- [ ] "Unlock Full Report" CTA displays

### Upsells
- [ ] Environmental add-on card displays ($9)
- [ ] Well/groundwater add-on card displays ($29)
- [ ] Clicking upsell toggles selection
- [ ] Selected upsells highlight (green border)
- [ ] Total price updates dynamically
- [ ] Base: $19, +Environmental: $28, +Well: $48, +Both: $57

### Stripe Checkout
- [ ] "Unlock Report" button creates checkout
- [ ] Line items include base + selected upsells
- [ ] Test card works
- [ ] Success URL includes address and coordinates
- [ ] Redirects to `/report/view?session_id=...`

### Report View (`/report/view`)
- [ ] Full report displays after payment
- [ ] Interactive map shows tank location
- [ ] GPS coordinates display
- [ ] System details display
- [ ] Confidence score shows
- [ ] Report is downloadable/printable

---

## ✅ No Conflicts Tests

### Removed Old Features
- [ ] `/app/api/locate/route.ts` deleted (no 5 free trial)
- [ ] `/components/TankLocator.tsx` deleted
- [ ] `/app/pricing/page.tsx` deleted (old generic pricing)
- [ ] `/app/protected/page.tsx` deleted

### No Free Trial Logic
- [ ] No "5 free lookups" messaging anywhere
- [ ] No trial countdown timers
- [ ] No "trial_locates_used" checks in code
- [ ] Pro dashboard requires subscription immediately

### Separate Flows
- [ ] Pro flow never mentions one-time reports
- [ ] Report flow never mentions subscriptions
- [ ] No cross-contamination in CTAs
- [ ] Clear distinction in navigation

---

## ✅ Database Tests

### Subscription Fields
- [ ] `profiles.subscription_tier` exists
- [ ] `profiles.subscription_status` exists
- [ ] `profiles.lookups_used` exists
- [ ] `profiles.stripe_customer_id` exists
- [ ] `profiles.stripe_subscription_id` exists
- [ ] Old `trial_locates_used` field removed

### Functions
- [ ] `increment_lookup_count()` works
- [ ] `check_rate_limit()` works
- [ ] `find_nearest_septic_tank()` works

### Tables
- [ ] `septic_sources` table exists
- [ ] `septic_lookups` table exists
- [ ] `septic_jobs` table exists
- [ ] `property_reports` table exists

---

## ✅ Edge Cases

### Pro Flow
- [ ] User signs up but doesn't subscribe → can't access dashboard
- [ ] User subscribes, cancels → loses access immediately
- [ ] User hits lookup limit → clear error message
- [ ] User tries to access dashboard directly → redirects

### Report Flow
- [ ] User enters invalid address → error message
- [ ] User enters address outside coverage → appropriate message
- [ ] User abandons checkout → can return and try again
- [ ] User completes payment → can't access report without session ID

### General
- [ ] Mobile responsive on all pages
- [ ] Fast page loads (< 2 seconds)
- [ ] No console errors
- [ ] No broken links

---

## 🎯 Success Criteria

**Pro Flow:**
- ✅ Subscription required before any access
- ✅ Usage limits enforced
- ✅ No free trial or free lookups
- ✅ Clear upgrade path

**Report Flow:**
- ✅ No account required
- ✅ Pay-per-report model works
- ✅ Upsells increase revenue
- ✅ Instant access after payment

**Homepage:**
- ✅ Clear dual paths
- ✅ SEO optimized
- ✅ Free widget for lead gen
- ✅ Professional design

**No Conflicts:**
- ✅ Old code removed
- ✅ Flows completely separate
- ✅ No confusing messaging
- ✅ Clean routing

---

## 📝 Test Results

**Date:** _____________
**Tester:** _____________

**Overall Status:** [ ] PASS  [ ] FAIL

**Issues Found:**
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Notes:**
_______________________________________________
_______________________________________________
_______________________________________________
