# 🗺️ TankFindr User Flow Guide

## Complete User Journey Explained

This document explains exactly how users move through TankFindr, when they see different options, and when they're charged.

---

## 🎯 Trial System: 5 Locates OR 7 Days

### The Rule
New users get **whichever comes first:**
- **5 free locates** OR
- **7 days free**

### Examples:

**Scenario A: Uses all 5 locates in 3 days**
- Day 1: User signs up, uses 3 locates
- Day 2: User uses 2 more locates (total: 5)
- **Trial ends immediately** → User must subscribe to continue

**Scenario B: Uses 3 locates in 7 days**
- Day 1: User signs up, uses 1 locate
- Day 4: User uses 2 more locates (total: 3)
- Day 7: **Trial expires** → User must subscribe

**Scenario C: Uses 5 locates on day 7**
- Days 1-6: User uses 4 locates
- Day 7: User uses 1 more locate (total: 5)
- **Trial ends by locate limit** (not time)

---

## 🚪 Complete User Flow

### Step 1: Landing Page (Not Logged In)
**URL:** `/`

**User sees:**
- Hero section with value proposition
- "Start Free Trial" button
- "View Pricing" button
- Text: "🎉 5 free locates OR 7 days free"

**User actions:**
- Click "Start Free Trial" → Goes to `/auth/sign-up`
- Click "View Pricing" → Goes to `/pricing`

---

### Step 2: Sign Up
**URL:** `/auth/sign-up`

**User sees:**
- Email and password fields
- "Create Account" button

**What happens:**
1. User enters email/password
2. Supabase sends confirmation email
3. User clicks link in email
4. Redirected to `/pricing` (to select a plan)

**Database:**
```sql
profiles table:
- subscription_status = 'trialing'
- trial_locates_used = 0
- trial_start_date = NOW()
- monthly_locates_used = 0
```

---

### Step 3: Choose Subscription Plan
**URL:** `/pricing`

**User sees:**
- 3 pricing tiers (Starter $99, Pro $249, Enterprise $599)
- All buttons bright green for readability
- FAQ about trial

**User actions:**
- Click "Start [Tier] Plan" → Redirects to Stripe checkout
- Enter credit card (required)
- Complete checkout

**What happens:**
1. Stripe creates subscription in trial mode
2. Webhook updates database:
```sql
profiles:
- stripe_customer_id = 'cus_xxx'
- stripe_subscription_id = 'sub_xxx'
- subscription_tier = 'starter' | 'pro' | 'enterprise'
- subscription_status = 'trialing'
```

3. User redirected to `/protected` (Tank Locator)

**Important:** Credit card is charged **$0** during trial. Charge happens when trial ends.

---

### Step 4: Using the Tank Locator (During Trial)
**URL:** `/protected`

**User sees:**
- Usage counter: "Trial Locates: X / 5"
- Address input field
- "Locate Tank" button
- Map view

**Locate #1-4:**
- User enters address
- Clicks "Locate Tank"
- AI analyzes satellite imagery
- Results appear with GPS coordinates
- Usage counter updates

**Database after each locate:**
```sql
profiles:
- trial_locates_used += 1

tanks table (new row):
- address, lat, lng, confidence, depth

usage table (new row):
- action = 'locate'
- payment_type = 'trial'
```

---

### Step 5: Locate #5 (Last Free Locate)
**User sees:**
- Usage counter: "Trial Locates: 5 / 5"
- Warning badge: "⚠️ Last free locate"
- Results appear normally

**What happens next:**
- User has used all 5 free locates
- **Next locate attempt requires subscription**

---

### Step 6: Trial Limit Reached
**User sees:**
- Error message: "You've used all 5 free trial locates. Please subscribe to continue."
- Automatically redirected to `/pricing` after 2 seconds

**User must:**
- Select a subscription tier
- Complete Stripe checkout
- Return to Tank Locator with full monthly allowance

---

### Step 7: Trial Expires by Time (7 Days)
**What happens:**
- 7 days pass since signup
- Stripe webhook fires: `customer.subscription.updated`
- Database updates:
```sql
profiles:
- subscription_status = 'active'
- monthly_locates_used = 0
- trial_locates_used = 0 (reset)
```

**User is charged:**
- Full monthly amount ($99, $249, or $599)
- Billing cycle starts

**User sees:**
- Usage counter changes to: "Starter Plan Locates: 0 / 10"
- Can now use their monthly allowance

---

### Step 8: Active Subscription - Monthly Usage

**User sees:**
- Usage counter: "[Tier] Plan Locates: X / Y"
- Warning when 3 locates remain
- Overage warning when limit reached

**When monthly limit is reached:**
- Modal appears: "You've reached your monthly limit"
- Options:
  - Continue & pay overage ($8/$6/$4 per locate)
  - Upgrade to next tier
  - Cancel

**Overage charges:**
- Automatically billed per locate
- Shown on next invoice
- User can upgrade anytime to reduce overage rate

---

### Step 9: Compliance Reports (Optional)

**After any successful locate:**

**User sees:**
- "Download Compliance Report ($25)" button
- Description of what's included

**User clicks button:**
1. Redirects to Stripe checkout
2. Pays $25 (one-time)
3. Returns to Tank Locator
4. "Download Your Report" button appears
5. Clicks to download professional PDF

**Report includes:**
- Satellite imagery
- GPS coordinates
- Confidence score
- Estimated depth
- Technician certification (if profile filled out)
- Legal disclaimer

---

## 💰 Payment Scenarios

### Scenario 1: User Subscribes During Trial
**Flow:**
1. Signs up → Gets trial
2. Uses 2 locates
3. Decides to subscribe immediately
4. Goes to `/pricing`, selects tier
5. Stripe checkout (already has trial, so converts)
6. Charged $0 (trial continues)
7. After 7 days OR 5 locates, charged full amount

### Scenario 2: User Hits Trial Limit
**Flow:**
1. Signs up → Gets trial
2. Uses all 5 free locates in 2 days
3. Tries 6th locate → Error message
4. Redirected to `/pricing`
5. Selects tier and subscribes
6. Returns with full monthly allowance

### Scenario 3: Trial Expires, User Doesn't Subscribe
**Flow:**
1. 7 days pass
2. User hasn't subscribed
3. Stripe cancels subscription
4. User loses access to Tank Locator
5. Must go to `/pricing` to resubscribe

---

## 📊 Revenue Model

### Subscription Revenue
- **Starter**: $99/mo (10 locates, $8 overage)
- **Pro**: $249/mo (40 locates, $6 overage)
- **Enterprise**: $599/mo (150 locates, $4 overage)

### Compliance Report Revenue
- **$25 per report** (99.6% margin)
- Optional add-on for any locate
- High-value for contractors needing documentation

### Overage Revenue
- Charged per locate beyond monthly limit
- Automatically billed
- Encourages upgrades to higher tiers

---

## 🎯 Subscription Strategy

### Why No Pay-Per-Locate?
**Focus on subscriptions:**
- Predictable recurring revenue
- Higher customer lifetime value
- Encourages commitment
- Simpler pricing model

**Trial is generous:**
- 5 free locates OR 7 days
- No credit card charge during trial
- Easy to try before buying

**Compliance reports provide flexibility:**
- Users can monetize without overage
- High-margin add-on revenue
- Solves real contractor need

---

## 📝 Summary

### Current User Flow:
1. Sign up → Trial starts (5 locates OR 7 days)
2. Use locates → Counter updates
3. Hit limit → Must subscribe
4. Trial expires → Charged full amount
5. Subscription active → Monthly allowance
6. Exceed allowance → Overage charges
7. Optional: Purchase compliance reports ($25 each)

### Key Points:
- ✅ Credit card required at signup
- ✅ $0 charged during trial
- ✅ Trial ends when EITHER limit is hit
- ✅ Must subscribe to continue after trial
- ✅ Compliance reports available anytime ($25)
- ✅ Overage charges for subscribers who exceed limits

---

## 🎨 UI/UX Notes

### Pricing Page:
- ✅ All buttons bright green (readable)
- ✅ Clear trial messaging
- ✅ FAQ explains trial rules

### Tank Locator:
- ✅ Usage counter always visible
- ✅ Warning when 3 locates remain
- ✅ Clear error when trial ends
- ✅ Overage warning for subscribers
- ✅ Compliance report button after each locate

### Profile Page:
- ✅ Technician info for reports
- ✅ Simple save functionality

---

## 🚀 Conversion Strategy

### Trial to Paid:
- Generous trial (5 locates)
- Clear value demonstration
- Easy checkout process
- No surprise charges

### Upsells:
- Compliance reports ($25)
- Tier upgrades (save on overages)
- Professional certification features

### Retention:
- Monthly value delivery
- Usage tracking
- Upgrade prompts when beneficial
- Professional documentation option

---

**This flow maximizes subscription conversions while providing high-margin add-on revenue through compliance reports!**
