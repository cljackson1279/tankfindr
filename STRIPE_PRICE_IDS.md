# Stripe Price IDs - TankFindr Production

## ✅ All Products Created Successfully

All products have been created in Stripe **LIVE MODE** with correct descriptions matching your app.

---

## 📋 Price IDs for Vercel Environment Variables

Copy these exact values into Vercel → Settings → Environment Variables:

### TankFindr Pro Subscription Tiers

**1. Starter Tier ($99/month - 300 lookups)**
```
Key: STRIPE_PRICE_STARTER
Value: price_1SZYRERsawlh5ooWb3nAPL4M
```
- Product ID: `prod_TWbeWPMo9JK2WV`
- Product Name: TankFindr Pro - Starter
- Description: 300 tank lookups per month for small septic companies. GPS-accurate locations from government records. Job history tracking and basic reporting.

**2. Pro Tier ($249/month - 1,500 lookups)**
```
Key: STRIPE_PRICE_PRO
Value: price_1SZYRNRsawlh5ooWmzFO5bVk
```
- Product ID: `prod_TWbee5udM9ZM5q`
- Product Name: TankFindr Pro - Pro
- Description: 1,500 tank lookups per month for growing septic businesses. Everything in Starter plus priority support, advanced analytics, and multi-user access (up to 5 users).

**3. Enterprise Tier ($599/month - Unlimited)**
```
Key: STRIPE_PRICE_ENTERPRISE
Value: price_1SZYRXRsawlh5ooWzzWE8rt6
```
- Product ID: `prod_TWbevQk7Jqih3S`
- Product Name: TankFindr Pro - Enterprise
- Description: Unlimited tank lookups for large septic companies. Everything in Pro plus custom integrations, up to 10 users, phone support, custom reporting, and API access.

### Inspector Pro

**4. Inspector Pro ($79/month - Unlimited reports)**
```
Key: STRIPE_PRICE_INSPECTOR
Value: price_1SZMs6Rsawlh5ooWuJ5X98xG
```
- Product ID: `prod_TWPhXsVvhD7J1W`
- Product Name: TankFindr Inspector Pro
- Description: Unlimited septic system reports for home inspectors. Includes verified permit data, GPS coordinates, flood zone info, and professional PDF reports.
- **Note:** This was already created, so using existing price ID

### Property Reports

**5. Property Report ($19 one-time)**
```
Key: STRIPE_PRICE_PROPERTY_REPORT
Value: price_1SZYRjRsawlh5ooWGgLVj2Me
```
- Product ID: `prod_TWbe7sOffzhCzG`
- Product Name: TankFindr Property Report
- Description: One-time septic system report for homeowners. Get instant answers: Does your property have a septic tank or sewer? Includes verified permit data, GPS coordinates, system details, and downloadable PDF report.
- **Type:** One-time payment (not recurring)

---

## 🔧 Quick Copy-Paste for Vercel

Add these to Vercel → Settings → Environment Variables (select "All Environments"):

```
STRIPE_PRICE_STARTER=price_1SZYRERsawlh5ooWb3nAPL4M
STRIPE_PRICE_PRO=price_1SZYRNRsawlh5ooWmzFO5bVk
STRIPE_PRICE_ENTERPRISE=price_1SZYRXRsawlh5ooWzzWE8rt6
STRIPE_PRICE_INSPECTOR=price_1SZMs6Rsawlh5ooWuJ5X98xG
STRIPE_PRICE_PROPERTY_REPORT=price_1SZYRjRsawlh5ooWGgLVj2Me
```

---

## 🔐 Other Required Stripe Variables

Don't forget these (if not already added):

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXX
STRIPE_SECRET_KEY=sk_live_XXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXX
```

Get these from: Stripe Dashboard → Developers → API Keys

---

## 📊 Product Summary

| Product | Price | Type | Lookups | Price ID |
|---------|-------|------|---------|----------|
| TankFindr Pro - Starter | $99/mo | Recurring | 300 | `price_1SZYRERsawlh5ooWb3nAPL4M` |
| TankFindr Pro - Pro | $249/mo | Recurring | 1,500 | `price_1SZYRNRsawlh5ooWmzFO5bVk` |
| TankFindr Pro - Enterprise | $599/mo | Recurring | Unlimited | `price_1SZYRXRsawlh5ooWzzWE8rt6` |
| Inspector Pro | $79/mo | Recurring | Unlimited | `price_1SZMs6Rsawlh5ooWuJ5X98xG` |
| Property Report | $19 | One-time | 1 report | `price_1SZYRjRsawlh5ooWGgLVj2Me` |

---

## ✅ Next Steps

1. **Add Price IDs to Vercel** (see above)
2. **Set up Webhook** (see STRIPE_WEBHOOK_SETUP.md)
3. **Test each checkout flow**
4. **Verify webhooks are working**

---

## 🎯 Testing Checklist

After adding to Vercel, test each product:

- [ ] TankFindr Pro - Starter ($99) checkout works
- [ ] TankFindr Pro - Pro ($249) checkout works
- [ ] TankFindr Pro - Enterprise ($599) checkout works
- [ ] Inspector Pro ($79) checkout works
- [ ] Property Report ($19) checkout works
- [ ] All redirects work correctly
- [ ] Webhooks create subscriptions in database
- [ ] PDF downloads work after payment

---

## 📝 Notes

- All products are in **LIVE MODE**
- All descriptions match the app exactly
- Property Report is configured as **one-time payment** (not recurring)
- Inspector Pro uses existing price ID (already created)
- All new products created: 2025-12-01

---

**Status:** ✅ All products and prices created successfully in Stripe Live Mode
