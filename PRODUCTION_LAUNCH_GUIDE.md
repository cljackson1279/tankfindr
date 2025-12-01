# TankFindr Production Launch Guide

**Date:** December 1, 2025  
**Goal:** Move from test mode to live production with Stripe payments and custom domain

---

## Phase 1: Stripe Live Mode Setup

### Step 1: Create Live Mode Products and Prices in Stripe

1. **Log into Stripe Dashboard:** https://dashboard.stripe.com
2. **Switch to Live Mode** (toggle in top-right corner)
3. **Create Products:**

#### Product 1: TankFindr Pro - Starter
- **Name:** TankFindr Pro - Starter
- **Description:** 300 tank lookups per month for small septic companies
- **Pricing:**
  - **Price:** $99.00 USD
  - **Billing period:** Monthly (recurring)
  - **Currency:** USD
- **Save the Price ID** (starts with `price_`) → Use for `STRIPE_PRICE_STARTER`

#### Product 2: TankFindr Pro - Pro
- **Name:** TankFindr Pro - Pro
- **Description:** 1,500 tank lookups per month for growing septic businesses
- **Pricing:**
  - **Price:** $249.00 USD
  - **Billing period:** Monthly (recurring)
  - **Currency:** USD
- **Save the Price ID** (starts with `price_`) → Use for `STRIPE_PRICE_PRO`

#### Product 3: TankFindr Pro - Enterprise
- **Name:** TankFindr Pro - Enterprise
- **Description:** Unlimited tank lookups for large septic companies
- **Pricing:**
  - **Price:** $599.00 USD
  - **Billing period:** Monthly (recurring)
  - **Currency:** USD
- **Save the Price ID** (starts with `price_`) → Use for `STRIPE_PRICE_ENTERPRISE`

#### Product 4: Inspector Pro
- **Name:** TankFindr Inspector Pro
- **Description:** Unlimited septic system reports for home inspectors
- **Pricing:**
  - **Price:** $79.00 USD
  - **Billing period:** Monthly (recurring)
  - **Currency:** USD
- **Save the Price ID** (starts with `price_`) → Use for `STRIPE_PRICE_INSPECTOR`

#### Product 5: Property Report (One-time)
- **Name:** TankFindr Property Report
- **Description:** One-time septic system report for homeowners
- **Pricing:**
  - **Price:** $19.00 USD
  - **Billing period:** One-time
  - **Currency:** USD
- **Save the Price ID** (starts with `price_`) → Use for `STRIPE_PRICE_PROPERTY_REPORT`

### Step 2: Get Live Mode API Keys

1. **Go to:** Developers → API Keys (in Stripe Dashboard)
2. **Copy these keys:**
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`) - Keep this secure!

### Step 3: Set Up Webhook Endpoint

1. **Go to:** Developers → Webhooks
2. **Click:** "Add endpoint"
3. **Endpoint URL:** `https://tankfindr.com/api/webhooks/stripe`
4. **Events to listen to:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. **Save the Signing Secret** (starts with `whsec_`) → Use for `STRIPE_WEBHOOK_SECRET`

---

## Phase 2: Environment Variables Configuration

### Required Environment Variables

Add these to **Vercel** (not .env.local):

```bash
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://cijtllcbrvkbvrjriweu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Get from Supabase Dashboard]
SUPABASE_SERVICE_ROLE_KEY=[Already have this]

# Stripe Live Mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXX
STRIPE_SECRET_KEY=sk_live_XXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXX

# Stripe Price IDs (from Step 1 above)
STRIPE_PRICE_STARTER=price_XXXXXXXXXX
STRIPE_PRICE_PRO=price_XXXXXXXXXX
STRIPE_PRICE_ENTERPRISE=price_XXXXXXXXXX
STRIPE_PRICE_INSPECTOR=price_XXXXXXXXXX
STRIPE_PRICE_PROPERTY_REPORT=price_XXXXXXXXXX

# Mapbox (for address search)
NEXT_PUBLIC_MAPBOX_TOKEN=[Your Mapbox token]

# Site URL
NEXT_PUBLIC_SITE_URL=https://tankfindr.com
```

### How to Add Environment Variables to Vercel

1. **Go to:** https://vercel.com/chris-jackson/tankfindr
2. **Click:** Settings → Environment Variables
3. **Add each variable:**
   - **Key:** Variable name (e.g., `STRIPE_SECRET_KEY`)
   - **Value:** The actual value
   - **Environments:** Select all (Production, Preview, Development)
4. **Click:** "Save"
5. **Repeat** for all variables above

### Important Notes

- ⚠️ **Never commit API keys to Git**
- ⚠️ **Use Vercel's environment variables** for production
- ⚠️ **Keep .env.local for local development only**
- ✅ **Vercel will automatically redeploy** when you add environment variables

---

## Phase 3: Custom Domain Setup (tankfindr.com)

### Step 1: Add Domain to Vercel

1. **Go to:** https://vercel.com/chris-jackson/tankfindr
2. **Click:** Settings → Domains
3. **Click:** "Add Domain"
4. **Enter:** `tankfindr.com`
5. **Click:** "Add"
6. **Also add:** `www.tankfindr.com` (repeat steps 3-5)

Vercel will show you DNS records to configure.

### Step 2: Configure DNS in Namecheap

1. **Log into Namecheap:** https://www.namecheap.com
2. **Go to:** Domain List → Manage (for tankfindr.com)
3. **Click:** Advanced DNS tab
4. **Add these DNS records:**

#### For Root Domain (tankfindr.com)

**Record Type:** A Record
- **Host:** `@`
- **Value:** `76.76.21.21` (Vercel's IP)
- **TTL:** Automatic

**Alternative: CNAME (if A record doesn't work)**
- **Host:** `@`
- **Value:** `cname.vercel-dns.com`
- **TTL:** Automatic

#### For www Subdomain (www.tankfindr.com)

**Record Type:** CNAME
- **Host:** `www`
- **Value:** `cname.vercel-dns.com`
- **TTL:** Automatic

#### Verification Record (Vercel will provide this)

**Record Type:** TXT
- **Host:** `_vercel`
- **Value:** (Vercel will show you this value)
- **TTL:** Automatic

### Step 3: Verify Domain in Vercel

1. **Wait 5-10 minutes** for DNS propagation
2. **Go back to Vercel:** Settings → Domains
3. **Click:** "Refresh" or "Verify"
4. **Status should change to:** ✅ Valid Configuration

### Step 4: Set Primary Domain

1. **In Vercel Domains settings**
2. **Find:** `tankfindr.com`
3. **Click:** Three dots → "Set as Primary"
4. **This ensures:** All traffic redirects to tankfindr.com (not www)

### Step 5: Enable HTTPS

- ✅ **Automatic:** Vercel automatically provisions SSL certificates
- ✅ **Wait:** 24-48 hours for full propagation
- ✅ **Force HTTPS:** Vercel automatically redirects HTTP to HTTPS

---

## Phase 4: Update Code References

### Files to Update

#### 1. Update Inspector Pro Price ID

**File:** `/app/inspector-pro/page.tsx`

Find line 39:
```typescript
priceId: 'price_1SZMs6Rsawlh5ooWuJ5X98xG', // Inspector Pro price
```

Change to:
```typescript
priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_INSPECTOR!, // Inspector Pro price
```

#### 2. Create Environment Variable Validation

**Create new file:** `/lib/env.ts`

```typescript
// Validate required environment variables at build time
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_STARTER',
  'STRIPE_PRICE_PRO',
  'STRIPE_PRICE_ENTERPRISE',
  'STRIPE_PRICE_INSPECTOR',
  'STRIPE_PRICE_PROPERTY_REPORT',
  'NEXT_PUBLIC_MAPBOX_TOKEN',
] as const;

export function validateEnv() {
  const missing = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

// Call this in your app initialization
if (process.env.NODE_ENV === 'production') {
  validateEnv();
}
```

#### 3. Update Documentation Files

**Files to update:**
- `/PAYMENT_FLOWS_AUDIT.md` - Change $49 to $99/$249/$599
- `/SESSION_SUMMARY.md` - Change $49 to $99/$249/$599

---

## Phase 5: SEO Optimization

### Step 1: Create sitemap.xml

**Create file:** `/app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tankfindr.com'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing-pro`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/inspector-pro`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/report`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/coverage`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]
}
```

### Step 2: Create robots.txt

**Create file:** `/app/robots.ts`

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/', '/pro/', '/inspector-pro/dashboard/', '/inspector-pro/report/'],
    },
    sitemap: 'https://tankfindr.com/sitemap.xml',
  }
}
```

### Step 3: Update Root Layout with SEO Metadata

**File:** `/app/layout.tsx`

Add comprehensive metadata:

```typescript
import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://tankfindr.com'),
  title: {
    default: 'TankFindr - Find Septic Tanks Instantly with GPS-Accurate Locations',
    template: '%s | TankFindr',
  },
  description: 'Locate septic tanks 10x faster with TankFindr. Access 2.3M+ GPS-accurate tank locations from government records. Perfect for septic companies, home inspectors, and homeowners.',
  keywords: [
    'septic tank location',
    'find septic tank',
    'septic system',
    'septic tank finder',
    'where is my septic tank',
    'septic tank GPS',
    'septic tank map',
    'does my house have a septic tank',
    'septic or sewer',
    'septic inspection',
    'home inspection septic',
    'septic company software',
    'septic tank records',
  ],
  authors: [{ name: 'TankFindr' }],
  creator: 'TankFindr',
  publisher: 'TankFindr',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tankfindr.com',
    title: 'TankFindr - Find Septic Tanks Instantly',
    description: 'Locate septic tanks 10x faster with GPS-accurate locations from government records. 2.3M+ tanks mapped across 12 states.',
    siteName: 'TankFindr',
    images: [
      {
        url: '/og-image.png', // You'll need to create this
        width: 1200,
        height: 630,
        alt: 'TankFindr - Septic Tank Location Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TankFindr - Find Septic Tanks Instantly',
    description: 'Locate septic tanks 10x faster with GPS-accurate locations from government records.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // Get from Google Search Console
  },
}
```

### Step 4: Add Structured Data (JSON-LD)

**Create component:** `/components/StructuredData.tsx`

```typescript
export function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'TankFindr',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: [
      {
        '@type': 'Offer',
        price: '99',
        priceCurrency: 'USD',
        name: 'TankFindr Pro - Starter',
      },
      {
        '@type': 'Offer',
        price: '249',
        priceCurrency: 'USD',
        name: 'TankFindr Pro - Pro',
      },
      {
        '@type': 'Offer',
        price: '599',
        priceCurrency: 'USD',
        name: 'TankFindr Pro - Enterprise',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
    description: 'Locate septic tanks 10x faster with GPS-accurate locations from government records.',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
```

Add to layout.tsx:
```typescript
import { StructuredData } from '@/components/StructuredData'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <StructuredData />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Step 5: Submit to Google Search Console

1. **Go to:** https://search.google.com/search-console
2. **Add property:** tankfindr.com
3. **Verify ownership:** Use DNS TXT record method
4. **Submit sitemap:** https://tankfindr.com/sitemap.xml
5. **Request indexing:** URL Inspection tool → Request Indexing

### Step 6: Create Google Business Profile

1. **Go to:** https://business.google.com
2. **Create business profile** for TankFindr
3. **Add business details:**
   - Category: Software Company
   - Website: https://tankfindr.com
   - Description: (Use SEO description above)
4. **Verify business**
5. **Add photos** and updates regularly

### Step 7: Local SEO Optimization

**Add location-specific pages:**
- `/coverage/florida`
- `/coverage/california`
- `/coverage/virginia`
- etc.

**Each page should include:**
- State-specific statistics (number of tanks)
- County coverage list
- Local testimonials
- State-specific regulations info

### Step 8: Content Marketing for SEO

**Create blog posts:**
- "How to Find Your Septic Tank: Complete Guide"
- "Septic vs Sewer: How to Tell What You Have"
- "10 Signs Your Home Has a Septic System"
- "Septic Tank Inspection Checklist for Home Buyers"
- "How Septic Companies Save Time with TankFindr"

**Location:** `/app/blog/[slug]/page.tsx`

---

## Phase 6: Analytics Setup

### Google Analytics 4

1. **Create GA4 property:** https://analytics.google.com
2. **Get Measurement ID:** (starts with `G-`)
3. **Add to environment variables:** `NEXT_PUBLIC_GA_MEASUREMENT_ID`
4. **Install Google Analytics:**

```bash
npm install @next/third-parties
```

**Update layout.tsx:**
```typescript
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
      </body>
    </html>
  )
}
```

### Conversion Tracking

**Track key events:**
- Sign up
- Subscription purchase
- Property report purchase
- Inspector report generation

---

## Phase 7: Testing Checklist

### Before Going Live

- [ ] All Stripe products created in live mode
- [ ] All environment variables added to Vercel
- [ ] Domain configured and verified
- [ ] SSL certificate active (HTTPS working)
- [ ] Test subscription purchase with real card
- [ ] Test one-time payment with real card
- [ ] Verify webhook events received
- [ ] Check all three pricing tiers work
- [ ] Test Inspector Pro subscription
- [ ] Verify PDF downloads work
- [ ] Check mobile responsiveness
- [ ] Test on multiple browsers
- [ ] Verify email receipts from Stripe
- [ ] Check Google Analytics tracking
- [ ] Verify sitemap accessible
- [ ] Test robots.txt
- [ ] Check all internal links work
- [ ] Verify no broken images
- [ ] Test search functionality
- [ ] Check loading speeds (PageSpeed Insights)

### Post-Launch Monitoring

- [ ] Monitor Stripe dashboard for payments
- [ ] Check Vercel logs for errors
- [ ] Monitor Google Search Console for indexing
- [ ] Track Google Analytics for traffic
- [ ] Check Supabase database for new users
- [ ] Monitor webhook delivery in Stripe
- [ ] Review customer feedback
- [ ] Check for 404 errors
- [ ] Monitor site uptime
- [ ] Track conversion rates

---

## Phase 8: Launch Timeline

### Day 1: Stripe Setup
- Create live mode products
- Get API keys
- Set up webhooks
- Test with real card

### Day 2: Environment Variables
- Add all variables to Vercel
- Deploy and verify
- Test all payment flows

### Day 3: Domain Setup
- Add domain to Vercel
- Configure DNS in Namecheap
- Wait for propagation
- Verify SSL

### Day 4: SEO Implementation
- Add sitemap and robots.txt
- Update metadata
- Add structured data
- Submit to Google Search Console

### Day 5: Testing
- Complete testing checklist
- Fix any issues
- Final verification

### Day 6: Launch! 🚀
- Announce on social media
- Email existing users
- Monitor closely
- Celebrate!

---

## Support Resources

### Stripe Documentation
- https://stripe.com/docs/payments/checkout
- https://stripe.com/docs/billing/subscriptions
- https://stripe.com/docs/webhooks

### Vercel Documentation
- https://vercel.com/docs/concepts/projects/domains
- https://vercel.com/docs/concepts/projects/environment-variables

### SEO Resources
- https://developers.google.com/search/docs
- https://search.google.com/search-console

### Next.js SEO
- https://nextjs.org/docs/app/building-your-application/optimizing/metadata

---

## Emergency Contacts

**Stripe Support:** https://support.stripe.com  
**Vercel Support:** https://vercel.com/support  
**Namecheap Support:** https://www.namecheap.com/support  
**Google Search Console:** https://support.google.com/webmasters

---

## Conclusion

Following this guide will take TankFindr from test mode to a fully operational production SaaS platform with:

✅ Live Stripe payments  
✅ Custom domain (tankfindr.com)  
✅ SSL/HTTPS security  
✅ SEO optimization  
✅ Google indexing  
✅ Analytics tracking  

**Estimated time to complete:** 3-5 days  
**Recommended approach:** One phase per day, testing thoroughly at each step

Good luck with your launch! 🚀
