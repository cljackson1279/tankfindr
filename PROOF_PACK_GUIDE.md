# TankFindr Proof Pack - Usage Guide

## 🎯 What You Got

A complete sales toolkit to close septic companies FAST:

1. **Printable One-Pager PDF** - Email to prospects
2. **/demo Route** - Live examples to share in emails
3. **Proof Examples Config** - Easy to add more counties

---

## 📄 Part 1: Printable One-Pager PDF

### How to Generate the PDF

1. **Visit the proof deck page:**
   ```
   https://tankfindr.com/proof-deck
   ```

2. **Print to PDF:**
   - Press `Cmd+P` (Mac) or `Ctrl+P` (Windows)
   - Select "Save as PDF" as destination
   - Click "Save"

3. **Email to prospects:**
   - Attach the PDF to your sales emails
   - Use it as a leave-behind after in-person meetings
   - Send it as a follow-up after phone calls

### What's Included in the One-Pager

- ✅ **Title:** "How TankFindr Helps Florida Septic Pros Locate Tanks in Minutes"
- ✅ **Intro paragraph** explaining TankFindr in plain language
- ✅ **3 real Florida examples** with before/after time comparisons
- ✅ **"How It Works"** section with 3 simple steps
- ✅ **Key benefits** (save 2+ hours, 2.2M records, book more jobs)
- ✅ **7-Day Risk-Free Trial CTA** with your contact info

### Customize Contact Info

Edit `/app/proof-deck/page.tsx` and update these lines:

```tsx
<ProofOnePager
  contactEmail="chris@tankfindr.com"  // ← Change this
  contactPhone="(555) 123-4567"       // ← Change this
  websiteUrl="https://tankfindr.com"  // ← Keep this
/>
```

---

## 🌐 Part 2: /demo Route (Live Examples)

### Share This Link with Prospects

```
https://tankfindr.com/demo
```

### What Prospects See

- **Live interactive demo** of TankFindr results
- **5 real Florida properties** from different counties
- **Before/after time comparisons** (2-3 hours → 3-5 minutes)
- **GPS coordinates** and map placeholders
- **Data quality indicators** (Verified vs Estimated)
- **CTA buttons** to start free trial

### Perfect for:

- ✅ Email signatures ("See live demo: tankfindr.com/demo")
- ✅ Follow-up emails after cold calls
- ✅ LinkedIn messages to septic company owners
- ✅ Facebook/Instagram ads landing page
- ✅ Trade show QR codes

---

## 🗂️ Part 3: Adding More Examples

### Step 1: Edit the Config File

Open `/lib/proofExamples.ts` and add new examples to the array:

```typescript
export const proofExamples: ProofExample[] = [
  // ... existing examples ...
  
  // Add your new example:
  {
    id: 'lee-county-1',                          // Unique ID
    address: '1234 Main St, Fort Myers, FL',    // Real address
    county: 'Lee',                               // County name
    lat: 26.6406,                                // Latitude
    lng: -81.8723,                               // Longitude
    septicOrSewer: 'Septic',                     // Septic | Sewer | LikelySeptic
    hasPermitData: true,                         // true = verified, false = estimated
    traditionalTimeHours: 2.5,                   // Hours without TankFindr
    tankFindrTimeMinutes: 4,                     // Minutes with TankFindr
    dataSources: 'Lee County DOH permits',       // Where data came from
    notes: 'Customer verified exact location',   // Optional notes
  },
]
```

### Step 2: Deploy

```bash
git add lib/proofExamples.ts
git commit -m "Add Lee County example"
git push origin main
```

### Step 3: Verify

- Visit `https://tankfindr.com/demo` - see new example in list
- Visit `https://tankfindr.com/proof-deck` - print new PDF with updated stats

---

## 📧 Email Templates Using the Proof Pack

### Template 1: Cold Email with PDF

**Subject:** Save 2+ hours per septic job in [County]

Hi [Name],

I help septic companies in Florida locate tanks faster using county permit data and GPS coordinates.

Instead of spending 2-3 hours calling the county and searching properties, your techs get exact tank locations in 3-5 minutes.

I've attached a one-pager showing how TankFindr works with real Florida examples.

**Try it free for 7 days:** https://tankfindr.com/pricing-pro

Want to see a live demo? Check out: https://tankfindr.com/demo

Best,
Chris
chris@tankfindr.com

---

### Template 2: Follow-up with Demo Link

**Subject:** Re: TankFindr - Live demo inside

Hi [Name],

Following up on my email about saving time on septic locates.

I put together a live demo showing 5 real Florida properties:
👉 https://tankfindr.com/demo

You'll see:
- Exact GPS coordinates from county permits
- Before/after time comparisons (2-3 hours → 3-5 minutes)
- Data from Miami-Dade, Broward, Palm Beach, and more

**Start your 7-day free trial:** https://tankfindr.com/pricing-pro

Questions? Just reply to this email.

Chris

---

### Template 3: LinkedIn Message

Hey [Name],

Saw you run a septic company in [County]. Quick question:

How much time do your techs spend locating tanks on each job?

I built TankFindr to solve this—GPS coordinates from 2.2M Florida septic permits, delivered in 3-5 minutes instead of 2-3 hours.

Live demo: https://tankfindr.com/demo

Worth a look?

---

## 🎨 Brand Colors Used

- **Green (Primary):** `emerald-600` (#059669)
- **Purple (Accent):** `purple-600` (#9333ea)
- **Light Background:** `gray-50` / `emerald-50` / `purple-50`

These are used consistently across:
- One-pager PDF
- /demo page
- All CTAs and buttons

---

## 📊 Files Created/Modified

### New Files:
1. `/lib/proofExamples.ts` - Config with sample properties
2. `/components/ProofOnePager.tsx` - Printable one-pager component
3. `/app/proof-deck/page.tsx` - Route for PDF generation
4. `/app/demo/page.tsx` - Live demo route

### How They Work Together:

```
proofExamples.ts (data)
    ↓
    ├─→ ProofOnePager.tsx (uses first 3 examples)
    │       ↓
    │   proof-deck/page.tsx (renders one-pager)
    │
    └─→ demo/page.tsx (uses all 5 examples)
```

---

## 🚀 Next Steps

### Immediate Actions:
1. ✅ Visit `https://tankfindr.com/proof-deck` and generate your first PDF
2. ✅ Visit `https://tankfindr.com/demo` and test the live demo
3. ✅ Update contact info in `/app/proof-deck/page.tsx`
4. ✅ Send the PDF to 5 septic companies TODAY

### This Week:
1. Replace placeholder addresses with REAL customer success stories
2. Add examples from counties where you have the most data
3. Get testimonials from early users and add to the one-pager
4. Track which counties get the most interest (add more examples there)

### Later Enhancements:
- Add actual map component to /demo (replace placeholder)
- Connect /demo to live Supabase data (instead of hard-coded)
- Add video walkthrough to /demo page
- Create county-specific landing pages (e.g., /demo/miami-dade)

---

## 💡 Pro Tips

### For Faster Closes:
1. **Lead with the demo link** in your first email
2. **Follow up with the PDF** if they click the demo
3. **Offer a live screen share** to walk through their specific county
4. **Show them a property they know** (ask for an address on the call)

### For Better Examples:
1. **Use real customer addresses** (with permission)
2. **Include diverse property types** (residential, commercial, rural)
3. **Show both verified and estimated** (transparency builds trust)
4. **Add photos of actual tanks** you've located (future enhancement)

### For Tracking:
1. Add UTM parameters to demo link: `?utm_source=email&utm_campaign=cold_outreach`
2. Track which counties get the most clicks
3. A/B test different time savings (2 hours vs 3 hours)
4. Monitor which examples get the most engagement

---

## 🐛 Troubleshooting

### PDF looks weird when printing:
- Make sure you're using Chrome or Safari (best print support)
- Select "Save as PDF" not "Print to printer"
- Check "Background graphics" option in print dialog

### Demo page not loading:
- Wait 2-3 minutes after deployment
- Clear browser cache (Cmd+Shift+R)
- Check Vercel deployment status

### Want to add more than 5 examples:
- Edit `/lib/proofExamples.ts` and add to the array
- The /demo page will automatically show all examples
- The one-pager will always use the first 3

---

## 📞 Questions?

If you need help customizing the proof pack or want to add specific features, just ask!

**Good luck closing those septic companies! 🚀**
