import React from "react";
import { Zap, Eye, Search, Shield, Link2, CheckSquare, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Features",
  description:
    "LoopNode performance, accessibility, SEO, security, and broken link auditing — powered by Lighthouse, axe-core, and live HTTP analysis.",
};

export default function FeaturesPage() {
  const auditModules = [
    {
      title: "Performance audits",
      subtitle: "Lighthouse + Core Web Vitals",
      description:
        "Every audit launches a real Chrome instance and runs Lighthouse against your URL. LoopNode captures LCP, INP, CLS, FCP, and TBT, rates each vital as Good, Needs work, or Poor, and lists every Lighthouse finding with severity and remediation guidance.",
      icon: Zap,
      checks: [
        "Largest Contentful Paint (LCP)",
        "Interaction to Next Paint (INP)",
        "Cumulative Layout Shift (CLS)",
        "First Contentful Paint & Total Blocking Time",
        "Performance score with historical trends",
        "Per-finding recommendations from Lighthouse",
      ],
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Accessibility scans",
      subtitle: "axe-core · WCAG 2.1",
      description:
        "Accessibility violations are detected in a real browser using axe-core. Issues are grouped by rule, ranked by impact (critical through minor), and include CSS selectors so developers can locate the exact element.",
      icon: Eye,
      checks: [
        "WCAG 2 A / AA rule coverage",
        "Color contrast failures",
        "Missing form labels and alt text",
        "Keyboard navigation and focus traps",
        "Heading hierarchy violations",
        "ARIA attribute and role errors",
      ],
      color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    },
    {
      title: "SEO health audits",
      subtitle: "On-page + technical SEO",
      description:
        "LoopNode fetches your page HTML and validates the fundamentals search engines care about — plus live checks against robots.txt and sitemap.xml. The SEO report page shows a pass/warn/fail checklist you can refresh anytime.",
      icon: Search,
      checks: [
        "Title and meta description length",
        "H1 presence and uniqueness",
        "Open Graph tags for social sharing",
        "Canonical URL configuration",
        "robots.txt and sitemap.xml reachability",
        "Image alt text for indexable content",
      ],
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Security & headers",
      subtitle: "Live HTTP analysis + CSP grading",
      description:
        "Security audits fetch live response headers and evaluate HTTPS, HSTS, CSP, X-Frame-Options, and more. Your Content-Security-Policy is parsed, graded A–F, and accompanied by getting-started, intermediate, and advanced hardening recommendations.",
      icon: Shield,
      checks: [
        "HTTPS enforcement check",
        "HSTS configuration strength",
        "CSP directive parsing and letter grade",
        "X-Frame-Options / frame-ancestors",
        "X-Content-Type-Options and Referrer-Policy",
        "Tiered CSP improvement recommendations",
      ],
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Broken link checker",
      subtitle: "Separate deep crawler",
      description:
        "Broken links are checked outside the main audit so you can run full internal crawls or external outbound checks on demand. See progress live, filter by link type, copy broken URLs, and view the source page and DOM element for every failure.",
      icon: Link2,
      checks: [
        "Internal site-wide crawl (all levels)",
        "External outbound link verification",
        "Filter by pages, images, scripts, stylesheets",
        "HTTP status codes and error details",
        "Source page URL and element selector",
        "Halt scan anytime with progress tracking",
      ],
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
  ];

  return (
    <div className="flex-1 w-full max-w-[88rem] mx-auto px-6 sm:px-8 lg:px-12 py-12 md:py-24">
      <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
          What LoopNode audits
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Industry-standard engines, one unified dashboard. Each category has its own report page with scores, live checks, and filterable issues.
        </p>
      </div>

      <div className="space-y-24">
        {auditModules.map((mod, idx) => {
          const Icon = mod.icon;
          return (
            <div
              key={idx}
              className={`flex flex-col lg:flex-row gap-12 lg:gap-16 items-center ${
                idx % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className="flex-1 space-y-6 max-w-2xl">
                <div className="space-y-2">
                  <Badge variant="outline" className={`${mod.color} text-xs font-semibold tracking-wide`}>
                    <Icon className="w-3.5 h-3.5" />
                    {mod.subtitle}
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {mod.title}
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {mod.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mod.checks.map((check, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{check}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="flex-1 w-full max-w-xl border-border/40">
                <CardContent className="aspect-[4/3] flex flex-col items-center justify-center p-10 relative overflow-hidden bg-gradient-to-br from-secondary/50 via-card to-secondary/20">
                  <div className="absolute inset-0 bg-primary/5 blur-2xl" />
                  <Icon className="w-20 h-20 text-primary/50 relative z-10 mb-4" />
                  <p className="text-sm font-semibold text-foreground relative z-10">{mod.title}</p>
                  <p className="text-xs text-muted-foreground relative z-10 mt-1">{mod.subtitle}</p>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <Card className="mt-24 text-center border-border/30">
        <CardHeader>
          <CardTitle className="text-2xl">Ready to run your first audit?</CardTitle>
          <CardDescription className="max-w-lg mx-auto">
            Start a 14-day free trial — connect a site and see real Lighthouse, axe-core, and security results in minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <ButtonLink href="/register" size="lg" className="shadow-lg shadow-primary/20">
            Start free trial
            <ArrowRight />
          </ButtonLink>
        </CardContent>
      </Card>
    </div>
  );
}
