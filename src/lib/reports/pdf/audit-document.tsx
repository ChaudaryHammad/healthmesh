import { Document, Page, Text } from "@react-pdf/renderer";
import type { Issue, IssueCategory, ReportType } from "@prisma/client";
import { formatIssueLocation, dedupeIssuesByTitle } from "@/lib/reports/format-issue-location";
import { formatActionableFix } from "@/lib/reports/render-branded-report-html";
import { getHeadlineIssues } from "@/lib/reports/report-highlights";
import { formatScanDate, LOOPNODE_BRAND } from "@/lib/reports/report-html-shared";
import {
  categoryLabel,
  formatScore,
  getTopIssues,
  groupIssuesByCategory,
  scoreDelta,
  type ReportScanContext,
} from "@/lib/reports/types";
import {
  FindingTable,
  PdfFooter,
  PdfHeadlineBox,
  PdfPageHeader,
  PdfTable,
  sharedStyles,
} from "@/lib/reports/pdf/components";
import { renderReactPdfToBuffer } from "@/lib/reports/pdf/render-to-buffer";

const SEVERITY_ORDER = { CRITICAL: 0, MAJOR: 1, MINOR: 2, INFO: 3 } as const;

function sortIssues(issues: Issue[]) {
  return [...issues].sort((a, b) => {
    const sev = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (sev !== 0) return sev;
    return a.title.localeCompare(b.title);
  });
}

function categoryScore(scan: ReportScanContext["scan"], category: IssueCategory) {
  switch (category) {
    case "PERFORMANCE":
      return scan.performanceScore;
    case "ACCESSIBILITY":
      return scan.accessibilityScore;
    case "SEO":
      return scan.seoScore;
    case "SECURITY":
      return scan.securityScore;
    default:
      return scan.overallScore;
  }
}

function headlineItems(issues: Issue[], category?: IssueCategory) {
  return dedupeIssuesByTitle(getHeadlineIssues(issues, { limit: 8, category })).map((issue) => {
    const sev = issue.severity === "CRITICAL" ? "Critical" : "Major";
    return `${sev}: ${issue.title}`;
  });
}

function issueRows(issues: Issue[], startIndex = 0) {
  return issues.map((issue, index) => ({
    index: String(startIndex + index + 1),
    severity: issue.severity,
    title: issue.title,
    description: issue.description ?? "",
    location: formatIssueLocation(issue),
    action: formatActionableFix(issue),
  }));
}

function ScoresTable({
  context,
  includeDeltas,
}: {
  context: ReportScanContext;
  includeDeltas: boolean;
}) {
  const { scan, previousScan: prev } = context;
  const rows = [
    ["Overall", scan.overallScore, prev?.overallScore],
    ["Performance", scan.performanceScore, prev?.performanceScore],
    ["Accessibility", scan.accessibilityScore, prev?.accessibilityScore],
    ["SEO", scan.seoScore, prev?.seoScore],
    ["Security", scan.securityScore, prev?.securityScore],
  ] as const;

  return (
    <PdfTable
      columns={[
        { key: "category", label: "Category", flex: 1.2 },
        { key: "score", label: "Score", flex: 0.8 },
        ...(includeDeltas ? [{ key: "change", label: "Change", flex: 0.8 }] : []),
      ]}
      rows={rows.map(([label, current, previous]) => {
        const delta = includeDeltas ? scoreDelta(current ?? null, previous ?? null) : null;
        return {
          category: label,
          score: formatScore(current ?? null),
          ...(includeDeltas
            ? { change: delta === null ? "—" : `${delta >= 0 ? "+" : ""}${delta}` }
            : {}),
        };
      })}
    />
  );
}

function VitalsTable({ scan }: { scan: ReportScanContext["scan"] }) {
  return (
    <PdfTable
      columns={[
        { key: "metric", label: "Metric", flex: 1 },
        { key: "value", label: "Value", flex: 1 },
        { key: "target", label: "Target (good)", flex: 1.2 },
      ]}
      rows={[
        { metric: "LCP", value: `${scan.lcp ?? "—"} ms`, target: "≤ 2,500 ms" },
        { metric: "INP", value: `${scan.inp ?? "—"} ms`, target: "≤ 200 ms" },
        { metric: "CLS", value: `${scan.cls ?? "—"}`, target: "≤ 0.1" },
        { metric: "FCP", value: `${scan.fcp ?? "—"} ms`, target: "≤ 1,800 ms" },
        { metric: "TBT", value: `${scan.tbt ?? "—"} ms`, target: "≤ 200 ms" },
      ]}
    />
  );
}

function CategoryReportPage({
  context,
  category,
  title,
}: {
  context: ReportScanContext;
  category: IssueCategory;
  title: string;
}) {
  const { website, scan } = context;
  const scanDate = formatScanDate(scan.completedAt);
  const categoryIssues = sortIssues(scan.issues.filter((issue) => issue.category === category));
  const score = categoryScore(scan, category);

  return (
    <Page size="A4" style={sharedStyles.page}>
      <PdfPageHeader
        websiteName={website.name}
        websiteUrl={website.url}
        scanDate={scanDate}
        subtitle={`${categoryLabel(category)} report`}
      />
      <Text style={sharedStyles.h1}>{title}</Text>
      <PdfHeadlineBox title="Priority issues — fix first" items={headlineItems(scan.issues, category)} />
      <Text style={sharedStyles.h2}>Score</Text>
      <PdfTable
        columns={[
          { key: "category", label: "Category", flex: 1.2 },
          { key: "score", label: "Score", flex: 1 },
        ]}
        rows={[
          {
            category: categoryLabel(category),
            score: `${formatScore(score ?? null)} / 100`,
          },
        ]}
      />
      {category === "PERFORMANCE" ? (
        <>
          <Text style={sharedStyles.h2}>Core Web Vitals (lab)</Text>
          <VitalsTable scan={scan} />
        </>
      ) : null}
      <Text style={sharedStyles.h2}>
        All {categoryLabel(category).toLowerCase()} findings ({categoryIssues.length})
      </Text>
      <FindingTable rows={issueRows(categoryIssues)} />
      <PdfFooter left={`${LOOPNODE_BRAND} · loopnode.app`} right={categoryLabel(category)} />
    </Page>
  );
}

function FullAuditDocument({ context }: { context: ReportScanContext }) {
  const { website, scan } = context;
  const scanDate = formatScanDate(scan.completedAt);
  const sorted = sortIssues(scan.issues);
  const grouped = groupIssuesByCategory(sorted);
  let issueIndex = 0;

  return (
    <Document title={`Audit — ${website.name}`}>
      <Page size="A4" style={sharedStyles.page}>
        <PdfPageHeader websiteName={website.name} websiteUrl={website.url} scanDate={scanDate} />
        <Text style={sharedStyles.h1}>Full audit report</Text>
        <PdfHeadlineBox title="Priority issues — fix first" items={headlineItems(scan.issues)} />
        <Text style={sharedStyles.h2}>Scores</Text>
        <ScoresTable context={context} includeDeltas={false} />
        <Text style={sharedStyles.h2}>Core Web Vitals (lab)</Text>
        <VitalsTable scan={scan} />
        <Text style={sharedStyles.h2}>All findings ({sorted.length})</Text>
        <FindingTable rows={issueRows(sorted)} />
        <PdfFooter left={`${LOOPNODE_BRAND} · loopnode.app`} right={website.name} />
      </Page>

      {Object.entries(grouped).map(([category, issues]) => {
        const startIndex = issueIndex;
        issueIndex += issues.length;
        return (
          <Page key={category} size="A4" style={sharedStyles.page}>
            <PdfPageHeader
              websiteName={website.name}
              websiteUrl={website.url}
              scanDate={scanDate}
              subtitle={categoryLabel(category as IssueCategory)}
            />
            <Text style={sharedStyles.h1}>{categoryLabel(category as IssueCategory)}</Text>
            <PdfHeadlineBox
              title="Priority issues — fix first"
              items={headlineItems(scan.issues, category as IssueCategory)}
            />
            <FindingTable rows={issueRows(issues, startIndex)} />
            <PdfFooter left={LOOPNODE_BRAND} right={categoryLabel(category as IssueCategory)} />
          </Page>
        );
      })}
    </Document>
  );
}

function ExecutiveSummaryDocument({ context }: { context: ReportScanContext }) {
  const { website, scan } = context;
  const scanDate = formatScanDate(scan.completedAt);
  const topIssues = getTopIssues(scan.issues, 15);
  const criticalCount = scan.issues.filter((issue) => issue.severity === "CRITICAL").length;

  return (
    <Document title={`Summary — ${website.name}`}>
      <Page size="A4" style={sharedStyles.page}>
        <PdfPageHeader
          websiteName={website.name}
          websiteUrl={website.url}
          scanDate={scanDate}
          subtitle="Executive summary"
        />
        <Text style={sharedStyles.h1}>Executive summary</Text>
        <PdfHeadlineBox title="Priority issues — fix first" items={headlineItems(scan.issues)} />
        <PdfTable
          columns={[
            { key: "metric", label: "Metric", flex: 1.2 },
            { key: "value", label: "Value", flex: 1 },
          ]}
          rows={[
            { metric: "Overall score", value: `${formatScore(scan.overallScore)} / 100` },
            { metric: "Critical issues", value: String(criticalCount) },
            { metric: "Total issues", value: String(scan.issues.length) },
          ]}
        />
        <Text style={sharedStyles.h2}>Category scores</Text>
        <ScoresTable context={context} includeDeltas={true} />
        <Text style={sharedStyles.h2}>Priority fixes ({topIssues.length})</Text>
        <FindingTable rows={issueRows(topIssues)} />
        <PdfFooter left={`${LOOPNODE_BRAND} · loopnode.app`} right="Executive summary" />
      </Page>
    </Document>
  );
}

export async function buildAuditReportPdfBuffer(type: ReportType, context: ReportScanContext) {
  switch (type) {
    case "FULL_AUDIT":
      return renderReactPdfToBuffer(<FullAuditDocument context={context} />);
    case "EXECUTIVE_SUMMARY":
      return renderReactPdfToBuffer(<ExecutiveSummaryDocument context={context} />);
    case "PERFORMANCE_REPORT":
      return renderReactPdfToBuffer(
        <Document title={`Performance — ${context.website.name}`}>
          <CategoryReportPage context={context} category="PERFORMANCE" title="Performance report" />
        </Document>
      );
    case "SEO_REPORT":
      return renderReactPdfToBuffer(
        <Document title={`SEO — ${context.website.name}`}>
          <CategoryReportPage context={context} category="SEO" title="SEO report" />
        </Document>
      );
    case "SECURITY_REPORT":
      return renderReactPdfToBuffer(
        <Document title={`Security — ${context.website.name}`}>
          <CategoryReportPage context={context} category="SECURITY" title="Security report" />
        </Document>
      );
    case "ACCESSIBILITY_REPORT":
      return renderReactPdfToBuffer(
        <Document title={`Accessibility — ${context.website.name}`}>
          <CategoryReportPage context={context} category="ACCESSIBILITY" title="Accessibility report" />
        </Document>
      );
    default:
      throw new Error("Unsupported PDF report type.");
  }
}
