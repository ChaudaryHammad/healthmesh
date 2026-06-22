"use client";

import React from "react";
import { Search, CheckCircle, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import { AuditPageShell, AuditSection, AuditIssueList, type AuditIssue } from "./audit-shared";
import type { SeoSnapshot, CheckStatus } from "@/lib/seo/fetch-seo-snapshot";

interface SeoAuditClientProps {
  websiteId: string;
  websiteName: string;
  websiteUrl: string;
  score: number | null;
  issues: AuditIssue[];
  lastScanned: string | null;
  snapshot: SeoSnapshot;
}

function statusIcon(status: CheckStatus) {
  switch (status) {
    case "pass":
      return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    case "warn":
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    case "fail":
      return <XCircle className="w-4 h-4 text-rose-400" />;
    default:
      return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
  }
}

function statusBadge(status: CheckStatus) {
  switch (status) {
    case "pass":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
    case "warn":
      return "bg-amber-500/10 text-amber-400 border-amber-500/25";
    case "fail":
      return "bg-rose-500/10 text-rose-400 border-rose-500/25";
    default:
      return "bg-secondary/40 text-muted-foreground border-border/30";
  }
}

function statusLabel(status: CheckStatus) {
  switch (status) {
    case "pass":
      return "Pass";
    case "warn":
      return "Needs work";
    case "fail":
      return "Fail";
    default:
      return "Unknown";
  }
}

export function SeoAuditClient({
  websiteId,
  websiteName,
  websiteUrl,
  score,
  issues,
  lastScanned,
  snapshot,
}: SeoAuditClientProps) {
  return (
    <AuditPageShell
      websiteId={websiteId}
      websiteName={websiteName}
      websiteUrl={websiteUrl}
      categoryLabel="SEO"
      score={score}
      icon={<Search className="w-5 h-5" />}
      accentClass="text-amber-400 bg-amber-500/10 border-amber-500/20"
      lastScanned={lastScanned}
    >
      {snapshot.error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-400">
          Could not fetch live page data: {snapshot.error}
        </div>
      )}

      {snapshot.reachable && (
        <AuditSection
          title="On-page SEO checklist"
          description="Live analysis of your homepage HTML (refreshed on each page load)"
        >
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{snapshot.passCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Passing</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{snapshot.warnCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Needs work</p>
            </div>
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-center">
              <p className="text-2xl font-bold text-rose-400">{snapshot.failCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Failing</p>
            </div>
          </div>

          <div className="space-y-3">
            {snapshot.checks.map((check) => (
              <div
                key={check.id}
                className="p-4 rounded-xl border border-border/30 bg-secondary/5 space-y-2"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {statusIcon(check.status)}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{check.label}</p>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusBadge(check.status)}`}
                        >
                          {statusLabel(check.status)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{check.detail}</p>
                    </div>
                  </div>
                </div>
                {check.value && (
                  <p className="text-[11px] font-mono text-foreground/70 bg-secondary/30 rounded-lg px-3 py-2 break-all">
                    {check.value}
                  </p>
                )}
                {check.status !== "pass" && (
                  <p className="text-xs text-muted-foreground pl-7">
                    <span className="font-medium text-foreground">Fix: </span>
                    {check.recommendation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </AuditSection>
      )}

      <AuditSection
        title="SEO best practices"
        description="Quick reference for improving search visibility"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            {
              title: "Unique titles & descriptions",
              text: "Every important page needs a unique title and meta description that matches search intent.",
            },
            {
              title: "Structured headings",
              text: "Use one H1 per page and nest H2/H3 logically — don't skip heading levels.",
            },
            {
              title: "Internal linking",
              text: "Link related pages together so crawlers and users can discover your content.",
            },
            {
              title: "Technical foundation",
              text: "Keep robots.txt, sitemap.xml, canonical URLs, and mobile-friendly design in good shape.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-4 rounded-xl border border-border/30 bg-secondary/5"
            >
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </AuditSection>

      <AuditSection title="Issues from last audit" description="Findings recorded during your most recent SEO scan">
        <AuditIssueList issues={issues} />
      </AuditSection>
    </AuditPageShell>
  );
}
