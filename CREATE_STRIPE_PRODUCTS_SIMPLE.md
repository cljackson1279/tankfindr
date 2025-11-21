# Create Stripe Test Products - Super Simple Guide

## ⏱️ Takes 5 Minutes Total

I can't create test mode products directly, but here's the absolute simplest way to do it yourself:

---

## 🎯 Product 1: TankFindr Starter ($99/mo)

### 1. Go here:
👉 **https://dashboard.stripe.com/test/products/create**

### 2. Fill in these exact values:

**Product information:**
```
Name: TankFindr Starter
Description: 10 tank locates per month with AI-powered satellite imagery analysis
```

**Pricing:**
- Click **"+ Add another price"** or the pricing section
- **Price:** `99`
- **Billing period:** `Monthly`
- **Currency:** `USD - US Dollar`

### 3. Click "Save product" (top right)

### 4. Copy the Price ID:
- After saving, you'll see the price listed
- Look for something like: `price_1ABC...xyz`
- **Copy it and save as:** `STRIPE_STARTER_PRICE_ID`

---

## 🎯 Product 2: TankFindr Pro ($249/mo)

### 1. Go here:
👉 **https://dashboard.stripe.com/test/products/create**

### 2. Fill in:

**Product information:**
```
Name: TankFindr Pro
Description: 40 tank locates per month with AI-powered satellite imagery analysis and priority support
```

**Pricing:**
- **Price:** `249`
- **Billing period:** `Monthly`
- **Currency:** `USD - US Dollar`

### 3. Click "Save product"

### 4. Copy the Price ID:
- **Save as:** `STRIPE_PRO_PRICE_ID`

---

## 🎯 Product 3: TankFindr Enterprise ($599/mo)

### 1. Go here:
👉 **https://dashboard.stripe.com/test/products/create**

### 2. Fill in:

**Product information:**
```
Name: TankFindr Enterprise
Description: 150 tank locates per month with AI-powered satellite imagery, priority support, and dedicated account manager
```

**Pricing:**
- **Price:** `599`
- **Billing period:** `Monthly`
- **Currency:** `USD - US Dollar`

### 3. Click "Save product"

### 4. Copy the Price ID:
- **Save as:** `STRIPE_ENTERPRISE_PRICE_ID`

---

## ✅ Done! Now You Have:

```
STRIPE_STARTER_PRICE_ID = price_xxxxx...
STRIPE_PRO_PRICE_ID = price_xxxxx...
STRIPE_ENTERPRISE_PRICE_ID = price_xxxxx...
```

---

## 🚀 Next: Get Your API Keys

### 1. Go here:
👉 **https://dashboard.stripe.com/test/apikeys**

### 2. Copy these two keys:

**Publishable key** (already visible):
```
pk_test_51xxxxx...
```
**Save as:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Secret key** (click "Reveal test key"):
```
sk_test_51xxxxx...
```
**Save as:** `STRIPE_SECRET_KEY`

---

## 📋 Your Complete Stripe Variables for Vercel:

After completing the steps above, you'll have these 5 Stripe variables:

```bash
STRIPE_SECRET_KEY=sk_test_51xxxxx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx...
STRIPE_STARTER_PRICE_ID=price_xxxxx...
STRIPE_PRO_PRICE_ID=price_xxxxx...
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx...
```

Plus you'll add this one after deployment:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx...
```

---

## 🎯 That's It!

You now have everything you need from Stripe. Add these to your other environment variables and you're ready to deploy to Vercel!

**Total time:** ~5 minutes
**Difficulty:** Copy and paste 😊

---

## ❓ Need Help?

If you get stuck on any step, just let me know which product you're on and I'll help you through it!
