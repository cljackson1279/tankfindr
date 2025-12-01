# Email DNS Verification Guide
**Email:** support@tankfindr.com  
**Provider:** Namecheap Private Email

---

## ✅ Your DNS Records Are Correct!

The DNS records you have are **exactly right** for Namecheap Private Email:

```
Hostname: @
Record type: MX
Priority: 10
Value: mx1.privateemail.com

Hostname: @
Record type: MX
Priority: 10
Value: mx2.privateemail.com

Hostname: @
Record type: TXT
Value: v=spf1 include:spf.privateemail.com ~all
```

---

## What Each Record Does

### MX Records (Mail Exchange)
**Purpose:** Tell the internet where to send emails for @tankfindr.com

- `mx1.privateemail.com` - Primary mail server
- `mx2.privateemail.com` - Backup mail server
- Priority: 10 (both have same priority for load balancing)

**What it means:** When someone sends email to support@tankfindr.com, the internet looks up these MX records and delivers the email to Namecheap's servers.

---

### TXT Record (SPF - Sender Policy Framework)
**Purpose:** Prevent email spoofing and improve deliverability

`v=spf1 include:spf.privateemail.com ~all`

**What it means:**
- `v=spf1` - This is an SPF record
- `include:spf.privateemail.com` - Namecheap's servers are authorized to send email from @tankfindr.com
- `~all` - Soft fail for other servers (mark as suspicious but don't reject)

**Why it's important:**
- ✅ Prevents spam filters from blocking your emails
- ✅ Shows Gmail/Outlook that you're legitimate
- ✅ Improves email deliverability
- ✅ Protects your domain from spoofing

**Yes, you NEED this record!** Without it, your emails might go to spam.

---

## How Email and Website Work Together

### They're Completely Separate!

**Namecheap (Email):**
- Handles: support@tankfindr.com
- Uses: MX and TXT records
- Servers: mx1.privateemail.com, mx2.privateemail.com

**Vercel (Website):**
- Handles: tankfindr.com website
- Uses: A and CNAME records
- Servers: Vercel's CDN

**No connection needed!** They work independently using different DNS records.

---

## Your Complete DNS Setup

Here's what your full DNS should look like:

### Email Records (Namecheap Private Email)
```
Type: MX
Host: @
Value: mx1.privateemail.com
Priority: 10

Type: MX
Host: @
Value: mx2.privateemail.com
Priority: 10

Type: TXT
Host: @
Value: v=spf1 include:spf.privateemail.com ~all
```

### Website Records (Vercel)
```
Type: A
Host: @
Value: 76.76.21.21 (Vercel's IP)

Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

**Both work together!**
- Email goes to Namecheap servers
- Website traffic goes to Vercel servers

---

## Testing Your Email Setup

### Test 1: Send Email TO support@tankfindr.com

1. From your personal email (cljackson79@gmail.com), send a test email:
   - **To:** support@tankfindr.com
   - **Subject:** Test Email
   - **Body:** This is a test

2. Check Private Email webmail:
   - Go to: https://privateemail.com/
   - Sign in with: support@tankfindr.com
   - Check inbox for the test email

**Expected result:** Email arrives within 1-2 minutes

---

### Test 2: Send Email FROM support@tankfindr.com

1. Log in to Private Email webmail
2. Compose new email:
   - **To:** cljackson79@gmail.com
   - **Subject:** Test Reply
   - **Body:** Testing sending from support@tankfindr.com

3. Send the email

4. Check your Gmail inbox

**Expected result:**
- Email arrives in Gmail
- Sender shows as: support@tankfindr.com
- NOT marked as spam

---

### Test 3: Website mailto Links

1. Go to: https://tankfindr.com/faq
2. Scroll to bottom
3. Click "Email Support" button

**Expected result:**
- Your default email app opens
- "To:" field shows: support@tankfindr.com
- Subject is pre-filled (if applicable)

---

### Test 4: SPF Verification

1. Send email FROM support@tankfindr.com TO cljackson79@gmail.com
2. Open the email in Gmail
3. Click the three dots (⋮) → "Show original"
4. Look for SPF check

**Expected result:**
```
spf=pass (google.com: domain of support@tankfindr.com designates ... as permitted sender)
```

If it says `spf=pass`, your SPF record is working correctly!

---

## Troubleshooting

### "Email not delivered"

**Possible causes:**
1. DNS records not propagated yet (wait 24-48 hours)
2. Mailbox not created in Namecheap
3. MX records incorrect

**Solution:**
- Check DNS propagation: https://dnschecker.org (search for tankfindr.com MX records)
- Verify mailbox exists in Namecheap Private Email dashboard
- Double-check MX record values

---

### "Email goes to spam"

**Possible causes:**
1. SPF record missing or incorrect
2. No DKIM record
3. Sending from new domain (needs reputation)

**Solution:**
- Verify SPF record exists: `v=spf1 include:spf.privateemail.com ~all`
- Add DKIM record (optional, improves deliverability)
- Send emails regularly to build reputation
- Ask recipients to mark as "Not Spam"

---

### "mailto link doesn't work"

**Possible causes:**
1. User doesn't have email client configured
2. Browser blocking mailto links

**Solution:**
- User can manually copy/paste: support@tankfindr.com
- Suggest using webmail (Gmail, Outlook.com)
- Provide alternative contact form (future enhancement)

---

## Optional: Add DKIM Record

DKIM (DomainKeys Identified Mail) further improves email deliverability.

### How to Add DKIM:

1. Log in to Namecheap Private Email
2. Go to **Settings** → **DKIM**
3. Copy the DKIM record provided
4. Add to Namecheap DNS:
   - **Type:** TXT
   - **Host:** (provided by Private Email, usually `default._domainkey`)
   - **Value:** (long string provided by Private Email)

**Not required, but recommended for better deliverability!**

---

## Email Best Practices

### 1. Set Up Email Signature

In Private Email webmail:
1. Go to **Settings** → **Signatures**
2. Create signature:

```
Chris Jackson
Founder, TankFindr
support@tankfindr.com
https://tankfindr.com

Find septic tanks faster with verified government data.
```

---

### 2. Set Up Auto-Reply (Optional)

For when you're away:

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

### 3. Forward to Gmail (Optional)

If you want to receive emails in Gmail:

1. In Private Email settings
2. Set up forwarding to: cljackson79@gmail.com
3. Keep copy in Private Email inbox (recommended)

**Benefits:**
- Get notifications on your phone
- Use Gmail's powerful search and filters
- Still have backup in Private Email

---

## Summary

### ✅ What's Working

- DNS records are correctly configured
- MX records point to Namecheap servers
- SPF record authorizes Namecheap to send email
- Website mailto links are live
- Email and website work independently

### ⏳ What to Test

- Send email TO support@tankfindr.com
- Send email FROM support@tankfindr.com
- Click mailto links on website
- Verify SPF pass in Gmail

### 📝 Optional Enhancements

- Add DKIM record for better deliverability
- Set up email signature
- Forward to Gmail for convenience
- Set up auto-reply

---

## Quick Reference

**Webmail Access:** https://privateemail.com/  
**Email Address:** support@tankfindr.com  
**Password:** (set in Namecheap)

**DNS Records Needed:**
- ✅ 2 MX records (mx1 and mx2.privateemail.com)
- ✅ 1 TXT record (SPF)
- ⭕ 1 TXT record (DKIM - optional)

**No Vercel connection needed!** Email and website are separate.

---

## Need Help?

If you have issues:

1. **Check DNS propagation:** https://dnschecker.org
2. **Verify mailbox exists:** Namecheap dashboard
3. **Test SPF:** Send email and check "Show original" in Gmail
4. **Contact Namecheap support:** For Private Email issues

---

**Your email is ready to use!** Just test sending and receiving to confirm everything works. 🎉
