# TankFindr Pricing Update - December 3, 2024

## 🎯 New Pricing Structure

### TankFindr Pro (For Contractors)

| Tier | Old Price | New Price | Old Lookups | New Lookups | Change |
|------|-----------|-----------|-------------|-------------|--------|
| **Starter** | $99/mo | **$79/mo** | 300 | **100** | -20% price, -67% lookups |
| **Pro** | $249/mo | **$159/mo** | 1,500 | **300** | -36% price, -80% lookups |
| **Enterprise** | $599/mo | **$279/mo** | Unlimited | Unlimited | -53% price |

### Inspector Pro (For Home Inspectors)

| Product | Old Price | New Price | Lookups | Change |
|---------|-----------|-----------|---------|--------|
| **Inspector Pro** | $79/mo | **$69/mo** | Unlimited | -13% price |

---

## ✅ What Was Updated

### 1. Stripe Products ✅
Created new price points in Stripe (live mode):

- **TankFindr Pro Starter**: `price_1SaLqCRsawlh5ooWQgdfknJr` ($79/mo)
- **TankFindr Pro Pro**: `price_1SaLqGRsawlh5ooWvKDsKmtm` ($159/mo)
- **TankFindr Pro Enterprise**: `price_1SaLqLRsawlh5ooWCq6xJjUK` ($279/mo)
- **Inspector Pro**: `price_1SaLqPRsawlh5ooWr2zvGHr2` ($69/mo)

### 2. Frontend Pages ✅
Updated pricing across all customer-facing pages:

- ✅ **Homepage** (`/app/page.tsx`)
  - TankFindr Pro: "From $79/month" (was $99)
  - Inspector Pro: "$69/month" (was $79)

- ✅ **Pricing Page** (`/app/pricing-pro/page.tsx`)
  - Starter: $79/mo, 100 lookups
  - Pro: $159/mo, 300 lookups
  - Enterprise: $279/mo, Unlimited

- ✅ **FAQ Page** (`/app/faq/page.tsx`)
  - Updated all pricing mentions in Q&A

- ✅ **Terms of Service** (`/app/terms/page.tsx`)
  - Updated subscription tier pricing in legal text

- ✅ **Pricing Page Metadata** (`/app/pricing-pro/layout.tsx`)
  - SEO description: "Plans from $79/month"
  - OpenGraph: "100-unlimited lookups"

### 3. Backend Logic ✅
Updated subscription configuration:

- ✅ **Subscription Tiers** (`/lib/subscription.ts`)
  - Starter: 100 lookups limit
  - Pro: 300 lookups limit
  - Enterprise: Unlimited (-1)
  - Updated prices in SUBSCRIPTION_TIERS config

### 4. Stripe Checkout ✅
- ✅ **Checkout API** (`/app/api/create-subscription-checkout/route.ts`)
  - Uses environment variables for price IDs
  - Ready to accept new prices once env vars are updated

---

## ⚠️ Action Required: Update Vercel Environment Variables

You need to manually update these environment variables in Vercel:

### Go to: https://vercel.com/chris-jackson/tankfindr/settings/environment-variables

Update the following variables for **Production**:

```
STRIPE_PRICE_STARTER=price_1SaLqCRsawlh5ooWQgdfknJr
STRIPE_PRICE_PRO=price_1SaLqGRsawlh5ooWvKDsKmtm
STRIPE_PRICE_ENTERPRISE=price_1SaLqLRsawlh5ooWCq6xJjUK
STRIPE_PRICE_INSPECTOR=price_1SaLqPRsawlh5ooWr2zvGHr2
```

### Steps:
1. Go to Vercel project settings
2. Click "Environment Variables"
3. Find each `STRIPE_PRICE_*` variable
4. Click "Edit" and update with new price ID
5. Save changes
6. **Redeploy** the site for changes to take effect

---

## 📊 Impact Analysis

### Price Reductions
- **Starter**: 20% cheaper, better entry point
- **Pro**: 36% cheaper, more competitive
- **Enterprise**: 53% cheaper, huge value for high-volume users
- **Inspector Pro**: 13% cheaper, more accessible for inspectors

### Lookup Limits
- **Starter**: Reduced from 300 → 100 (focus on entry-level)
- **Pro**: Reduced from 1,500 → 300 (mid-tier positioning)
- **Enterprise**: Still unlimited (premium tier)

### Strategic Rationale
1. **Lower barrier to entry** - $79 starter makes it easier for small contractors to try
2. **Better value perception** - Enterprise at $279 vs $599 is a huge discount
3. **Clearer tier differentiation** - 100/300/Unlimited is easier to understand
4. **Competitive positioning** - More aggressive pricing to capture market share

---

## 🧪 Testing Checklist

### Before Going Live:
- [ ] Update Vercel environment variables (see above)
- [ ] Redeploy Vercel after env var update
- [ ] Test checkout flow for each tier
- [ ] Verify Stripe webhooks update subscription correctly
- [ ] Check that lookup limits are enforced properly

### Test Checkout Flow:
1. Visit https://tankfindr.com/pricing-pro
2. Click "Start 7-Day Free Trial" on Starter plan
3. Verify Stripe checkout shows **$79.00/month**
4. Complete checkout with test card: `4242 4242 4242 4242`
5. Verify subscription created in Stripe dashboard
6. Check that user gets 100 lookups in TankFindr Pro dashboard

### Test Each Tier:
- [ ] Starter ($79, 100 lookups)
- [ ] Pro ($159, 300 lookups)
- [ ] Enterprise ($279, unlimited)
- [ ] Inspector Pro ($69, unlimited)

---

## 🚨 Rollback Plan

If you need to revert to old pricing:

### 1. Revert Code Changes:
```bash
git revert 96c799f
git push origin main
```

### 2. Restore Old Stripe Price IDs in Vercel:
```
STRIPE_PRICE_STARTER=price_1SZYRERsawlh5ooWb3nAPL4M  # $99
STRIPE_PRICE_PRO=<old_pro_price_id>                 # $249
STRIPE_PRICE_ENTERPRISE=<old_enterprise_price_id>   # $599
STRIPE_PRICE_INSPECTOR=<old_inspector_price_id>     # $79
```

---

## 📝 Files Modified

### Frontend:
- `/app/page.tsx` - Homepage pricing
- `/app/pricing-pro/page.tsx` - Pricing page tiers
- `/app/pricing-pro/layout.tsx` - SEO metadata
- `/app/faq/page.tsx` - FAQ pricing mentions
- `/app/terms/page.tsx` - Terms of Service pricing

### Backend:
- `/lib/subscription.ts` - Subscription tier configuration
- `/app/api/create-subscription-checkout/route.ts` - Stripe checkout (uses env vars)

### Stripe:
- Created 4 new price objects in Stripe (live mode)

---

## 🎯 Next Steps

1. **Update Vercel environment variables** (see section above)
2. **Redeploy** the site
3. **Test checkout** for all 4 tiers
4. **Monitor Stripe dashboard** for new subscriptions
5. **Update marketing materials** with new pricing
6. **Email existing customers** about price changes (if applicable)

---

## 💡 Marketing Messaging

### For New Customers:
> "TankFindr Pro now starts at just $79/month - find septic tanks 10x faster with GPS-accurate locations from 2.2M+ government records."

### For Existing Customers (if grandfathering):
> "Good news! We've lowered our prices. Your current plan is now even better value, or you can switch to our new lower-priced tiers."

### For Sales Outreach:
> "We just dropped our prices by up to 53%. TankFindr Pro Enterprise is now $279/mo (was $599) with unlimited lookups. Try it free for 7 days."

---

**Pricing update deployed and ready to go live once Vercel env vars are updated!** 🚀
