# Cursor Integration Guide for TankFindr

This guide explains how to work with TankFindr in Cursor IDE, including setup, best practices, and AI-assisted development workflows.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Cursor Features for TankFindr](#cursor-features-for-tankfindr)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Using AI Features](#using-ai-features)
6. [Running Import Scripts](#running-import-scripts)
7. [Debugging](#debugging)
8. [Best Practices](#best-practices)

---

## Getting Started

### Opening the Project in Cursor

1. **Clone the repository** (if not already done):
   ```bash
   gh repo clone cljackson1279/tankfindr
   cd tankfindr
   ```

2. **Open in Cursor**:
   ```bash
   cursor .
   ```
   
   Or use **File → Open Folder** and select the `tankfindr` directory.

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables**:
   - Copy `.env.example` to `.env.local` (if it exists)
   - Or create `.env.local` with required variables:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     STRIPE_SECRET_KEY=your_stripe_secret
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable
     NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
     ```

5. **Start development server**:
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Cursor Features for TankFindr

### 1. **AI Chat (Cmd/Ctrl + L)**

Ask Cursor AI about the codebase:

**Example prompts:**
- "Explain how the septic tank location API works"
- "How do I add a new data source to the import scripts?"
- "What's the database schema for the septic_tanks table?"
- "Help me debug this Stripe webhook error"

### 2. **AI Edit (Cmd/Ctrl + K)**

Select code and ask AI to modify it:

**Example edits:**
- "Add error handling to this function"
- "Optimize this database query"
- "Add TypeScript types to this component"
- "Refactor this to use async/await"

### 3. **Composer (Cmd/Ctrl + I)**

Generate entire files or large code blocks:

**Example tasks:**
- "Create a new import script for King County, WA"
- "Generate a React component for displaying septic tank history"
- "Write a test suite for the locate API"

### 4. **Inline Autocomplete**

Cursor suggests code as you type:
- Press **Tab** to accept
- Press **Cmd/Ctrl + →** to accept word-by-word
- Keep typing to ignore

### 5. **Codebase Context**

Cursor indexes your entire codebase:
- Use `@` in chat to reference specific files
- Example: "@scripts/import-new-mexico-statewide.js explain this script"

---

## Project Structure

### Key Directories

```
tankfindr/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── locate-septic/        # Main septic location API
│   │   ├── webhooks/stripe/      # Stripe webhook handler
│   │   └── ...
│   ├── auth/                     # Authentication pages
│   ├── protected/                # Protected pages (requires login)
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── TankLocator.tsx          # Main tank locator UI
│   └── ui/                       # Reusable UI components
├── lib/                          # Utility libraries
│   ├── supabase/                 # Supabase clients
│   ├── stripe.ts                 # Stripe configuration
│   └── skyfi.ts                  # SkyFi API integration
├── scripts/                      # Import scripts
│   ├── import-new-mexico-statewide.js
│   ├── import-fairfax-county-va.js
│   ├── import-sonoma-county-ca.js
│   └── import-all-priority-sources.js
├── public/                       # Static assets
├── supabase/                     # Supabase migrations
├── *.md                          # Documentation files
└── package.json                  # Dependencies
```

### Important Files

| File | Purpose |
|------|---------|
| `app/api/locate-septic/route.ts` | Main API for locating septic tanks |
| `app/api/webhooks/stripe/route.ts` | Handles Stripe subscription events |
| `components/TankLocator.tsx` | Interactive map and location UI |
| `lib/supabase/client.ts` | Supabase client configuration |
| `SUPABASE_COMPLETE_SCHEMA.sql` | Complete database schema |
| `IMPORT_SCRIPTS_GUIDE.md` | Guide for import scripts |
| `VERCEL_DEPLOYMENT_GUIDE.md` | Deployment instructions |

---

## Development Workflow

### 1. **Start Development Server**

```bash
npm run dev
```

Access at [http://localhost:3000](http://localhost:3000)

### 2. **Make Changes**

Edit files in Cursor. Changes auto-reload in the browser.

### 3. **Test Changes**

- Test in browser
- Check console for errors
- Use Cursor's integrated terminal for commands

### 4. **Commit Changes**

Use Cursor's Git integration:
1. Click **Source Control** icon (left sidebar)
2. Review changes
3. Stage files (click `+` icon)
4. Enter commit message
5. Click **✓ Commit**
6. Click **⋯ → Push**

Or use terminal:
```bash
git add .
git commit -m "Your message"
git push origin main
```

### 5. **Deploy**

Vercel automatically deploys when you push to `main`.

---

## Using AI Features

### Creating New Import Scripts

**Prompt in Composer (Cmd/Ctrl + I):**

```
Create a new import script for King County, WA septic data.

Data source: https://example.com/FeatureServer/0
ID field: PERMIT_NO
County: King County
State: WA

Follow the same pattern as scripts/import-new-mexico-statewide.js
```

### Debugging API Issues

**Prompt in Chat (Cmd/Ctrl + L):**

```
@app/api/locate-septic/route.ts

I'm getting a 500 error when calling this API. 
The error message is: "Cannot read property 'lat' of undefined"

Help me debug this issue.
```

### Adding New Features

**Prompt in Composer:**

```
Add a feature to export septic tank search results to PDF.

Requirements:
- Button in TankLocator component
- Generate PDF with tank location, confidence score, and map image
- Use jspdf library (already installed)
```

### Refactoring Code

**Select code, then Cmd/Ctrl + K:**

```
Refactor this to use TypeScript interfaces and add proper error handling
```

---

## Running Import Scripts

### From Cursor Terminal

Open terminal in Cursor (`` Ctrl+` ``) and run:

```bash
# Run individual script
node scripts/import-new-mexico-statewide.js

# Run batch import
node scripts/import-all-priority-sources.js

# Run with logging
node scripts/import-new-mexico-statewide.js 2>&1 | tee logs/nm-import.log
```

### Setting Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Scripts will automatically load these variables.

### Monitoring Import Progress

Watch the terminal output:
- ✅ = Success
- ⚠️ = Warning (skipped records)
- ❌ = Error

Check Supabase dashboard to verify records are being inserted.

---

## Debugging

### Using Cursor's Debugger

1. Set breakpoints by clicking left of line numbers
2. Press **F5** to start debugging
3. Use debug console to inspect variables

### Console Logging

Add `console.log()` statements:

```typescript
console.log('Tank data:', tankData);
console.log('Coordinates:', { lat, lng });
```

View logs in:
- Browser console (F12)
- Cursor terminal (for API routes)
- Vercel logs (for production)

### Common Issues

#### "Module not found"

**Solution**: Install the missing package:
```bash
npm install <package-name>
```

#### "Environment variable not defined"

**Solution**: Add to `.env.local` and restart dev server.

#### "Supabase connection failed"

**Solution**: Check Supabase URL and keys in `.env.local`.

---

## Best Practices

### Code Organization

- Keep components small and focused
- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Put reusable logic in `lib/` directory

### Git Workflow

- Commit often with clear messages
- Use branches for major features
- Test before pushing to `main`
- Review changes before committing

### AI Usage

- Be specific in prompts
- Reference files with `@filename`
- Review AI-generated code before using
- Ask for explanations if unclear

### Performance

- Use React Server Components where possible
- Minimize client-side JavaScript
- Optimize images with Next.js Image component
- Cache API responses when appropriate

---

## Keyboard Shortcuts

### Cursor-Specific

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + L` | Open AI Chat |
| `Cmd/Ctrl + K` | AI Edit (inline) |
| `Cmd/Ctrl + I` | Open Composer |
| `Cmd/Ctrl + Shift + L` | Clear chat history |

### General IDE

| Shortcut | Action |
|----------|--------|
| `` Ctrl+` `` | Toggle terminal |
| `Cmd/Ctrl + P` | Quick file open |
| `Cmd/Ctrl + Shift + P` | Command palette |
| `Cmd/Ctrl + B` | Toggle sidebar |
| `Cmd/Ctrl + /` | Toggle comment |
| `F5` | Start debugging |

---

## Useful Cursor Rules

Create a `.cursorrules` file in the project root:

```
# TankFindr Cursor Rules

## Code Style
- Use TypeScript for all new files
- Follow Next.js App Router conventions
- Use async/await instead of .then()
- Add JSDoc comments for functions

## Import Scripts
- Follow the pattern in existing scripts
- Use batch processing (1000 records per batch)
- Add comprehensive error handling
- Log progress to console

## API Routes
- Validate all inputs
- Return proper HTTP status codes
- Use try/catch for error handling
- Add rate limiting for production

## Components
- Use React Server Components by default
- Add 'use client' only when needed
- Extract reusable logic to custom hooks
- Follow shadcn/ui component patterns
```

---

## Resources

### Documentation

- **TankFindr Docs**: See `*.md` files in project root
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Stripe**: [stripe.com/docs](https://stripe.com/docs)

### Cursor Resources

- **Cursor Docs**: [cursor.sh/docs](https://cursor.sh/docs)
- **Cursor Forum**: [forum.cursor.sh](https://forum.cursor.sh)
- **Cursor Discord**: [discord.gg/cursor](https://discord.gg/cursor)

---

## Quick Start Checklist

- [ ] Clone repository
- [ ] Open in Cursor
- [ ] Install dependencies (`npm install`)
- [ ] Create `.env.local` with environment variables
- [ ] Start dev server (`npm run dev`)
- [ ] Test in browser (http://localhost:3000)
- [ ] Make changes and commit
- [ ] Push to GitHub
- [ ] Vercel auto-deploys

---

## Tips for Working with Manus Agent

When working with Manus Agent in Cursor:

1. **Be specific**: "Add error handling to the import script" is better than "fix this"
2. **Reference files**: Use `@filename` to give context
3. **Ask for explanations**: "Explain how this works" before modifying
4. **Iterate**: Start simple, then refine with follow-up prompts
5. **Review code**: Always review AI-generated code before committing

---

**Last Updated**: November 25, 2025  
**Maintainer**: TankFindr Development Team
