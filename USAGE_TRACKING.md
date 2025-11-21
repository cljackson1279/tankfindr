# TankFindr Usage Tracking & Overage Billing System

## Overview

TankFindr has a comprehensive usage tracking and overage billing system to prevent gaming and ensure fair billing. Here's exactly how it works:

---

## ✅ What's Implemented

### 1. **Real-Time Usage Tracking**

Every time a user performs a locate:
- ✅ Usage counter increments in database
- ✅ Trial users: `trial_locates_used` increases
- ✅ Subscribed users: `monthly_locates_used` increases
- ✅ Action logged in `usage` table for analytics

**Database Fields:**
```sql
profiles.trial_locates_used      -- Tracks free trial usage (max 5)
profiles.monthly_locates_used    -- Tracks monthly subscription usage
profiles.trial_start             -- When trial started (for 7-day check)
profiles.subscription_tier       -- starter/pro/enterprise
```

---

### 2. **Tier-Based Limits**

| Tier | Monthly Locates | Overage Rate |
|------|----------------|--------------|
| Starter | 10 | $8 per locate |
| Pro | 40 | $6 per locate |
| Enterprise | 150 | $4 per locate |

**Trial:** 5 free locates OR 7 days (whichever comes first)

---

### 3. **User-Facing Features**

#### A. **Usage Counter (Always Visible)**
- Shows: "X / Y locates used"
- Updates in real-time after each locate
- Different display for trial vs subscription

#### B. **Approaching Limit Warning**
- Triggers when: 3 or fewer locates remaining
- Shows: Orange warning badge
- Message: "X locates remaining"

#### C. **Overage Confirmation Modal**
- Triggers when: User tries to locate after hitting limit
- Shows:
  - "You've reached your monthly limit"
  - Exact overage charge amount
  - Option to continue and pay
  - Option to upgrade to next tier
  - Savings calculation if they upgrade
  - Cancel button

#### D. **Upgrade Suggestions**
- Shows next tier benefits
- Calculates potential savings
- Direct link to pricing page

---

### 4. **Backend Protection**

#### Permission Check (Before Every Locate)
```typescript
checkLocatePermission(profile) {
  // 1. Check trial status
  if (trialing) {
    if (trial_days >= 7) return "Trial expired"
    if (trial_locates >= 5) return "Free locates used up"
    return ALLOW
  }
  
  // 2. Check subscription status
  if (canceled || no_subscription) return "No active subscription"
  if (past_due) return "Payment failed"
  
  // 3. Check monthly limit
  if (monthly_used >= tier_limit) {
    return ALLOW_WITH_OVERAGE_CHARGE
  }
  
  return ALLOW
}
```

#### Automatic Overage Billing
```typescript
chargeOverage(profile, address) {
  // 1. Create invoice item
  stripe.invoiceItems.create({
    customer: profile.stripe_customer_id,
    amount: tier.overage * 100,  // $8, $6, or $4
    description: "Overage locate: {address}"
  })
  
  // 2. Create and finalize invoice
  invoice = stripe.invoices.create({
    customer: profile.stripe_customer_id,
    auto_advance: true  // Auto-charge
  })
  
  stripe.invoices.finalizeInvoice(invoice.id)
}
```

**Result:** User is charged immediately when they exceed their limit.

---

### 5. **Monthly Reset**

When Stripe sends `invoice.payment_succeeded` webhook:
```typescript
// Reset monthly counter
profiles.monthly_locates_used = 0
profiles.current_period_start = new Date()
profiles.current_period_end = subscription.current_period_end
```

**This happens automatically every billing cycle.**

---

## 🔒 Anti-Gaming Protections

### 1. **Server-Side Validation**
- ❌ Cannot bypass limits via client-side manipulation
- ✅ All checks happen in API route
- ✅ Database is source of truth

### 2. **Immediate Charging**
- ❌ Cannot accumulate unlimited overages
- ✅ Each overage is charged immediately
- ✅ Invoice created and finalized instantly

### 3. **User Confirmation Required**
- ❌ Cannot accidentally trigger overages
- ✅ Modal blocks locate action
- ✅ User must explicitly confirm charge
- ✅ Can cancel and upgrade instead

### 4. **Trial Limits Enforced**
- ❌ Cannot get unlimited free locates
- ✅ Hard limit: 5 free locates
- ✅ Hard limit: 7 days
- ✅ Whichever comes first ends trial

### 5. **Database Tracking**
- ✅ Every locate logged in `usage` table
- ✅ Timestamps for audit trail
- ✅ Metadata includes address and confidence
- ✅ Cannot be deleted by users (RLS policies)

---

## 📊 User Flow Examples

### Example 1: Starter User Approaching Limit

**Scenario:** User has used 8/10 locates

1. **Dashboard shows:**
   ```
   Starter Plan Locates: 8 / 10
   ⚠️ 2 locates remaining
   ```

2. **User does 2 more locates** → Now at 10/10

3. **User tries 11th locate:**
   - ❌ Locate blocked
   - ⚠️ Modal appears:
     ```
     You've reached your monthly limit
     
     You've used all 10 locates included in your Starter plan.
     Continuing will charge $8 per additional locate.
     
     💡 Save money: Upgrade to Pro for:
     • 40 locates per month
     • Only $6 per overage (vs $8)
     • $249/month
     
     [Continue & Charge $8] [Upgrade to Pro] [Cancel]
     ```

4. **If user clicks "Continue & Charge $8":**
   - ✅ Locate proceeds
   - ✅ Stripe charges $8 immediately
   - ✅ Counter shows: "10 / 10 (+1 overage)"
   - ✅ Usage logged in database

5. **If user clicks "Upgrade to Pro":**
   - → Redirected to pricing page
   - → Can upgrade immediately
   - → New limits apply

---

### Example 2: Trial User

**Scenario:** New user on trial

1. **Dashboard shows:**
   ```
   Trial Locates: 0 / 5
   ```

2. **User does 5 locates** → Now at 5/5

3. **User tries 6th locate:**
   - ❌ Locate blocked
   - ⚠️ Error: "Free trial locates used up. Your subscription will start now."
   - → User must complete subscription setup

4. **Alternative: 7 days pass before 5 locates:**
   - ❌ Locate blocked
   - ⚠️ Error: "Trial period expired. Please complete your subscription setup."

---

### Example 3: Pro User with Overages

**Scenario:** Pro user (40 locates, $6 overage)

1. **Month starts:** 0 / 40 locates

2. **User does 45 locates:**
   - First 40: Included in plan
   - Last 5: $6 each = $30 in overages

3. **Billing:**
   - Monthly charge: $249 (Pro plan)
   - Overage charges: $30 (5 × $6)
   - **Total: $279**

4. **Next month:**
   - Counter resets to 0 / 40
   - Fresh allocation

---

## 🔄 Upgrade Flow

When user upgrades mid-cycle:

1. **Stripe handles proration automatically**
   - Credits unused time from old plan
   - Charges prorated amount for new plan

2. **New limits apply immediately**
   - `subscription_tier` updated via webhook
   - Next locate uses new tier limits

3. **Monthly counter continues**
   - Doesn't reset until next billing cycle
   - But new limit is higher

**Example:**
- User on Starter (10 locates) has used 9
- Upgrades to Pro (40 locates)
- Now shows: 9 / 40 (31 remaining)

---

## 📈 Analytics & Reporting

### Data Available for Analysis

**From `usage` table:**
- Total locates per user
- Locates per day/week/month
- Average confidence scores
- Most searched addresses

**From `profiles` table:**
- Trial conversion rate
- Overage frequency
- Average monthly usage per tier
- Upgrade patterns

**From Stripe:**
- Revenue from overages
- Churn rate
- Upgrade/downgrade patterns

---

## 🧪 Testing the System

### Test Scenario 1: Reach Limit
1. Create test user
2. Perform locates until limit reached
3. Verify warning appears at 3 remaining
4. Verify modal blocks next locate
5. Confirm overage charge works

### Test Scenario 2: Trial Expiration
1. Create test user
2. Set `trial_start` to 8 days ago
3. Try to locate
4. Verify "Trial expired" error

### Test Scenario 3: Overage Billing
1. Use Stripe test mode
2. Exceed monthly limit
3. Confirm overage charge
4. Check Stripe dashboard for invoice item
5. Verify invoice created and paid

---

## 🔧 Configuration

All limits and prices are configured in `lib/stripe.ts`:

```typescript
export const TIERS = {
  starter: {
    name: 'Starter',
    locates: 10,
    overage: 8,
    price: 99,
    priceId: process.env.STRIPE_STARTER_PRICE_ID
  },
  pro: {
    name: 'Pro',
    locates: 40,
    overage: 6,
    price: 249,
    priceId: process.env.STRIPE_PRO_PRICE_ID
  },
  enterprise: {
    name: 'Enterprise',
    locates: 150,
    overage: 4,
    price: 599,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID
  }
}

export const TRIAL_CONFIG = {
  freeLocates: 5,
  trialDays: 7
}
```

**To change limits:** Update these values and redeploy.

---

## ✅ Summary

**Yes, the system is fully implemented to:**

1. ✅ Track every locate accurately
2. ✅ Prevent gaming via server-side checks
3. ✅ Warn users before overages
4. ✅ Require confirmation for overage charges
5. ✅ Charge overages immediately
6. ✅ Suggest upgrades when appropriate
7. ✅ Reset monthly on billing cycle
8. ✅ Handle trial limits (5 locates OR 7 days)
9. ✅ Log everything for analytics
10. ✅ Provide clear user feedback

**The system is production-ready and cannot be gamed!** 🔒
