# Stripe Webhook Setup Guide

## 🎯 Goal

Set up a Stripe webhook to automatically sync subscription and payment events with your TankFindr database.

---

## 📍 Webhook Endpoint URL

**Production URL:** `https://tankfindr.com/api/webhooks/stripe`

**For testing (before domain is live):** `https://tankfindr.vercel.app/api/webhooks/stripe`

---

## 🔧 Step-by-Step Setup

### 1. Access Stripe Webhook Settings

1. Log into Stripe Dashboard: https://dashboard.stripe.com
2. Make sure you're in **LIVE MODE** (toggle in top-right)
3. Go to: **Developers** → **Webhooks**
4. Click: **Add endpoint**

### 2. Configure Webhook Endpoint

**Endpoint URL:**
```
https://tankfindr.com/api/webhooks/stripe
```

**Description:** (optional)
```
TankFindr production webhook for subscription and payment events
```

**API Version:** (leave as latest)

### 3. Select Events to Listen For

Click **Select events** and choose these:

#### Checkout Events
- [x] `checkout.session.completed` - When customer completes checkout
- [x] `checkout.session.async_payment_succeeded` - When async payment succeeds
- [x] `checkout.session.async_payment_failed` - When async payment fails

#### Subscription Events
- [x] `customer.subscription.created` - When subscription is created
- [x] `customer.subscription.updated` - When subscription is modified
- [x] `customer.subscription.deleted` - When subscription is cancelled
- [x] `customer.subscription.paused` - When subscription is paused
- [x] `customer.subscription.resumed` - When subscription is resumed
- [x] `customer.subscription.trial_will_end` - 3 days before trial ends

#### Invoice Events
- [x] `invoice.created` - When invoice is created
- [x] `invoice.finalized` - When invoice is finalized
- [x] `invoice.payment_succeeded` - When invoice payment succeeds
- [x] `invoice.payment_failed` - When invoice payment fails
- [x] `invoice.upcoming` - 7 days before next invoice

#### Payment Events
- [x] `payment_intent.succeeded` - When payment succeeds
- [x] `payment_intent.payment_failed` - When payment fails
- [x] `payment_intent.canceled` - When payment is cancelled

#### Customer Events
- [x] `customer.created` - When customer is created
- [x] `customer.updated` - When customer info is updated
- [x] `customer.deleted` - When customer is deleted

### 4. Save Webhook

1. Click: **Add endpoint**
2. You'll see your new webhook listed
3. Click on the webhook to view details
4. **Copy the Signing Secret** (starts with `whsec_`)

### 5. Add Signing Secret to Vercel

1. Go to: https://vercel.com/chris-jackson/tankfindr/settings/environment-variables
2. Click: **Add New**
3. Key: `STRIPE_WEBHOOK_SECRET`
4. Value: `whsec_XXXXXXXXXX` (paste the signing secret)
5. Environment: **All** (Production, Preview, Development)
6. Click: **Save**

---

## 🧪 Testing the Webhook

### Option 1: Use Stripe CLI (Recommended for Local Testing)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local development
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Option 2: Test in Stripe Dashboard

1. Go to: **Developers** → **Webhooks**
2. Click on your webhook
3. Click: **Send test webhook**
4. Select event: `checkout.session.completed`
5. Click: **Send test webhook**
6. Check the **Response** tab to see if it succeeded

### Option 3: Make a Real Test Purchase

1. Go to: https://tankfindr.com/pricing-pro
2. Click: **Start with Starter**
3. Use test card: `4242 4242 4242 4242`
4. Expiry: Any future date
5. CVC: Any 3 digits
6. Complete checkout
7. Check webhook logs in Stripe Dashboard

---

## 📊 Verify Webhook is Working

### In Stripe Dashboard

1. Go to: **Developers** → **Webhooks**
2. Click on your webhook
3. Check the **Attempts** tab
4. You should see successful deliveries (200 status)

### In Vercel Logs

1. Go to: https://vercel.com/chris-jackson/tankfindr/deployments
2. Click on latest deployment
3. Click: **Functions**
4. Find: `/api/webhooks/stripe`
5. Check logs for webhook events

### In Supabase

1. Go to: Supabase Dashboard → Table Editor
2. Check `subscriptions` table for new records
3. Check `users` table for updated subscription status

---

## 🔍 Webhook Event Flow

Here's what happens when a customer subscribes:

1. **Customer clicks "Subscribe"** on your website
2. **Stripe Checkout opens** with payment form
3. **Customer enters payment info** and submits
4. **Stripe processes payment** and creates subscription
5. **Stripe sends webhook** to your endpoint: `checkout.session.completed`
6. **Your API receives webhook** at `/api/webhooks/stripe`
7. **API verifies signature** using webhook secret
8. **API extracts customer data** (email, subscription tier, etc.)
9. **API updates Supabase** with subscription info
10. **Customer is redirected** to dashboard

---

## 🚨 Troubleshooting

### Webhook Returns 404

**Problem:** Stripe can't find your endpoint

**Solutions:**
- Verify URL is correct: `https://tankfindr.com/api/webhooks/stripe`
- Check domain is live and accessible
- Try with Vercel URL first: `https://tankfindr.vercel.app/api/webhooks/stripe`

### Webhook Returns 401 or 403

**Problem:** Signature verification failing

**Solutions:**
- Verify `STRIPE_WEBHOOK_SECRET` is correct in Vercel
- Make sure secret starts with `whsec_`
- Check you're using the signing secret from the correct webhook
- Redeploy Vercel after adding the secret

### Webhook Returns 500

**Problem:** Server error in your code

**Solutions:**
- Check Vercel function logs for error details
- Verify Supabase connection is working
- Check environment variables are all set
- Look for TypeScript errors in the webhook handler

### Events Not Creating Subscriptions

**Problem:** Webhook receives events but doesn't update database

**Solutions:**
- Check Supabase service role key is correct
- Verify webhook handler is parsing events correctly
- Check database table structure matches expected schema
- Look for errors in Vercel function logs

---

## 📝 Webhook Handler Code

Your webhook handler is at: `/app/api/webhooks/stripe/route.ts`

It handles these events:

```typescript
switch (event.type) {
  case 'checkout.session.completed':
    // Create subscription in database
    // Update user subscription status
    break;
    
  case 'customer.subscription.updated':
    // Update subscription in database
    break;
    
  case 'customer.subscription.deleted':
    // Cancel subscription in database
    // Update user status
    break;
    
  case 'invoice.payment_succeeded':
    // Record successful payment
    // Extend subscription period
    break;
    
  case 'invoice.payment_failed':
    // Mark subscription as past_due
    // Send payment failed email
    break;
}
```

---

## 🔐 Security Best Practices

1. **Always verify webhook signatures** - Prevents fake webhook attacks
2. **Use HTTPS only** - Stripe requires HTTPS for webhooks
3. **Keep signing secret secure** - Never commit to Git
4. **Log all webhook events** - Helps with debugging
5. **Handle idempotency** - Same event might be sent multiple times
6. **Return 200 quickly** - Stripe times out after 30 seconds

---

## 📈 Monitoring Webhooks

### Set Up Alerts

1. **Stripe Dashboard:**
   - Go to: **Developers** → **Webhooks** → Your webhook
   - Enable: **Email notifications for failed events**

2. **Vercel:**
   - Set up error alerts for function failures
   - Monitor function execution time

3. **Supabase:**
   - Check for failed database writes
   - Monitor subscription table for anomalies

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Webhook endpoint created in Stripe
- [ ] All required events selected
- [ ] Signing secret copied to Vercel
- [ ] Vercel redeployed with new secret
- [ ] Test webhook sent successfully
- [ ] Webhook logs show 200 responses
- [ ] Test subscription creates database record
- [ ] User subscription status updates correctly
- [ ] Email receipts sent from Stripe
- [ ] Dashboard shows active subscription

---

## 🎯 Next Steps

After webhook is working:

1. ✅ Test all subscription tiers
2. ✅ Test subscription cancellation
3. ✅ Test payment failure handling
4. ✅ Test one-time Property Report purchase
5. ✅ Monitor webhook logs for first week
6. ✅ Set up error alerts

---

## 📞 Support

If you encounter issues:

1. **Check Stripe Logs:** Dashboard → Developers → Webhooks → Attempts
2. **Check Vercel Logs:** Deployments → Functions → `/api/webhooks/stripe`
3. **Check Supabase Logs:** Dashboard → Logs
4. **Stripe Support:** https://support.stripe.com
5. **Vercel Support:** https://vercel.com/support

---

**Status:** Ready to set up webhook endpoint
**Estimated Time:** 10-15 minutes
**Difficulty:** Easy (just follow steps)

---

## 🔗 Quick Links

- Stripe Webhooks: https://dashboard.stripe.com/webhooks
- Stripe Events Reference: https://stripe.com/docs/api/events/types
- Vercel Environment Variables: https://vercel.com/chris-jackson/tankfindr/settings/environment-variables
- Webhook Testing Guide: https://stripe.com/docs/webhooks/test

---

**Ready to set up your webhook? Follow the steps above and you'll be done in 10 minutes!** 🚀
