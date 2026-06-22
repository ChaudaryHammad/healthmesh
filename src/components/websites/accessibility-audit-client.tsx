"use client";

import React, { useMemo } from "react";
import { Eye, Users, Keyboard, Monitor } from "lucide-react";
import { AuditPageShell, AuditSection, AuditIssueList, type AuditIssue } from "./audit-shared";

interface AccessibilityAuditClientProps {
  websiteId: string;
  websiteName: string;
  websiteUrl: string;
  score: number | null;
  issues: AuditIssue[];
  lastScanned: string | null;
}

const WCAG_GUIDES = [
  {
    icon: <Users className="w-4 h-4" />,
    title: "Perceivable",
    description: "Provide text alternatives, captions, and sufficient color contrast for all users.",
  },
  {
    icon: <Keyboard className="w-4 h-4" />,
    title: "Operable",
    description: "Ensure keyboard navigation, visible focus states, and no keyboard traps.",
  },
  {
    icon: <Monitor className="w-4 h-4" />,
    title: "Understandable",
    description: "Use clear labels, predictable navigation, and helpful error messages.",
  },
  {
    icon: <Eye className="w-4 h-4" />,
    title: "Robust",
    description: "Use valid HTML, ARIA roles correctly, and test with assistive technologies.",
  },
];

export function AccessibilityAuditClient({
  websiteId,
  websiteName,
  websiteUrl,
  score,
  issues,
  lastScanned,
}: AccessibilityAuditClientProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, { title: string; count: number; severity: AuditIssue["severity"] }>();
    for (const issue of issues) {
      const existing = map.get(issue.title);
      if (existing) {
        existing.count += 1;
        const order = { CRITICAL: 0, MAJOR: 1, MINOR: 2, INFO: 3 };
        if (order[issue.severity] < order[existing.severity]) {
          existing.severity = issue.severity;
        }
      } else {
        map.set(issue.title, { title: issue.title, count: 1, severity: issue.severity });
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      const order = { CRITICAL: 0, MAJOR: 1, MINOR: 2, INFO: 3 };
      return order[a.severity] - order[b.severity] || b.count - a.count;
    });
  }, [issues]);

  const counts = {
    CRITICAL: issues.filter((i) => i.severity === "CRITICAL").length,
    MAJOR: issues.filter((i) => i.severity === "MAJOR").length,
    MINOR: issues.filter((i) => i.severity === "MINOR").length,
    INFO: issues.filter((i) => i.severity === "INFO").length,
  };

  return (
    <AuditPageShell
      websiteId={websiteId}
      websiteName={websiteName}
      websiteUrl={websiteUrl}
      categoryLabel="Accessibility"
      score={score}
      icon={<Eye className="w-5 h-5" />}
      accentClass="text-violet-400 bg-violet-500/10 border-violet-500/20"
      lastScanned={lastScanned}
    >
      <AuditSection
        title="Violation summary"
        description="axe-core WCAG 2.x findings grouped by impact level"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-center">
            <p className="text-2xl font-bold text-rose-400">{counts.CRITICAL}</p>
            <p className="text-xs text-muted-foreground mt-1">Critical</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{counts.MAJOR}</p>
            <p className="text-xs text-muted-foreground mt-1">Serious</p>
          </div>
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{counts.MINOR}</p>
            <p className="text-xs text-muted-foreground mt-1">Moderate</p>
          </div>
          <div className="rounded-xl border border-border/30 bg-secondary/10 p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{counts.INFO}</p>
            <p className="text-xs text-muted-foreground mt-1">Minor</p>
          </div>
        </div>
      </AuditSection>

      {grouped.length > 0 && (
        <AuditSection
          title="Rules affected"
          description="Most common accessibility rules failing on your site"
        >
          <div className="space-y-2">
            {grouped.slice(0, 8).map((rule) => (
              <div
                key={rule.title}
                className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border/30 bg-secondary/5"
              >
                <p className="text-sm text-foreground font-medium truncate">{rule.title}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {rule.count} instance{rule.count !== 1 ? "s" : ""}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                      rule.severity === "CRITICAL"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : rule.severity === "MAJOR"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-secondary/40 text-muted-foreground border-border/30"
                    }`}
                  >
                    {rule.severity.charAt(0) + rule.severity.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </AuditSection>
      )}

      <AuditSection title="WCAG principles" description="Framework for making your site accessible to everyone">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {WCAG_GUIDES.map((guide) => (
            <div
              key={guide.title}
              className="flex gap-3 p-4 rounded-xl border border-border/30 bg-secondary/5"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 shrink-0">
                {guide.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{guide.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{guide.description}</p>
              </div>
            </div>
          ))}
        </div>
      </AuditSection>

      <AuditSection title="All violations" description="Every accessibility issue found in your last audit">
        <AuditIssueList issues={issues} />
      </AuditSection>
    </AuditPageShell>
  );
}
