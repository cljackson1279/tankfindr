# TankFindr Stripe Configuration

## ✅ Products and Prices Created Successfully!

I've set up your TankFindr subscription products in your Stripe account. Here are the details:

### Product IDs and Price IDs

#### 1. TankFindr Starter
- **Product ID**: `prod_TSubihmRIICgcf`
- **Price ID**: `price_1SVymZRsawlh5ooWJaAvhJej`
- **Amount**: $99.00/month
- **Description**: 10 tank locates per month with AI-powered satellite imagery analysis

#### 2. TankFindr Pro
- **Product ID**: `prod_TSubIZudBJ6FNQ`
- **Price ID**: `price_1SVymfRsawlh5ooW1VVoV8Rs`
- **Amount**: $249.00/month
- **Description**: 40 tank locates per month with AI-powered satellite imagery analysis and priority support

#### 3. TankFindr Enterprise
- **Product ID**: `prod_TSubkiAL2N1Ckl`
- **Price ID**: `price_1SVymkRsawlh5ooWnn749Fid`
- **Amount**: $599.00/month
- **Description**: 150 tank locates per month with AI-powered satellite imagery, priority support, and dedicated account manager

---

## 🔑 Environment Variables to Add

Add these to your `.env.local` file:

```bash
# Stripe Price IDs for TankFindr
STRIPE_STARTER_PRICE_ID=price_1SVymZRsawlh5ooWJaAvhJej
STRIPE_PRO_PRICE_ID=price_1SVymfRsawlh5ooW1VVoV8Rs
STRIPE_ENTERPRISE_PRICE_ID=price_1SVymkRsawlh5ooWnn749Fid
```

---

## 📋 Next Steps to Get Your Stripe Keys

### 1. Get Your Stripe API Keys

**For Test Mode (Development):**
1. Go to: https://dashboard.stripe.com/test/apikeys
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`) → Copy to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (click "Reveal test key", starts with `sk_test_`) → Copy to `STRIPE_SECRET_KEY`

**For Live Mode (Production):**
1. Go to: https://dashboard.stripe.com/apikeys
2. Same process, but keys will start with `pk_live_` and `sk_live_`

### 2. Set Up Webhook Secret

**For Local Development:**
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run in terminal:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. Copy the webhook signing secret (starts with `whsec_`)
4. Add to `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

**For Production (Vercel):**
1. Go to: https://dashboard.stripe.com/webhooks
2. Click **+ Add endpoint**
3. Enter endpoint URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** and add to Vercel environment variables

---

## 🧪 Testing with Stripe Test Cards

Use these test card numbers in your checkout:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

**Declined Payment:**
- Card: `4000 0000 0000 0002`

**Requires Authentication (3D Secure):**
- Card: `4000 0025 0000 3155`

More test cards: https://stripe.com/docs/testing

---

## 💳 Trial Logic Implementation

Your app is configured with:
- **5 free locates OR 7 days free** (whichever comes first)
- Credit card required at signup
- No charge until trial ends
- Trial period is set to 7 days in Stripe checkout
- App tracks free locates separately in Supabase

### How It Works:
1. User signs up and selects a tier
2. Stripe checkout session created with `trial_period_days: 7`
3. User enters credit card (no charge yet)
4. App tracks `trial_locates_used` in Supabase `profiles` table
5. When user hits 5 locates OR 7 days pass:
   - Trial ends
   - Stripe charges the full monthly amount
   - Recurring billing begins

---

## 🔄 Overage Billing

Overages are charged immediately when a user exceeds their monthly limit:

- **Starter**: $8 per extra locate
- **Pro**: $6 per extra locate
- **Enterprise**: $4 per extra locate

The app creates invoice items automatically and finalizes invoices for immediate payment.

---

## 📊 Monitoring Your Stripe Account

**View Subscriptions:**
- https://dashboard.stripe.com/subscriptions

**View Customers:**
- https://dashboard.stripe.com/customers

**View Invoices:**
- https://dashboard.stripe.com/invoices

**View Webhook Events:**
- https://dashboard.stripe.com/webhooks

**View Logs:**
- https://dashboard.stripe.com/logs

---

## ⚠️ Important Notes

1. **Test vs Live Mode**: Always use test mode during development. Switch to live mode only when ready for production.

2. **Webhook Signing Secret**: This is different for test and live mode. Make sure to update it when switching modes.

3. **Price IDs**: The Price IDs I created are for **LIVE MODE**. If you want to test first, you'll need to create test mode versions of these products/prices.

4. **Security**: Never commit your Stripe secret keys to GitHub. Always use environment variables.

---

## 🚀 Ready to Deploy?

Once you have all your keys configured:

1. Update `.env.local` with all Stripe keys
2. Test locally with `npm run dev`
3. Use Stripe test cards to verify checkout flow
4. Deploy to Vercel
5. Add environment variables in Vercel dashboard
6. Set up production webhook endpoint
7. Switch to live mode when ready!
