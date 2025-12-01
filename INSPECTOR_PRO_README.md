# Inspector Pro Implementation Guide

## Overview

TankFindr Inspector Pro is a $79/month subscription service for home inspectors that provides unlimited professional septic system reports with verified permit data.

---

## Features

### ✅ **Subscription Model**
- **Price**: $79/month
- **Stripe Price ID**: `price_1SZMs6Rsawlh5ooWuJ5X98xG`
- **Stripe Product ID**: `prod_TWPhXsVvhD7J1W`
- **Reports**: Unlimited
- **Trial**: 7 days (inherited from Stripe checkout settings)

### ✅ **Data Extraction**

The system now extracts rich Florida-specific data from the `septic_tanks` table:

#### Verified Information (from permit records):
- **System Type** (`SYSTTYPE`): "OSTDS Abandonment", "OSTDS Repair", "OSTDS Existing", etc.
- **Permit Number** (`APNO`): e.g., "AP1267843"
- **System Capacity** (`ESTIMGPD`): Gallons Per Day rating (200, 300, 400 GPD)
- **Lot Size** (`ACREAGE` or `ACRES`): Property acreage
- **Property Type** (`COMRESID`): "Residential" or "Commercial"
- **Water Supply** (`WSUPLTYP`): "SDWA Community", "SDWA Transient non community", etc.
- **Approval Status** (`FINSYSAPRV`): "Approved", etc.
- **Approval Date** (`APPRDATE`): Timestamp converted to readable date
- **Final Inspection** (`FINALINSP`): Timestamp converted to readable date
- **Tax Folio** (`FOLIO` or `GEOFOLIO`): Tax parcel folio number
- **System Address** (`SYSTADDR`): Often cleaner than main address

#### Inferred Information (calculated):
- **Estimated Tank Size**: Calculated from GPD capacity
  - 200 GPD → 750-1000 gallons
  - 300 GPD → 1000-1250 gallons
  - 400 GPD → 1250-1500 gallons
  - 400+ GPD → 1500+ gallons
- **System Age**: Calculated from approval date
- **Distance from Address**: Calculated from GPS coordinates
- **GPS Coordinates**: From county GIS data (after geometry fix)

---

## Pages & Routes

### 1. **Landing Page** (`/inspector-pro`)
- Pricing information
- Feature list
- Subscribe button (redirects to Stripe Checkout)
- Requires authentication (redirects to login if not signed in)

### 2. **Dashboard** (`/inspector-pro/dashboard`)
- Address search with Mapbox autocomplete
- Recent reports list
- Generate report button
- Subscription management link
- **Access Control**: Requires active `inspector` tier subscription

### 3. **Report Page** (`/inspector-pro/report`)
- Query params: `?lat=X&lng=Y&address=ADDRESS`
- Displays verified and inferred information
- Satellite map with tank location marker
- Download PDF button (placeholder for future implementation)
- **Access Control**: Requires active `inspector` tier subscription

---

## Database Schema

### Subscription Tracking

The `profiles` table tracks subscription status:

```sql
subscription_tier: 'inspector'
subscription_status: 'active'
stripe_customer_id: 'cus_...'
```

### Usage Tracking

The `usage` table logs report generation:

```sql
INSERT INTO usage (user_id, action_type, metadata)
VALUES (
  'user-uuid',
  'inspector_report',
  '{
    "lat": 25.8367,
    "lng": -80.22776,
    "address": "2169 NW 90 Street, Miami, FL 33147",
    "classification": "septic"
  }'
);
```

---

## Code Updates

### 1. **`lib/septicLookup.ts`**

Enhanced `extractSystemInfo()` function to extract Florida-specific attributes:

```typescript
// FLORIDA-SPECIFIC RICH DATA EXTRACTION
if (attrs.SYSTTYPE) {
  systemInfo.type = attrs.SYSTTYPE;
  systemInfo.systemTypeVerified = true;
}

if (attrs.APNO) {
  systemInfo.permitNumber = attrs.APNO;
  systemInfo.permitNumberVerified = true;
}

if (attrs.ESTIMGPD) {
  systemInfo.capacity = `${attrs.ESTIMGPD} GPD`;
  systemInfo.capacityVerified = true;
  // Estimate tank size from GPD
  const gpd = parseInt(attrs.ESTIMGPD);
  if (gpd <= 200) {
    systemInfo.estimatedTankSize = "750-1000 gallons";
  } else if (gpd <= 300) {
    systemInfo.estimatedTankSize = "1000-1250 gallons";
  } else if (gpd <= 400) {
    systemInfo.estimatedTankSize = "1250-1500 gallons";
  } else {
    systemInfo.estimatedTankSize = "1500+ gallons";
  }
}

// ... and many more fields
```

### 2. **`lib/stripe.ts`**

Added `inspector` tier to TIERS configuration:

```typescript
inspector: {
  name: 'Inspector Pro',
  price: 79,
  locates: 999999, // Unlimited
  priceId: 'price_1SZMs6Rsawlh5ooWuJ5X98xG',
  overage: 0 // No overage for unlimited plan
}
```

---

## Stripe Integration

### Products & Prices

| Product | Price ID | Amount | Interval |
|---------|----------|--------|----------|
| TankFindr Inspector Pro | `price_1SZMs6Rsawlh5ooWuJ5X98xG` | $79.00 | month |

### Checkout Flow

1. User clicks "Subscribe Now" on `/inspector-pro`
2. System creates Stripe Checkout session via `/api/create-checkout-session`
3. User completes payment on Stripe
4. Stripe webhook updates `profiles` table with subscription status
5. User redirected to `/inspector-pro/dashboard`

### Webhook Handling

The existing webhook handler (`/api/webhooks/stripe`) should automatically handle:
- `checkout.session.completed` → Set subscription_tier = 'inspector'
- `customer.subscription.updated` → Update subscription_status
- `customer.subscription.deleted` → Set subscription_status = 'canceled'

---

## Florida Data Coverage

### Current Status

- **Total Florida Records**: 2,081,191
- **Records with Rich Data**: ~50,000+ (Miami-Dade and other counties)
- **Geometry Fix Status**: In progress (see `FIX_FLORIDA_GEOMETRIES.md`)

### Data Quality by Field

| Field | Coverage | Notes |
|-------|----------|-------|
| SYSTTYPE | ~50% | Miami-Dade, Broward, Palm Beach have this |
| APNO | ~50% | Permit numbers available in major counties |
| ESTIMGPD | ~50% | Capacity ratings in major counties |
| ACREAGE | ~90% | Most records have lot size |
| COMRESID | ~50% | Property type in major counties |
| WSUPLTYP | ~50% | Water supply type in major counties |
| APPRDATE | ~50% | Approval dates in major counties |
| FINALINSP | ~30% | Final inspection dates less common |

### Expanding Coverage

To add more states or improve Florida coverage:

1. Run additional import scripts (see `IMPORT_SCRIPTS_GUIDE.md`)
2. Update `extractSystemInfo()` to handle new field names
3. Test with sample addresses from new data sources

---

## Testing

### Test Addresses (Florida)

#### Miami-Dade (Rich Data):
- **2169 NW 90 Street, Miami, FL 33147**
  - System Type: OSTDS Abandonment
  - Permit: AP1267843
  - Capacity: 200 GPD
  - Approval Date: December 19, 2016

- **332 NE 114 Street, Miami, FL 33161**
  - System Type: OSTDS Repair
  - Permit: AP857989
  - Capacity: 300 GPD
  - Approval Date: May 6, 2008

#### Other Counties (Basic Data):
- **1234 NW 79th Street, Miami, FL 33147**
  - Has septic data but may have limited attributes

### Testing Checklist

- [ ] Subscribe to Inspector Pro (use test Stripe card)
- [ ] Access dashboard
- [ ] Search for test address
- [ ] Generate report
- [ ] Verify "Verified" fields show green checkmarks
- [ ] Verify "Inferred" fields show blue info icons
- [ ] Check GPS coordinates are correct
- [ ] Verify satellite map loads
- [ ] Check recent reports list
- [ ] Test PDF download (when implemented)
- [ ] Cancel subscription and verify access is revoked

---

## Future Enhancements

### Short Term
1. **PDF Generation**: Implement actual PDF download using `jsPDF` or server-side rendering
2. **Logo Upload**: Allow inspectors to add their company logo to reports
3. **Custom Branding**: Let inspectors customize report colors/fonts
4. **Email Reports**: Send reports directly to clients

### Medium Term
5. **Multi-State Expansion**: Add Virginia, California, New Mexico data
6. **Drainfield Estimation**: Use AI to estimate drainfield location from satellite imagery
7. **Compliance Notes**: Add FHA/VA compliance indicators
8. **Historical Reports**: Show permit history and past inspections

### Long Term
9. **Mobile App**: Native iOS/Android app for field use
10. **Offline Mode**: Download reports for offline access
11. **Batch Processing**: Upload CSV of addresses, get bulk reports
12. **API Access**: Let inspectors integrate with their own systems

---

## Deployment

### Environment Variables

Make sure these are set in Vercel:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://cijtllcbrvkbvrjriweu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...

# Site
NEXT_PUBLIC_SITE_URL=https://tankfindr.com
```

### Deployment Steps

1. Push code to GitHub (already done)
2. Vercel automatically deploys
3. Test on staging/production
4. Monitor Stripe dashboard for subscriptions
5. Check Supabase for usage logs

---

## Support & Maintenance

### Common Issues

**Issue**: Reports show "Unknown" classification
- **Cause**: Geometry fix not complete
- **Solution**: Run Florida geometry fix script (see `FIX_FLORIDA_GEOMETRIES.md`)

**Issue**: No verified data showing
- **Cause**: Address is in county without rich data
- **Solution**: Expected behavior for some counties; system will show what's available

**Issue**: Subscription not activating
- **Cause**: Webhook not received from Stripe
- **Solution**: Check Stripe webhook logs, verify endpoint is configured

### Monitoring

- **Stripe Dashboard**: Monitor subscriptions, revenue, churn
- **Supabase**: Check `usage` table for report generation volume
- **Vercel**: Monitor page load times, errors
- **User Feedback**: Collect feedback from inspectors on data accuracy

---

## Contact

For questions or issues:
- **GitHub**: https://github.com/cljackson1279/tankfindr
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Supabase Dashboard**: https://supabase.com/dashboard

---

## Changelog

### 2024-11-30
- ✅ Created Inspector Pro subscription tier ($79/month)
- ✅ Enhanced septic data extraction for Florida attributes
- ✅ Built Inspector Pro landing page
- ✅ Built Inspector Pro dashboard with address search
- ✅ Built professional report page with verified/inferred data
- ✅ Integrated Stripe checkout and subscription management
- ✅ Added usage tracking for report generation
- ✅ Deployed to production via GitHub → Vercel

### Next Release
- ⏳ PDF generation
- ⏳ Logo upload
- ⏳ Email reports
