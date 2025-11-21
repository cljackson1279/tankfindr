# TankFindr Setup Guide

## Overview
TankFindr is an AI-powered septic tank locator that uses satellite imagery to find buried septic tanks in 5 minutes with 85% accuracy.

## Prerequisites
- Node.js 18+ installed
- Supabase account (free tier)
- Mapbox account (free tier)
- Stripe account (test mode)
- Git installed

## Step 1: Install Dependencies

```bash
cd tankfindr
npm install
```

## Step 2: Set Up Supabase Database

1. Go to your Supabase dashboard: https://app.supabase.com
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `supabase-schema.sql` file
5. Paste into the SQL editor
6. Click **Run** to execute the schema

This will create:
- `profiles` table (user subscription data)
- `tanks` table (located septic tanks)
- `usage` table (usage tracking)
- `cache` table (offline functionality)
- Row Level Security (RLS) policies
- Indexes for performance

## Step 3: Configure Environment Variables

The `.env.local` file template is already created. You need to fill in the values:

### Supabase Keys
1. Go to Supabase Dashboard > Settings > API
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### Mapbox Token
1. Go to https://account.mapbox.com/access-tokens/
2. Copy your **Default public token**
3. Paste into `NEXT_PUBLIC_MAPBOX_TOKEN`

### Stripe Keys (Test Mode)
1. Go to https://dashboard.stripe.com/test/apikeys
2. Click **Reveal test key** for:
   - **Secret key** → `STRIPE_SECRET_KEY` (starts with sk_test_)
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with pk_test_)

## Step 4: Create Stripe Products and Prices

You need to create 3 subscription products in Stripe:

### Option A: Using Stripe Dashboard (Recommended)

1. Go to https://dashboard.stripe.com/test/products
2. Click **+ Add product**

**Create Starter Plan:**
- Name: `TankFindr Starter`
- Description: `10 tank locates per month`
- Pricing model: `Recurring`
- Price: `$99.00 USD`
- Billing period: `Monthly`
- Click **Save product**
- Copy the **Price ID** (starts with `price_`) → paste into `STRIPE_STARTER_PRICE_ID`

**Create Pro Plan:**
- Name: `TankFindr Pro`
- Description: `40 tank locates per month`
- Pricing model: `Recurring`
- Price: `$249.00 USD`
- Billing period: `Monthly`
- Click **Save product**
- Copy the **Price ID** → paste into `STRIPE_PRO_PRICE_ID`

**Create Enterprise Plan:**
- Name: `TankFindr Enterprise`
- Description: `150 tank locates per month`
- Pricing model: `Recurring`
- Price: `$599.00 USD`
- Billing period: `Monthly`
- Click **Save product**
- Copy the **Price ID** → paste into `STRIPE_ENTERPRISE_PRICE_ID`

### Option B: Using Stripe CLI

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Create Starter plan
stripe products create --name="TankFindr Starter" --description="10 tank locates per month"
stripe prices create --product=prod_XXX --unit-amount=9900 --currency=usd --recurring[interval]=month

# Create Pro plan
stripe products create --name="TankFindr Pro" --description="40 tank locates per month"
stripe prices create --product=prod_XXX --unit-amount=24900 --currency=usd --recurring[interval]=month

# Create Enterprise plan
stripe products create --name="TankFindr Enterprise" --description="150 tank locates per month"
stripe prices create --product=prod_XXX --unit-amount=59900 --currency=usd --recurring[interval]=month
```

## Step 5: Set Up Stripe Webhooks

Webhooks are required to handle subscription events (trial end, payment success, etc.)

### For Local Development:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run the webhook listener:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
3. Copy the webhook signing secret (starts with `whsec_`)
4. Paste into `STRIPE_WEBHOOK_SECRET` in `.env.local`

### For Production (Vercel):

1. Deploy your app to Vercel first
2. Go to https://dashboard.stripe.com/test/webhooks
3. Click **+ Add endpoint**
4. Enter your webhook URL: `https://your-domain.vercel.app/api/webhooks/stripe`
5. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **Add endpoint**
7. Copy the **Signing secret** → paste into `STRIPE_WEBHOOK_SECRET` in Vercel environment variables

## Step 6: SkyFi API (Optional - Using Mock for Now)

The app currently uses a mock implementation of the SkyFi API. When you get access to the real SkyFi API:

1. Get your API key from SkyFi
2. Paste into `SKYFI_API_KEY` in `.env.local`
3. Update `lib/skyfi.ts` to use the real API implementation (commented code is provided)

## Step 7: Twilio SMS (Optional)

If you want SMS notifications:

1. Go to https://console.twilio.com/
2. Get your:
   - **Account SID** → `TWILIO_SID`
   - **Auth Token** → `TWILIO_TOKEN`
   - **Phone Number** → `TWILIO_NUMBER`

## Step 8: Test Locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Test the Flow:

1. **Sign Up**: Create a new account
2. **Select Plan**: Choose a pricing tier (Starter/Pro/Enterprise)
3. **Enter Test Card**: Use Stripe test card `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code
4. **Locate Tank**: Enter an address and click "LOCATE TANK"
5. **Check Results**: View confidence score, depth estimate, and map location
6. **Navigate**: Click "Open in Google Maps"

### Test Trial Logic:

- You get 5 free locates OR 7 days, whichever comes first
- Try using up all 5 free locates to trigger subscription start
- Check Supabase `profiles` table to see `trial_locates_used` incrementing

## Step 9: Deploy to Vercel

### Connect GitHub:

1. Go to https://vercel.com/
2. Click **Add New Project**
3. Import your GitHub repository: `cljackson1279/tankfindr`
4. Vercel will auto-detect Next.js

### Add Environment Variables:

In Vercel project settings, add all environment variables from `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SKYFI_API_KEY=...
NEXT_PUBLIC_MAPBOX_TOKEN=...
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_STARTER_PRICE_ID=...
STRIPE_PRO_PRICE_ID=...
STRIPE_ENTERPRISE_PRICE_ID=...
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### Deploy:

1. Click **Deploy**
2. Wait for build to complete
3. Visit your live site!

### Set Up Production Webhook:

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Update `STRIPE_WEBHOOK_SECRET` in Vercel with the new signing secret

## Pricing Structure

### Tiers:
- **Starter**: $99/mo, 10 locates, $8 per overage
- **Pro**: $249/mo, 40 locates, $6 per overage
- **Enterprise**: $599/mo, 150 locates, $4 per overage

### Trial Logic:
- New users get 5 free locates OR 7 days free (whichever comes first)
- Credit card required at signup
- No charge until trial ends
- After trial, full monthly amount is charged
- Overages charged immediately when limit exceeded

## Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Map not showing
- Check `NEXT_PUBLIC_MAPBOX_TOKEN` is correct
- Check browser console for errors
- Verify Mapbox token has proper permissions

### Auth not working
- Verify Supabase URL and keys
- Check Supabase dashboard for auth settings
- Ensure email confirmation is disabled for testing

### Stripe errors
- Ensure using TEST keys (sk_test_, pk_test_)
- Verify Price IDs are correct
- Check Stripe dashboard logs

### Webhook not receiving events
- For local: Ensure `stripe listen` is running
- For production: Verify webhook URL is correct
- Check webhook signing secret matches

## Support

For issues or questions:
- Check Supabase logs
- Check Stripe dashboard logs
- Check Vercel deployment logs
- Review browser console errors

## Next Steps After MVP

1. Get real SkyFi API access
2. Replace mock location function
3. Add SMS notifications via Twilio
4. Create admin dashboard
5. Add analytics tracking
6. Set up custom domain
7. Add more location-based features
