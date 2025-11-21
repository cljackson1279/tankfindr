# Create TankFindr Test Mode Products in Stripe

## 🎯 Create Test Mode Products Manually

Since the Stripe MCP is connected to live mode, you'll need to create test mode products manually. It's quick and easy!

---

## Step-by-Step: Create Test Mode Products

### Step 1: Switch to Test Mode

1. Go to: https://dashboard.stripe.com/
2. Look for the toggle in the **top right corner**
3. Click to switch from **"Live"** to **"Test"**
4. The page will reload - you're now in test mode

---

### Step 2: Create Product 1 - TankFindr Starter

1. **Go to Products:**
   - https://dashboard.stripe.com/test/products

2. **Click "+ Add product"** (top right)

3. **Fill in Product Details:**
   ```
   Name: TankFindr Starter
   Description: 10 tank locates per month with AI-powered satellite imagery analysis
   ```

4. **Pricing:**
   - Click **"Add pricing"**
   - **Pricing model:** Standard pricing
   - **Price:** `99.00`
   - **Billing period:** Monthly
   - **Currency:** USD

5. **Click "Save product"**

6. **Copy the Price ID:**
   - After saving, you'll see the price listed
   - Click on the price
   - Copy the **Price ID** (starts with `price_`)
   - **Save this as:** `STRIPE_STARTER_PRICE_ID_TEST`

---

### Step 3: Create Product 2 - TankFindr Pro

1. **Click "+ Add product"** again

2. **Fill in Product Details:**
   ```
   Name: TankFindr Pro
   Description: 40 tank locates per month with AI-powered satellite imagery analysis and priority support
   ```

3. **Pricing:**
   - Click **"Add pricing"**
   - **Pricing model:** Standard pricing
   - **Price:** `249.00`
   - **Billing period:** Monthly
   - **Currency:** USD

4. **Click "Save product"**

5. **Copy the Price ID:**
   - Click on the price
   - Copy the **Price ID**
   - **Save this as:** `STRIPE_PRO_PRICE_ID_TEST`

---

### Step 4: Create Product 3 - TankFindr Enterprise

1. **Click "+ Add product"** again

2. **Fill in Product Details:**
   ```
   Name: TankFindr Enterprise
   Description: 150 tank locates per month with AI-powered satellite imagery, priority support, and dedicated account manager
   ```

3. **Pricing:**
   - Click **"Add pricing"**
   - **Pricing model:** Standard pricing
   - **Price:** `599.00`
   - **Billing period:** Monthly
   - **Currency:** USD

4. **Click "Save product"**

5. **Copy the Price ID:**
   - Click on the price
   - Copy the **Price ID**
   - **Save this as:** `STRIPE_ENTERPRISE_PRICE_ID_TEST`

---

## ✅ Verification

After creating all 3 products, go to:
https://dashboard.stripe.com/test/products

You should see:
- ✅ TankFindr Starter - $99.00/month
- ✅ TankFindr Pro - $249.00/month
- ✅ TankFindr Enterprise - $599.00/month

---

## 📋 Complete Environment Variables for Vercel

Here's the **complete list** of all environment variables you need to add to Vercel:

---

### 🔵 SUPABASE (3 variables)

**Where to find:** https://app.supabase.com/project/YOUR_PROJECT/settings/api

```
NEXT_PUBLIC_SUPABASE_URL
Value: https://xxxxx.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

```
SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

---

### 🗺️ MAPBOX (1 variable)

**Where to find:** https://account.mapbox.com/access-tokens/

```
NEXT_PUBLIC_MAPBOX_TOKEN
Value: pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsxxxxx...
```

---

### 🛰️ SKYFI (1 variable)

**Where to find:** Your SkyFi account dashboard

```
SKYFI_API_KEY
Value: your_skyfi_api_key_here
```

---

### 💳 STRIPE - TEST MODE (3 variables)

**Where to find:** https://dashboard.stripe.com/test/apikeys

```
STRIPE_SECRET_KEY
Value: sk_test_51xxxxx... (click "Reveal test key")
```

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_test_51xxxxx... (visible on page)
```

```
STRIPE_WEBHOOK_SECRET
Value: whsec_xxxxx... (you'll get this AFTER deploying - see below)
```

---

### 💰 STRIPE PRICE IDs - TEST MODE (3 variables)

**Where to find:** After creating products above, copy the Price IDs

```
STRIPE_STARTER_PRICE_ID
Value: price_xxxxx... (from Step 2.6 above)
```

```
STRIPE_PRO_PRICE_ID
Value: price_xxxxx... (from Step 3.5 above)
```

```
STRIPE_ENTERPRISE_PRICE_ID
Value: price_xxxxx... (from Step 4.5 above)
```

---

### 🌐 SITE URL (1 variable)

**Initial value (before deployment):**

```
NEXT_PUBLIC_SITE_URL
Value: http://localhost:3000
```

**Update after deployment to:**

```
NEXT_PUBLIC_SITE_URL
Value: https://your-app-name.vercel.app
```

---

### 📱 TWILIO - OPTIONAL (3 variables)

**Only add if you want SMS notifications**

**Where to find:** https://console.twilio.com/

```
TWILIO_SID
Value: ACxxxxx...
```

```
TWILIO_TOKEN
Value: xxxxx...
```

```
TWILIO_NUMBER
Value: +15551234567
```

---

## 📊 Summary: Total Environment Variables

### Required for Testing (12 variables):
1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`
4. `NEXT_PUBLIC_MAPBOX_TOKEN`
5. `SKYFI_API_KEY`
6. `STRIPE_SECRET_KEY` (test mode)
7. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test mode)
8. `STRIPE_WEBHOOK_SECRET` (add after deployment)
9. `STRIPE_STARTER_PRICE_ID` (test mode)
10. `STRIPE_PRO_PRICE_ID` (test mode)
11. `STRIPE_ENTERPRISE_PRICE_ID` (test mode)
12. `NEXT_PUBLIC_SITE_URL`

### Optional (3 variables):
13. `TWILIO_SID`
14. `TWILIO_TOKEN`
15. `TWILIO_NUMBER`

---

## 🔄 How to Add in Vercel

### During Initial Setup:

1. After importing GitHub repo, **before clicking Deploy**
2. Scroll down to **"Environment Variables"**
3. Add each variable:
   - **Name:** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value:** (paste the value)
   - Click **"Add"**
4. Repeat for all 12 required variables
5. Then click **"Deploy"**

### After Deployment:

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings → Environment Variables**
4. Click **"Add New"**
5. Add variable name and value
6. Click **"Save"**
7. **Redeploy** from Deployments tab

---

## ⚠️ Special Note: STRIPE_WEBHOOK_SECRET

You can't get this until AFTER you deploy to Vercel:

### Initial Deployment:
```
STRIPE_WEBHOOK_SECRET
Value: whsec_temporary_placeholder
```

### After Deployment:

1. Get your Vercel URL (e.g., `https://tankfindr.vercel.app`)
2. Go to: https://dashboard.stripe.com/test/webhooks
3. Click **"+ Add endpoint"**
4. Enter: `https://your-url.vercel.app/api/webhooks/stripe`
5. Select these events:
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

## 📋 Copy-Paste Template for Vercel

Here's a template you can use. Replace the values with your actual keys:

```bash
# === SUPABASE ===
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# === MAPBOX ===
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsxxxxx...

# === SKYFI ===
SKYFI_API_KEY=your_skyfi_key_here

# === STRIPE (TEST MODE) ===
STRIPE_SECRET_KEY=sk_test_51xxxxx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx...
STRIPE_WEBHOOK_SECRET=whsec_temporary_placeholder

# === STRIPE PRICE IDs (TEST MODE) ===
STRIPE_STARTER_PRICE_ID=price_xxxxx...
STRIPE_PRO_PRICE_ID=price_xxxxx...
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx...

# === SITE URL ===
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# === TWILIO (OPTIONAL) ===
# TWILIO_SID=ACxxxxx...
# TWILIO_TOKEN=xxxxx...
# TWILIO_NUMBER=+15551234567
```

---

## ✅ Checklist

Before deploying to Vercel, make sure you have:

### Stripe Setup:
- [ ] Switched to Test Mode in Stripe
- [ ] Created TankFindr Starter product ($99/mo)
- [ ] Created TankFindr Pro product ($249/mo)
- [ ] Created TankFindr Enterprise product ($599/mo)
- [ ] Copied all 3 Price IDs
- [ ] Copied Test Mode Publishable Key
- [ ] Copied Test Mode Secret Key

### Environment Variables:
- [ ] All 3 Supabase variables
- [ ] Mapbox token
- [ ] SkyFi API key
- [ ] Stripe secret key (test)
- [ ] Stripe publishable key (test)
- [ ] All 3 Stripe Price IDs (test)
- [ ] Site URL (will update after deployment)
- [ ] Webhook secret (will add after deployment)

### Ready to Deploy:
- [ ] Code pushed to GitHub
- [ ] All variables ready to paste into Vercel
- [ ] Stripe test products created

---

## 🎯 Next Steps

1. **Create the 3 test mode products** (Steps 2-4 above)
2. **Copy all the Price IDs**
3. **Get your Stripe test API keys**
4. **Add all 12 variables to Vercel**
5. **Deploy!**
6. **Set up webhook after deployment**

You're almost there! 🚀
