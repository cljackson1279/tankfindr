# Namecheap Email Setup Guide
**Email:** support@tankfindr.com

---

## Part 1: Configure Email in Namecheap

### Step 1: Access Email Settings

1. Go to: https://www.namecheap.com/myaccount/login/
2. Sign in to your Namecheap account
3. Click **Domain List** in the left sidebar
4. Find **tankfindr.com** and click **Manage**
5. Click the **Email** tab

---

### Step 2: Choose Email Hosting Option

Namecheap offers several options:

#### Option A: Private Email (Recommended - $0.99/month)
**Best for:** Professional email with webmail access

1. Click **Add Email** or **Get Private Email**
2. Select **Private Email** plan
3. Choose billing cycle (annual is cheaper)
4. Complete purchase
5. Once activated, click **Manage** next to Private Email
6. Create mailbox: `support@tankfindr.com`
7. Set a strong password
8. Access webmail at: https://privateemail.com/

**Features:**
- ✅ 3GB storage per mailbox
- ✅ Webmail access (check email in browser)
- ✅ IMAP/SMTP support (use with Gmail, Outlook, Apple Mail)
- ✅ Mobile app support
- ✅ Professional appearance

---

#### Option B: Email Forwarding (Free)
**Best for:** Forwarding to your existing email (e.g., Gmail)

1. In the **Email** tab, scroll to **Email Forwarding**
2. Click **Add Forwarder**
3. Enter:
   - **Alias:** `support`
   - **Forward to:** Your personal email (e.g., cljackson79@gmail.com)
4. Click **Add Forwarder**
5. Verify the forwarding email if prompted

**Features:**
- ✅ Free
- ✅ Receive emails at your existing inbox
- ❌ Cannot send FROM support@tankfindr.com (will show your personal email)
- ❌ Less professional for replies

---

#### Option C: Use Gmail with Custom Domain (Free)
**Best for:** Using Gmail interface with custom domain

**Requirements:**
- Google Workspace account (starts at $6/user/month)
- OR use Gmail's "Send mail as" feature (free but requires SMTP setup)

**Setup:**
1. Set up email forwarding (Option B above)
2. In Gmail, go to **Settings** → **Accounts and Import**
3. Click **Add another email address**
4. Enter: `support@tankfindr.com`
5. Use Namecheap's SMTP settings:
   - **SMTP Server:** `mail.privateemail.com` (if using Private Email)
   - **Port:** 587
   - **Username:** support@tankfindr.com
   - **Password:** Your email password
6. Verify the email address

---

### Step 3: Configure DNS Records (If Needed)

If you chose Private Email or another provider, verify these DNS records exist:

1. Go to **Domain List** → **Manage** → **Advanced DNS**
2. Check for these records:

**MX Records:**
```
Type: MX Record
Host: @
Value: mx1.privateemail.com
Priority: 10

Type: MX Record
Host: @
Value: mx2.privateemail.com
Priority: 10
```

**TXT Record (SPF):**
```
Type: TXT Record
Host: @
Value: v=spf1 include:spf.privateemail.com ~all
```

These are usually added automatically by Namecheap.

---

### Step 4: Test Email

1. Send a test email TO: support@tankfindr.com
2. Check if you receive it (webmail or forwarded inbox)
3. Reply FROM: support@tankfindr.com
4. Verify the recipient receives it with correct sender

---

## Part 2: Add Email Links to Website

### What is a mailto link?

A `mailto:` link opens the user's default email client with your email pre-filled:

```html
<a href="mailto:support@tankfindr.com">support@tankfindr.com</a>
```

When clicked, it opens:
- Gmail (if using Chrome/Gmail)
- Outlook (if using Outlook)
- Apple Mail (if on Mac/iPhone)
- Default email app on the device

---

### Advanced mailto Features

You can pre-fill subject and body:

```html
<a href="mailto:support@tankfindr.com?subject=Support%20Request&body=Hi%20TankFindr%20team,">
  Contact Support
</a>
```

This opens email with:
- **To:** support@tankfindr.com
- **Subject:** Support Request
- **Body:** Hi TankFindr team,

---

## Part 3: Where to Add Email Links

### Pages to Update:

1. **Footer** (all pages)
   - Add support email with mailto link

2. **Contact/FAQ Page**
   - Add "Email us at: support@tankfindr.com"
   - Make it clickable

3. **Error Pages**
   - Add "Contact support@tankfindr.com for help"

4. **Account Settings**
   - Add "Need help? Email support@tankfindr.com"

5. **Pricing Pages**
   - Add "Questions? Email support@tankfindr.com"

---

## Part 4: Email Best Practices

### Auto-Reply Setup

Consider setting up an auto-reply in Namecheap:

**Subject:** We received your message

**Body:**
```
Hi there,

Thank you for contacting TankFindr! We've received your message and will respond within 24 hours.

In the meantime, check out our FAQ: https://tankfindr.com/faq

Best regards,
TankFindr Team
```

---

### Email Signature

Create a professional signature:

```
Chris Jackson
Founder, TankFindr
support@tankfindr.com
https://tankfindr.com

Find septic tanks faster with verified government data.
```

---

## Recommended Setup

**For your use case, I recommend:**

1. **Option A: Private Email ($0.99/month)**
   - Professional appearance
   - Can send and receive as support@tankfindr.com
   - Webmail access from anywhere
   - Can forward to Gmail if you want

2. **OR Option C: Gmail with forwarding (Free)**
   - Forward support@tankfindr.com → cljackson79@gmail.com
   - Set up "Send mail as" in Gmail
   - Use Gmail interface you're familiar with
   - Still looks professional to users

---

## Quick Start Checklist

### Namecheap Setup:
- [ ] Log in to Namecheap
- [ ] Go to Domain List → tankfindr.com → Manage
- [ ] Click Email tab
- [ ] Choose Private Email or Email Forwarding
- [ ] Create support@tankfindr.com mailbox
- [ ] Test sending and receiving emails

### Website Updates:
- [ ] Add mailto links to footer
- [ ] Add to FAQ page
- [ ] Add to pricing pages
- [ ] Add to error messages
- [ ] Test clicking email links

---

## Testing

After setup:

1. **Test Receiving:**
   - Send email to support@tankfindr.com from your personal email
   - Verify you receive it

2. **Test Sending:**
   - Reply to that email FROM support@tankfindr.com
   - Check if it arrives with correct sender

3. **Test Website Links:**
   - Click email link on website
   - Verify it opens email client
   - Verify support@tankfindr.com is in "To:" field

---

## Troubleshooting

### "Email not delivered"
- Check MX records in DNS settings
- Wait 24-48 hours for DNS propagation
- Verify mailbox was created correctly

### "Cannot send from support@tankfindr.com"
- Check SMTP settings
- Verify password is correct
- Enable "Less secure app access" if using Gmail

### "mailto link doesn't work"
- User might not have email client configured
- Provide alternative: "Or email us at support@tankfindr.com"
- Consider adding a contact form as backup

---

## Next Steps

Once email is working:

1. ✅ Add email to all website pages
2. ✅ Set up auto-reply
3. ✅ Create email signature
4. ✅ Test thoroughly
5. ✅ Update Privacy Policy with email address
6. ✅ Update Terms & Conditions with email address

---

## Cost Summary

**Option A: Private Email**
- $0.99/month (billed annually: ~$12/year)
- Professional, full-featured

**Option B: Email Forwarding**
- Free
- Basic functionality

**Option C: Google Workspace**
- $6/user/month ($72/year)
- Full Gmail features with custom domain

**Recommendation:** Start with Private Email ($12/year) for professional appearance and full functionality.
