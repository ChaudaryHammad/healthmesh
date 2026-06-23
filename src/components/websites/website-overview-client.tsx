"use client";

import React from "react";
import Link from "next/link";
import {
  Globe,
  Zap,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Eye,
  Search,
  LinkIcon,
  BarChart2,
  AlertTriangle,
  ChevronRight,
  Calendar,
  ExternalLink,
  ArrowUpRight,
  Unlink,
} from "lucide-react";
import { ScoreGauge } from "./score-gauge";
import { ScoreChart } from "./score-chart";
import { formatDate, formatDateTime, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  VITAL_DEFINITIONS,
  formatVitalValue,
  getVitalRating,
  vitalRatingClasses,
  vitalRatingLabel,
} from "@/lib/web-vitals";
import { AuditScanControls } from "@/components/websites/audit-scan-controls";

interface SerializedScan {
  id: string;
  status: string;
  overallScore: number | null;
  performanceScore: number | null;
  accessibilityScore: number | null;
  seoScore: number | null;
  securityScore: number | null;
  fcp: number | null;
  lcp: number | null;
  cls: number | null;
  inp: number | null;
  tbt: number | null;
  completedAt: Date | string | null;
  createdAt: Date | string;
  issueCount: number;
  criticalCount: number;
}

interface SerializedWebsite {
  id: string;
  name: string;
  url: string;
  scanFrequency: string;
  createdAt: Date | string;
}

interface SerializedBrokenLinkScan {
  id: string;
  status: string;
  mode: string;
  brokenCount: number;
  linksChecked: number;
  linksFound: number;
  pagesCrawled: number;
  progressPercent: number;
  statusMessage: string | null;
  completedAt: Date | string | null;
  createdAt: Date | string;
}

interface WebsiteOverviewClientProps {
  website: SerializedWebsite;
  scans: SerializedScan[];
  latestBrokenLinkScan: SerializedBrokenLinkScan | null;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    COMPLETED: {
      label: "Completed",
      className: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
      icon: <CheckCircle className="w-3 h-3" />,
    },
    RUNNING: {
      label: "Running",
      className: "bg-blue-500/10 border-blue-500/25 text-blue-400",
      icon: <Zap className="w-3 h-3 animate-pulse" />,
    },
    FAILED: {
      label: "Failed",
      className: "bg-rose-500/10 border-rose-500/25 text-rose-400",
      icon: <XCircle className="w-3 h-3" />,
    },
    PENDING: {
      label: "Pending",
      className: "bg-amber-500/10 border-amber-500/25 text-amber-400",
      icon: <Clock className="w-3 h-3" />,
    },
  };
  const cfg = map[status] ?? map["PENDING"];
  return (
    <Badge variant="outline" className={`text-[11px] ${cfg.className}`}>
      {cfg.icon} {cfg.label}
    </Badge>
  );
}

const AUDIT_PAGES = [
  {
    key: "performance",
    label: "Performance",
    description: "Speed, Core Web Vitals, and Lighthouse audits",
    icon: <Zap className="w-4 h-4" />,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    href: (id: string) => `/dashboard/websites/${id}/performance`,
    scoreKey: "performanceScore" as keyof SerializedScan,
  },
  {
    key: "accessibility",
    label: "Accessibility",
    description: "WCAG issues and axe-core findings",
    icon: <Eye className="w-4 h-4" />,
    color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    href: (id: string) => `/dashboard/websites/${id}/accessibility`,
    scoreKey: "accessibilityScore" as keyof SerializedScan,
  },
  {
    key: "seo",
    label: "SEO",
    description: "Meta tags, headings, robots, and sitemap",
    icon: <Search className="w-4 h-4" />,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    href: (id: string) => `/dashboard/websites/${id}/seo`,
    scoreKey: "seoScore" as keyof SerializedScan,
  },
  {
    key: "security",
    label: "Security",
    description: "HTTP headers and transport security",
    icon: <Shield className="w-4 h-4" />,
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    href: (id: string) => `/dashboard/websites/${id}/security`,
    scoreKey: "securityScore" as keyof SerializedScan,
  },
];

function VitalCard({
  vitalKey,
  abbr,
  name,
  value,
}: {
  vitalKey: string;
  abbr: string;
  name: string;
  value: number | null;
}) {
  const rating = getVitalRating(vitalKey, value);
  const styles = vitalRatingClasses(rating);

  return (
    <div
      className={`flex flex-col items-center text-center rounded-xl border bg-secondary/10 p-4 gap-2 ${styles.border}`}
    >
      <p className="text-sm font-semibold text-foreground">{abbr}</p>
      <p className={`text-2xl font-bold tabular-nums leading-none ${styles.text}`}>
        {formatVitalValue(vitalKey, value)}
      </p>
      <p className="text-[11px] text-muted-foreground leading-snug">{name}</p>
      <Badge variant="outline" className={`text-[10px] ${styles.badge}`}>
        {vitalRatingLabel(rating)}
      </Badge>
    </div>
  );
}

function BrokenLinksSection({
  websiteId,
  scan,
}: {
  websiteId: string;
  scan: SerializedBrokenLinkScan | null;
}) {
  const isRunning = scan?.status === "RUNNING";
  const lastRun = scan?.completedAt ?? scan?.createdAt ?? null;
  const checkerHref = `/dashboard/websites/${websiteId}/broken-links`;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-card to-card">
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="relative p-6 md:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl border border-blue-500/25 bg-blue-500/10 text-blue-400 shrink-0">
              <Unlink className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">Broken Link Checker</h2>
                {scan && <StatusBadge status={scan.status} />}
              </div>
              <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                Crawl internal pages or check outbound links separately. Find 404s, dead
                anchors, and broken assets with source page context.
              </p>
            </div>
          </div>

          <Link
            href={checkerHref}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-500/90 transition-all shrink-0"
          >
            Open checker
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {isRunning ? (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground font-medium">
                {scan.statusMessage ?? "Scan in progress…"}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {Math.round(scan.progressPercent)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${Math.min(100, scan.progressPercent)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(scan.linksChecked)} links checked · {formatNumber(scan.pagesCrawled)}{" "}
              pages crawled
            </p>
          </div>
        ) : scan ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border/30 bg-card/60 p-4 text-center">
              <p
                className={`text-2xl font-bold tabular-nums ${
                  scan.brokenCount > 0 ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {formatNumber(scan.brokenCount)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Broken links</p>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/60 p-4 text-center">
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {formatNumber(scan.linksChecked)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Links checked</p>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/60 p-4 text-center">
              <p className="text-2xl font-bold tabular-nums text-foreground capitalize">
                {scan.mode.toLowerCase()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Last scan mode</p>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/60 p-4 text-center">
              <p className="text-sm font-semibold text-foreground">
                {lastRun ? formatDate(lastRun) : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Last run</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/40 bg-secondary/10 p-6 text-center">
            <LinkIcon className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-60" />
            <p className="text-sm text-muted-foreground">
              No link scans yet. Open the checker to run an internal or external crawl.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={checkerHref}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border/40 bg-card hover:bg-secondary/20 text-sm font-medium transition-colors"
          >
            <Globe className="w-4 h-4 text-blue-400" />
            Check internal links
          </Link>
          <Link
            href={checkerHref}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border/40 bg-card hover:bg-secondary/20 text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-blue-400" />
            Check external links
          </Link>
        </div>
      </div>
    </section>
  );
}

export function WebsiteOverviewClient({
  website,
  scans,
  latestBrokenLinkScan,
}: WebsiteOverviewClientProps) {
  const latestScan = scans[0] ?? null;

  const coreVitals = VITAL_DEFINITIONS.filter((v) => v.isCoreWebVital);
  const labMetrics = VITAL_DEFINITIONS.filter((v) => !v.isCoreWebVital);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-border/30 bg-gradient-to-br from-card via-card to-secondary/10 p-6 md:p-8 space-y-5">
        <Link
          href="/dashboard/websites"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Connected Websites
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                {website.name}
              </h1>
              {latestScan && <StatusBadge status={latestScan.status} />}
            </div>
            <a
              href={website.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              {website.url.replace(/^https?:\/\//, "")}
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            {latestScan && (
              <div className="flex flex-wrap gap-2 pt-1">
                {latestScan.criticalCount > 0 && (
                  <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20">
                    <AlertTriangle className="w-3 h-3" />
                    {latestScan.criticalCount} critical
                  </Badge>
                )}
                <Badge variant="secondary">{latestScan.issueCount} total issues</Badge>
                <Badge variant="secondary" className="capitalize">
                  {website.scanFrequency.toLowerCase()} scans
                </Badge>
              </div>
            )}
          </div>

          <AuditScanControls
            websiteId={website.id}
            runningScanId={
              latestScan?.status === "RUNNING" ? latestScan.id : null
            }
            label="Run audit"
            runningLabel="Scanning…"
            runVariant="default"
            size="lg"
            className="shrink-0"
          />
        </div>
      </div>

      {/* Health scores */}
      <Card className="rounded-2xl border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">Health scores</CardTitle>
          <CardDescription>
            Performance, accessibility, SEO, and security from your latest audit
          </CardDescription>
        </CardHeader>
        <CardContent>
          {latestScan?.completedAt && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
              <Calendar className="w-3 h-3" />
              Last scan: {formatDate(latestScan.completedAt)}
            </div>
          )}
          {latestScan ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
            <div className="col-span-2 sm:col-span-1 flex justify-center">
              <ScoreGauge score={latestScan.overallScore} label="Overall" size="lg" />
            </div>
            <ScoreGauge score={latestScan.performanceScore} label="Performance" size="md" />
            <ScoreGauge score={latestScan.accessibilityScore} label="Accessibility" size="md" />
            <ScoreGauge score={latestScan.seoScore} label="SEO" size="md" />
            <ScoreGauge score={latestScan.securityScore} label="Security" size="md" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-secondary/40 flex items-center justify-center mb-4">
              <BarChart2 className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No audits yet</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Run your first audit to see health scores and Core Web Vitals for this site.
            </p>
          </div>
        )}
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      {latestScan && (
        <section className="bg-card border border-border/30 rounded-2xl p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Core Web Vitals</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Google&apos;s key user experience metrics from your latest Lighthouse run
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coreVitals.map(({ key, abbr, name }) => (
              <VitalCard
                key={key}
                vitalKey={key}
                abbr={abbr}
                name={name}
                value={latestScan[key as keyof SerializedScan] as number | null}
              />
            ))}
          </div>

          <div className="pt-2 border-t border-border/20 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Lab metrics</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Additional Lighthouse timing metrics (not official Core Web Vitals)
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {labMetrics.map(({ key, abbr, name }) => (
                <VitalCard
                  key={key}
                  vitalKey={key}
                  abbr={abbr}
                  name={name}
                  value={latestScan[key as keyof SerializedScan] as number | null}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Audit categories */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Audit reports</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Drill into detailed findings for each category
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AUDIT_PAGES.map((page) => {
            const score =
              page.scoreKey && latestScan
                ? (latestScan[page.scoreKey] as number | null)
                : null;
            return (
              <Link
                key={page.key}
                href={page.href(website.id)}
                className="group bg-card border border-border/30 rounded-2xl p-5 hover:border-border/60 hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`flex items-center justify-center w-11 h-11 rounded-xl border shrink-0 ${page.color}`}
                  >
                    {page.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">{page.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {page.description}
                    </p>
                    {score !== null && (
                      <p className="text-xs font-medium text-foreground/80 mt-1.5">
                        Score: <span className="tabular-nums">{score}</span>/100
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Broken links — separate from audit metrics */}
      <BrokenLinksSection websiteId={website.id} scan={latestBrokenLinkScan} />

      {/* Score trends */}
      {scans.length > 1 && (
        <section className="bg-card border border-border/30 rounded-2xl p-6 md:p-8">
          <h2 className="text-lg font-bold text-foreground mb-1">Score trends</h2>
          <p className="text-sm text-muted-foreground mb-6">
            How your audit scores have changed over recent runs
          </p>
          <ScoreChart scans={scans} />
        </section>
      )}

      {/* Scan history */}
      {scans.length > 0 && (
        <section className="bg-card border border-border/30 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-border/20">
            <h2 className="text-lg font-bold text-foreground">Scan history</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Recent audit runs for this website
            </p>
          </div>
          <div className="divide-y divide-border/20">
            {scans.map((scan) => (
              <div
                key={scan.id}
                className="flex flex-wrap items-center gap-3 sm:gap-4 px-6 py-4 hover:bg-secondary/10 transition-colors text-sm"
              >
                <StatusBadge status={scan.status} />
                <span className="text-muted-foreground text-xs">
                  {formatDateTime(scan.createdAt)}
                </span>
                <div className="flex items-center gap-3 ml-auto">
                  {scan.overallScore !== null && (
                    <span className="font-bold text-foreground tabular-nums">
                      {scan.overallScore}
                      <span className="text-muted-foreground font-normal text-xs">/100</span>
                    </span>
                  )}
                  {scan.criticalCount > 0 && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400">
                      <AlertTriangle className="w-3 h-3" />
                      {scan.criticalCount} critical
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {scan.issueCount} issues
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
