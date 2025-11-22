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
- **Trial ends immediately** → User must subscribe or pay-per-locate

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
- All buttons now bright green ✅ (just fixed!)
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

### Step 5A: Locate #5 (Last Free Locate)
**User sees:**
- Usage counter: "Trial Locates: 5 / 5"
- Warning badge: "⚠️ Last free locate"
- Results appear normally

**What happens next:**
- User has used all 5 free locates
- Trial can still continue if within 7 days
- **Next locate attempt triggers pay-per option**

---

### Step 5B: Locate #6 (Trial Limit Reached)
**User sees:**
- 🚫 **Pay-Per-Locate Modal appears**

**Modal content:**
```
🎯 You've used all 5 free trial locates

Continue with a one-time payment of $15 per locate,
or subscribe for unlimited access.

[Pay $15 for One Locate]  [View Subscription Plans]  [Cancel]
```

**User options:**

**Option A: Pay $15**
- Clicks "Pay $15 for One Locate"
- Redirects to Stripe checkout
- Pays $15
- Returns to `/protected?payment=success`
- Can perform the locate
- Usage counter shows: "Trial Locates: 5 / 5 (+1 paid)"

**Database:**
```sql
usage table:
- payment_type = 'pay_per_locate'
- stripe_payment_id = 'pi_xxx'
```

**Option B: Subscribe**
- Clicks "View Subscription Plans"
- Goes to `/pricing`
- Selects a tier
- Stripe converts trial to paid subscription
- Returns with full monthly allowance

**Option C: Cancel**
- Clicks "Cancel"
- Modal closes
- User can't perform locate
- Can try again later (same modal appears)

---

### Step 6: Trial Expires by Time (7 Days)
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

### Scenario 2: User Uses Pay-Per-Locate
**Flow:**
1. Signs up → Gets trial
2. Uses all 5 free locates in 2 days
3. Tries 6th locate → Pay-per modal
4. Pays $15 for one locate
5. Performs locate
6. Tries 7th locate → Pay-per modal again
7. Can keep paying $15 per locate OR subscribe

**Revenue:**
- User pays $15 × N locates
- Eventually might subscribe (higher LTV)

### Scenario 3: Trial Expires, User Doesn't Subscribe
**Current behavior:**
1. 7 days pass
2. User hasn't subscribed
3. Stripe cancels subscription
4. User loses access to Tank Locator

**Question for you:** Should this user see the pay-per option instead?

---

## 🤔 Current Limitation

### When Pay-Per DOESN'T Appear:
- ❌ After 7-day trial expires (if user didn't use all 5 locates)
- ❌ User with cancelled subscription

### When Pay-Per DOES Appear:
- ✅ After using all 5 trial locates (within 7 days)
- ✅ User with active subscription who hits monthly limit

---

## 💡 Recommended Change

### Option A: Current (Conservative)
**Pay-per only after 5 locates used**

**Pros:**
- Encourages subscription
- Simpler logic

**Cons:**
- Loses revenue from users who won't subscribe
- Users who used 3 locates in 7 days have no option

---

### Option B: Flexible (More Revenue)
**Pay-per available in ALL these cases:**

1. ✅ Used all 5 trial locates (current)
2. ✅ Trial expired by time (NEW)
3. ✅ Subscription cancelled (NEW)
4. ✅ Monthly limit reached (current)

**Pros:**
- More revenue opportunities
- Better user experience (always have an option)
- Captures "occasional users"

**Cons:**
- Slightly more complex logic
- Might reduce subscription conversions

---

## 🎯 User Flow with Option B (Recommended)

### After Trial Expires (7 days):
**User tries to locate:**

**Modal appears:**
```
⏰ Your 7-day trial has ended

You can:
• Pay $15 for one locate
• Subscribe for unlimited monthly access

[Pay $15 for One Locate]  [View Subscription Plans]
```

**Benefits:**
- User isn't blocked
- Still has options
- You capture revenue either way

---

## 📊 Revenue Comparison

### Current (Option A):
- User uses 3 locates in 7 days
- Trial expires
- User leaves (no subscription)
- **Revenue: $0**

### Recommended (Option B):
- User uses 3 locates in 7 days
- Trial expires
- User needs 2 more locates this month
- Pays $15 × 2 = $30
- **Revenue: $30**

---

## 🔧 Implementation

### To Enable Option B:
I need to update the `handleLocate` function in `TankLocator.tsx`:

**Current logic:**
```typescript
if (usage.isTrial && usage.used >= usage.limit && !usage.hasSubscription) {
  setShowPayPerOption(true)
  return
}
```

**New logic:**
```typescript
// Show pay-per if:
// 1. Trial user hit 5 locate limit, OR
// 2. Trial expired and no subscription, OR
// 3. Subscription cancelled
if (
  (usage.isTrial && usage.used >= usage.limit) ||
  (usage.trialExpired && !usage.hasSubscription) ||
  (usage.subscriptionCancelled)
) {
  setShowPayPerOption(true)
  return
}
```

---

## ✅ Decision Needed

**Which option do you prefer?**

**A) Current:** Pay-per only after 5 locates used
**B) Recommended:** Pay-per available after trial expires too

Let me know and I'll implement it!

---

## 📝 Summary

### Current User Flow:
1. Sign up → Trial starts (5 locates OR 7 days)
2. Use locates → Counter updates
3. Hit limit → Pay-per option OR subscribe
4. Trial expires → Must subscribe
5. Subscription active → Monthly allowance
6. Exceed allowance → Overage charges

### Key Points:
- ✅ Credit card required at signup
- ✅ $0 charged during trial
- ✅ Trial ends when EITHER limit is hit
- ✅ Pay-per available after 5 locates used
- ❌ Pay-per NOT available after 7 days expire (unless you want this changed)

---

## 🎨 UI/UX Notes

### Pricing Page:
- ✅ All buttons now bright green (readable)
- ✅ Clear trial messaging
- ✅ FAQ explains trial rules

### Tank Locator:
- ✅ Usage counter always visible
- ✅ Warning when 3 locates remain
- ✅ Pay-per modal with clear options
- ✅ Overage warning for subscribers

### Profile Page:
- ✅ Technician info for reports
- ✅ Simple save functionality

---

**Questions? Let me know which option you prefer and I'll push the updates!**
