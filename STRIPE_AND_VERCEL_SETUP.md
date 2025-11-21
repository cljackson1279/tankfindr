# Complete Stripe & Vercel Setup Guide

## ✅ Database Setup Complete!

Your Supabase tables are ready:
- ✅ cache
- ✅ profiles
- ✅ tanks
- ✅ usage
- ✅ geography_columns, geometry_columns, spatial_ref_sys (PostGIS - normal)

Now let's get Stripe keys and deploy to Vercel!

---

## 🔑 PART 1: Get Stripe API Keys

### Step 1: Get Test Mode Keys (for development/testing)

1. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com/test/apikeys

2. **Copy Publishable Key:**
   - Already visible on the page
   - Starts with `pk_test_`
   - Example: `pk_test_51Qx...`
   - **Save this as:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

3. **Copy Secret Key:**
   - Click **"Reveal test key"** button
   - Starts with `sk_test_`
   - Example: `sk_test_51Qx...`
   - ⚠️ **Important:** Never share this key!
   - **Save this as:** `STRIPE_SECRET_KEY`

### Step 2: Set Up Webhook for Production

**Note:** You'll do this AFTER deploying to Vercel, but here's what you'll need:

1. **Go to Webhooks:**
   - https://dashboard.stripe.com/webhooks

2. **Click "+ Add endpoint"**

3. **Enter your Vercel URL:**
   - Format: `https://your-app-name.vercel.app/api/webhooks/stripe`
   - Example: `https://tankfindr.vercel.app/api/webhooks/stripe`

4. **Select these events:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. **Click "Add endpoint"**

6. **Copy Signing Secret:**
   - After creating, click on the endpoint
   - Click **"Reveal"** next to "Signing secret"
   - Starts with `whsec_`
   - **Save this as:** `STRIPE_WEBHOOK_SECRET`

---

## 🚀 PART 2: Deploy to Vercel

### Step 1: Push Code to GitHub

**Important:** You need to push the code first!

```bash
# On your local machine
cd /path/to/tankfindr

# Pull my changes
git pull origin main

# Push to GitHub
git push origin main
```

**Commits that will be pushed:**
- Complete TankFindr MVP implementation
- Stripe integration and products
- Usage tracking and overage warnings
- Build fixes
- Documentation

### Step 2: Connect GitHub to Vercel

1. **Go to Vercel:**
   - https://vercel.com/

2. **Click "Add New Project"**

3. **Import Git Repository:**
   - Select **GitHub**
   - Find `cljackson1279/tankfindr`
   - Click **Import**

4. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

5. **DON'T DEPLOY YET!** Click "Environment Variables" first

---

## 🔐 PART 3: Add Environment Variables in Vercel

### Step 1: Add All Environment Variables

In the Vercel project configuration, add these one by one:

#### Supabase Variables (you already have these)

```
NEXT_PUBLIC_SUPABASE_URL
Value: https://xxxxx.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```
SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Mapbox Variable (you already have this)

```
NEXT_PUBLIC_MAPBOX_TOKEN
Value: pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsxxxxx...
```

#### SkyFi Variable (you already have this)

```
SKYFI_API_KEY
Value: your_skyfi_key_here
```

#### Stripe Variables (from Part 1)

```
STRIPE_SECRET_KEY
Value: sk_test_51Qx... (from Step 1.3 above)
```

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_test_51Qx... (from Step 1.2 above)
```

```
STRIPE_WEBHOOK_SECRET
Value: whsec_... (you'll get this after deployment - see Part 4)
```

#### Stripe Price IDs (already configured - just copy these)

```
STRIPE_STARTER_PRICE_ID
Value: price_1SVymZRsawlh5ooWJaAvhJej
```

```
STRIPE_PRO_PRICE_ID
Value: price_1SVymfRsawlh5ooW1VVoV8Rs
```

```
STRIPE_ENTERPRISE_PRICE_ID
Value: price_1SVymkRsawlh5ooWnn749Fid
```

#### Site URL (temporary - will update after deployment)

```
NEXT_PUBLIC_SITE_URL
Value: http://localhost:3000
```

**Note:** We'll update this after deployment

#### Twilio (OPTIONAL - skip if not using SMS)

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

### Step 2: Deploy!

1. After adding all environment variables, click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You should see: ✅ **"Congratulations! Your project has been deployed"**
4. Click **"Visit"** to see your live site!

---

## 🔗 PART 4: Complete Webhook Setup

Now that your site is deployed, finish the webhook configuration:

### Step 1: Get Your Vercel URL

After deployment, copy your URL:
- Example: `https://tankfindr.vercel.app`
- Or: `https://tankfindr-git-main-yourname.vercel.app`

### Step 2: Create Production Webhook

1. **Go to Stripe Webhooks:**
   - https://dashboard.stripe.com/webhooks

2. **Click "+ Add endpoint"**

3. **Enter endpoint URL:**
   ```
   https://your-vercel-url.vercel.app/api/webhooks/stripe
   ```

4. **Select events:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. **Click "Add endpoint"**

6. **Copy Signing Secret:**
   - Click on the endpoint you just created
   - Click **"Reveal"** next to "Signing secret"
   - Copy the value (starts with `whsec_`)

### Step 3: Update Webhook Secret in Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/

2. **Select your TankFindr project**

3. **Go to Settings → Environment Variables**

4. **Find `STRIPE_WEBHOOK_SECRET`**
   - Click **Edit**
   - Paste the new webhook secret
   - Click **Save**

5. **Redeploy:**
   - Go to **Deployments** tab
   - Click ⋯ (three dots) on latest deployment
   - Click **Redeploy**
   - Wait for redeployment to complete

### Step 4: Update Site URL

1. **In Vercel Settings → Environment Variables**

2. **Find `NEXT_PUBLIC_SITE_URL`**
   - Click **Edit**
   - Change from `http://localhost:3000`
   - To: `https://your-vercel-url.vercel.app`
   - Click **Save**

3. **Redeploy again** (same process as Step 3.5)

---

## 🔐 PART 5: Configure Supabase Auth Redirects

1. **Go to Supabase Dashboard:**
   - https://app.supabase.com

2. **Select your TankFindr project**

3. **Go to Authentication → URL Configuration**

4. **Add Redirect URLs:**
   - `https://your-vercel-url.vercel.app/auth/callback`
   - `https://your-vercel-url.vercel.app/**`

5. **Click "Save"**

---

## ✅ PART 6: Test Everything!

### Test 1: Visit Your Site
```
https://your-vercel-url.vercel.app
```
- ✅ Landing page loads
- ✅ Pricing page works
- ✅ No console errors

### Test 2: Sign Up Flow
1. Click "Sign Up"
2. Enter email and password
3. Check email for confirmation
4. Confirm email
5. Should redirect to protected page

### Test 3: Stripe Checkout (Test Mode)
1. Go to Pricing page
2. Click "Get Started" on Starter plan
3. Should redirect to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
5. Expiry: any future date (12/25)
6. CVC: any 3 digits (123)
7. ZIP: any 5 digits (12345)
8. Complete checkout
9. Should redirect back to app

### Test 4: Tank Locator
1. After subscribing, go to protected page
2. Enter an address
3. Click "Locate Tank"
4. Should show results and map

### Test 5: Webhook Events
1. Go to Stripe Dashboard → Webhooks
2. Click on your endpoint
3. Check "Events" tab
4. Should see successful events (200 status)

---

## 🎯 Quick Reference: All Environment Variables

Copy this checklist to make sure you have everything:

### ✅ Supabase (3 variables)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

### ✅ Mapbox (1 variable)
- [ ] `NEXT_PUBLIC_MAPBOX_TOKEN`

### ✅ SkyFi (1 variable)
- [ ] `SKYFI_API_KEY`

### ✅ Stripe (6 variables)
- [ ] `STRIPE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_STARTER_PRICE_ID`
- [ ] `STRIPE_PRO_PRICE_ID`
- [ ] `STRIPE_ENTERPRISE_PRICE_ID`

### ✅ Site URL (1 variable)
- [ ] `NEXT_PUBLIC_SITE_URL`

### ⚪ Twilio - Optional (3 variables)
- [ ] `TWILIO_SID`
- [ ] `TWILIO_TOKEN`
- [ ] `TWILIO_NUMBER`

**Total Required: 12 variables**
**Total Optional: 3 variables**

---

## 🔄 Switching from Test to Live Mode

When you're ready for real payments:

### Step 1: Get Live Stripe Keys
1. Go to: https://dashboard.stripe.com/apikeys (no /test)
2. Copy live publishable key (starts with `pk_live_`)
3. Copy live secret key (starts with `sk_live_`)

### Step 2: Update Vercel Environment Variables
1. Update `STRIPE_SECRET_KEY` with live key
2. Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` with live key
3. Update `STRIPE_WEBHOOK_SECRET` with live webhook secret
4. Keep Price IDs the same (they're already live)

### Step 3: Redeploy
- Redeploy from Vercel dashboard

### Step 4: Test with Real Card
- Use a real credit card (will be charged)
- Test the complete flow
- Monitor Stripe dashboard

---

## 🐛 Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify all environment variables are set
- Make sure you pushed latest code to GitHub

### Webhook Not Receiving Events
- Verify webhook URL is correct
- Check webhook signing secret matches
- View webhook attempts in Stripe dashboard
- Check Vercel function logs

### Auth Redirect Issues
- Verify Supabase redirect URLs are set
- Check `NEXT_PUBLIC_SITE_URL` is correct
- Clear browser cookies and try again

### Stripe Checkout Fails
- Verify Price IDs are correct
- Check Stripe API keys are valid
- Ensure using correct mode (test vs live)
- Check Stripe dashboard logs

---

## 📞 Support Links

- **Stripe Dashboard:** https://dashboard.stripe.com/
- **Vercel Dashboard:** https://vercel.com/
- **Supabase Dashboard:** https://app.supabase.com/
- **Stripe Test Cards:** https://stripe.com/docs/testing
- **Stripe Webhook Docs:** https://stripe.com/docs/webhooks

---

## 🎉 You're Done!

Once you complete all these steps, your TankFindr MVP will be:

✅ Fully deployed to Vercel
✅ Connected to Supabase database
✅ Integrated with Stripe payments
✅ Accepting real subscriptions
✅ Tracking usage and billing overages
✅ Production-ready!

**Time to launch! 🚀**
