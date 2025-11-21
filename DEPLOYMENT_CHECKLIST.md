# TankFindr Deployment Checklist

## 📦 Pre-Deployment Checklist

### 1. Database Setup
- [ ] Run `supabase-schema.sql` in Supabase SQL Editor
- [ ] Verify all tables created: `profiles`, `tanks`, `usage`, `cache`
- [ ] Verify RLS policies are enabled
- [ ] Test that trigger creates profile on user signup

### 2. Environment Variables (Local)
- [ ] Copy `.env.local` template
- [ ] Add Supabase URL and keys
- [ ] Add Mapbox token
- [ ] Add Stripe test keys (secret + publishable)
- [ ] Add Stripe webhook secret (from `stripe listen`)
- [ ] Add Stripe Price IDs (already filled in)
- [ ] Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

### 3. Stripe Setup
- [x] Create TankFindr Starter product ($99/mo)
- [x] Create TankFindr Pro product ($249/mo)
- [x] Create TankFindr Enterprise product ($599/mo)
- [x] Get Price IDs for each tier
- [ ] Install Stripe CLI for local webhook testing
- [ ] Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### 4. Local Testing
- [ ] Run `npm install` to install dependencies
- [ ] Run `npm run dev` to start development server
- [ ] Open http://localhost:3000
- [ ] Test signup flow
- [ ] Test pricing page
- [ ] Test Stripe checkout with test card: `4242 4242 4242 4242`
- [ ] Test tank location (mock data)
- [ ] Verify map displays correctly
- [ ] Test Google Maps navigation button
- [ ] Check Supabase tables for data

---

## 🚀 Vercel Deployment

### Step 1: Push to GitHub
```bash
cd /path/to/tankfindr
git pull origin main  # Get latest changes
git push origin main  # Push to GitHub
```

### Step 2: Connect to Vercel
1. Go to: https://vercel.com/
2. Click **Add New Project**
3. Import your GitHub repository: `cljackson1279/tankfindr`
4. Vercel will auto-detect Next.js framework

### Step 3: Configure Environment Variables
In Vercel project settings, add all these variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# SkyFi
SKYFI_API_KEY=your_skyfi_key_here

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsxxxxx...

# Stripe (use LIVE keys for production)
STRIPE_SECRET_KEY=sk_live_xxxxx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx...
STRIPE_WEBHOOK_SECRET=whsec_xxxxx... (from production webhook)

# Stripe Price IDs
STRIPE_STARTER_PRICE_ID=price_1SVymZRsawlh5ooWJaAvhJej
STRIPE_PRO_PRICE_ID=price_1SVymfRsawlh5ooW1VVoV8Rs
STRIPE_ENTERPRISE_PRICE_ID=price_1SVymkRsawlh5ooWnn749Fid

# Twilio (optional)
TWILIO_SID=ACxxxxx...
TWILIO_TOKEN=xxxxx...
TWILIO_NUMBER=+15551234567

# Site URL (update after deployment)
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### Step 4: Deploy
1. Click **Deploy**
2. Wait for build to complete (~2-3 minutes)
3. Visit your live site!

### Step 5: Update Site URL
1. Copy your Vercel deployment URL (e.g., `https://tankfindr.vercel.app`)
2. Go back to Vercel project settings > Environment Variables
3. Update `NEXT_PUBLIC_SITE_URL` with your actual URL
4. Redeploy (Vercel > Deployments > ⋯ > Redeploy)

---

## 🔗 Post-Deployment Setup

### 1. Set Up Production Stripe Webhook
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
6. Copy the **Signing secret** (starts with `whsec_`)
7. Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables
8. Redeploy

### 2. Switch to Stripe Live Mode
⚠️ **Only do this when ready for real payments!**

1. Go to: https://dashboard.stripe.com/apikeys
2. Get your **live mode** keys (start with `pk_live_` and `sk_live_`)
3. Update these in Vercel:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Update webhook secret (from production webhook above)
5. Redeploy

### 3. Configure Supabase Auth Redirect URLs
1. Go to: https://app.supabase.com/project/YOUR_PROJECT/auth/url-configuration
2. Add these URLs:
   - `https://your-domain.vercel.app/auth/callback`
   - `https://your-domain.vercel.app/**`
3. Save changes

### 4. Test Production Deployment
- [ ] Visit your live site
- [ ] Test signup with real email
- [ ] Test pricing page loads
- [ ] Test Stripe checkout (use test card first)
- [ ] Verify webhook events in Stripe dashboard
- [ ] Test tank location
- [ ] Test Google Maps navigation
- [ ] Check Supabase for data

---

## 🎯 Custom Domain (Optional)

### Add Custom Domain to Vercel
1. Go to Vercel project > Settings > Domains
2. Add your domain (e.g., `tankfindr.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (~24 hours)
5. Update `NEXT_PUBLIC_SITE_URL` in Vercel
6. Update Stripe webhook URL
7. Update Supabase redirect URLs

---

## 🔒 Security Checklist

- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Never commit API keys to GitHub
- [ ] Use test mode Stripe keys for development
- [ ] Use live mode Stripe keys only in production
- [ ] Enable RLS policies in Supabase
- [ ] Verify webhook signature validation is working
- [ ] Test that users can only access their own data

---

## 📊 Monitoring & Analytics

### Stripe Dashboard
- Monitor subscriptions: https://dashboard.stripe.com/subscriptions
- Check webhook events: https://dashboard.stripe.com/webhooks
- View logs: https://dashboard.stripe.com/logs

### Supabase Dashboard
- Monitor database: https://app.supabase.com/project/YOUR_PROJECT/editor
- Check auth users: https://app.supabase.com/project/YOUR_PROJECT/auth/users
- View logs: https://app.supabase.com/project/YOUR_PROJECT/logs

### Vercel Dashboard
- View deployments: https://vercel.com/your-username/tankfindr
- Check logs: Vercel > Project > Logs
- Monitor performance: Vercel > Analytics

---

## 🐛 Troubleshooting

### Build Fails on Vercel
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Try building locally: `npm run build`

### Webhook Not Receiving Events
- Verify webhook URL is correct
- Check webhook signing secret matches
- View webhook attempts in Stripe dashboard
- Check Vercel function logs

### Map Not Showing
- Verify Mapbox token is correct
- Check browser console for errors
- Ensure token has proper permissions

### Auth Not Working
- Verify Supabase URL and keys
- Check redirect URLs in Supabase settings
- Ensure `NEXT_PUBLIC_SITE_URL` is correct

### Stripe Checkout Fails
- Verify Price IDs are correct
- Check Stripe API keys are valid
- Ensure using correct mode (test vs live)
- Check Stripe dashboard logs

---

## 📈 Next Steps After Launch

1. **Monitor Performance**
   - Track conversion rates
   - Monitor subscription churn
   - Analyze usage patterns

2. **Gather Feedback**
   - Set up user feedback form
   - Monitor support requests
   - Track feature requests

3. **Optimize**
   - Improve AI accuracy
   - Add more features
   - Optimize loading times

4. **Scale**
   - Upgrade Supabase plan if needed
   - Consider CDN for static assets
   - Add caching layer

5. **Marketing**
   - SEO optimization (already done!)
   - Social media presence
   - Content marketing
   - Paid advertising

---

## ✅ Launch Checklist

- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] Stripe products and prices created
- [ ] Production webhook configured
- [ ] Custom domain configured (optional)
- [ ] Test all user flows
- [ ] Monitor initial users
- [ ] Ready to accept payments!

---

## 🎉 You're Ready to Launch!

Once all checkboxes are complete, your TankFindr MVP is ready for production!

**Need help?** Check the other guides:
- `SETUP.md` - Full setup instructions
- `STRIPE_SETUP.md` - Stripe configuration details
- `API_KEYS_GUIDE.md` - Where to find all API keys
