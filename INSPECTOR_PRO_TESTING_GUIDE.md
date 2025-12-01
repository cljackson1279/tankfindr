# Inspector Pro Testing Guide

## Quick Test Access (Bypass Paywall)

To test Inspector Pro without going through Stripe checkout, manually grant yourself access in Supabase:

### Option 1: SQL Editor (Fastest)

1. Go to your Supabase Dashboard → SQL Editor
2. Run this query (replace `YOUR_EMAIL` with your actual email):

```sql
UPDATE profiles
SET 
  subscription_tier = 'inspector',
  subscription_status = 'active'
WHERE email = 'YOUR_EMAIL';
```

3. Refresh your browser
4. You now have full Inspector Pro access!

### Option 2: Table Editor

1. Go to Supabase Dashboard → Table Editor → `profiles`
2. Find your user row
3. Edit these fields:
   - `subscription_tier`: Change to `inspector`
   - `subscription_status`: Change to `active`
4. Save
5. Refresh your browser

---

## Stripe Test Mode Setup

The current issue is that the Inspector Pro price was created in **live mode** but your site uses **test mode** keys.

### Create Test Mode Price

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. **Toggle to Test Mode** (top right corner - should show "Test mode" badge)
3. Go to **Products** → **Add product**
4. Fill in:
   - **Name**: TankFindr Inspector Pro (Test)
   - **Description**: Unlimited professional septic reports for home inspectors
   - **Pricing**: Recurring
   - **Price**: $79.00 USD
   - **Billing period**: Monthly
5. Click **Save product**
6. Copy the **Price ID** (starts with `price_`)

### Update Code with Test Price

Edit `lib/stripe.ts` and update the Inspector tier:

```typescript
inspector: {
  name: 'Inspector Pro',
  price: 79,
  locates: 999999,
  priceId: 'price_TEST_ID_HERE', // Replace with your test mode price ID
  overage: 0
}
```

---

## Testing Checklist

### 1. Access Dashboard
- [ ] Log in to your account
- [ ] Navigate to `/inspector-pro/dashboard`
- [ ] Verify you see the dashboard (not redirected to pricing)

### 2. Generate Report
- [ ] Enter address: **2169 NW 90 Street, Miami, FL 33147**
- [ ] Click "Generate Report"
- [ ] Verify report loads with data

### 3. Verify Data Display
- [ ] Check "Verified Information" section shows:
  - ✅ System Type (e.g., "OSTDS Abandonment")
  - ✅ Permit Number (e.g., "AP1267843")
  - ✅ System Capacity (e.g., "200 GPD")
  - ✅ Lot Size
  - ✅ Property Type
  - ✅ Water Supply Type
  - ✅ Approval Status
  - ✅ Approval Date

- [ ] Check "Inferred Information" section shows:
  - 🔵 Estimated Tank Size (e.g., "750-1000 gallons")
  - 🔵 System Age
  - 🔵 GPS Coordinates
  - 🔵 Distance from Address

### 4. Test Other Addresses
- [ ] **332 NE 114 Street, Miami, FL 33161** (OSTDS Repair)
- [ ] **1234 NW 79th Street, Miami, FL 33147** (Basic data)
- [ ] Any Virginia address (Fairfax County)
- [ ] Any California address (Sonoma County)

### 5. Check Recent Reports
- [ ] Navigate back to dashboard
- [ ] Verify "Recent Reports" shows your generated reports
- [ ] Click on a recent report to view it again

### 6. Test Satellite Map
- [ ] Verify the satellite map loads
- [ ] Check that the tank location marker appears
- [ ] Verify coordinates match the data

---

## Test Mode Stripe Checkout (After Creating Test Price)

1. Click "Subscribe Now" on `/inspector-pro`
2. Use Stripe test card: **4242 4242 4242 4242**
3. Expiry: Any future date (e.g., 12/25)
4. CVC: Any 3 digits (e.g., 123)
5. Complete checkout
6. Verify redirect to dashboard
7. Check Supabase `profiles` table updated with:
   - `subscription_tier`: 'inspector'
   - `subscription_status`: 'active'
   - `stripe_customer_id`: 'cus_...'

---

## Troubleshooting

### "No such price" Error
**Problem**: Site is using test mode keys but price was created in live mode

**Solution**: 
1. Create a test mode price (see above)
2. Update `lib/stripe.ts` with test price ID
3. OR switch to live mode keys in Vercel environment variables

### "Access Denied" on Dashboard
**Problem**: User doesn't have `inspector` subscription tier

**Solution**:
1. Manually update `profiles` table (see Option 1 above)
2. OR complete Stripe checkout with test card

### Reports Show "Unknown"
**Problem**: Florida geometry fix not complete OR address not in database

**Solution**:
1. Use test addresses listed above (known to have data)
2. Wait for Florida geometry fix to complete
3. Check Supabase `septic_tanks` table for the address

### No Verified Data Showing
**Problem**: Address is in a county without rich permit data

**Solution**:
- This is expected for some counties
- Use Miami-Dade addresses for best results
- System will show whatever data is available

---

## Production Deployment

When ready for production:

1. **Create Live Mode Price**:
   - Toggle Stripe to **Live mode**
   - Create same product/price as test mode
   - Copy the live price ID

2. **Update Environment Variables**:
   ```bash
   # In Vercel Dashboard → Settings → Environment Variables
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

3. **Update Code**:
   - Update `lib/stripe.ts` with live price ID
   - Commit and push

4. **Test Live Checkout**:
   - Use a real card OR Stripe test card in live mode
   - Verify webhook receives events
   - Check `profiles` table updates correctly

---

## Quick Reference

### Test Addresses (Rich Data)
- **2169 NW 90 Street, Miami, FL 33147** - OSTDS Abandonment, 200 GPD
- **332 NE 114 Street, Miami, FL 33161** - OSTDS Repair, 300 GPD

### Stripe Test Cards
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

### Key Database Tables
- `profiles` - User subscription status
- `septic_tanks` - Septic system data
- `usage` - Report generation logs

### Key Routes
- `/inspector-pro` - Landing page
- `/inspector-pro/dashboard` - Main dashboard
- `/inspector-pro/report?lat=X&lng=Y&address=ADDRESS` - Report view

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Vercel deployment logs
3. Check Supabase logs
4. Verify environment variables are set correctly
