import React from "react";
import { auth } from "@/lib/auth";
import {
  Zap,
  Eye,
  Search,
  Shield,
  Link2,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
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
  title: "LoopNode — Website health monitoring & audits",
  description:
    "Monitor performance, accessibility, SEO, and security. Crawl broken links, track scores over time, and fix issues before your users notice.",
};

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const features = [
    {
      title: "Performance audits",
      description:
        "Real Lighthouse runs measure LCP, INP, CLS, FCP, and TBT. See Core Web Vitals with Good / Needs work / Poor ratings and drill into every finding.",
      icon: Zap,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Accessibility scans",
      description:
        "axe-core checks WCAG 2.1 rules in a real browser — contrast, labels, keyboard traps, and ARIA issues with selectors you can act on.",
      icon: Eye,
      color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    },
    {
      title: "SEO health checks",
      description:
        "Live analysis of titles, meta descriptions, H1 structure, Open Graph tags, robots.txt, sitemap.xml, and image alt text.",
      icon: Search,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Security & CSP grading",
      description:
        "Inspect HTTPS, HSTS, CSP, X-Frame-Options, and more. Get a letter grade on your Content-Security-Policy with tiered fix recommendations.",
      icon: Shield,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Broken link checker",
      description:
        "Dedicated crawler for internal and external links — find 404s, dead assets, and broken anchors with source page and element context.",
      icon: Link2,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Score trends & history",
      description:
        "Track health scores across audits, compare categories over time, and know exactly when a deploy introduced regressions.",
      icon: BarChart3,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Connect your site",
      description:
        "Add any public URL. LoopNode validates the connection and keeps your portfolio organized in one dashboard.",
    },
    {
      step: "02",
      title: "Run a full audit",
      description:
        "One click triggers Lighthouse, axe-core, SEO parsing, and security header checks — real engines, not simulated scores.",
    },
    {
      step: "03",
      title: "Fix with confidence",
      description:
        "Every issue includes severity, description, and recommendations. Category pages go deep — CSP grades, WCAG rules, vitals breakdowns.",
    },
  ];

  const pillars = [
    {
      icon: Layers,
      title: "Real scanning engines",
      text: "Lighthouse, axe-core, and live HTTP analysis — the same tools experts use, automated for your workflow.",
    },
    {
      icon: Clock,
      title: "Continuous monitoring",
      text: "Schedule scans on Pro plans and catch regressions before they reach production traffic.",
    },
    {
      icon: CheckCircle2,
      title: "Actionable reports",
      text: "No vanity metrics. Every score ties to specific issues with clear next steps to resolve them.",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center overflow-hidden">
      <section className="relative w-full max-w-[88rem] mx-auto px-6 pt-20 pb-24 md:pt-32 md:pb-36 flex flex-col items-center text-center">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary px-3 py-1.5 text-xs font-semibold tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Built on Lighthouse &amp; axe-core
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] bg-gradient-to-b from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Know your website&apos;s health before your users do
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            LoopNode audits performance, accessibility, SEO, and security — then crawls for broken links.
            One dashboard. Real scores. Clear fixes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <ButtonLink
              href={isLoggedIn ? "/dashboard" : "/register"}
              size="lg"
              className="w-full sm:w-auto shadow-lg shadow-primary/20"
            >
              {isLoggedIn ? "Go to dashboard" : "Start free trial"}
              <ArrowRight />
            </ButtonLink>
            <ButtonLink
              href="/pricing"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              View pricing
            </ButtonLink>
          </div>
          <p className="text-xs text-muted-foreground">
            14-day free trial · No credit card required · Plans from $19/mo
          </p>
        </div>
      </section>

      <section className="w-full max-w-[88rem] mx-auto px-6 py-20 border-t border-border/20">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Everything you need to ship healthy sites
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Five audit dimensions plus a dedicated link checker — each with its own deep-dive report page.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card
                key={idx}
                className="hover:shadow-lg transition-all duration-300 border-border/30"
              >
                <CardContent className="space-y-4">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl border ${feature.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <ButtonLink href="/features" variant="link" className="text-sm font-semibold">
            Explore all capabilities
            <ArrowRight />
          </ButtonLink>
        </div>
      </section>

      <section className="w-full bg-secondary/15 border-t border-b border-border/20">
        <div className="max-w-[88rem] mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:pr-8 flex flex-col justify-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              How LoopNode works
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connect a URL, run an audit, and get categorized findings in under a minute. No agents to install, no code changes required.
            </p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, idx) => (
              <div key={idx} className="space-y-3">
                <span className="block text-4xl font-extrabold text-primary/25 font-mono leading-none">
                  {item.step}
                </span>
                <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full max-w-[88rem] mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Why teams choose LoopNode
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Purpose-built for developers, agencies, and product teams who ship often and cannot afford silent regressions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <Card key={idx} className="border-border/30">
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base font-bold">{p.title}</CardTitle>
                  <CardDescription className="leading-relaxed">{p.text}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="w-full max-w-[88rem] mx-auto px-6 pb-20">
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
          <CardHeader className="text-center relative z-10">
            <CardTitle className="text-3xl font-bold max-w-xl mx-auto">
              Start monitoring your sites today
            </CardTitle>
            <CardDescription className="max-w-md mx-auto leading-relaxed">
              Try LoopNode free for 14 days. Run your first audit in under 60 seconds and see exactly where your site stands.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pb-8">
            <ButtonLink href={isLoggedIn ? "/dashboard" : "/register"} size="lg" className="shadow-lg shadow-primary/20">
              {isLoggedIn ? "Open dashboard" : "Start free trial"}
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" size="lg">
              Talk to us
            </ButtonLink>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
