# Vercel Environment Variables Setup Guide

This guide will help you configure all required environment variables in Vercel for TankFindr production deployment.

---

## Step 1: Access Vercel Dashboard

1. Go to: https://vercel.com/chris-jackson/tankfindr
2. Click: **Settings** → **Environment Variables**

---

## Step 2: Add Environment Variables

Copy and paste each variable below into Vercel. For each variable:
- Click "Add New"
- Enter the **Key** (variable name)
- Enter the **Value** (the actual secret/key)
- Select **All Environments** (Production, Preview, Development)
- Click "Save"

---

## Required Variables

### Supabase Configuration

```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://cijtllcbrvkbvrjriweu.supabase.co
Environments: All
```

```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [Get from Supabase Dashboard → Settings → API → anon public]
Environments: All
```

```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: [Already have this - starts with eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...]
Environments: All
```

---

### Stripe Configuration (Live Mode)

**⚠️ IMPORTANT: Use LIVE mode keys, not test mode!**

```
Key: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_live_XXXXXXXXXX [Get from Stripe Dashboard → Developers → API Keys]
Environments: All
```

```
Key: STRIPE_SECRET_KEY
Value: sk_live_XXXXXXXXXX [Get from Stripe Dashboard → Developers → API Keys]
Environments: All
```

```
Key: STRIPE_WEBHOOK_SECRET
Value: whsec_XXXXXXXXXX [Get from Stripe Dashboard → Developers → Webhooks → Signing secret]
Environments: All
```

---

### Stripe Price IDs

**Create these products in Stripe Dashboard first (see PRODUCTION_LAUNCH_GUIDE.md)**

```
Key: STRIPE_PRICE_STARTER
Value: price_XXXXXXXXXX [TankFindr Pro - Starter ($99/month)]
Environments: All
```

```
Key: STRIPE_PRICE_PRO
Value: price_XXXXXXXXXX [TankFindr Pro - Pro ($249/month)]
Environments: All
```

```
Key: STRIPE_PRICE_ENTERPRISE
Value: price_XXXXXXXXXX [TankFindr Pro - Enterprise ($599/month)]
Environments: All
```

```
Key: STRIPE_PRICE_INSPECTOR
Value: price_XXXXXXXXXX [Inspector Pro ($79/month)]
Environments: All
```

```
Key: STRIPE_PRICE_PROPERTY_REPORT
Value: price_XXXXXXXXXX [Property Report ($19 one-time)]
Environments: All
```

---

### Mapbox Configuration

```
Key: NEXT_PUBLIC_MAPBOX_TOKEN
Value: pk.XXXXXXXXXX [Get from Mapbox Dashboard → Access Tokens]
Environments: All
```

---

### Site Configuration

```
Key: NEXT_PUBLIC_SITE_URL
Value: https://tankfindr.com
Environments: Production only
```

```
Key: NEXT_PUBLIC_SITE_URL
Value: https://tankfindr-git-main-chris-jackson.vercel.app
Environments: Preview only
```

```
Key: NEXT_PUBLIC_SITE_URL
Value: http://localhost:3000
Environments: Development only
```

---

### Optional: Google Analytics

```
Key: NEXT_PUBLIC_GA_MEASUREMENT_ID
Value: G-XXXXXXXXXX [Get from Google Analytics → Admin → Data Streams]
Environments: Production only
```

---

## Step 3: Verify Configuration

After adding all variables:

1. **Check the list** - You should have 12-13 environment variables total
2. **Redeploy** - Vercel will automatically redeploy when you add variables
3. **Wait** - Give it 2-3 minutes for the deployment to complete
4. **Test** - Visit your site and test a payment flow

---

## Step 4: Domain Configuration

### Add Custom Domain

1. Go to: **Settings** → **Domains**
2. Click: **Add Domain**
3. Enter: `tankfindr.com`
4. Click: **Add**
5. Repeat for: `www.tankfindr.com`

### Configure DNS (Namecheap)

1. Log into Namecheap: https://www.namecheap.com
2. Go to: **Domain List** → **Manage** (for tankfindr.com)
3. Click: **Advanced DNS** tab
4. Add these records:

**A Record (Root Domain)**
- Type: `A Record`
- Host: `@`
- Value: `76.76.21.21`
- TTL: Automatic

**CNAME Record (www)**
- Type: `CNAME Record`
- Host: `www`
- Value: `cname.vercel-dns.com`
- TTL: Automatic

**TXT Record (Verification)**
- Type: `TXT Record`
- Host: `_vercel`
- Value: [Vercel will show you this]
- TTL: Automatic

5. **Save all records**
6. **Wait 5-10 minutes** for DNS propagation
7. **Return to Vercel** → Click "Refresh" to verify

### Set Primary Domain

1. In Vercel Domains settings
2. Find: `tankfindr.com`
3. Click: **⋯** (three dots) → **Set as Primary**
4. This ensures all traffic redirects to tankfindr.com

---

## Step 5: SSL Certificate

✅ **Automatic** - Vercel provisions SSL certificates automatically
- Wait 24-48 hours for full propagation
- HTTPS will be enforced automatically
- HTTP traffic redirects to HTTPS

---

## Step 6: Webhook Configuration

### Update Stripe Webhook URL

1. Go to: Stripe Dashboard → **Developers** → **Webhooks**
2. Find your webhook endpoint
3. Click: **Edit**
4. Update URL to: `https://tankfindr.com/api/webhooks/stripe`
5. Ensure these events are selected:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. **Save**

---

## Troubleshooting

### Build Fails After Adding Variables

**Problem:** Vercel build fails with "Missing environment variable"

**Solution:**
1. Check variable names match exactly (case-sensitive)
2. Ensure all required variables are added
3. Verify no typos in variable names
4. Redeploy manually: **Deployments** → **⋯** → **Redeploy**

### Stripe Payments Not Working

**Problem:** Checkout redirects fail or payments don't process

**Solution:**
1. Verify you're using **LIVE** mode keys (pk_live_, sk_live_)
2. Check webhook URL is correct: `https://tankfindr.com/api/webhooks/stripe`
3. Test webhook delivery in Stripe Dashboard
4. Check Vercel logs for errors: **Deployments** → Click deployment → **Functions**

### Domain Not Resolving

**Problem:** tankfindr.com shows "This site can't be reached"

**Solution:**
1. Wait longer - DNS can take up to 48 hours
2. Check DNS records in Namecheap are correct
3. Use DNS checker: https://dnschecker.org
4. Try clearing browser cache
5. Try incognito/private browsing mode

### SSL Certificate Not Working

**Problem:** Browser shows "Not Secure" or SSL error

**Solution:**
1. Wait 24-48 hours for certificate provisioning
2. Check domain is verified in Vercel
3. Force HTTPS: Vercel does this automatically
4. Clear browser cache and try again

---

## Verification Checklist

After completing all steps, verify:

- [ ] All 12-13 environment variables added to Vercel
- [ ] Domain tankfindr.com added and verified
- [ ] DNS records configured in Namecheap
- [ ] SSL certificate active (HTTPS working)
- [ ] Stripe webhook URL updated to production domain
- [ ] Test payment with real card works
- [ ] Webhook events received in Stripe
- [ ] Site loads at https://tankfindr.com
- [ ] www.tankfindr.com redirects to tankfindr.com
- [ ] All pages load correctly
- [ ] No console errors in browser

---

## Quick Reference: Where to Get Each Value

| Variable | Where to Get It |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Already have (in .env.local) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API Keys (Live mode) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys (Live mode) |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks → Signing secret |
| `STRIPE_PRICE_STARTER` | Stripe Dashboard → Products → Starter → Price ID |
| `STRIPE_PRICE_PRO` | Stripe Dashboard → Products → Pro → Price ID |
| `STRIPE_PRICE_ENTERPRISE` | Stripe Dashboard → Products → Enterprise → Price ID |
| `STRIPE_PRICE_INSPECTOR` | Stripe Dashboard → Products → Inspector Pro → Price ID |
| `STRIPE_PRICE_PROPERTY_REPORT` | Stripe Dashboard → Products → Property Report → Price ID |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox Dashboard → Access Tokens |
| `NEXT_PUBLIC_SITE_URL` | Use: `https://tankfindr.com` |

---

## Support

If you encounter issues:

1. **Check Vercel Logs:** Deployments → Click deployment → Functions
2. **Check Stripe Logs:** Stripe Dashboard → Developers → Logs
3. **Check Browser Console:** F12 → Console tab
4. **Vercel Support:** https://vercel.com/support
5. **Stripe Support:** https://support.stripe.com

---

## Next Steps

After completing this setup:

1. ✅ Test all payment flows with real card
2. ✅ Submit sitemap to Google Search Console
3. ✅ Set up Google Analytics
4. ✅ Create Google Business Profile
5. ✅ Start marketing and SEO efforts

**Your production environment is now ready! 🚀**
