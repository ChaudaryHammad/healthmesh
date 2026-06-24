# LoopNode — Billing & Payments (Stripe Elements)

> **Status:** Planned — not implemented yet.  
> **Today:** `Subscription` records exist in the database; trial is created on register; `/admin/billing` supports manual overrides. Stripe is **not** connected.  
> **Goal:** Embedded card payments via **Stripe Elements** inside the app (not redirect Checkout), with webhooks, entitlements, and admin support tools.

Related docs: [PROGRESS.md](./PROGRESS.md) · [DEPLOY.md](./DEPLOY.md)

---

## Table of contents

1. [What we will build](#1-what-we-will-build)
2. [Plans & entitlements](#2-plans--entitlements)
3. [Architecture overview](#3-architecture-overview)
4. [Stripe setup (Dashboard)](#4-stripe-setup-dashboard)
5. [User flows](#5-user-flows)
6. [Non-user / visitor flows](#6-non-user--visitor-flows)
7. [Admin flows](#7-admin-flows)
8. [Stripe Elements payment flow (technical)](#8-stripe-elements-payment-flow-technical)
9. [Webhooks](#9-webhooks)
10. [Environment variables](#10-environment-variables)
11. [Implementation map (files to add)](#11-implementation-map-files-to-add)
12. [Security & compliance](#12-security--compliance)
13. [Testing checklist](#13-testing-checklist)

---

## 1. What we will build

| Feature | Description |
|---------|-------------|
| **14-day trial** | ✅ Already: new users get `TRIALING` + Pro-level access, no card |
| **Stripe Elements** | Card form embedded in `/dashboard/settings/billing` and upgrade modal |
| **Subscriptions** | Monthly recurring via Stripe Billing (`Starter`, `Pro`, `Agency`) |
| **Entitlements** | Server-side gates: site limits, scans, link crawl mode, history, reports |
| **Upgrade modal** | Paywall when user hits a limit or trial expired |
| **Customer Portal** | Stripe-hosted page for update card, invoices, cancel (linked from settings) |
| **Webhooks** | `/api/webhooks/stripe` keeps DB in sync with Stripe |
| **Admin billing** | ✅ Partial: manual overrides; will add Stripe customer links + sync status |
| **Emails** | Trial ending, payment failed, subscription confirmed |

**Not in v1:** Annual billing, usage-based metering, Agency invoicing (manual / contact sales).

---

## 2. Plans & entitlements

Matches marketing pricing at `/pricing`.

| Plan | Price | Sites | Scheduled scans | Broken links | History | Reports |
|------|-------|-------|-----------------|--------------|---------|---------|
| **Trial** | Free 14 days | 15 (Pro access) | Daily | Internal + external | 90 days | Full PDF |
| **Starter** | $19/mo | 3 | Manual only | Internal only | 30 days | PDF on demand |
| **Pro** | $49/mo | 15 | Daily | Internal + external | 90 days | Auto PDF + comparison |
| **Agency** | $129/mo | 50 | Hourly | Full depth | 1 year | All types |

### Subscription statuses (`Subscription.status`)

| Status | Meaning | User experience |
|--------|---------|-----------------|
| `TRIALING` | Active trial | Full Pro access; banner with days left |
| `ACTIVE` | Paid and current | Plan limits apply |
| `PAST_DUE` | Payment failed | Warning banner; grace period; retry via update card |
| `CANCELLED` | Cancelled, period not ended yet | Access until `currentPeriodEnd` |
| `EXPIRED` | Trial ended or sub ended | Read-only; no new scans; upgrade prompts |

### Entitlement helper (to implement)

Single server function used everywhere — **never gate in UI only**:

```ts
// src/lib/entitlements.ts (planned)
getEntitlements(userId) → {
  plan, status, trialEndsAt, currentPeriodEnd,
  websiteLimit, canScan, canScheduleScans, canExternalLinks,
  historyDays, reportTypes, isReadOnly
}
```

**Used by:**

- `addWebsiteAction` — site count vs limit  
- `startScanAction` / audit dispatch — `canScan`  
- `startBrokenLinkScanAction` — external mode on Starter blocked  
- Scheduled cron (future) — frequency by plan  
- Report generator — allowed report types  
- History queries — date cutoff by plan  

---

## 3. Architecture overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        LoopNode (Vercel)                         │
├─────────────────────────────────────────────────────────────────┤
│  Marketing (/pricing)  →  Register  →  Trial (no card)          │
│  Dashboard / Settings / Billing  →  Stripe Elements (Payment)    │
│  Upgrade modal  →  same Elements flow                           │
│  API: create-subscription, setup-intent, portal-session         │
│  API: /api/webhooks/stripe  ←  Stripe events                    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │      Stripe           │
                    │  Customers            │
                    │  Subscriptions        │
                    │  PaymentElement       │
                    │  Customer Portal      │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Supabase (Prisma)    │
                    │  Subscription table   │
                    └───────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Admin (/admin/billing)  —  manual overrides + Stripe links     │
└─────────────────────────────────────────────────────────────────┘
```

**Why Stripe Elements (not Checkout redirect)?**

- Payment stays **inside** LoopNode UI (billing page + upgrade modal).
- Matches SaaS settings pattern; branding stays consistent.
- Checkout redirect remains optional fallback for Agency invoicing later.

---

## 4. Stripe setup (Dashboard)

### 4a. Create Stripe account

1. [dashboard.stripe.com](https://dashboard.stripe.com) → activate account (test mode first).
2. **Developers → API keys:**
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`

### 4b. Products & prices

Create three products with **monthly recurring** prices:

| Product | Price ID env var | Amount |
|---------|------------------|--------|
| LoopNode Starter | `STRIPE_PRICE_STARTER` | $19/mo |
| LoopNode Pro | `STRIPE_PRICE_PRO` | $49/mo |
| LoopNode Agency | `STRIPE_PRICE_AGENCY` | $129/mo |

Use **same price IDs** in test and map production IDs in Vercel production env.

### 4c. Customer Portal

**Settings → Billing → Customer portal** — enable:

- Update payment method  
- View invoices  
- Cancel subscription (at period end recommended)

Portal return URL: `https://your-app.vercel.app/dashboard/settings/billing`

### 4d. Webhook endpoint

**Developers → Webhooks → Add endpoint:**

- URL: `https://your-app.vercel.app/api/webhooks/stripe`
- Events: see [Webhooks](#9-webhooks)
- Signing secret → `STRIPE_WEBHOOK_SECRET`

For local dev: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

---

## 5. User flows

### 5a. New user — register → trial

```
/pricing or /register
    → Create account (no card)
    → Subscription: TRIALING, plan=PRO, trialEndsAt = now + 14 days
    → Dashboard: optional banner "X days left in trial"
    → Full Pro entitlements during trial
```

### 5b. During trial — subscribe early

```
/dashboard/settings/billing
    → See: trial countdown, current usage (sites X / 15)
    → "Choose a plan" → Starter | Pro | Agency cards
    → Select plan → Stripe Payment Element appears
    → Enter card → Confirm
    → Webhook: checkout/subscription active
    → Status: ACTIVE, plan set, trial ended
    → Banner: "You're on Pro" + Manage billing link
```

### 5c. Trial ending (3 days before)

```
Cron or daily job (planned)
    → Email: "Your trial ends in 3 days"
    → In-app banner on dashboard
    → Billing page highlights subscribe CTA
```

### 5d. Trial expired — no payment

```
trialEndsAt < now AND no active Stripe sub
    → status = EXPIRED
    → Read-only: view websites, past scans, reports
    → Blocked: new scans, add site, broken link scan
    → Upgrade modal on any gated action:
        "Your trial ended. Subscribe to keep scanning."
        → Opens billing / Elements flow
```

### 5e. Paid user — upgrade / downgrade

```
/dashboard/settings/billing
    → "Change plan" → select new tier
    → Stripe subscription update (proration)
    → Webhook: customer.subscription.updated
    → DB plan + currentPeriodEnd synced
```

**Downgrade note:** If user has more sites than new plan allows, block downgrade until they remove sites (or show warning).

### 5f. Paid user — update card / invoices / cancel

```
/dashboard/settings/billing → "Manage billing"
    → API creates Stripe Customer Portal session
    → Redirect to Stripe-hosted portal
    → User updates card, downloads invoice, or cancels
    → Webhooks sync cancelAtPeriodEnd, PAST_DUE, etc.
```

### 5g. Payment failed

```
invoice.payment_failed webhook
    → status = PAST_DUE
    → Email: "Payment failed — update your card"
    → Banner in app with link to Portal
    → After invoice.paid → status = ACTIVE
```

### 5h. Hit a plan limit (upgrade modal)

| Trigger | Modal copy (example) |
|---------|---------------------|
| 4th site on Starter | "Starter includes 3 sites. Upgrade to Pro for 15." |
| Scan when EXPIRED | "Your trial ended. Subscribe to keep scanning." |
| External links on Starter | "External crawls are on Pro and Agency." |
| Daily schedule on Starter | "Automated scans require Pro or Agency." |

Modal actions: **Upgrade** (opens Elements on billing) · **View plans** (`/pricing`) · **Dismiss** (soft gates only).

---

## 6. Non-user / visitor flows

### Visitors on marketing site

| Page | What they see | Action |
|------|---------------|--------|
| `/` (landing) | Pricing teaser, features | CTA → `/register` or `/pricing` |
| `/pricing` | Starter / Pro / Agency cards | Starter & Pro → **Start free trial** → `/register` |
| `/pricing` | Agency card | **Contact sales** → `/contact` (no self-serve card for Agency in v1 optional) |
| `/features` | Product info | Register CTA |
| `/contact` | Sales / support form | No payment |

**No payment on marketing pages** — visitors never enter card until they have an account and go to billing (or trial ends).

### Register without paying

- FAQ promises: "14-day free trial · No credit card required" — must stay true until user opens billing.
- After register → straight to dashboard with trial.

### Logged-out user hits paywalled link

- Redirect to `/login` → after login, return to intended page or billing.

---

## 7. Admin flows

Admin app: `/admin/billing` (already exists; Stripe features to add).

### 7a. What admin sees today

- Estimated MRR (from active paid plans in DB)
- Subscription table: user, plan, status, trial/period dates
- Manual override dialog (plan, status, dates, admin notes)
- Users without subscription → "Init trial"

### 7b. What admin will see after Stripe

| Feature | Purpose |
|---------|---------|
| **Stripe customer link** | Open customer in Stripe Dashboard |
| **Stripe subscription ID** | Copy / debug |
| **Last webhook sync** | When DB was last updated from Stripe |
| **Sync from Stripe** | Button to pull latest subscription state |
| **Failed payments list** | Filter `PAST_DUE` users |

### 7c. When admin uses manual override

Use **only for support**, not normal billing:

| Scenario | Admin action |
|----------|--------------|
| Comp account for partner | Set `ACTIVE` + plan, add note; optionally comp in Stripe too |
| Extend trial | Push `trialEndsAt`, keep `TRIALING` |
| Stripe webhook missed | Fix DB manually or "Sync from Stripe" |
| Refund handled in Stripe | Update status / notes in admin |
| Ban abusive user | `/admin/users` ban (existing) |

**Rule:** If user has `stripeSubscriptionId`, prefer Stripe as source of truth; manual edits may be overwritten on next webhook unless subscription is detached.

### 7d. Admin vs Stripe

```
Normal path:  User pays → Stripe → Webhook → DB → Admin read-only view
Support path: Admin override → DB (+ optional Stripe dashboard)
```

---

## 8. Stripe Elements payment flow (technical)

### Packages to add

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

### UI components (planned)

| Component | Role |
|-----------|------|
| `BillingSettingsClient` | Plan cards, usage, trial banner, manage portal link |
| `StripePaymentForm` | Wraps `Elements` + `PaymentElement` |
| `UpgradeModal` | Shared paywall dialog |

### Server actions / API routes (planned)

| Endpoint | Purpose |
|----------|---------|
| `POST /api/billing/create-subscription` | Create/find Stripe Customer, create Subscription (`payment_behavior: default_incomplete`), return `clientSecret` |
| `POST /api/billing/change-plan` | Update subscription item to new price |
| `POST /api/billing/portal` | Create Customer Portal session URL |
| `GET /api/billing/status` | Current subscription for UI |

### Client flow (subscribe to Pro)

```
1. User clicks "Subscribe to Pro" on billing page
2. Client POST /api/billing/create-subscription { plan: "PRO" }
3. Server:
   - auth() → userId
   - prisma.subscription → get or create stripeCustomerId
   - stripe.customers.create (if needed)
   - stripe.subscriptions.create({
       customer,
       items: [{ price: STRIPE_PRICE_PRO }],
       payment_behavior: 'default_incomplete',
       expand: ['latest_invoice.payment_intent']
     })
   - Return { clientSecret: payment_intent.client_secret }
4. Client mounts <Elements stripe={stripePromise} options={{ clientSecret }}>
     <PaymentElement />
     <Button onClick={confirmPayment}>Subscribe</Button>
   </Elements>
5. stripe.confirmPayment({ elements, redirect: 'if_required' })
6. On success → poll or wait for webhook → UI shows ACTIVE
7. Webhook checkout.session.completed / invoice.paid → update DB
```

### Agency plan

**Option A (v1):** Self-serve via Elements like Pro.  
**Option B:** Contact sales only — admin manually sets `ACTIVE` + `AGENCY` after offline deal.

Marketing currently uses **Contact sales** for Agency — implementation can keep that and add self-serve later.

---

## 9. Webhooks

**Route:** `POST /api/webhooks/stripe`  
Verify signature with `STRIPE_WEBHOOK_SECRET` before processing.

| Event | Action |
|-------|--------|
| `customer.subscription.created` | Store `stripeSubscriptionId`, link customer |
| `customer.subscription.updated` | Sync `plan`, `status`, `currentPeriodEnd`, `cancelAtPeriodEnd` |
| `customer.subscription.deleted` | Set `EXPIRED` or `CANCELLED` |
| `invoice.paid` | Set `ACTIVE`, clear `PAST_DUE` |
| `invoice.payment_failed` | Set `PAST_DUE`, send email |
| `checkout.session.completed` | (If used) Activate plan from session metadata |

**Idempotency:** Store processed event IDs or use Stripe idempotency; webhooks may retry.

**Local testing:**

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 10. Environment variables

### Vercel (app)

| Variable | Required | Notes |
|----------|----------|--------|
| `STRIPE_SECRET_KEY` | Yes | `sk_test_...` or `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | `pk_test_...` or `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Yes | `whsec_...` from webhook endpoint |
| `STRIPE_PRICE_STARTER` | Yes | Price ID `price_...` |
| `STRIPE_PRICE_PRO` | Yes | Price ID `price_...` |
| `STRIPE_PRICE_AGENCY` | Yes | Price ID `price_...` |

Add to `src/lib/env.ts` validation when implementing.

### Stripe Dashboard

- Webhook URL must match production domain.
- Customer Portal return URL = billing settings page.

### Not needed on Trigger.dev

Billing runs on Vercel only.

---

## 11. Implementation map (files to add)

| Path | Purpose |
|------|---------|
| `src/lib/stripe.ts` | Stripe SDK singleton |
| `src/lib/entitlements.ts` | `getEntitlements(userId)` |
| `src/lib/plans.ts` | ✅ Exists — extend with Stripe price mapping |
| `src/lib/subscription.ts` | ✅ Exists — extend with Stripe sync helpers |
| `src/app/api/webhooks/stripe/route.ts` | Webhook handler |
| `src/app/api/billing/create-subscription/route.ts` | Elements client secret |
| `src/app/api/billing/portal/route.ts` | Customer Portal session |
| `src/app/api/billing/change-plan/route.ts` | Upgrade/downgrade |
| `src/actions/billing.ts` | Server actions wrapper |
| `src/components/billing/stripe-payment-form.tsx` | PaymentElement UI |
| `src/components/billing/upgrade-modal.tsx` | Paywall dialog |
| `src/components/billing/plan-picker.tsx` | Plan selection cards |
| `src/components/settings/billing-settings-client.tsx` | Replace placeholder UI |
| `src/app/dashboard/settings/billing/page.tsx` | Load real subscription data |
| `src/components/admin/admin-billing-client.tsx` | Add Stripe links + sync |
| `prisma/schema.prisma` | ✅ `Subscription` exists — optional: `stripeEventId` log table |

### Phase A checklist (from PROGRESS.md)

- [x] `Subscription` model + trial on register  
- [ ] Stripe Elements subscribe flow  
- [ ] Customer Portal link  
- [ ] Webhooks  
- [ ] `getEntitlements()` + server gates  
- [ ] Billing settings UI (real data)  
- [ ] `UpgradeModal` component  
- [ ] Trial expiry job + emails  
- [ ] Admin: Stripe customer links  

---

## 12. Security & compliance

- **Never** store raw card numbers — Stripe Elements + PCI scope on Stripe side.
- **Never** trust client-reported plan — always verify via webhook or `stripe.subscriptions.retrieve`.
- Webhook route must verify `stripe-signature`.
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` server-only (not `NEXT_PUBLIC_`).
- Entitlement checks on **every** gated server action.
- Admin manual overrides logged in `ActivityLog` (already pattern in `admin.ts`).

---

## 13. Testing checklist

### Test mode (Stripe test cards)

- `4242 4242 4242 4242` — success  
- `4000 0000 0000 0002` — decline  
- `4000 0000 0000 0341` — requires authentication (3DS)

### Scenarios

- [ ] Register → trial created, no card  
- [ ] Subscribe Starter via Elements → ACTIVE, 3 site limit enforced  
- [ ] Upgrade Starter → Pro via change plan  
- [ ] Add 4th site on Starter → blocked + upgrade modal  
- [ ] Trial expires → scans blocked, read-only works  
- [ ] Payment fails → PAST_DUE banner + email  
- [ ] Portal: update card → PAST_DUE cleared  
- [ ] Portal: cancel → access until period end  
- [ ] Webhook replay does not duplicate charges  
- [ ] Admin manual extend trial works  
- [ ] Pricing page CTAs → register (no card)  

---

## Quick reference — who pays where?

| Person | Where they pay | How |
|--------|----------------|-----|
| New visitor | Nowhere | Registers → free trial |
| Trial user | `/dashboard/settings/billing` | Stripe Elements when ready |
| Expired trial | Billing or upgrade modal | Stripe Elements |
| Paid user | Portal (card/invoices) or billing (change plan) | Stripe |
| Agency (sales-led) | Offline / contact | Admin manual override |
| Admin | N/A | Overrides in `/admin/billing` |

---

*Update this doc when Stripe ships or plan limits change.*
