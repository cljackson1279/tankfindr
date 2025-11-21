# Supabase Database Setup Instructions

## 📋 Quick Start

Follow these exact steps to create all your TankFindr database tables:

---

## Step 1: Open Supabase SQL Editor

1. Go to: **https://app.supabase.com**
2. Click on your **TankFindr project**
3. In the left sidebar, click **SQL Editor**
4. Click the **New Query** button (top right)

---

## Step 2: Copy the SQL Schema

**Option A: From the file**
1. Open the file: `SUPABASE_COMPLETE_SCHEMA.sql`
2. Select all (Ctrl+A / Cmd+A)
3. Copy (Ctrl+C / Cmd+C)

**Option B: From below**
Scroll down to see the complete schema at the bottom of this document.

---

## Step 3: Paste and Execute

1. **Paste** the entire SQL code into the SQL Editor
2. **Click the "Run" button** (or press Ctrl+Enter / Cmd+Enter)
3. **Wait** for execution (~5-10 seconds)
4. **Look for success message** at the bottom

You should see:
```
Success. No rows returned
```

---

## Step 4: Verify Tables Were Created

### Method 1: Table Editor
1. Click **Table Editor** in the left sidebar
2. You should see these 4 tables:
   - ✅ **profiles**
   - ✅ **tanks**
   - ✅ **usage**
   - ✅ **cache**

### Method 2: Run Verification Query
In SQL Editor, run this query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'tanks', 'usage', 'cache');
```

You should see all 4 table names listed.

---

## Step 5: Check RLS is Enabled

Run this query:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'tanks', 'usage', 'cache');
```

All tables should show `rowsecurity = true`

---

## Step 6: Test Profile Creation

1. Go to your TankFindr app
2. Sign up with a test email
3. Go back to Supabase → **Table Editor** → **profiles**
4. You should see a new row with your user ID

If you see the profile, everything is working! ✅

---

## 🔍 What Gets Created

### Tables (4)
1. **profiles** - User subscription and billing info
   - Tracks trial usage (5 free locates)
   - Tracks monthly usage
   - Stores Stripe customer ID
   - Stores subscription tier and status

2. **tanks** - Located septic tanks
   - GPS coordinates (lat/lng)
   - Confidence score
   - Depth estimate
   - Address

3. **usage** - Action logging
   - Every locate action
   - Timestamps
   - Metadata for analytics

4. **cache** - Offline functionality
   - Recent searches cached
   - Keeps last 50 entries

### Indexes (10)
- Performance optimization for queries
- Geospatial index for tank locations
- User ID indexes for fast lookups

### RLS Policies (15)
- Users can only see their own data
- Service role can manage all data (for webhooks)
- Secure by default

### Functions (3)
1. **handle_new_user()** - Auto-creates profile on signup
2. **clean_old_cache()** - Removes old cache entries
3. **update_updated_at_column()** - Auto-updates timestamps

### Triggers (2)
1. **on_auth_user_created** - Runs when user signs up
2. **update_profiles_updated_at** - Runs on profile updates

---

## 🔧 Troubleshooting

### Error: "extension postgis does not exist"

**Solution:**
1. Go to **Database** → **Extensions** in Supabase
2. Search for "postgis"
3. Click **Enable**
4. Run the schema again

### Error: "permission denied"

**Solution:**
Make sure you're logged into the correct Supabase project and have admin access.

### Error: "relation already exists"

**Solution:**
This is fine! The schema uses `IF NOT EXISTS`, so it won't overwrite existing tables. You can safely run it again.

### Tables don't appear in Table Editor

**Solution:**
1. Refresh the page
2. Check the SQL Editor for error messages
3. Try running the verification query

### Profile not created on signup

**Solution:**
1. Check if trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
2. If missing, run the schema again
3. Check Supabase logs for errors

---

## 📊 Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         auth.users                          │
│                    (Supabase built-in)                      │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ (1:1)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                         profiles                            │
├─────────────────────────────────────────────────────────────┤
│ • id (FK to auth.users)                                     │
│ • stripe_customer_id                                        │
│ • subscription_tier (starter/pro/enterprise)                │
│ • subscription_status                                       │
│ • trial_locates_used (max 5)                               │
│ • monthly_locates_used                                      │
│ • current_period_start/end                                  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ (1:many)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                          tanks                              │
├─────────────────────────────────────────────────────────────┤
│ • id                                                        │
│ • user_id (FK to profiles)                                  │
│ • address                                                   │
│ • lat, lng (GPS coordinates)                                │
│ • confidence_score                                          │
│ • depth_estimate                                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                          usage                              │
├─────────────────────────────────────────────────────────────┤
│ • id                                                        │
│ • user_id (FK to profiles)                                  │
│ • action ('locate', etc.)                                   │
│ • metadata (JSONB)                                          │
│ • created_at                                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                          cache                              │
├─────────────────────────────────────────────────────────────┤
│ • id                                                        │
│ • address (unique)                                          │
│ • data (JSONB - cached results)                             │
│ • created_at                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Success Checklist

After running the schema, verify:

- [ ] All 4 tables appear in Table Editor
- [ ] RLS is enabled on all tables
- [ ] PostGIS extension is enabled
- [ ] Test user signup creates profile automatically
- [ ] No error messages in SQL Editor

---

## 🎯 Next Steps

Once your database is set up:

1. ✅ **Database setup complete!**
2. 🔴 Get Stripe API keys
3. 🔴 Add environment variables to Vercel
4. 🔴 Deploy to Vercel
5. 🔴 Test the complete flow

---

## 📞 Need Help?

If you run into issues:

1. Check the error message in SQL Editor
2. Look at Supabase logs (Logs section in sidebar)
3. Verify you're in the correct project
4. Try running the schema again (it's safe)

---

## 🔒 Security Notes

- ✅ RLS policies ensure data isolation
- ✅ Users can only access their own data
- ✅ Service role bypasses RLS for webhooks
- ✅ All sensitive operations are server-side
- ✅ Audit trail via usage table

Your database is production-ready and secure! 🎉
