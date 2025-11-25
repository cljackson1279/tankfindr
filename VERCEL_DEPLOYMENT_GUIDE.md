# Vercel Deployment Guide for TankFindr

This guide walks you through deploying TankFindr to Vercel, including environment variable configuration, domain setup, and continuous deployment.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Deployment](#initial-deployment)
3. [Environment Variables](#environment-variables)
4. [Continuous Deployment](#continuous-deployment)
5. [Custom Domain Setup](#custom-domain-setup)
6. [Monitoring and Logs](#monitoring-and-logs)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

- ✅ **GitHub Account**: Your code is already on GitHub
- ✅ **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
- ✅ **Supabase Project**: Already set up
- ✅ **Stripe Account**: Already configured

### Required Information

Before deploying, gather these values:

| Variable | Where to Find |
|----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Created after deployment (see below) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox Dashboard → Access Tokens |

---

## Initial Deployment

### Method 1: Vercel Dashboard (Recommended)

#### Step 1: Connect GitHub Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select **GitHub** as the provider
4. Search for `cljackson1279/tankfindr`
5. Click **"Import"**

#### Step 2: Configure Project

1. **Project Name**: `tankfindr` (or your preferred name)
2. **Framework Preset**: Next.js (auto-detected)
3. **Root Directory**: `./` (default)
4. **Build Command**: `npm run build` (default)
5. **Output Directory**: `.next` (default)

#### Step 3: Add Environment Variables

Click **"Environment Variables"** and add all required variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_your-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token

# App URL (update after first deployment)
NEXT_PUBLIC_APP_URL=https://tankfindr.vercel.app
```

**Note**: Leave `STRIPE_WEBHOOK_SECRET` empty for now. We'll add it after deployment.

#### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (2-5 minutes)
3. You'll get a deployment URL like `https://tankfindr.vercel.app`

---

### Method 2: Vercel CLI

#### Install Vercel CLI

```bash
npm install -g vercel
```

#### Login to Vercel

```bash
vercel login
```

#### Deploy from Terminal

```bash
cd /home/ubuntu/tankfindr

# First deployment (interactive)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? tankfindr
# - Directory? ./
# - Override settings? No

# Production deployment
vercel --prod
```

---

## Environment Variables

### Adding Variables via Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your **tankfindr** project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Key**: Variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: The actual value
   - **Environment**: Select all (Production, Preview, Development)
5. Click **"Save"**

### Adding Variables via CLI

```bash
# Add a single variable
vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Add from .env.local file
vercel env pull .env.local
```

### Required Environment Variables

#### Supabase Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://cijtllcbrvkbvrjriweu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

#### Stripe Variables

```env
# Use LIVE keys for production
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Use TEST keys for development
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### Mapbox Variables

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
```

#### App Configuration

```env
NEXT_PUBLIC_APP_URL=https://tankfindr.vercel.app
```

### Updating Environment Variables

After adding or updating variables:

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Check **"Use existing Build Cache"** (faster)
4. Click **"Redeploy"**

---

## Stripe Webhook Configuration

### Step 1: Get Your Vercel Deployment URL

After first deployment, note your URL:
```
https://tankfindr.vercel.app
```

### Step 2: Create Webhook in Stripe

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter webhook URL:
   ```
   https://tankfindr.vercel.app/api/webhooks/stripe
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**

### Step 3: Get Webhook Secret

1. Click on your newly created webhook
2. Click **"Reveal"** under **Signing secret**
3. Copy the secret (starts with `whsec_`)

### Step 4: Add Webhook Secret to Vercel

1. Go to Vercel Dashboard → tankfindr → Settings → Environment Variables
2. Add new variable:
   - **Key**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: `whsec_your_secret_here`
   - **Environment**: Production
3. Click **"Save"**
4. Redeploy the application

### Step 5: Test Webhook

1. In Stripe Dashboard, go to your webhook
2. Click **"Send test webhook"**
3. Select an event (e.g., `checkout.session.completed`)
4. Click **"Send test webhook"**
5. Check the response (should be 200 OK)

---

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

### Manual Deployment

#### Via Dashboard

1. Go to Vercel Dashboard → tankfindr
2. Click **"Deployments"** tab
3. Click **"Redeploy"** on any deployment

#### Via CLI

```bash
cd /home/ubuntu/tankfindr

# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

### Deployment Workflow

```bash
# 1. Make changes locally
# 2. Test locally
npm run dev

# 3. Commit changes
git add .
git commit -m "Your changes"

# 4. Push to GitHub
git push origin main

# 5. Vercel automatically deploys!
# Check deployment status at vercel.com/dashboard
```

---

## Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to Vercel Dashboard → tankfindr → Settings → Domains
2. Click **"Add"**
3. Enter your domain (e.g., `tankfindr.com`)
4. Click **"Add"**

### Step 2: Configure DNS

Vercel will show you DNS records to add. Go to your domain registrar and add:

#### For Apex Domain (tankfindr.com)

```
Type: A
Name: @
Value: 76.76.21.21
```

#### For www Subdomain (www.tankfindr.com)

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Wait for Verification

- DNS propagation can take 24-48 hours
- Vercel will automatically issue SSL certificate
- Check status in Vercel Dashboard

### Step 4: Update Environment Variables

After domain is verified, update:

```env
NEXT_PUBLIC_APP_URL=https://tankfindr.com
```

And update Stripe webhook URL to use your custom domain.

---

## Monitoring and Logs

### View Deployment Logs

#### Via Dashboard

1. Go to Vercel Dashboard → tankfindr → Deployments
2. Click on a deployment
3. View **Build Logs** and **Function Logs**

#### Via CLI

```bash
# View recent deployments
vercel ls

# View logs for a deployment
vercel logs <deployment-url>
```

### Real-time Function Logs

1. Go to Vercel Dashboard → tankfindr → Logs
2. Filter by:
   - **Function**: `/api/locate-septic`, `/api/webhooks/stripe`, etc.
   - **Status**: All, Errors only
   - **Time range**: Last hour, day, week

### Analytics

1. Go to Vercel Dashboard → tankfindr → Analytics
2. View:
   - Page views
   - Top pages
   - Top referrers
   - Devices and browsers

---

## Troubleshooting

### Build Failures

#### Error: "Module not found"

**Solution**: Install missing dependency:

```bash
npm install <missing-package>
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push origin main
```

#### Error: "Environment variable not defined"

**Solution**: Add the variable in Vercel Dashboard and redeploy.

### Runtime Errors

#### Error: "Supabase connection failed"

**Possible causes:**
- Incorrect Supabase URL or keys
- Supabase project is paused
- Network issues

**Solution**: Verify environment variables and check Supabase status.

#### Error: "Stripe webhook signature verification failed"

**Possible causes:**
- Incorrect webhook secret
- Webhook endpoint URL mismatch

**Solution**: 
1. Verify `STRIPE_WEBHOOK_SECRET` in Vercel
2. Check webhook URL in Stripe Dashboard
3. Redeploy after updating

### Deployment Stuck

**Solution**: 
1. Cancel the deployment in Vercel Dashboard
2. Check build logs for errors
3. Fix issues and push again

### 404 Errors

**Possible causes:**
- Route doesn't exist
- Build didn't include the page
- Incorrect Next.js configuration

**Solution**: Check `next.config.ts` and verify routes.

---

## Performance Optimization

### Enable Edge Functions

For faster API responses, use Edge Runtime:

```typescript
// app/api/locate-septic/route.ts
export const runtime = 'edge';
```

### Enable ISR (Incremental Static Regeneration)

For pages that don't change often:

```typescript
// app/page.tsx
export const revalidate = 3600; // Revalidate every hour
```

### Enable Caching

Add cache headers to API routes:

```typescript
export async function GET(request: Request) {
  return new Response(JSON.stringify(data), {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
    }
  });
}
```

---

## Security Best Practices

### Environment Variables

- ✅ Never commit `.env.local` to Git
- ✅ Use different keys for development and production
- ✅ Rotate keys periodically
- ✅ Use Vercel's environment variable encryption

### API Routes

- ✅ Validate all inputs
- ✅ Use authentication middleware
- ✅ Rate limit API endpoints
- ✅ Verify webhook signatures

### Database

- ✅ Use Row Level Security (RLS) in Supabase
- ✅ Never expose service role key to client
- ✅ Use prepared statements to prevent SQL injection

---

## Vercel CLI Reference

### Common Commands

```bash
# Login
vercel login

# Deploy to production
vercel --prod

# Deploy to preview
vercel

# List deployments
vercel ls

# View logs
vercel logs <deployment-url>

# Pull environment variables
vercel env pull

# Add environment variable
vercel env add <KEY>

# Remove deployment
vercel rm <deployment-url>

# Link local project to Vercel
vercel link
```

---

## Deployment Checklist

### Before First Deployment

- [ ] Code is pushed to GitHub
- [ ] All environment variables are ready
- [ ] Supabase database schema is applied
- [ ] Stripe products are created
- [ ] Mapbox token is obtained

### During Deployment

- [ ] Connect GitHub repository to Vercel
- [ ] Add all environment variables
- [ ] Deploy to production
- [ ] Verify deployment URL works

### After Deployment

- [ ] Create Stripe webhook with deployment URL
- [ ] Add webhook secret to Vercel
- [ ] Redeploy with webhook secret
- [ ] Test signup and payment flow
- [ ] Test septic tank location feature
- [ ] Set up custom domain (optional)
- [ ] Monitor logs for errors

---

## Support Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

## Next Steps

1. **Deploy to Vercel** using this guide
2. **Test all features** in production
3. **Set up monitoring** and alerts
4. **Configure custom domain** (if applicable)
5. **Launch to users!** 🚀

---

**Last Updated**: November 25, 2025  
**Maintainer**: TankFindr Development Team
