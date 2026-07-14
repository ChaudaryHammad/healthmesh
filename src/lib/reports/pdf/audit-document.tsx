import { Document, Page, Text } from "@react-pdf/renderer";
import type { Issue, IssueCategory, ReportType } from "@prisma/client";
import { formatIssueLocation, dedupeIssuesByTitle } from "@/lib/reports/format-issue-location";
import { formatActionableFix } from "@/lib/reports/render-branded-report-html";
import { getHeadlineIssues } from "@/lib/reports/report-highlights";
import { formatScanDate } from "@/lib/reports/report-html-shared";
import {
  categoryLabel,
  formatScore,
  getTopIssues,
  scoreDelta,
  type ReportScanContext,
} from "@/lib/reports/types";
import { colors } from "@/lib/reports/pdf/theme";
import {
  FindingCardList,
  PdfBrandHeader,
  PdfFixedFooter,
  PdfHeadlineBox,
  PdfTable,
  ReportIntro,
  ScoreHero,
  SummaryMetricsRow,
  sharedStyles,
  type CoverSeverityCounts,
} from "@/lib/reports/pdf/components";
import { renderReactPdfToBuffer } from "@/lib/reports/pdf/render-to-buffer";

const SEVERITY_ORDER = { CRITICAL: 0, MAJOR: 1, MINOR: 2, INFO: 3 } as const;

const AUDIT_CATEGORY_ORDER: IssueCategory[] = [
  "PERFORMANCE",
  "ACCESSIBILITY",
  "SEO",
  "SECURITY",
];

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

function severityCounts(issues: Issue[]): CoverSeverityCounts {
  return {
    critical: issues.filter((i) => i.severity === "CRITICAL").length,
    major: issues.filter((i) => i.severity === "MAJOR").length,
    minor: issues.filter((i) => i.severity === "MINOR").length,
    info: issues.filter((i) => i.severity === "INFO").length,
    total: issues.length,
  };
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
        { metric: "LCP", value: `${scan.lcp ?? "—"} ms`, target: "<= 2,500 ms" },
        { metric: "INP", value: `${scan.inp ?? "—"} ms`, target: "<= 200 ms" },
        { metric: "CLS", value: `${scan.cls ?? "—"}`, target: "<= 0.1" },
        { metric: "FCP", value: `${scan.fcp ?? "—"} ms`, target: "<= 1,800 ms" },
        { metric: "TBT", value: `${scan.tbt ?? "—"} ms`, target: "<= 200 ms" },
      ]}
    />
  );
}

function CategoryReportDocument({
  context,
  category,
  title,
}: {
  context: ReportScanContext;
  category: IssueCategory;
  title: string;
}) {
  const { website, scan, previousScan } = context;
  const scanDate = formatScanDate(scan.completedAt);
  const categoryIssues = sortIssues(scan.issues.filter((issue) => issue.category === category));
  const score = categoryScore(scan, category) ?? null;
  const prevScore = previousScan ? categoryScore(previousScan, category) ?? null : null;
  const delta = scoreDelta(score, prevScore);
  const counts = severityCounts(categoryIssues);
  const label = categoryLabel(category);

  return (
    <Document title={`${title} — ${website.name}`}>
      <Page size="A4" style={sharedStyles.page} wrap>
        <PdfBrandHeader
          websiteName={website.name}
          websiteUrl={website.url}
          scanDate={scanDate}
          subtitle={`${label} report`}
        />
        <ReportIntro
          reportTitle={title}
          websiteName={website.name}
          websiteUrl={website.url}
          scanDate={scanDate}
          overallScore={score}
          severityCounts={counts}
        />

        <SummaryMetricsRow
          items={[
            { label: "Category score", value: `${formatScore(score)} / 100` },
            { label: "Findings", value: String(categoryIssues.length) },
            {
              label: "vs previous",
              value: delta === null ? "—" : `${delta >= 0 ? "+" : ""}${delta}`,
              valueColor:
                delta === null ? colors.muted : delta >= 0 ? colors.scoreGood : colors.scoreBad,
            },
          ]}
        />

        {category === "PERFORMANCE" ? (
          <>
            <Text style={sharedStyles.h2}>Core Web Vitals (lab)</Text>
            <VitalsTable scan={scan} />
          </>
        ) : null}

        <Text style={sharedStyles.h2}>Priority issues</Text>
        {headlineItems(scan.issues, category).length > 0 ? (
          <PdfHeadlineBox title="Fix these first" items={headlineItems(scan.issues, category)} />
        ) : (
          <PdfHeadlineBox
            title="Looking good"
            items={["No critical or major issues in this category."]}
            ok
          />
        )}

        <Text style={sharedStyles.h2}>Findings ({categoryIssues.length})</Text>
        <FindingCardList rows={issueRows(categoryIssues)} />

        <PdfFixedFooter contextLabel={label} />
      </Page>
    </Document>
  );
}

function FullAuditDocument({ context }: { context: ReportScanContext }) {
  const { website, scan, previousScan } = context;
  const scanDate = formatScanDate(scan.completedAt);
  const counts = severityCounts(scan.issues);
  const priorityItems = headlineItems(scan.issues);

  const categoryCards = AUDIT_CATEGORY_ORDER.map((category) => ({
    label: categoryLabel(category),
    score: categoryScore(scan, category) ?? null,
  }));

  return (
    <Document title={`Audit — ${website.name}`}>
      {/* Dense page 1 — no empty cover */}
      <Page size="A4" style={sharedStyles.page} wrap>
        <PdfBrandHeader
          websiteName={website.name}
          websiteUrl={website.url}
          scanDate={scanDate}
          subtitle="Full audit report"
        />
        <ReportIntro
          reportTitle="Full audit report"
          websiteName={website.name}
          websiteUrl={website.url}
          scanDate={scanDate}
          overallScore={scan.overallScore}
          severityCounts={counts}
        />

        <Text style={sharedStyles.h2}>Category scores</Text>
        <ScoreHero overallScore={scan.overallScore} categories={categoryCards} hideOverall />

        <Text style={sharedStyles.h2}>Core Web Vitals (lab)</Text>
        <VitalsTable scan={scan} />

        <Text style={sharedStyles.h2}>Priority issues</Text>
        {priorityItems.length > 0 ? (
          <PdfHeadlineBox title="Fix these first" items={priorityItems} />
        ) : (
          <PdfHeadlineBox
            title="Looking good"
            items={["No critical or major issues in this scan."]}
            ok
          />
        )}

        <PdfFixedFooter contextLabel="Overview" />
      </Page>

      {AUDIT_CATEGORY_ORDER.map((category) => {
        const issues = sortIssues(scan.issues.filter((issue) => issue.category === category));
        const score = categoryScore(scan, category) ?? null;
        const prevScore = previousScan ? categoryScore(previousScan, category) ?? null : null;
        const delta = scoreDelta(score, prevScore);
        const label = categoryLabel(category);

        return (
          <Page key={category} size="A4" style={sharedStyles.page} wrap>
            <PdfBrandHeader
              websiteName={website.name}
              websiteUrl={website.url}
              scanDate={scanDate}
              subtitle={`Full audit · ${label}`}
            />
            <Text style={sharedStyles.h1}>{label}</Text>

            <SummaryMetricsRow
              items={[
                { label: "Score", value: `${formatScore(score)} / 100` },
                { label: "Findings", value: String(issues.length) },
                {
                  label: "vs previous",
                  value: delta === null ? "—" : `${delta >= 0 ? "+" : ""}${delta}`,
                  valueColor:
                    delta === null
                      ? colors.muted
                      : delta >= 0
                        ? colors.scoreGood
                        : colors.scoreBad,
                },
              ]}
            />

            {category === "PERFORMANCE" ? (
              <>
                <Text style={sharedStyles.h2}>Core Web Vitals (lab)</Text>
                <VitalsTable scan={scan} />
              </>
            ) : null}

            <Text style={sharedStyles.h2}>Findings ({issues.length})</Text>
            <FindingCardList rows={issueRows(issues)} />

            <PdfFixedFooter contextLabel={label} />
          </Page>
        );
      })}
    </Document>
  );
}

function ExecutiveSummaryDocument({ context }: { context: ReportScanContext }) {
  const { website, scan, previousScan } = context;
  const scanDate = formatScanDate(scan.completedAt);
  const topIssues = getTopIssues(scan.issues, 12);
  const counts = severityCounts(scan.issues);
  const overallDelta = scoreDelta(scan.overallScore, previousScan?.overallScore ?? null);

  const categoryCards = AUDIT_CATEGORY_ORDER.map((category) => {
    const current = categoryScore(scan, category) ?? null;
    const previous = previousScan ? categoryScore(previousScan, category) ?? null : null;
    return {
      label: categoryLabel(category),
      score: current,
      delta: scoreDelta(current, previous),
    };
  });

  return (
    <Document title={`Summary — ${website.name}`}>
      <Page size="A4" style={sharedStyles.page} wrap>
        <PdfBrandHeader
          websiteName={website.name}
          websiteUrl={website.url}
          scanDate={scanDate}
          subtitle="Executive summary"
        />
        <ReportIntro
          reportTitle="Executive summary"
          websiteName={website.name}
          websiteUrl={website.url}
          scanDate={scanDate}
          overallScore={scan.overallScore}
          severityCounts={counts}
        />

        <Text style={sharedStyles.h2}>Category scores</Text>
        <ScoreHero
          overallScore={scan.overallScore}
          overallDelta={overallDelta}
          categories={categoryCards}
          hideOverall
        />

        <Text style={sharedStyles.h2}>Priority fixes ({topIssues.length})</Text>
        <FindingCardList rows={issueRows(topIssues)} />

        <PdfFixedFooter contextLabel="Executive summary" />
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
        <CategoryReportDocument
          context={context}
          category="PERFORMANCE"
          title="Performance report"
        />,
      );
    case "SEO_REPORT":
      return renderReactPdfToBuffer(
        <CategoryReportDocument context={context} category="SEO" title="SEO report" />,
      );
    case "SECURITY_REPORT":
      return renderReactPdfToBuffer(
        <CategoryReportDocument context={context} category="SECURITY" title="Security report" />,
      );
    case "ACCESSIBILITY_REPORT":
      return renderReactPdfToBuffer(
        <CategoryReportDocument
          context={context}
          category="ACCESSIBILITY"
          title="Accessibility report"
        />,
      );
    default:
      throw new Error("Unsupported PDF report type.");
  }
}
