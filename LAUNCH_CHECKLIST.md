# TankFindr Production Launch Checklist

Use this checklist to ensure everything is configured correctly before going live.

---

## Phase 1: Stripe Live Mode Setup ⏱️ 30-45 minutes

### Create Products in Stripe Dashboard

- [ ] Log into Stripe Dashboard: https://dashboard.stripe.com
- [ ] Switch to **Live Mode** (toggle in top-right)
- [ ] Go to: **Products** → **Add product**

#### Product 1: TankFindr Pro - Starter
- [ ] Name: `TankFindr Pro - Starter`
- [ ] Description: `300 tank lookups per month for small septic companies`
- [ ] Price: `$99.00 USD`
- [ ] Billing: `Monthly (recurring)`
- [ ] **Save Price ID** → `STRIPE_PRICE_STARTER`

#### Product 2: TankFindr Pro - Pro
- [ ] Name: `TankFindr Pro - Pro`
- [ ] Description: `1,500 tank lookups per month for growing septic businesses`
- [ ] Price: `$249.00 USD`
- [ ] Billing: `Monthly (recurring)`
- [ ] **Save Price ID** → `STRIPE_PRICE_PRO`

#### Product 3: TankFindr Pro - Enterprise
- [ ] Name: `TankFindr Pro - Enterprise`
- [ ] Description: `Unlimited tank lookups for large septic companies`
- [ ] Price: `$599.00 USD`
- [ ] Billing: `Monthly (recurring)`
- [ ] **Save Price ID** → `STRIPE_PRICE_ENTERPRISE`

#### Product 4: Inspector Pro
- [ ] Name: `TankFindr Inspector Pro`
- [ ] Description: `Unlimited septic system reports for home inspectors`
- [ ] Price: `$79.00 USD`
- [ ] Billing: `Monthly (recurring)`
- [ ] **Save Price ID** → `STRIPE_PRICE_INSPECTOR`

#### Product 5: Property Report
- [ ] Name: `TankFindr Property Report`
- [ ] Description: `One-time septic system report for homeowners`
- [ ] Price: `$19.00 USD`
- [ ] Billing: `One-time`
- [ ] **Save Price ID** → `STRIPE_PRICE_PROPERTY_REPORT`

### Get API Keys

- [ ] Go to: **Developers** → **API Keys**
- [ ] Copy **Publishable key** (starts with `pk_live_`)
- [ ] Copy **Secret key** (starts with `sk_live_`)
- [ ] **Keep these secure!**

### Set Up Webhook

- [ ] Go to: **Developers** → **Webhooks**
- [ ] Click: **Add endpoint**
- [ ] URL: `https://tankfindr.com/api/webhooks/stripe`
- [ ] Select events:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Click: **Add endpoint**
- [ ] Copy **Signing secret** (starts with `whsec_`)

---

## Phase 2: Vercel Environment Variables ⏱️ 15-20 minutes

### Access Vercel Dashboard

- [ ] Go to: https://vercel.com/chris-jackson/tankfindr
- [ ] Click: **Settings** → **Environment Variables**

### Add All Variables

For each variable below, click "Add New", enter Key and Value, select "All Environments", click "Save":

#### Supabase
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://cijtllcbrvkbvrjriweu.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = [Get from Supabase Dashboard]
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = [Already have this]

#### Stripe
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
- [ ] `STRIPE_SECRET_KEY` = `sk_live_...`
- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_...`

#### Stripe Price IDs
- [ ] `STRIPE_PRICE_STARTER` = `price_...` (from Phase 1)
- [ ] `STRIPE_PRICE_PRO` = `price_...` (from Phase 1)
- [ ] `STRIPE_PRICE_ENTERPRISE` = `price_...` (from Phase 1)
- [ ] `STRIPE_PRICE_INSPECTOR` = `price_...` (from Phase 1)
- [ ] `STRIPE_PRICE_PROPERTY_REPORT` = `price_...` (from Phase 1)

#### Other Services
- [ ] `NEXT_PUBLIC_MAPBOX_TOKEN` = `pk....` [Get from Mapbox]
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://tankfindr.com` (Production only)

### Verify Variables Added

- [ ] Count total variables: Should have 12-13
- [ ] Check for typos in variable names
- [ ] Verify all values are correct
- [ ] Wait for automatic redeployment (2-3 minutes)

---

## Phase 3: Custom Domain Setup ⏱️ 20-30 minutes

### Add Domain to Vercel

- [ ] Go to: **Settings** → **Domains**
- [ ] Click: **Add Domain**
- [ ] Enter: `tankfindr.com`
- [ ] Click: **Add**
- [ ] Repeat for: `www.tankfindr.com`
- [ ] Note the DNS records Vercel shows you

### Configure DNS in Namecheap

- [ ] Log into Namecheap: https://www.namecheap.com
- [ ] Go to: **Domain List** → **Manage** (tankfindr.com)
- [ ] Click: **Advanced DNS** tab

#### Add DNS Records

**A Record (Root Domain)**
- [ ] Type: `A Record`
- [ ] Host: `@`
- [ ] Value: `76.76.21.21`
- [ ] TTL: `Automatic`
- [ ] Click: **Save**

**CNAME Record (www)**
- [ ] Type: `CNAME Record`
- [ ] Host: `www`
- [ ] Value: `cname.vercel-dns.com`
- [ ] TTL: `Automatic`
- [ ] Click: **Save**

**TXT Record (Verification)**
- [ ] Type: `TXT Record`
- [ ] Host: `_vercel`
- [ ] Value: [Copy from Vercel]
- [ ] TTL: `Automatic`
- [ ] Click: **Save**

### Verify Domain

- [ ] Wait 5-10 minutes for DNS propagation
- [ ] Return to Vercel → Domains
- [ ] Click: **Refresh** to verify
- [ ] Status should show: ✅ **Valid Configuration**

### Set Primary Domain

- [ ] In Vercel Domains settings
- [ ] Find: `tankfindr.com`
- [ ] Click: **⋯** (three dots)
- [ ] Click: **Set as Primary**
- [ ] Verify www redirects to non-www

---

## Phase 4: Testing ⏱️ 30-45 minutes

### Test Payment Flows

#### TankFindr Pro
- [ ] Go to: https://tankfindr.com/pricing-pro
- [ ] Click: **Start with Starter** ($99/month)
- [ ] Sign up with test email
- [ ] Use real credit card (will be charged)
- [ ] Verify redirect to dashboard
- [ ] Verify subscription shows in Stripe Dashboard
- [ ] Test a property lookup
- [ ] Cancel subscription in Stripe (for testing)

#### Inspector Pro
- [ ] Go to: https://tankfindr.com/inspector-pro
- [ ] Click: **Subscribe Now** ($79/month)
- [ ] Sign up with different email
- [ ] Use real credit card
- [ ] Verify redirect to dashboard
- [ ] Generate a test report
- [ ] Click: **Download PDF**
- [ ] Verify PDF downloads correctly
- [ ] Cancel subscription in Stripe

#### Property Reports
- [ ] Go to: https://tankfindr.com/report
- [ ] Enter test address
- [ ] Click: **Check Address**
- [ ] Click: **Purchase Full Report** ($19)
- [ ] Use real credit card
- [ ] Verify redirect to full report
- [ ] Click: **Download PDF**
- [ ] Verify PDF downloads correctly

### Test Webhooks

- [ ] Go to: Stripe Dashboard → Developers → Webhooks
- [ ] Click on your webhook
- [ ] Check: **Recent events** tab
- [ ] Verify events are being received
- [ ] Check for any errors

### Test Website Functionality

- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Coverage map displays
- [ ] FAQ page loads
- [ ] Privacy/Terms pages load
- [ ] Mobile responsiveness works
- [ ] No console errors (F12 → Console)
- [ ] Images load correctly
- [ ] Forms submit correctly

---

## Phase 5: SEO Setup ⏱️ 45-60 minutes

### Google Search Console

- [ ] Go to: https://search.google.com/search-console
- [ ] Click: **Add property**
- [ ] Enter: `tankfindr.com`
- [ ] Choose: **DNS verification**
- [ ] Add TXT record to Namecheap
- [ ] Wait for verification
- [ ] Click: **Sitemaps** in left menu
- [ ] Enter: `https://tankfindr.com/sitemap.xml`
- [ ] Click: **Submit**
- [ ] Go to: **URL Inspection**
- [ ] Enter: `https://tankfindr.com`
- [ ] Click: **Request Indexing**

### Google Analytics

- [ ] Go to: https://analytics.google.com
- [ ] Create new property: `TankFindr`
- [ ] Get Measurement ID (starts with `G-`)
- [ ] Add to Vercel environment variables:
  - [ ] Key: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
  - [ ] Value: `G-XXXXXXXXXX`
  - [ ] Environment: Production only
- [ ] Wait for redeployment
- [ ] Test: Visit site, check Real-time reports

### Google Business Profile

- [ ] Go to: https://business.google.com
- [ ] Click: **Create a profile**
- [ ] Business name: `TankFindr`
- [ ] Category: `Software Company`
- [ ] Website: `https://tankfindr.com`
- [ ] Description: [Use SEO description from metadata]
- [ ] Complete verification process
- [ ] Add logo and photos
- [ ] Publish profile

### Bing Webmaster Tools

- [ ] Go to: https://www.bing.com/webmasters
- [ ] Add site: `https://tankfindr.com`
- [ ] Import from Google Search Console (easier)
- [ ] Or verify with DNS TXT record
- [ ] Submit sitemap: `https://tankfindr.com/sitemap.xml`

---

## Phase 6: Final Verification ⏱️ 15-20 minutes

### Security Checks

- [ ] HTTPS working (green padlock in browser)
- [ ] No mixed content warnings
- [ ] All API keys are in environment variables (not in code)
- [ ] .env.local is in .gitignore
- [ ] No sensitive data in GitHub repo

### Performance Checks

- [ ] Run PageSpeed Insights: https://pagespeed.web.dev
- [ ] Score should be 90+ for Performance
- [ ] Fix any critical issues
- [ ] Test on mobile device
- [ ] Test on different browsers (Chrome, Safari, Firefox)

### Functionality Checks

- [ ] All three payment tiers work
- [ ] Inspector Pro reports generate correctly
- [ ] Property reports generate correctly
- [ ] PDF downloads work
- [ ] Email receipts sent from Stripe
- [ ] Webhooks processing correctly
- [ ] User accounts created in Supabase
- [ ] Subscriptions tracked in database

### SEO Checks

- [ ] Sitemap accessible: https://tankfindr.com/sitemap.xml
- [ ] Robots.txt accessible: https://tankfindr.com/robots.txt
- [ ] Meta tags correct (view page source)
- [ ] Open Graph tags correct (test with: https://www.opengraph.xyz)
- [ ] Structured data valid (test with: https://search.google.com/test/rich-results)
- [ ] Google Search Console shows no errors

---

## Phase 7: Launch! 🚀 ⏱️ 5 minutes

### Final Steps

- [ ] Announce on social media
- [ ] Email existing beta users
- [ ] Update email signature with link
- [ ] Post in relevant forums/communities
- [ ] Monitor Stripe dashboard for first payments
- [ ] Monitor Vercel logs for errors
- [ ] Monitor Google Analytics for traffic

### Post-Launch Monitoring (First 24 Hours)

- [ ] Check Stripe dashboard every few hours
- [ ] Monitor Vercel logs for errors
- [ ] Check Google Analytics for traffic
- [ ] Respond to any customer support emails
- [ ] Fix any critical bugs immediately
- [ ] Monitor webhook delivery
- [ ] Check for 404 errors in Search Console

---

## Troubleshooting

### Payment Not Working
1. Check Stripe keys are LIVE mode (pk_live_, sk_live_)
2. Verify webhook URL is correct
3. Check Vercel logs for errors
4. Test webhook delivery in Stripe

### Domain Not Resolving
1. Wait longer (DNS can take 48 hours)
2. Check DNS records in Namecheap
3. Use DNS checker: https://dnschecker.org
4. Clear browser cache

### SSL Certificate Not Working
1. Wait 24-48 hours for provisioning
2. Verify domain is verified in Vercel
3. Check for mixed content warnings
4. Force HTTPS (Vercel does this automatically)

### Site Not Building
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Check for TypeScript errors
4. Redeploy manually

---

## Success Metrics

Track these metrics in the first week:

- [ ] Number of signups
- [ ] Number of paid subscriptions
- [ ] Number of property reports purchased
- [ ] Total revenue
- [ ] Website traffic (Google Analytics)
- [ ] Conversion rate (visitors → customers)
- [ ] Average session duration
- [ ] Bounce rate
- [ ] Search impressions (Search Console)
- [ ] Search clicks (Search Console)

---

## Next Steps After Launch

### Week 1
- [ ] Monitor all systems closely
- [ ] Fix any bugs or issues
- [ ] Respond to customer feedback
- [ ] Adjust pricing if needed
- [ ] Start content marketing (blog posts)

### Month 1
- [ ] Analyze conversion rates
- [ ] A/B test pricing page
- [ ] Improve SEO rankings
- [ ] Add more state coverage
- [ ] Build email marketing list

### Month 3
- [ ] Add new features based on feedback
- [ ] Expand to more states
- [ ] Partner with septic companies
- [ ] Run paid advertising campaigns
- [ ] Build affiliate program

---

## Completion Status

**Date Started:** _______________  
**Date Completed:** _______________  
**Launched By:** _______________  
**First Customer:** _______________  
**First Revenue:** $_______________

---

## Notes

Use this section to track any issues, decisions, or important information during the launch process:

```
[Add your notes here]
```

---

**Congratulations on launching TankFindr! 🎉**

You've built something amazing. Now go get those customers!
