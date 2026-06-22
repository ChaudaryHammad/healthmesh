"use client";

import React from "react";
import { Zap, Gauge, Clock, Layers } from "lucide-react";
import { AuditPageShell, AuditSection, AuditIssueList, type AuditIssue } from "./audit-shared";
import {
  VITAL_DEFINITIONS,
  formatVitalValue,
  getVitalRating,
  vitalRatingClasses,
  vitalRatingLabel,
} from "@/lib/web-vitals";

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  cls: number | null;
  inp: number | null;
  tbt: number | null;
}

interface PerformanceAuditClientProps {
  websiteId: string;
  websiteName: string;
  websiteUrl: string;
  score: number | null;
  issues: AuditIssue[];
  lastScanned: string | null;
  metrics: PerformanceMetrics | null;
}

const PERFORMANCE_TIPS = [
  {
    icon: <Gauge className="w-4 h-4" />,
    title: "Optimize LCP",
    description:
      "Preload hero images, use modern formats (WebP/AVIF), and eliminate render-blocking resources above the fold.",
  },
  {
    icon: <Clock className="w-4 h-4" />,
    title: "Reduce blocking time",
    description:
      "Split large JavaScript bundles, defer non-critical scripts, and remove unused third-party tags.",
  },
  {
    icon: <Layers className="w-4 h-4" />,
    title: "Stabilize layout (CLS)",
    description:
      "Set explicit width/height on images and embeds, reserve space for ads, and avoid inserting content above existing content.",
  },
  {
    icon: <Zap className="w-4 h-4" />,
    title: "Improve interactivity (INP)",
    description:
      "Break up long tasks, use web workers for heavy computation, and minimize main-thread work during interactions.",
  },
];

export function PerformanceAuditClient({
  websiteId,
  websiteName,
  websiteUrl,
  score,
  issues,
  lastScanned,
  metrics,
}: PerformanceAuditClientProps) {
  const criticalCount = issues.filter((i) => i.severity === "CRITICAL").length;
  const majorCount = issues.filter((i) => i.severity === "MAJOR").length;

  const coreVitals = VITAL_DEFINITIONS.filter((v) => v.isCoreWebVital);
  const labMetrics = VITAL_DEFINITIONS.filter((v) => !v.isCoreWebVital);

  return (
    <AuditPageShell
      websiteId={websiteId}
      websiteName={websiteName}
      websiteUrl={websiteUrl}
      categoryLabel="Performance"
      score={score}
      icon={<Zap className="w-5 h-5" />}
      accentClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      lastScanned={lastScanned}
    >
      {metrics && (
        <AuditSection
          title="Core Web Vitals"
          description="Key user experience metrics from your latest Lighthouse performance audit"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coreVitals.map(({ key, abbr, name }) => {
              const val = metrics[key as keyof PerformanceMetrics];
              const rating = getVitalRating(key, val);
              const styles = vitalRatingClasses(rating);
              return (
                <div
                  key={key}
                  className={`rounded-xl border p-5 text-center space-y-2 ${styles.border} bg-secondary/10`}
                >
                  <p className="text-sm font-semibold text-foreground">{abbr}</p>
                  <p className={`text-3xl font-bold tabular-nums ${styles.text}`}>
                    {formatVitalValue(key, val)}
                  </p>
                  <p className="text-xs text-muted-foreground">{name}</p>
                  <span
                    className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border ${styles.badge}`}
                  >
                    {vitalRatingLabel(rating)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border/20">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Lab metrics</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {labMetrics.map(({ key, abbr, name }) => {
                const val = metrics[key as keyof PerformanceMetrics];
                const rating = getVitalRating(key, val);
                const styles = vitalRatingClasses(rating);
                return (
                  <div
                    key={key}
                    className={`rounded-xl border p-4 flex items-center justify-between gap-4 ${styles.border} bg-secondary/5`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{abbr}</p>
                      <p className="text-xs text-muted-foreground">{name}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold tabular-nums ${styles.text}`}>
                        {formatVitalValue(key, val)}
                      </p>
                      <span className={`text-[10px] font-medium ${styles.text}`}>
                        {vitalRatingLabel(rating)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </AuditSection>
      )}

      <AuditSection
        title="Issue summary"
        description="Breakdown of Lighthouse performance findings from your last audit"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border/30 bg-secondary/10 p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{issues.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total issues</p>
          </div>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-center">
            <p className="text-2xl font-bold text-rose-400">{criticalCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Critical</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{majorCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Major</p>
          </div>
          <div className="rounded-xl border border-border/30 bg-secondary/10 p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{score ?? "—"}</p>
            <p className="text-xs text-muted-foreground mt-1">Lighthouse score</p>
          </div>
        </div>
      </AuditSection>

      <AuditSection title="Improvement guide" description="Actionable steps based on common performance bottlenecks">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PERFORMANCE_TIPS.map((tip) => (
            <div
              key={tip.title}
              className="flex gap-3 p-4 rounded-xl border border-border/30 bg-secondary/5"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                {tip.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </AuditSection>

      <AuditSection title="Lighthouse findings" description="Detailed issues from your last performance audit">
        <AuditIssueList issues={issues} />
      </AuditSection>
    </AuditPageShell>
  );
}
