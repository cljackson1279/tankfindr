# Complete Environment Variables for Vercel Deployment

## ✅ Your Stripe Test Products Are Ready!

Here are your 3 test mode Price IDs:
- **Starter ($99/mo):** `price_1SW0dERsawlh5ooWS1vofyMx`
- **Pro ($249/mo):** `price_1SW0ftRsawlh5ooWfxKAfM3L`
- **Enterprise ($599/mo):** `price_1SW0heRsawlh5ooWIn6gOZuk`

---

## 📋 Complete List: All Environment Variables for Vercel

Copy these into Vercel when deploying. Replace the placeholder values with your actual keys.

---

### 🔵 SUPABASE (3 variables)

**Where to find:** https://app.supabase.com/project/YOUR_PROJECT/settings/api

```
NEXT_PUBLIC_SUPABASE_URL
```
**Value:** `https://xxxxx.supabase.co` (replace with your Supabase URL)

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (replace with your anon key)

```
SUPABASE_SERVICE_ROLE_KEY
```
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (replace with your service role key)

---

### 🗺️ MAPBOX (1 variable)

**Where to find:** https://account.mapbox.com/access-tokens/

```
NEXT_PUBLIC_MAPBOX_TOKEN
```
**Value:** `pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsxxxxx...` (replace with your Mapbox token)

---

### 🛰️ SKYFI (1 variable)

**Where to find:** Your SkyFi dashboard

```
SKYFI_API_KEY
```
**Value:** `your_skyfi_api_key_here` (replace with your SkyFi key)

---

### 💳 STRIPE - TEST MODE (3 variables)

**Where to find:** https://dashboard.stripe.com/test/apikeys

```
STRIPE_SECRET_KEY
```
**Value:** `sk_test_51xxxxx...` (click "Reveal test key" and copy)

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```
**Value:** `pk_test_51xxxxx...` (already visible on the page)

```
STRIPE_WEBHOOK_SECRET
```
**Value:** `whsec_temporary_placeholder` (you'll update this AFTER deploying)

---

### 💰 STRIPE PRICE IDs - TEST MODE (3 variables)

**✅ Already configured - use these exact values:**

```
STRIPE_STARTER_PRICE_ID
```
**Value:** `price_1SW0dERsawlh5ooWS1vofyMx`

```
STRIPE_PRO_PRICE_ID
```
**Value:** `price_1SW0ftRsawlh5ooWfxKAfM3L`

```
STRIPE_ENTERPRISE_PRICE_ID
```
**Value:** `price_1SW0heRsawlh5ooWIn6gOZuk`

---

### 🌐 SITE URL (1 variable)

**Initial value (before deployment):**

```
NEXT_PUBLIC_SITE_URL
```
**Value:** `http://localhost:3000`

**⚠️ Update after deployment to:** `https://your-app-name.vercel.app`

---

### 📱 TWILIO - OPTIONAL (3 variables)

**Only add if you want SMS notifications**

```
TWILIO_SID
```
**Value:** `ACxxxxx...` (from https://console.twilio.com/)

```
TWILIO_TOKEN
```
**Value:** `xxxxx...`

```
TWILIO_NUMBER
```
**Value:** `+15551234567`

---

## 📊 Summary

### Required Variables: 12
1. ✅ `NEXT_PUBLIC_SUPABASE_URL`
2. ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. ✅ `SUPABASE_SERVICE_ROLE_KEY`
4. ✅ `NEXT_PUBLIC_MAPBOX_TOKEN`
5. ✅ `SKYFI_API_KEY`
6. ✅ `STRIPE_SECRET_KEY`
7. ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
8. ✅ `STRIPE_WEBHOOK_SECRET`
9. ✅ `STRIPE_STARTER_PRICE_ID` → **price_1SW0dERsawlh5ooWS1vofyMx**
10. ✅ `STRIPE_PRO_PRICE_ID` → **price_1SW0ftRsawlh5ooWfxKAfM3L**
11. ✅ `STRIPE_ENTERPRISE_PRICE_ID` → **price_1SW0heRsawlh5ooWIn6gOZuk**
12. ✅ `NEXT_PUBLIC_SITE_URL`

### Optional Variables: 3
13. ⚪ `TWILIO_SID`
14. ⚪ `TWILIO_TOKEN`
15. ⚪ `TWILIO_NUMBER`

---

## 🚀 How to Add in Vercel

### During Initial Deployment:

1. Go to: https://vercel.com/
2. Click **"Add New Project"**
3. Import your GitHub repo: `cljackson1279/tankfindr`
4. Click **"Import"**
5. **Before clicking Deploy**, scroll to **"Environment Variables"**
6. Add each variable one by one:
   - Enter **Key** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter **Value** (paste your actual value)
   - Click **"Add"**
7. Repeat for all 12 required variables
8. Click **"Deploy"**

---

## 📝 Copy-Paste Template

Here's a template you can fill in and use:

```bash
# === SUPABASE ===
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# === MAPBOX ===
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsxxxxx...

# === SKYFI ===
SKYFI_API_KEY=your_skyfi_key_here

# === STRIPE TEST MODE ===
STRIPE_SECRET_KEY=sk_test_51xxxxx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx...
STRIPE_WEBHOOK_SECRET=whsec_temporary_placeholder

# === STRIPE PRICE IDs (TEST MODE) - USE THESE EXACT VALUES ===
STRIPE_STARTER_PRICE_ID=price_1SW0dERsawlh5ooWS1vofyMx
STRIPE_PRO_PRICE_ID=price_1SW0ftRsawlh5ooWfxKAfM3L
STRIPE_ENTERPRISE_PRICE_ID=price_1SW0heRsawlh5ooWIn6gOZuk

# === SITE URL ===
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# === TWILIO (OPTIONAL) ===
# TWILIO_SID=ACxxxxx...
# TWILIO_TOKEN=xxxxx...
# TWILIO_NUMBER=+15551234567
```

---

## 🔑 Next Steps: Get Your Stripe API Keys

### Step 1: Go to Stripe Test API Keys
👉 https://dashboard.stripe.com/test/apikeys

### Step 2: Copy Publishable Key
- Already visible on the page
- Starts with `pk_test_`
- Copy and save as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Step 3: Copy Secret Key
- Click **"Reveal test key"** button
- Starts with `sk_test_`
- Copy and save as `STRIPE_SECRET_KEY`

---

## ⚠️ Important: Webhook Secret

You can't get the webhook secret until AFTER you deploy to Vercel.

### For Now:
Use this placeholder:
```
STRIPE_WEBHOOK_SECRET=whsec_temporary_placeholder
```

### After Deployment:
1. Get your Vercel URL (e.g., `https://tankfindr.vercel.app`)
2. Go to: https://dashboard.stripe.com/test/webhooks
3. Click **"+ Add endpoint"**
4. Enter: `https://your-url.vercel.app/api/webhooks/stripe`
5. Select these 6 events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **"Add endpoint"**
7. Copy the **Signing secret** (starts with `whsec_`)
8. Update `STRIPE_WEBHOOK_SECRET` in Vercel
9. Redeploy

---

## ✅ Pre-Deployment Checklist

Before deploying to Vercel, make sure you have:

### Stripe:
- [x] Created 3 test products ✅ DONE!
- [x] Copied 3 Price IDs ✅ DONE!
- [ ] Copied test publishable key
- [ ] Copied test secret key

### Other Services:
- [ ] Supabase URL and keys
- [ ] Mapbox token
- [ ] SkyFi API key

### Ready to Deploy:
- [ ] All 12 environment variables ready
- [ ] Code pushed to GitHub
- [ ] Vercel account ready

---

## 🎉 You're Almost There!

You've completed the hardest part (creating Stripe products)! 

**Next steps:**
1. Get your Stripe test API keys (2 minutes)
2. Gather your Supabase, Mapbox, and SkyFi keys
3. Push code to GitHub
4. Deploy to Vercel with all environment variables
5. Set up webhook after deployment

**You're about 15 minutes away from a live TankFindr app!** 🚀
