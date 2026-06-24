# Website Health Monitor — Local Setup Guide

> **Stack**: Next.js 16, TypeScript, TailwindCSS v4, Prisma 7, PostgreSQL, Auth.js v5

---

## Prerequisites

Install these before starting:

| Tool | Version | Download |
|---|---|---|
| Node.js | 20+ (LTS) | https://nodejs.org |
| pnpm / npm | any | comes with Node.js |
| PostgreSQL | 15+ | https://www.postgresql.org/download/ |
| Git | any | https://git-scm.com |

---

## Step 1 — Clone & Install Dependencies

```bash
cd d:\saas
npm install
```

> `.npmrc` already contains `legacy-peer-deps=true` to handle peer conflicts between Next.js 16 and Auth.js v5.

---

## Step 2 — Create Your `.env.local` File

Create a file at `d:\saas\.env.local` and fill in each value as described below.

```env
# ─────────────────────────────────────────────
# DATABASE (PostgreSQL)
# ─────────────────────────────────────────────
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/healthmonitor"

# ─────────────────────────────────────────────
# AUTH.JS v5
# ─────────────────────────────────────────────
AUTH_SECRET="your-random-secret-here"

# ─────────────────────────────────────────────
# APP URL
# ─────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"

# ─────────────────────────────────────────────
# EMAIL
# ─────────────────────────────────────────────
# Shown as the sender on all emails (required)
EMAIL_FROM="LoopNode <your-gmail@gmail.com>"

# Gmail / personal address → SMTP (required for @gmail.com, @yahoo.com, etc.)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="your-google-app-password"

# Optional: inbox for contact form submissions (defaults to EMAIL_FROM)
# SUPPORT_EMAIL="support@yourdomain.com"
```

---

## Step 3 — Get Each API Key / Credential

### 3A — PostgreSQL Database

**Option A: Local PostgreSQL (Free)**

1. Install PostgreSQL from https://www.postgresql.org/download/windows/
2. During install, set a password for the `postgres` user
3. Open pgAdmin or psql and run:
   ```sql
   CREATE DATABASE healthmonitor;
   ```
4. Your connection string:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/healthmonitor"
   ```

**Option B: Supabase (Free cloud, recommended)**

1. Go to https://supabase.com → Sign up (free)
2. Create a new project
3. Go to **Project Settings → Database → Connection string → URI**
4. Copy the URI — it looks like:
   ```
   postgresql://postgres.abcxyz:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```
5. Replace `[PASSWORD]` with the database password you set during project creation
6. Paste it as `DATABASE_URL`

**Option C: Neon (Free cloud, serverless)**

1. Go to https://neon.tech → Sign up (free)
2. Create a new project
3. Go to **Dashboard → Connection Details**
4. Copy the connection string (starts with `postgresql://`)
5. Paste it as `DATABASE_URL`

---

### 3B — AUTH_SECRET (Required)

This is just a random secret string used to sign JWT tokens. Generate one:

```bash
# Run in terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Or use the online generator: https://generate-secret.vercel.app/32

Paste the output as `AUTH_SECRET`.

---

### 3C — Email via SMTP (verify, password reset, contact form, newsletter)

All emails are sent through **SMTP**. Add these to **`.env.local`**:

```env
EMAIL_FROM="LoopNode <your-gmail@gmail.com>"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="your-google-app-password"
```

#### Gmail setup

1. Go to https://myaccount.google.com
2. **Security → 2-Step Verification** → turn it ON
3. **Security → App Passwords** → create one for **Mail**
4. Copy the 16-character password (remove spaces) → `SMTP_PASS`

#### Optional

```env
SUPPORT_EMAIL="support@yourdomain.com"
```

Contact form emails go here; defaults to `EMAIL_FROM` if omitted.

#### `.env` vs `.env.local`

| File | Purpose |
|---|---|
| **`.env.local`** | Real secrets for local dev (git-ignored) |
| **`.env`** | Prisma / template only — no real passwords |
| **`.env.example`** | Reference list of all keys |

#### Mailhog (local testing — no real delivery)

1. Install: https://github.com/mailhog/MailHog/releases
2. Run `MailHog.exe`
3. In `.env.local`:

```env
EMAIL_FROM="LoopNode <test@test.com>"
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_USER="test"
SMTP_PASS="test"
```

4. View captured emails at http://localhost:8025

---

## Step 4 — Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to your database (creates all tables)
npx prisma db push

# (Optional) Seed with demo data
# npx prisma db seed
```

Verify tables were created:

```bash
npx prisma studio
```

This opens a browser UI at http://localhost:5555 where you can browse all tables.

---

## Step 5 — Run the App

```bash
npm run dev
```

Open http://localhost:3000

---

## Step 6 — Create Your First Account

1. Go to http://localhost:3000/register
2. Fill in name, email, password
3. You'll be redirected to the dashboard

> **Note**: Email verification is required in production. For local dev, if SMTP isn't set up yet, you can skip verification by manually setting `emailVerified` in Prisma Studio.

---

## All Available Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/register` | Sign up |
| `/login` | Sign in |
| `/forgot-password` | Password reset request |
| `/dashboard` | Overview with stats |
| `/dashboard/websites` | All connected websites (grid + table view) |
| `/dashboard/websites/[id]` | Website health overview with gauges & chart |
| `/dashboard/websites/[id]/performance` | Performance audit issues |
| `/dashboard/websites/[id]/accessibility` | Accessibility (A11Y) issues |
| `/dashboard/websites/[id]/seo` | SEO issues |
| `/dashboard/websites/[id]/security` | Security header issues |
| `/dashboard/websites/[id]/broken-links` | Broken link checker |
| `/dashboard/websites/[id]/settings` | Edit website / delete |
| `/pricing` | Pricing page |
| `/features` | Features page |
| `/contact` | Contact page |
| `/admin` | Admin overview (requires `ADMIN` role) |
| `/admin/users` | User management |
| `/admin/websites` | Cross-tenant websites |
| `/admin/billing` | Subscriptions + manual overrides |
| `/admin/newsletter` | Newsletter subscribers |
| `/admin/contacts` | Support inbox |

> **Admin access:** In Prisma Studio, set a user's `role` to `ADMIN`, then sign out and back in. Admin link appears in the sidebar.

---

## Testing the Scan Engine

The audit engine runs **real scans** using Lighthouse (performance), axe-core (accessibility), Cheerio (SEO), and HTTP header checks (security). Broken links are checked separately on the Broken Links page.

1. Go to `/dashboard/websites` → Connect a Website
2. Open the website → click **Run Audit** (Lighthouse + axe + SEO + security)
3. For broken links, go to **Broken Links** → choose Internal or External → **Check Broken Links**

> Audits can take 30–90 seconds. Broken link scans crawl all internal pages and show live progress.

---

## Common Issues

### `PrismaClientInitializationError`
Your `DATABASE_URL` is wrong or PostgreSQL isn't running.
- Check the URL format: `postgresql://user:pass@host:port/dbname`
- Make sure PostgreSQL service is running

### `AUTH_SECRET` error on startup
Run `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` and set the output as `AUTH_SECRET`.

### Port 3000 in use
```bash
# Kill the process using port 3000
npx kill-port 3000
npm run dev
```

### `Could not find Chrome` when running audits
Puppeteer needs Chrome for Lighthouse and accessibility scans.

```bash
npx puppeteer browsers install chrome
```

If you already have Google Chrome installed, audits will also try to use it automatically. You can point to a custom binary with:

```env
CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

### TypeScript errors in VS Code about missing modules
Press `Ctrl+Shift+P` → **TypeScript: Restart TS Server**. The files exist — this is just a stale language server cache.

---

## Environment Variable Quick Reference

```env
# REQUIRED — app won't start without these
DATABASE_URL=          # PostgreSQL connection string
AUTH_SECRET=           # Random 32-byte base64 string
NEXTAUTH_URL=          # http://localhost:3000

# OPTIONAL — email features won't work without these
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

---

## Minimum Setup (Fastest Path)

If you just want to run the app quickly:

1. Create a free [Supabase](https://supabase.com) project → get `DATABASE_URL`
2. Run `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` → get `AUTH_SECRET`
3. Create `.env.local` with just those 3 values + `NEXTAUTH_URL=http://localhost:3000`
4. Run `npx prisma db push && npm run dev`
5. Open http://localhost:3000 → Register → Done

Email features (verify email, forgot password) will show errors without SMTP configured, but the core scan/audit features work immediately.
