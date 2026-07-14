# Quick Wins Plan: Regression Alerts, Portfolio Attention, Issue Center

**Status:** Planning only — no code until you approve this doc  
**Date:** 2026-07-14  
**Out of scope:** Stripe / billing changes (manual billing stays as-is)

---

## 1. Goal

Make LoopNode something users **come back to** and get value from without opening every site manually.

We will ship **three connected pieces**:

| # | Workstream | Outcome |
|---|------------|---------|
| A | **Regression alerts (email)** | After a re-scan, email when health got worse (scores and/or new critical issues) |
| B | **Portfolio “What needs attention”** | One screen across all sites: worst / newest / most urgent first |
| C | **Issue Center upgrade** | Issue Center becomes that daily home + gains regression-aware sorting/filters |

Uptime emails already exist. We **reuse that pattern** for scan regressions (detect once → in-app notification → email).

---

## 2. What exists today (baseline)

### Issue Center (`/dashboard/issues`)

- UI exists and is usable: search, filters (site / category / severity / status), expand, acknowledge, dismiss, bulk actions, CSV export.
- Loads **only issues from each site’s latest completed scan**.
- Sorted by **severity only**.
- Issues are created **fresh on every scan** (new rows). Fingerprints are used to **auto-resolve** old open issues that disappeared — **not** to upsert or show “new since last scan.”
- `BROKEN_LINKS` exists as a category in the UI, but coverage crawls do **not** write `Issue` rows today (separate Coverage tables).
- Acknowledging an issue does **not** follow the finding onto the next scan’s new row (workflow gap).

### Scores / comparison

- Previous vs current scan already exists for **reports** and the **website score chart** (deltas).
- **No** scan-complete email, **no** regression notification types, **no** “new issues vs last scan” in Issue Center.

### Email / notifications

- Uptime path is the template to copy: `notifyUptime*` → `Notification` row + HTML email via Nodemailer.
- No scan/issue/regression `NotificationType`s yet.
- No global notification preferences UI (only per-monitor uptime toggles).

### Dashboard overview (`/dashboard`)

- Shows averages, critical count, recent scans/activity.
- **Does not** surface “what got worse” or a prioritized attention queue.

---

## 3. Target user workflows (before → after)

### Workflow A — Agency / freelancer after a deploy

**Before**

1. Redeploy client site.
2. Manually open LoopNode → pick site → run audit (or wait for schedule).
3. Open several category pages / Issue Center and mentally compare to last week.
4. Often skip this → regressions ship unnoticed.

**After**

1. Redeploy → scheduled or manual scan completes.
2. If scores drop or new critical/major issues appear → **email + bell notification** with site name, what changed, link into Issue Center filtered to that site.
3. Open one link → see **new / worsened** issues first → acknowledge or dismiss → share PDF if needed.

### Workflow B — Morning portfolio check (many sites)

**Before**

1. Open each website one by one.
2. Issue Center is a flat severity list with weak “what’s new” signal.
3. Easy to miss a quiet mid-severity regression on site #17.

**After**

1. Open **Dashboard attention strip** and/or **Issue Center**.
2. List ordered by attention score (new + critical + recent score drop + site).
3. Filter: “New since last scan” / “Regressed sites only.”
4. Clear the queue (acknowledge / dismiss) without hopping sites.

### Workflow C — Issue triage

**Before**

- Acknowledge on scan N → scan N+1 recreates the same fingerprint as a new `OPEN` issue → ACK feels pointless.
- No “fixed since last scan” / “still open” framing.

**After (pragmatic V1 — see scope)**

- Issue Center shows **badges**: `New`, `Still open`, `Fixed` (fixed = auto-resolved after last audit).
- Attention sort uses **new + severity** first.
- Full ACK persistence across scans can be Phase 2 if we need schema changes (website-level issue store). V1 focuses on **labels + sorting + alerts**, not a full rewrite of issue storage.

---

## 4. Workstream A — Regression alerts (email)

### What we will build

1. **Detect regressions when an audit completes** (same place scan is finalized / after `autoResolveIssuesAfterAudit`).
2. Compare **current completed scan** vs **previous completed scan** for that website:
   - Overall / category score drops beyond thresholds
   - New fingerprints present on current scan that were not on previous (especially `CRITICAL` / `MAJOR`)
3. **Debounce / once-per-transition:** email only when a regression is detected for this run (not on every unchanged re-scan).
4. **In-app notification** + **email to account email** (same as uptime).
5. Deep link: `/dashboard/issues?websiteId=…&attention=new` (or similar).

### Suggested thresholds (tunable constants, not a settings UI in V1)

| Signal | Default rule (proposal) |
|--------|-------------------------|
| Overall score | Drop ≥ **5 points** |
| Any category score | Drop ≥ **8 points** |
| New critical issues | Count ≥ **1** |
| New major issues | Count ≥ **3** (or ≥1 if you prefer noisier alerts) |
| First scan ever | **No** regression email (nothing to compare) |
| Failed scan | **No** regression email (optional separate failure email later) |

Exact numbers can be adjusted after you try it on a few sites.

### Email content (proposal)

- Subject: `[Regression] {siteName} — score −12 / 3 new critical issues`
- Body: site URL, previous vs current overall (and worst category), top 3–5 new critical/major titles, CTA button to Issue Center.
- Reuse shared email layout (same as uptime templates).

### Notification types to add

- `SCAN_REGRESSION` (required)
- Optional later: `SCAN_IMPROVED` (only if you want positive emails — **not** in V1 to avoid noise)

### Preferences (V1)

- Simple account-level flag later if needed; **V1 default: on** for all users (same spirit as uptime defaults).
- Optional: “Email me on score regressions” checkbox under Settings — only if trivial; otherwise skip and keep default on.

### Files we expect to touch (when coding starts)

- New: regression detector helper (e.g. `src/lib/scans/detect-regression.ts`)
- New: email templates (e.g. `src/lib/email/templates/regression-emails.ts`)
- New/extend: `src/lib/scans/alerts.ts` or similar (mirror `src/lib/uptime/alerts.ts`)
- Call site: after successful audit completion (`complete-audit-scan` / Trigger task success path)
- Prisma: add `NotificationType` value(s)
- Bell UI already polls notifications — new types should show automatically if rendered generically

### Explicitly not in this workstream

- Slack/Discord webhooks (recommended next, not this doc’s V1)
- Uptime alert redesign
- Billing emails
- Per-site mute (Phase 2)

---

## 5. Workstream B — Portfolio “What needs attention”

### What we will build

A **portfolio attention model** that scores each site (and/or each issue) so agents aren’t forced to click every website.

### Attention inputs (V1)

For each website with a latest completed scan:

| Factor | Weight idea |
|--------|-------------|
| Count of **new** critical/major issues vs previous scan | Highest |
| Count of open critical on latest scan | High |
| Score drop (overall / worst category) vs previous | High |
| Open major count | Medium |
| Recency of scan / unresolved ACK backlog | Lower |

Produce:

1. **`attentionScore`** (number) per website and optionally per issue.
2. **`attentionReasons`** short tags: e.g. `Score −9`, `3 new critical`, `12 open major`.

### Where it shows

**B1 — Dashboard (`/dashboard`)**

- New section: **Needs attention** (top 5–10 sites), ranked by `attentionScore`.
- Each row: site name, overall score + delta, critical/new counts, reasons pills, link to Issue Center filtered to that site.
- Empty state: “All clear — no regressions or critical issues.”

**B2 — Issue Center default sort**

- Default sort becomes **attention** (not only severity).
- Secondary sort: severity → createdAt.

### Data loading

- Extend portfolio query (Issue Center + dashboard) to also load **previous completed scan** per site (same pattern as `loadScanContext` / report service).
- Compute new fingerprints set = current − previous.
- Auto-resolved count since last run can feed a “Fixed” chip later.

---

## 6. Workstream C — Issue Center upgrade

### What will improve in the UI/UX

| Area | Improvement |
|------|-------------|
| Default sort | Attention (new + severity + score regression context), not severity alone |
| Filters | Add: **New since last scan**, **Critical+Major only**, keep existing site/category/severity/status |
| Badges on rows | `New`, `Still open` (fingerprint existed on previous scan), optional `Regressed site` context in header |
| Empty / summary strip | “X new issues · Y sites with score drops · Z critical open” |
| Deep links | Support query params from regression email (`websiteId`, `attention=new`) |
| Dashboard ↔ Issue Center | Same attention language so the product feels one system |

### What we will **not** do in V1 (important)

| Deferred | Why |
|----------|-----|
| Full website-level issue upsert / ACK carryover rewrite | Larger schema + migration; easy to get wrong |
| Merge Coverage (`BrokenLinkResult`) into Issue Center | Separate crawl system; worth a follow-up |
| Comments, assignees, SLAs | Not needed for retention quick win |
| Replacing severity filters | We **add** attention; we don’t remove existing filters |
| Building Issue Center from scratch | Current UI is a solid base — we **upgrade**, not rewrite |

### ACK persistence (honest V1 stance)

Today ACK does not survive a new scan (new row, same fingerprint, status `OPEN` again).

**V1:** Do not block alerts / attention on a full persistence redesign.

**Phase 2 (separate plan):** durable findings keyed by `(websiteId, fingerprint)` with status that survives scans — so ACK/dismiss sticks. Mentioned here so expectations are clear.

---

## 7. How the three pieces connect

```text
Scan completes
    │
    ├─► create Issues + autoResolve (existing)
    │
    ├─► detectRegression(previous, current)
    │       │
    │       ├─► Notification (bell)
    │       └─► Email (if regression)
    │
    └─► attention data used by
            ├─► Dashboard “Needs attention”
            └─► Issue Center sort/filters/badges
```

One detection engine → three surfaces (email, dashboard, Issue Center). Avoid three separate “regression” implementations.

---

## 8. Implementation phases (when you say go)

### Phase 1 — Shared regression/attention engine (foundation)

- Helper: previous scan lookup
- Helper: score deltas + new fingerprints + attention score/reasons
- Unit-testable pure functions (thresholds, fingerprint set math)

**Deliverable:** usable from server loaders + alert sender; no UI yet if preferred, or immediately used by Phase 2.

### Phase 2 — Issue Center upgrade

- Wire attention into `getPortfolioIssuesForUser` (or successor)
- Badges + filters + default sort + query params
- Summary strip

**Deliverable:** `/dashboard/issues` becomes the daily triage home.

### Phase 3 — Dashboard “Needs attention”

- Top sites list on `/dashboard`
- Links into Issue Center with filters applied

**Deliverable:** portfolio overview answers “what should I look at?” in &lt;10 seconds.

### Phase 4 — Regression email + notification types

- Prisma enum values
- Templates + sender
- Hook into audit completion path
- Manual QA: two scans on a test site with intentional score/issue change

**Deliverable:** inbox email after a real regression.

Recommended order: **1 → 2 → 3 → 4** (engine → see it in product → email).  
If you want the retention punch faster: **1 → 4 → 2 → 3** (engine → email first).  
**Recommendation:** `1 → 2 → 4 → 3` — Issue Center proves attention UX, then email, then dashboard polish.

---

## 9. Success criteria

You can call this done when:

1. Completing a second audit that is **worse** produces exactly **one** regression email and one bell notification.
2. Completing a scan that is **unchanged / better** produces **no** regression email.
3. Issue Center can filter **New since last scan** and sorts urgent items above noise.
4. Dashboard lists the hottest sites without opening each website.
5. Manual billing / upgrade flow is **untouched**.

---

## 10. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Email noise → users ignore alerts | Sensible thresholds; no “improved” spam in V1; one email per completed regressing scan |
| First audits spam | Skip when no previous completed scan |
| ACK feels broken still | Document Phase 2; V1 badges still explain New vs Still open |
| Performance loading previous scans for 50 sites | Batch queries; only latest + previous per site (2 scans max each) |
| Hobby email limits / SMTP failures | Same path as uptime; log failures; notification still created in-app |

---

## 11. Estimate (engineering time)

| Phase | Estimate |
|-------|----------|
| Shared engine | 1–2 days |
| Issue Center upgrade | 2–3 days |
| Dashboard attention | 1 day |
| Regression email + hook | 1–2 days |
| QA + threshold tuning | 1 day |
| **Total** | **~1–1.5 weeks** (one focused engineer) |

---

## 12. Approval checklist

Before coding, confirm:

- [ ] Keep manual billing untouched — **yes**
- [ ] V1 email = regressions only (not improvements) — **proposed yes**
- [ ] Thresholds above OK to start (tunable constants) — **confirm or edit**
- [ ] Phase order: `1 → 2 → 4 → 3` — **confirm or change**
- [ ] Defer durable ACK upsert to Phase 2 plan — **confirm**
- [ ] Defer Slack/webhooks — **confirm**

---

## 13. Next step

Reply with edits to thresholds / phase order / anything you want cut.

When you say **“approved — start coding”**, implement Phase 1 first (shared detection/attention engine), then proceed in the agreed order — still no Stripe work.
