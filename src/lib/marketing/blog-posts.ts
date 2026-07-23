export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  author: string;
  category: string;
  content: Array<{ type: "p" | "h2" | "h3" | "ul"; text?: string; items?: string[] }>;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "core-web-vitals-fixes-that-matter",
    title: "Core Web Vitals: The Fixes That Actually Move Scores",
    description:
      "Stop chasing Lighthouse vanity. Here’s how to diagnose LCP, INP, and CLS like an engineer — and ship the changes that users feel.",
    date: "July 18, 2026",
    readTime: "7 min read",
    author: "Health Mesh Team",
    category: "Performance",
    content: [
      {
        type: "p",
        text: "Core Web Vitals measure real experience: how fast the page becomes useful (LCP), how stable it stays while loading (CLS), and how quickly it responds to clicks and taps (INP). Lab scores help you debug; field data decides rankings and bounce rate. Treat both seriously, but fix causes — not symptoms.",
      },
      {
        type: "h2",
        text: "LCP — make the hero paint first",
      },
      {
        type: "p",
        text: "If LCP is slow, find the LCP element in a trace. It’s usually a hero image, H1 block, or large card. Then ask: is it discoverable early, sized correctly, and unblocked by CSS/JS?",
      },
      {
        type: "ul",
        items: [
          "Preload the exact LCP image (same URL the page uses) and serve AVIF/WebP with a fallback.",
          "Don’t lazy-load above-the-fold media. Lazy-loading the LCP image is a common self-own.",
          "Inline critical CSS for the first viewport; defer the rest.",
          "Prefer server-rendered or statically generated HTML for the first paint — client-only heroes lose every time.",
        ],
      },
      {
        type: "h2",
        text: "INP — keep the main thread free",
      },
      {
        type: "p",
        text: "INP is bad when interactions wait on long tasks. Chat widgets, tag managers, and oversized bundles are usual suspects. Measure with the Performance panel and Interaction to Next Paint tooling, not vibes.",
      },
      {
        type: "ul",
        items: [
          "Break work into chunks under ~50ms; yield to the browser between chunks.",
          "Load third-party scripts after hydration or on interaction — not in <head> by default.",
          "Code-split routes and heavy modals; delete dead dependencies from the client bundle.",
          "Move CPU-heavy work (parsing, transforms) off the main thread when it must run client-side.",
        ],
      },
      {
        type: "h2",
        text: "CLS — reserve space before paint",
      },
      {
        type: "ul",
        items: [
          "Always set width/height or aspect-ratio on images, videos, and embeds.",
          "Reserve space for cookie banners, alerts, and late-loading ads.",
          "Use font-display strategies that don’t shove text around after swap.",
          "Never inject content above existing content after first paint unless the layout was reserved.",
        ],
      },
      {
        type: "h2",
        text: "A practical triage order",
      },
      {
        type: "p",
        text: "Fix LCP first if users land on marketing pages. Fix INP first if the product UI feels sticky. Fix CLS when support reports “the button jumped.” Re-measure after each change — stacking five “optimizations” without a baseline wastes a sprint.",
      },
      {
        type: "p",
        text: "Health Mesh stores LCP, INP, CLS, FCP, and TBT on every performance scan so you can see regressions over time instead of only when someone remembers to open DevTools.",
      },
    ],
  },
  {
    slug: "wcag-checklist-product-uis",
    title: "A WCAG Checklist Product Teams Can Actually Finish",
    description:
      "Accessibility work stalls when the checklist is academic. Use this AA-focused pass for contrast, keyboard, forms, and announcements.",
    date: "July 12, 2026",
    readTime: "7 min read",
    author: "Health Mesh Team",
    category: "Accessibility",
    content: [
      {
        type: "p",
        text: "WCAG 2.1 Level AA is the bar most SaaS teams need. The goal isn’t a perfect score once — it’s a repeatable review before shipping UI. Automate what you can; manually verify keyboard paths and screen reader flows for critical journeys (sign-in, checkout, settings).",
      },
      {
        type: "h2",
        text: "Contrast and non-color cues",
      },
      {
        type: "ul",
        items: [
          "Body text ≥ 4.5:1 contrast; large text ≥ 3:1. Check muted labels and placeholders too.",
          "Don’t use color alone for errors, success, or required fields — add text or icons.",
          "Focus rings need ≥ 3:1 against adjacent colors. Never remove outline without a visible replacement.",
          "Test light and dark themes separately; one theme usually fails first.",
        ],
      },
      {
        type: "h2",
        text: "Keyboard and focus",
      },
      {
        type: "p",
        text: "If you can’t complete the happy path with Tab, Enter, Space, and Escape, neither can a large share of power users and assistive-tech users.",
      },
      {
        type: "ul",
        items: [
          "Tab order follows visual order. Custom widgets must expose the right roles and states.",
          "Modals trap focus while open and restore focus to the trigger on close.",
          "Menus support Arrow keys; Escape closes overlays.",
          "Provide a skip link to main content on pages with dense chrome.",
        ],
      },
      {
        type: "h2",
        text: "Forms that announce errors",
      },
      {
        type: "ul",
        items: [
          "Every input needs a real <label> or aria-label — placeholders don’t count.",
          "Associate error text with the field (aria-describedby) and announce it.",
          "Don’t rely on red borders alone; say what failed and how to fix it.",
          "Disable submit only when necessary, and explain why when you do.",
        ],
      },
      {
        type: "h2",
        text: "Where automation helps",
      },
      {
        type: "p",
        text: "axe-core catches a large slice of WCAG failures: missing names, contrast issues, landmark problems. It won’t catch poor focus order or confusing copy. Pair automated scans with a 10-minute keyboard pass on each release.",
      },
      {
        type: "p",
        text: "Health Mesh runs axe-core against live pages, groups violations by severity, and points at selectors so fixes aren’t a scavenger hunt.",
      },
    ],
  },
  {
    slug: "http-security-headers-production",
    title: "Ship Safer Pages With HTTP Security Headers",
    description:
      "CSP, HSTS, frame controls, and a few supporting headers — what they do, what breaks if you rush them, and a sane rollout order.",
    date: "July 5, 2026",
    readTime: "8 min read",
    author: "Health Mesh Team",
    category: "Security",
    content: [
      {
        type: "p",
        text: "Security headers tell browsers how to treat your responses. They’re cheap to add and expensive to ignore. Misconfigured CSP can break production; missing HSTS leaves room for downgrade attacks. Roll out deliberately.",
      },
      {
        type: "h2",
        text: "Content-Security-Policy",
      },
      {
        type: "p",
        text: "CSP reduces XSS impact by limiting where scripts, styles, and connections can come from. A policy full of 'unsafe-inline' and wildcards mostly performs theater.",
      },
      {
        type: "ul",
        items: [
          "Start with default-src 'self', then open only what you need.",
          "Prefer nonces or hashes over 'unsafe-inline' for scripts.",
          "Set object-src 'none' and base-uri 'self'.",
          "Ship Content-Security-Policy-Report-Only first; fix violations, then enforce.",
        ],
      },
      {
        type: "h2",
        text: "HSTS and framing controls",
      },
      {
        type: "ul",
        items: [
          "Strict-Transport-Security with a long max-age (and includeSubDomains when ready).",
          "Only enable HSTS once HTTPS works everywhere — including apex and www.",
          "Use CSP frame-ancestors (or X-Frame-Options) to block clickjacking.",
          "DENY or SAMEORIGIN for most apps; allow specific parents only when embedding is intentional.",
        ],
      },
      {
        type: "h2",
        text: "Supporting headers worth setting",
      },
      {
        type: "ul",
        items: [
          "X-Content-Type-Options: nosniff",
          "Referrer-Policy: strict-origin-when-cross-origin (or stricter)",
          "Permissions-Policy to disable camera, mic, and geo unless required",
        ],
      },
      {
        type: "h2",
        text: "Rollout without breaking prod",
      },
      {
        type: "p",
        text: "Change one header family at a time. Watch browser console reports and real-user error rates. Document exceptions (payment iframes, analytics domains) so the next engineer doesn’t “fix” CSP by widening it again.",
      },
      {
        type: "p",
        text: "Health Mesh fetches live headers on security scans, grades CSP weaknesses, and lists concrete hardening steps from quick wins to stricter policies.",
      },
    ],
  },
  {
    slug: "technical-seo-audit-checklist",
    title: "Technical SEO: A Checklist Before You Blame Content",
    description:
      "Titles, canonicals, indexability, and structured signals — the plumbing that decides whether good content can rank at all.",
    date: "June 28, 2026",
    readTime: "7 min read",
    author: "Health Mesh Team",
    category: "SEO",
    content: [
      {
        type: "p",
        text: "When traffic stalls, teams rewrite copy first. Often the issue is technical: pages blocked from indexing, duplicate titles, broken canonicals, or a sitemap that lies. Fix the plumbing, then optimize content.",
      },
      {
        type: "h2",
        text: "Indexability basics",
      },
      {
        type: "ul",
        items: [
          "Confirm robots meta and X-Robots-Tag aren’t accidentally noindex on public pages.",
          "Keep robots.txt from blocking CSS/JS that Google needs to render.",
          "Canonical tags should point to the preferred URL — and match what you want indexed.",
          "Soft-404s (200 responses with “not found” UI) confuse crawlers; return real 404/410.",
        ],
      },
      {
        type: "h2",
        text: "Titles, descriptions, and headings",
      },
      {
        type: "ul",
        items: [
          "One unique <title> per indexable URL; keep important keywords early.",
          "Meta descriptions aren’t a ranking factor, but they affect CTR — write them on purpose.",
          "Use a single H1 that matches intent; don’t spam heading levels for style.",
          "Template pages (blog, product, docs) need unique titles — check for duplicates across the site.",
        ],
      },
      {
        type: "h2",
        text: "Sitemaps, links, and mobile",
      },
      {
        type: "ul",
        items: [
          "XML sitemap lists only canonical, indexable URLs and stays updated.",
          "Internal links should reach important pages within a few clicks.",
          "Mobile layout must be usable — Google indexes with a mobile user agent.",
          "Fix redirect chains; prefer one clean hop to HTTPS + preferred host.",
        ],
      },
      {
        type: "h2",
        text: "How to work the list",
      },
      {
        type: "p",
        text: "Audit top landing pages first, then templates that generate thousands of URLs. One broken product template beats twenty perfect blog posts. Re-crawl after deploys that touch head tags or routing.",
      },
      {
        type: "p",
        text: "Health Mesh’s SEO scans surface title/meta issues, structural problems, and related findings so you can fix templates instead of guessing from Search Console alone.",
      },
    ],
  },
  {
    slug: "find-fix-broken-links",
    title: "Find Broken Links Before Your Users Do",
    description:
      "404s, soft failures, and dead assets quietly erode trust. Here’s a coverage strategy that doesn’t require crawling the internet by hand.",
    date: "June 20, 2026",
    readTime: "6 min read",
    author: "Health Mesh Team",
    category: "Coverage",
    content: [
      {
        type: "p",
        text: "Broken links look small until a prospect hits a dead pricing PDF or a docs page that 404s mid-onboarding. Link rot is inevitable; undetected link rot is a process failure.",
      },
      {
        type: "h2",
        text: "What “broken” really means",
      },
      {
        type: "ul",
        items: [
          "Hard failures: 404, 410, DNS errors, connection timeouts.",
          "Auth walls and 401/403 on public marketing URLs — often accidental.",
          "Soft-404s that return 200 with an error page.",
          "Broken assets: images, scripts, and stylesheets that fail to load.",
        ],
      },
      {
        type: "h2",
        text: "Where to look first",
      },
      {
        type: "ul",
        items: [
          "Primary navigation, footer, and homepage CTAs.",
          "Docs, blog posts, and changelog archives — they rot fastest.",
          "Sitemap URLs vs. what the site actually links to.",
          "External vendor links (status pages, signup flows) that change without notice.",
        ],
      },
      {
        type: "h2",
        text: "A sane operating rhythm",
      },
      {
        type: "p",
        text: "Crawl high-value paths weekly. After large content migrations, run a full pass. Fix by priority: revenue and support paths first, then long-tail content. Prefer redirects over deleting popular URLs when content moves.",
      },
      {
        type: "ul",
        items: [
          "Replace or redirect dead URLs; don’t leave “coming soon” forever.",
          "Update internal links at the source — not only via blanket redirects.",
          "Track repeat offenders (templates that emit bad hrefs).",
          "Alert on spikes in 404 rates after deploys.",
        ],
      },
      {
        type: "p",
        text: "Health Mesh coverage scans follow links from your site, classify failures, and help you catch regressions before customers file tickets.",
      },
    ],
  },
  {
    slug: "uptime-monitoring-that-isnt-noise",
    title: "Uptime Monitoring That Isn’t Just Noise",
    description:
      "Green checks aren’t enough. Design checks, thresholds, and alerts so on-call wakes up for real outages — not flaky noise.",
    date: "June 14, 2026",
    readTime: "6 min read",
    author: "Health Mesh Team",
    category: "Reliability",
    content: [
      {
        type: "p",
        text: "Uptime tools fail in two ways: they miss real outages, or they page you for nothing. Good monitoring is boring — clear targets, honest probes, and alerts that map to user pain.",
      },
      {
        type: "h2",
        text: "What to probe",
      },
      {
        type: "ul",
        items: [
          "A public health endpoint or homepage that proves the edge is alive.",
          "One authenticated or API path if downtime there is customer-visible.",
          "TLS expiry and DNS for the apex and www hosts.",
          "Critical third parties only if you have a real fallback plan.",
        ],
      },
      {
        type: "h2",
        text: "Define “down” carefully",
      },
      {
        type: "p",
        text: "A single failed check isn’t an outage. Require consecutive failures, sensible timeouts, and expected status codes. Measure latency too — a site that responds in 12 seconds is “up” and still useless.",
      },
      {
        type: "ul",
        items: [
          "Alert on multi-region failure, not one flaky network path.",
          "Separate warning (slow) from critical (unreachable).",
          "Include runbook links in alerts: where logs live, who owns the service.",
          "Mute deploys intentionally; don’t silence forever.",
        ],
      },
      {
        type: "h2",
        text: "After the page",
      },
      {
        type: "p",
        text: "Every incident should end with a short note: detection time, user impact, root cause, and one prevention step. If the same alert fires monthly without action, either fix the system or delete the alert.",
      },
      {
        type: "p",
        text: "Health Mesh uptime checks give you a continuous pulse next to audits — so availability and quality live in the same operational picture.",
      },
    ],
  },
  {
    slug: "triage-website-health-issues",
    title: "How to Triage Website Health Issues Without Drowning",
    description:
      "Audits produce lists. Teams need a queue. Use severity, blast radius, and effort to decide what ships this week.",
    date: "June 8, 2026",
    readTime: "6 min read",
    author: "Health Mesh Team",
    category: "Operations",
    content: [
      {
        type: "p",
        text: "A 200-finding audit is useless if everything is “P0.” Triage is the skill that turns monitoring into shipping. Rank by user impact first, then by how fast you can verify a fix.",
      },
      {
        type: "h2",
        text: "A simple priority model",
      },
      {
        type: "ul",
        items: [
          "P0 — Security exposure, total outage, or broken checkout/sign-in.",
          "P1 — Core Web Vitals failing on key landing pages; major a11y blockers on primary flows.",
          "P2 — SEO template bugs, widespread but non-blocking a11y, noisy 404s on secondary pages.",
          "P3 — Polish, low-traffic pages, speculative hardening.",
        ],
      },
      {
        type: "h2",
        text: "Group before you assign",
      },
      {
        type: "p",
        text: "Don’t file 40 tickets for the same missing image dimensions. Group by root cause: one template, one header config, one third-party script. Assign the group to an owner with a clear done definition (“LCP < 2.5s on /pricing in lab + no regression next scan”).",
      },
      {
        type: "h2",
        text: "Cadence that works",
      },
      {
        type: "ul",
        items: [
          "Weekly: review new critical/major findings only.",
          "Per release: re-scan affected templates and top URLs.",
          "Monthly: burn down one P2 theme (e.g. all contrast issues in the design system).",
          "Ignore noise deliberately — document why so it doesn’t resurface as panic.",
        ],
      },
      {
        type: "p",
        text: "Health Mesh issue views help you filter by severity and category so the queue stays actionable instead of becoming another ignored dashboard.",
      },
    ],
  },
  {
    slug: "pre-deploy-website-health-checklist",
    title: "A Pre-Deploy Website Health Checklist",
    description:
      "Five minutes before you ship can save five hours of incident cleanup. Use this short gate for performance, a11y, SEO, and security.",
    date: "June 1, 2026",
    readTime: "5 min read",
    author: "Health Mesh Team",
    category: "Checklist",
    content: [
      {
        type: "p",
        text: "Most regressions are boring: a missing meta title on a new template, a banner that shifts layout, a script added “temporarily.” A short pre-deploy gate beats heroic firefighting.",
      },
      {
        type: "h2",
        text: "Before you merge",
      },
      {
        type: "ul",
        items: [
          "Hit the changed URLs on preview: title, H1, canonical, and no accidental noindex.",
          "Keyboard through any new modal, menu, or form once.",
          "Confirm images have dimensions; no lazy-load on above-the-fold LCP media.",
          "Check response headers on the preview host if you changed CSP or cookies.",
        ],
      },
      {
        type: "h2",
        text: "Right after deploy",
      },
      {
        type: "ul",
        items: [
          "Smoke the homepage, sign-in, and one revenue path.",
          "Watch error rate and p95 latency for 15–30 minutes.",
          "Run or schedule an audit on the touched templates.",
          "Verify redirects if URLs moved — old links should land cleanly.",
        ],
      },
      {
        type: "h2",
        text: "When to block the release",
      },
      {
        type: "p",
        text: "Block on broken auth/checkout, security header removals you didn’t intend, or LCP/CLS collapses on primary landing pages. Don’t block on every low-severity lint — park those in the backlog with an owner.",
      },
      {
        type: "h2",
        text: "Keep the checklist short",
      },
      {
        type: "p",
        text: "If the gate takes half an hour, people skip it. Aim for five to ten minutes of human checks plus automated scans. Expand only when a class of incident keeps repeating.",
      },
      {
        type: "p",
        text: "Health Mesh fits here as the automated half: scan after deploy, compare to the previous run, and catch regressions while rollback is still cheap.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
