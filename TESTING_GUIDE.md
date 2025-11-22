# 🧪 TankFindr Testing Guide

## Complete Testing Checklist

Use this guide to test all features of your TankFindr MVP before going live.

---

## 🔧 Prerequisites

### ✅ Before Testing, Verify:
- [ ] All code pushed to GitHub
- [ ] Vercel deployment successful
- [ ] Supabase schema migration run
- [ ] All environment variables set in Vercel
- [ ] Stripe test mode active

### 📋 Environment Variables Checklist:
```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ NEXT_PUBLIC_MAPBOX_TOKEN
✅ SKYFI_API_KEY
✅ STRIPE_SECRET_KEY (test mode: sk_test_...)
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (test mode: pk_test_...)
✅ STRIPE_WEBHOOK_SECRET (whsec_...)
✅ STRIPE_STARTER_PRICE_ID (price_1SW0dERsawlh5ooWS1vofyMx)
✅ STRIPE_PRO_PRICE_ID (price_1SW0ftRsawlh5ooWfxKAfM3L)
✅ STRIPE_ENTERPRISE_PRICE_ID (price_1SW0heRsawlh5ooWIn6gOZuk)
✅ NEXT_PUBLIC_SITE_URL (your Vercel URL)
```

---

## 🧪 Test 1: Landing Page & Sign Up

### Steps:
1. **Visit your Vercel URL**
   - Should see landing page with hero section
   - Green "Start Free Trial" button
   - "View Pricing" button
   - Text: "🎉 5 free locates OR 7 days free"

2. **Click "Start Free Trial"**
   - Redirects to `/auth/sign-up`
   - See email and password fields

3. **Create Test Account**
   - Email: `test@example.com`
   - Password: `TestPass123!`
   - Click "Create Account"

4. **Check Email**
   - Should receive confirmation email from Supabase
   - Click confirmation link

5. **Verify Redirect**
   - Should redirect to `/pricing` page
   - See 3 pricing tiers with bright green buttons

### ✅ Success Criteria:
- [ ] Landing page loads correctly
- [ ] Sign up form works
- [ ] Confirmation email received
- [ ] Redirects to pricing after confirmation
- [ ] All buttons are bright green

---

## 🧪 Test 2: Subscription Checkout

### Steps:
1. **On Pricing Page**
   - Click "Start Starter Plan" ($99/mo)

2. **Stripe Checkout Opens**
   - Should see Stripe checkout page
   - Amount: $99.00/month
   - Trial: 7 days free

3. **Enter Test Card**
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: 12/34
   CVC: 123
   ZIP: 12345
   ```

4. **Complete Checkout**
   - Click "Subscribe"
   - Should redirect back to your site

5. **Verify Redirect**
   - Should land on `/protected` (Tank Locator)
   - See usage counter: "Trial Locates: 0 / 5"

### ✅ Success Criteria:
- [ ] Stripe checkout opens
- [ ] Test card accepted
- [ ] Redirects to Tank Locator
- [ ] Usage counter shows 0/5
- [ ] No errors in console

### 🔍 Verify in Supabase:
1. Go to Supabase Table Editor
2. Open `profiles` table
3. Find your user
4. Check:
   - `subscription_status` = 'trialing'
   - `subscription_tier` = 'starter'
   - `stripe_customer_id` = 'cus_...'
   - `trial_locates_used` = 0

---

## 🧪 Test 3: Tank Locator (Trial)

### Steps:
1. **On Tank Locator Page**
   - See map (satellite view)
   - See address input field
   - See "Locate Tank" button
   - See usage counter: "Trial Locates: 0 / 5"

2. **Perform First Locate**
   - Enter address: `1600 Pennsylvania Ave NW, Washington, DC 20500`
   - Click "Locate Tank"
   - Should see loading spinner

3. **Verify Results**
   - Results card appears
   - Confidence score displayed (e.g., 85%)
   - Estimated depth shown (e.g., 4 feet)
   - GPS coordinates displayed
   - Map zooms to location
   - Green marker appears
   - Usage counter updates: "Trial Locates: 1 / 5"

4. **Test Google Maps Button**
   - Click "Navigate with Google Maps"
   - Should open Google Maps in new tab
   - Location should be correct

5. **Perform 4 More Locates**
   - Use different addresses
   - Watch counter increment: 2/5, 3/5, 4/5, 5/5
   - When at 5/5, see warning: "⚠️ Last free locate"

### ✅ Success Criteria:
- [ ] Map loads correctly
- [ ] Address input works
- [ ] Locate button triggers API call
- [ ] Results appear with all data
- [ ] Map marker placed correctly
- [ ] Usage counter updates
- [ ] Google Maps navigation works

### 🔍 Verify in Supabase:
1. Check `profiles` table:
   - `trial_locates_used` = 5
2. Check `tanks` table:
   - 5 new rows created
   - Each has address, lat, lng, confidence, depth
3. Check `usage` table:
   - 5 new rows with action='locate'

---

## 🧪 Test 4: Trial Limit Reached

### Steps:
1. **After Using 5 Locates**
   - Usage counter shows: "Trial Locates: 5 / 5"

2. **Try 6th Locate**
   - Enter new address
   - Click "Locate Tank"

3. **Verify Error Message**
   - Should see error: "You've used all 5 free trial locates. Please subscribe to continue."
   - After 2 seconds, redirects to `/pricing`

4. **On Pricing Page**
   - See 3 tiers again
   - Can upgrade or stay on current plan

### ✅ Success Criteria:
- [ ] Error message appears
- [ ] Automatic redirect to pricing
- [ ] Cannot perform more locates without subscribing

---

## 🧪 Test 5: Compliance Reports

### Steps:
1. **Perform a Locate** (use a new test account if needed)
   - Complete a tank locate successfully
   - Results appear

2. **See Compliance Report Button**
   - Below results, see: "📄 Download Compliance Report ($25)"
   - Description explains what's included

3. **Click Report Button**
   - Redirects to Stripe checkout
   - Amount: $25.00 (one-time payment)

4. **Enter Test Card**
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: 12/34
   CVC: 123
   ZIP: 12345
   ```

5. **Complete Payment**
   - Click "Pay"
   - Redirects back to Tank Locator

6. **Download Report**
   - "Download Your Report" button appears
   - Click to download PDF

7. **Verify PDF Contents**
   - Property address
   - GPS coordinates
   - Confidence score
   - Estimated depth
   - Satellite map image
   - Technician info (if profile filled)
   - Legal disclaimer

### ✅ Success Criteria:
- [ ] Report button appears after locate
- [ ] Stripe checkout opens with $25
- [ ] Payment processes successfully
- [ ] Download button appears
- [ ] PDF downloads correctly
- [ ] PDF contains all required info

### 🔍 Verify in Supabase:
1. Check `reports` table:
   - New row created
   - `user_id` matches your user
   - `tank_id` matches the tank
   - `stripe_payment_id` = 'pi_...'
   - `price_paid` = 2500 (cents)

---

## 🧪 Test 6: Profile Page (Technician Info)

### Steps:
1. **Navigate to Profile**
   - Click "Profile" button in header
   - Or go to `/profile`

2. **Fill in Technician Info**
   - Full Name: `John Smith`
   - License Number: `SEP-2024-12345`
   - Company Name: `Smith Septic Services`

3. **Save Profile**
   - Click "Save Profile"
   - Should see success message

4. **Generate Report with Info**
   - Go back to Tank Locator
   - Perform a locate
   - Purchase compliance report
   - Download PDF

5. **Verify PDF Has Technician Info**
   - PDF should show:
     - Certified by: John Smith
     - License: SEP-2024-12345
     - Company: Smith Septic Services

### ✅ Success Criteria:
- [ ] Profile page loads
- [ ] Can enter technician info
- [ ] Save button works
- [ ] Info persists after refresh
- [ ] Info appears in generated reports

---

## 🧪 Test 7: Subscription Overage

### Steps:
1. **Wait for Trial to Convert** (or use Stripe dashboard to end trial manually)
   - After 7 days OR 5 locates, trial ends
   - User is charged $99

2. **Use Monthly Allowance**
   - Perform 10 locates (Starter plan limit)
   - Usage counter shows: "Starter Plan Locates: 10 / 10"

3. **Try 11th Locate**
   - Enter address
   - Click "Locate Tank"

4. **Verify Overage Warning**
   - Modal appears:
     - "⚠️ You've reached your monthly limit"
     - "Continuing will charge $8 per additional locate"
     - Shows upgrade option to Pro plan
   - Options:
     - "Continue & Charge $8"
     - "Upgrade to Pro"
     - "Cancel"

5. **Test Continue with Overage**
   - Click "Continue & Charge $8"
   - Locate proceeds
   - Usage counter shows: "Starter Plan Locates: 10 / 10 (+1 overage)"

6. **Verify Overage Charge**
   - Check Stripe dashboard
   - Should see $8 invoice item created

### ✅ Success Criteria:
- [ ] Trial converts to paid after 7 days
- [ ] Monthly limit enforced
- [ ] Overage warning appears
- [ ] Can continue with overage charge
- [ ] Stripe creates invoice item
- [ ] Usage counter shows overage

---

## 🧪 Test 8: Stripe Webhooks

### Steps:
1. **Set Up Stripe CLI** (for local testing)
   ```bash
   stripe login
   stripe listen --forward-to https://your-vercel-url.vercel.app/api/webhooks/stripe
   ```

2. **Test Webhook Events**
   - Create subscription → `customer.subscription.created`
   - Update subscription → `customer.subscription.updated`
   - Cancel subscription → `customer.subscription.deleted`
   - Payment succeeds → `invoice.payment_succeeded`
   - Payment fails → `invoice.payment_failed`

3. **Verify Database Updates**
   - Check `profiles` table after each event
   - Verify `subscription_status` changes correctly

### ✅ Success Criteria:
- [ ] Webhooks receive events
- [ ] Database updates correctly
- [ ] No errors in logs

---

## 🧪 Test 9: Upgrade Flow

### Steps:
1. **On Tank Locator with Starter Plan**
   - Click "Manage Subscription" button
   - Or go to `/pricing`

2. **Click "Upgrade to Pro"**
   - Stripe checkout opens
   - Shows upgrade from $99 to $249

3. **Complete Upgrade**
   - Confirm upgrade
   - Redirects back

4. **Verify Upgrade**
   - Usage counter shows: "Pro Plan Locates: 0 / 40"
   - Overage rate changed to $6

### ✅ Success Criteria:
- [ ] Upgrade flow works
- [ ] Stripe prorates correctly
- [ ] Database updates tier
- [ ] Usage limits updated

---

## 🧪 Test 10: Mobile Responsiveness

### Steps:
1. **Open Site on Mobile** (or use Chrome DevTools mobile view)
   - Landing page
   - Pricing page
   - Tank Locator
   - Profile page

2. **Verify Touch Targets**
   - All buttons at least 60px (glove-friendly)
   - Easy to tap on mobile

3. **Test Map on Mobile**
   - Map loads correctly
   - Can zoom and pan
   - Marker visible

### ✅ Success Criteria:
- [ ] All pages responsive
- [ ] Buttons large enough
- [ ] Map works on mobile
- [ ] No horizontal scroll

---

## 🐛 Common Issues & Fixes

### Issue 1: Stripe Checkout Doesn't Open
**Fix:**
- Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel
- Verify it's test mode key (`pk_test_...`)
- Check browser console for errors

### Issue 2: Email Confirmation Doesn't Work
**Fix:**
- Check Supabase email settings
- Verify redirect URLs in Supabase Auth settings
- Add your Vercel URL to allowed redirects

### Issue 3: Map Doesn't Load
**Fix:**
- Check `NEXT_PUBLIC_MAPBOX_TOKEN` in Vercel
- Verify token is valid
- Check browser console for errors

### Issue 4: Webhooks Not Working
**Fix:**
- Verify `STRIPE_WEBHOOK_SECRET` in Vercel
- Check webhook endpoint in Stripe dashboard
- Ensure endpoint is `https://your-url.vercel.app/api/webhooks/stripe`
- Check Vercel function logs

### Issue 5: Database Errors
**Fix:**
- Verify all tables exist in Supabase
- Check RLS policies are enabled
- Verify `SUPABASE_SERVICE_ROLE_KEY` in Vercel

---

## ✅ Final Checklist

Before going live:

### Functionality:
- [ ] Sign up and email confirmation works
- [ ] Subscription checkout works
- [ ] Trial system enforces limits
- [ ] Tank locator returns results
- [ ] Map displays correctly
- [ ] Usage tracking accurate
- [ ] Overage warnings appear
- [ ] Compliance reports generate
- [ ] Profile page saves data
- [ ] Webhooks update database

### Stripe:
- [ ] Test mode products created
- [ ] Webhook endpoint configured
- [ ] Test payments work
- [ ] Overage billing works

### Supabase:
- [ ] All tables created
- [ ] RLS policies enabled
- [ ] Data persists correctly

### UI/UX:
- [ ] All buttons bright green
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Loading states work

### Documentation:
- [ ] All guides reviewed
- [ ] Environment variables documented
- [ ] Testing completed

---

## 🚀 Ready to Launch!

Once all tests pass, you're ready to:

1. **Switch to Live Mode:**
   - Create live Stripe products
   - Update env vars with live keys
   - Update webhook to live endpoint

2. **Final Verifications:**
   - Test with real credit card
   - Verify real charges work
   - Check email notifications

3. **Go Live!** 🎉

---

## 📊 Monitoring After Launch

### Daily:
- Check Stripe dashboard for payments
- Monitor Vercel function logs
- Check Supabase usage

### Weekly:
- Review user signups
- Analyze conversion rates
- Check compliance report attach rate

### Monthly:
- Review revenue metrics
- Analyze churn rate
- Plan feature improvements

---

**Happy Testing!** 🧪✨
