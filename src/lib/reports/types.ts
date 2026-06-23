import type { Issue, ReportType, Scan, Website } from "@prisma/client";
import { CATEGORY_LABELS } from "@/lib/issues";

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  FULL_AUDIT: "Full audit report",
  EXECUTIVE_SUMMARY: "Executive summary",
  ISSUES_CSV: "Issues export (CSV)",
};

export type ScanWithIssues = Scan & {
  issues: Issue[];
};

export type ReportScanContext = {
  website: Pick<Website, "id" | "name" | "url">;
  scan: ScanWithIssues;
  previousScan: ScanWithIssues | null;
};

export function formatScore(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return String(Math.round(value));
}

export function scoreDelta(current: number | null, previous: number | null) {
  if (current === null || previous === null) return null;
  return Math.round(current - previous);
}

export function buildReportTitle(
  type: ReportType,
  websiteName: string,
  scanDate: Date | null
) {
  const dateLabel = scanDate
    ? scanDate.toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  switch (type) {
    case "FULL_AUDIT":
      return `Full audit — ${websiteName} — ${dateLabel}`;
    case "EXECUTIVE_SUMMARY":
      return `Executive summary — ${websiteName} — ${dateLabel}`;
    case "ISSUES_CSV":
      return `Issues CSV — ${websiteName} — ${dateLabel}`;
    default:
      return `Report — ${websiteName} — ${dateLabel}`;
  }
}

export function groupIssuesByCategory(issues: Issue[]) {
  return issues.reduce(
    (acc, issue) => {
      const key = issue.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(issue);
      return acc;
    },
    {} as Record<Issue["category"], Issue[]>
  );
}

export function getTopIssues(issues: Issue[], limit = 5) {
  const order = { CRITICAL: 0, MAJOR: 1, MINOR: 2, INFO: 3 };
  return [...issues]
    .sort((a, b) => order[a.severity] - order[b.severity])
    .slice(0, limit);
}

export function categoryLabel(category: Issue["category"]) {
  return CATEGORY_LABELS[category] ?? category;
}
