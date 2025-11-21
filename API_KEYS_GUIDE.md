# TankFindr API Keys Quick Reference

## 🔑 Where to Get Each API Key

### 1. Supabase Keys ✅ (You already have these)

**Where to find:**
1. Go to: https://app.supabase.com/project/YOUR_PROJECT/settings/api
2. Copy these values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 2. Mapbox Token ✅ (You already have this)

**Where to find:**
1. Go to: https://account.mapbox.com/access-tokens/
2. Copy your **Default public token**

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsxxxxx...
```

---

### 3. Stripe Keys 🔴 (You need to get these)

**Test Mode Keys (for development):**

1. Go to: https://dashboard.stripe.com/test/apikeys
2. You'll see:
   - **Publishable key** (already visible, starts with `pk_test_`)
   - **Secret key** (click "Reveal test key", starts with `sk_test_`)

```bash
STRIPE_SECRET_KEY=sk_test_51xxxxx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx...
```

**Live Mode Keys (for production):**

1. Go to: https://dashboard.stripe.com/apikeys
2. Same process, but keys start with `pk_live_` and `sk_live_`

---

### 4. Stripe Webhook Secret 🔴 (You need to set this up)

**For Local Development:**

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Open terminal and run:
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. Copy the webhook signing secret that appears (starts with `whsec_`)

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx...
```

**For Production (after deploying to Vercel):**

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **+ Add endpoint**
3. Enter: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret**

---

### 5. Stripe Price IDs ✅ (Already created!)

These are already in your `.env.local`:

```bash
STRIPE_STARTER_PRICE_ID=price_1SVymZRsawlh5ooWJaAvhJej
STRIPE_PRO_PRICE_ID=price_1SVymfRsawlh5ooW1VVoV8Rs
STRIPE_ENTERPRISE_PRICE_ID=price_1SVymkRsawlh5ooWnn749Fid
```

---

### 6. SkyFi API Key ✅ (You already have this)

**Note:** The app currently uses a mock implementation. When you're ready to use the real API, uncomment the real implementation in `lib/skyfi.ts`.

```bash
SKYFI_API_KEY=your_skyfi_key_here
```

---

### 7. Twilio (Optional - for SMS notifications)

**Where to find:**
1. Go to: https://console.twilio.com/
2. Get from dashboard:
   - **Account SID**
   - **Auth Token**
   - **Phone Number** (from Phone Numbers section)

```bash
TWILIO_SID=ACxxxxx...
TWILIO_TOKEN=xxxxx...
TWILIO_NUMBER=+15551234567
```

---

### 8. Site URL

```bash
# For local development:
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# For production (after deploying):
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

---

## 📋 Complete .env.local Template

Here's what your complete `.env.local` should look like:

```bash
# === SUPABASE ===
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# === SKYFI ===
SKYFI_API_KEY=your_skyfi_key_here

# === MAPBOX ===
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsxxxxx...

# === STRIPE ===
STRIPE_SECRET_KEY=sk_test_51xxxxx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx...
STRIPE_WEBHOOK_SECRET=whsec_xxxxx...

# Stripe Price IDs (LIVE MODE - Already created!)
STRIPE_STARTER_PRICE_ID=price_1SVymZRsawlh5ooWJaAvhJej
STRIPE_PRO_PRICE_ID=price_1SVymfRsawlh5ooW1VVoV8Rs
STRIPE_ENTERPRISE_PRICE_ID=price_1SVymkRsawlh5ooWnn749Fid

# === TWILIO (Optional) ===
TWILIO_SID=ACxxxxx...
TWILIO_TOKEN=xxxxx...
TWILIO_NUMBER=+15551234567

# === APP ===
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## ✅ Checklist

Before running the app, make sure you have:

- [x] Supabase URL and keys
- [x] Mapbox token
- [ ] Stripe test secret key
- [ ] Stripe test publishable key
- [ ] Stripe webhook secret (for local development)
- [x] Stripe Price IDs (already created)
- [x] SkyFi API key (using mock for now)
- [ ] Twilio credentials (optional)

---

## 🚀 Next Steps

1. **Get your Stripe API keys** (test mode) from the links above
2. **Set up Stripe CLI** for local webhook testing
3. **Update your `.env.local`** with all the keys
4. **Run the Supabase schema** (see SETUP.md)
5. **Test locally**: `npm run dev`
6. **Deploy to Vercel** when ready

---

## 🆘 Need Help?

- **Stripe Dashboard**: https://dashboard.stripe.com/
- **Supabase Dashboard**: https://app.supabase.com/
- **Mapbox Account**: https://account.mapbox.com/
- **Stripe CLI Docs**: https://stripe.com/docs/stripe-cli
- **Stripe Testing**: https://stripe.com/docs/testing
