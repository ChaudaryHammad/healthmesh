import { Document, Page, Text } from "@react-pdf/renderer";
import type { BrokenLinksReportInput } from "@/lib/reports/generate-broken-links-pdf";
import { formatResourceTypes } from "@/lib/scanner/link-resource-types";
import {
  GroupedBrokenLinksFindingTable,
  PdfBrandHeader,
  PdfFixedFooter,
  PdfHeadlineBox,
  PdfTable,
  SummaryMetricsRow,
  sharedStyles,
} from "@/lib/reports/pdf/components";
import { colors } from "@/lib/reports/pdf/theme";
import { renderReactPdfToBuffer } from "@/lib/reports/pdf/render-to-buffer";

function formatCompletedDate(completedAt: string | null) {
  const date = completedAt ? new Date(completedAt) : new Date();
  return date.toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });
}

function BrokenLinksDocument({ input }: { input: BrokenLinksReportInput }) {
  const scanDate = formatCompletedDate(input.completedAt);
  const modeLabel = input.mode === "EXTERNAL" ? "External links" : "Internal links";
  const uniqueBroken = input.totalBrokenUnique ?? input.brokenCount;
  const occurrenceCount = input.occurrenceCount;

  const headlineItems =
    uniqueBroken > 0
      ? [
          `${uniqueBroken} unreachable URL${uniqueBroken === 1 ? "" : "s"} across ${input.pagesCrawled} page${input.pagesCrawled === 1 ? "" : "s"}`,
          occurrenceCount > uniqueBroken
            ? `${occurrenceCount} page occurrence${occurrenceCount === 1 ? "" : "s"}`
            : `${input.linksChecked} URLs checked · ${modeLabel}`,
          ...(input.findingsTruncated
            ? [`Showing top ${input.groups.length} of ${uniqueBroken} unreachable URLs in this PDF`]
            : []),
        ]
      : ["No unreachable URLs found"];

  const summaryRows = [
    { setting: "Scan mode", value: modeLabel },
    { setting: "Resource types", value: formatResourceTypes(input.resourceTypes) },
    { setting: "Pages crawled", value: String(input.pagesCrawled) },
    { setting: "URLs checked", value: String(input.linksChecked) },
    { setting: "Unreachable URLs", value: String(uniqueBroken) },
    { setting: "Page occurrences", value: String(occurrenceCount) },
  ];

  const groupRows = input.groups.map((group, index) => ({
    num: String(index + 1),
    sev: group.severity,
    status:
      group.statusCode !== null
        ? `HTTP ${group.statusCode}`
        : (group.errorMessage ?? "Unreachable"),
    url: group.href,
    pages: group.occurrences.map((o) => o.sourcePageUrl),
    pageCount: group.occurrences.length,
  }));

  const findingsHeading = input.findingsTruncated
    ? `Findings (top ${input.groups.length} of ${uniqueBroken})`
    : `Findings (${input.groups.length})`;

  return (
    <Document title={`Coverage — ${input.websiteName}`}>
      <Page size="A4" style={sharedStyles.page} wrap>
        <PdfBrandHeader
          websiteName={input.websiteName}
          websiteUrl={input.websiteUrl}
          scanDate={scanDate}
          subtitle="Coverage report"
        />

        <Text style={{ fontSize: 8, fontWeight: 700, color: colors.headerMuted, marginBottom: 4 }}>
          COVERAGE REPORT
        </Text>
        <Text style={sharedStyles.h1}>{input.websiteName}</Text>
        <Text style={{ fontSize: 8.5, color: colors.muted, marginBottom: 10 }}>
          {input.websiteUrl} · {scanDate}
        </Text>

        <SummaryMetricsRow
          items={[
            {
              label: "Unreachable",
              value: String(uniqueBroken),
              valueColor: uniqueBroken > 0 ? colors.critical : colors.scoreGood,
            },
            { label: "Pages crawled", value: String(input.pagesCrawled) },
            { label: "URLs checked", value: String(input.linksChecked) },
          ]}
        />

        <PdfHeadlineBox title="Summary" items={headlineItems} ok={uniqueBroken === 0} />

        <Text style={sharedStyles.h2}>Scan settings</Text>
        <PdfTable
          columns={[
            { key: "setting", label: "Setting", flex: 1 },
            { key: "value", label: "Value", flex: 2, wrap: true },
          ]}
          rows={summaryRows}
        />

        <Text style={sharedStyles.h2}>{findingsHeading}</Text>
        <GroupedBrokenLinksFindingTable rows={groupRows} />

        <PdfFixedFooter contextLabel="Coverage" />
      </Page>
    </Document>
  );
}

export async function buildBrokenLinksPdfBuffer(input: BrokenLinksReportInput) {
  return renderReactPdfToBuffer(<BrokenLinksDocument input={input} />);
}
