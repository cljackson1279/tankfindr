# How to Find Stripe Webhooks Page (Live Mode)

## The Problem

Stripe keeps redirecting you to test mode even though you toggled it off.

## The Solution

Follow these exact steps:

---

## Step 1: Open Stripe Dashboard

Go to: **https://dashboard.stripe.com**

---

## Step 2: Make SURE You're in Live Mode

**Look at the TOP RIGHT corner** of the page.

You'll see a toggle that says either:
- 🟢 **"Viewing test data"** ← This means you're in TEST mode
- 🔴 **"Viewing live data"** ← This means you're in LIVE mode

**Click the toggle** until it says **"Viewing live data"**

The toggle should turn from gray/blue to **RED/ORANGE** when in live mode.

---

## Step 3: Navigate to Webhooks

**Option A: Direct Link (Easiest)**

Just click this link while logged into Stripe:

👉 **https://dashboard.stripe.com/webhooks**

This will take you directly to the webhooks page in whatever mode you're currently in.

**Option B: Manual Navigation**

1. Look at the **left sidebar**
2. Click: **Developers** (near the bottom of the sidebar)
3. In the submenu that appears, click: **Webhooks**

---

## Step 4: Verify You're on the Right Page

You should see:
- Page title: **"Webhooks"**
- A button: **"Add endpoint"** (top right)
- Either a list of existing webhooks, or "No webhooks configured yet"

**Check the top right corner again** - it should still say **"Viewing live data"**

If it says "Viewing test data", click the toggle again.

---

## Step 5: Create Webhook Endpoint

1. Click: **"Add endpoint"**
2. Enter URL: `https://tankfindr.vercel.app/api/webhooks/stripe`
3. Click: **"Select events"**
4. Search for and select these events:

**Checkout:**
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`

**Subscriptions:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

**Invoices:**
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Payments:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

5. Click: **"Add events"**
6. Click: **"Add endpoint"**

---

## Step 6: Get Signing Secret

After creating the webhook:

1. You'll be taken to the webhook details page
2. Look for: **"Signing secret"**
3. Click: **"Reveal"** or **"Click to reveal"**
4. Copy the secret (starts with `whsec_`)
5. **Save this somewhere safe!**

---

## Step 7: Add to Vercel

1. Go to: https://vercel.com/chris-jackson/tankfindr/settings/environment-variables
2. Click: **"Add New"**
3. Key: `STRIPE_WEBHOOK_SECRET`
4. Value: `whsec_XXXXXXXXXX` (paste what you copied)
5. Environment: **All**
6. Click: **"Save"**

---

## Troubleshooting

### Still Can't Find Webhooks Page?

**Try this:**

1. Log out of Stripe completely
2. Clear your browser cache
3. Log back in
4. Use the direct link: https://dashboard.stripe.com/webhooks
5. Make sure toggle says "Viewing live data"

### Toggle Keeps Switching Back to Test Mode?

This happens if you have a bookmark or link that includes `?test=true` in the URL.

**Solution:**
- Remove any Stripe bookmarks
- Type the URL manually: `dashboard.stripe.com`
- Don't use browser back button

### Can't See "Developers" in Sidebar?

You might need to scroll down in the sidebar. It's usually near the bottom, above "Settings".

---

## Quick Reference

| What | Where |
|------|-------|
| **Webhooks Page** | https://dashboard.stripe.com/webhooks |
| **Live Mode Toggle** | Top right corner (should be RED/ORANGE) |
| **Add Endpoint Button** | Top right of webhooks page |
| **Webhook URL** | `https://tankfindr.vercel.app/api/webhooks/stripe` |
| **Signing Secret** | Revealed after creating webhook |

---

## Alternative: I'll Do It For You

If you still can't find it, you can:

1. **Get your Stripe Secret Key:**
   - Go to: https://dashboard.stripe.com/apikeys
   - Make sure you're in **LIVE MODE** (red toggle)
   - Copy the **Secret key** (starts with `sk_live_`)
   - Send it to me (or add it to `.env.local`)

2. **I'll create the webhook programmatically** using the API

---

**Need Help?**

If you're still stuck, take a screenshot of your Stripe Dashboard and I can guide you from there!
