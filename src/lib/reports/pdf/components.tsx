import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { HEALTHMESH_BRAND } from "@/lib/reports/report-html-shared";
import { colors, fonts, scoreColor } from "@/lib/reports/pdf/theme";

export const sharedStyles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 52,
    paddingHorizontal: 40,
    fontFamily: fonts.body,
    fontSize: 9.5,
    color: colors.text,
    lineHeight: 1.4,
  },
  coverPage: {
    paddingTop: 32,
    paddingBottom: 52,
    paddingHorizontal: 40,
    fontFamily: fonts.body,
    fontSize: 9.5,
    color: colors.text,
    lineHeight: 1.4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: colors.text,
    paddingBottom: 14,
    marginBottom: 28,
  },
  headerBrand: {
    flexDirection: "column",
    flexShrink: 0,
    maxWidth: 280,
  },
  headerMeta: {
    flexDirection: "column",
    alignItems: "flex-end",
    flexShrink: 0,
    maxWidth: 220,
  },
  logo: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: -0.5,
    lineHeight: 1.3,
  },
  logoBlock: {
    marginBottom: 6,
  },
  logoSub: {
    fontSize: 8,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    lineHeight: 1.4,
  },
  meta: {
    fontSize: 8.5,
    color: colors.muted,
    lineHeight: 1.4,
    textAlign: "right",
    marginBottom: 2,
  },
  metaStrong: {
    color: colors.text,
    fontWeight: 700,
  },
  h1: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 6,
    color: colors.text,
  },
  h2: {
    fontSize: 10,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
    color: colors.text,
  },
  footer: {
    marginTop: 32,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: colors.footer,
  },
  fixedFooter: {
    position: "absolute",
    left: 40,
    right: 40,
    bottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fixedFooterText: {
    fontSize: 7,
    color: colors.footer,
  },
  brandHeader: {
    marginBottom: 10,
  },
  brandAccentBar: {
    height: 3,
    backgroundColor: colors.borderStrong,
    marginBottom: 8,
  },
  brandHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandWordmark: {
    fontSize: 13,
    fontWeight: 700,
    color: colors.headerText,
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 7.5,
    color: colors.headerMuted,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginTop: 2,
  },
  headlineBox: {
    backgroundColor: colors.headlineBg,
    borderWidth: 1,
    borderColor: colors.headlineBorder,
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  headlineBoxOk: {
    backgroundColor: colors.okBg,
    borderColor: colors.okBorder,
  },
  headlineTitle: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.headlineText,
    marginBottom: 4,
  },
  headlineTitleOk: {
    color: colors.okTitle,
  },
  headlineItem: {
    fontSize: 8.5,
    color: colors.headlineItem,
    marginBottom: 2,
    lineHeight: 1.35,
  },
  headlineItemOk: {
    color: colors.okItem,
  },
  table: {
    marginTop: 4,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  th: {
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.muted,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 5,
    paddingHorizontal: 6,
    alignItems: "flex-start",
  },
  td: {
    fontSize: 8.5,
    paddingRight: 4,
  },
  tdWrap: {
    lineHeight: 1.35,
  },
  tdStrong: {
    fontWeight: 700,
  },
  tdMuted: {
    fontSize: 8,
    color: colors.muted,
    marginTop: 1,
  },
  mono: {
    fontFamily: fonts.mono,
    fontSize: 8,
    color: "#475569",
  },
  action: {
    color: colors.action,
    fontSize: 8.5,
  },
  empty: {
    color: colors.muted,
    fontSize: 8.5,
  },
  scoreHeroWrap: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 8,
  },
  scoreHeroMain: {
    width: 110,
    marginRight: 8,
    backgroundColor: colors.headerBg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 4,
    padding: 8,
  },
  scoreHeroLabel: {
    fontSize: 7,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.headerMuted,
    marginBottom: 2,
  },
  scoreHeroValue: {
    fontSize: 26,
    fontWeight: 700,
    lineHeight: 1.05,
  },
  scoreHeroSub: {
    fontSize: 7.5,
    color: colors.muted,
    marginTop: 2,
  },
  scoreCardRow: {
    flexDirection: "row",
    flexGrow: 1,
  },
  scoreCard: {
    flexGrow: 1,
    flexBasis: 0,
    backgroundColor: colors.headerBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 6,
    marginRight: 6,
  },
  scoreCardLast: {
    marginRight: 0,
  },
  scoreCardLabel: {
    fontSize: 6.5,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: colors.muted,
    marginBottom: 2,
  },
  scoreCardValue: {
    fontSize: 13,
    fontWeight: 700,
  },
  scoreCardDelta: {
    fontSize: 7,
    marginTop: 1,
  },
  metricStrip: {
    flexDirection: "row",
    marginBottom: 8,
  },
  metricChip: {
    flexGrow: 1,
    flexBasis: 0,
    backgroundColor: colors.headerBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 6,
    marginRight: 6,
  },
  metricChipLast: {
    marginRight: 0,
  },
  metricChipLabel: {
    fontSize: 6.5,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: colors.muted,
    marginBottom: 2,
  },
  metricChipValue: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.text,
  },
  findingCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 6,
    backgroundColor: colors.surface,
  },
  findingCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  findingCardTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: colors.text,
    marginBottom: 2,
    lineHeight: 1.3,
  },
  findingFieldLabel: {
    fontSize: 6.5,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: colors.muted,
    marginBottom: 1,
    marginTop: 3,
  },
  severityPill: {
    borderRadius: 2,
    paddingVertical: 1,
    paddingHorizontal: 4,
    marginLeft: 6,
  },
  severityPillText: {
    fontSize: 6.5,
    fontWeight: 700,
    letterSpacing: 0.2,
  },
});

export function PdfPageHeader({
  websiteName,
  websiteUrl,
  scanDate,
  subtitle = "Website audit report",
}: {
  websiteName: string;
  websiteUrl: string;
  scanDate: string;
  subtitle?: string;
}) {
  return (
    <PdfBrandHeader
      websiteName={websiteName}
      websiteUrl={websiteUrl}
      scanDate={scanDate}
      subtitle={subtitle}
    />
  );
}

/** Gray slate brand header used across all redesigned PDF report types. */
export function PdfBrandHeader({
  websiteName,
  websiteUrl,
  scanDate,
  subtitle = "Website audit report",
}: {
  websiteName: string;
  websiteUrl: string;
  scanDate: string;
  subtitle?: string;
}) {
  return (
    <View style={sharedStyles.brandHeader} fixed={false}>
      <View style={sharedStyles.brandAccentBar} />
      <View style={sharedStyles.brandHeaderRow}>
        <View style={{ maxWidth: 280 }}>
          <Text style={sharedStyles.brandWordmark}>{HEALTHMESH_BRAND}</Text>
          <Text style={sharedStyles.brandSubtitle}>{subtitle}</Text>
        </View>
        <View style={{ alignItems: "flex-end", maxWidth: 250 }}>
          <Text style={[sharedStyles.meta, sharedStyles.metaStrong, { textAlign: "right" }]}>
            {websiteName}
          </Text>
          <Text style={[sharedStyles.meta, { textAlign: "right" }]}>{websiteUrl}</Text>
          <Text style={[sharedStyles.meta, { marginBottom: 0, textAlign: "right" }]}>{scanDate}</Text>
        </View>
      </View>
    </View>
  );
}

export function PdfFooter({ left, right }: { left: string; right: string }) {
  return (
    <View style={sharedStyles.footer}>
      <Text>{left}</Text>
      <Text>{right}</Text>
    </View>
  );
}

/**
 * Page-bottom footer. `fixed` pins it to every page bottom regardless of content height.
 * Keep as a direct child of <Page>; page paddingBottom reserves space above it.
 */
export function PdfFixedFooter({ contextLabel }: { contextLabel?: string }) {
  const left = `${HEALTHMESH_BRAND}${contextLabel ? ` · ${contextLabel}` : ""}`;
  return (
    <View style={sharedStyles.fixedFooter} fixed>
      <Text style={sharedStyles.fixedFooterText}>{left}</Text>
      <Text
        style={sharedStyles.fixedFooterText}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}

export type CoverSeverityCounts = {
  critical: number;
  major: number;
  minor: number;
  info: number;
  total: number;
};

/** Dense title + severity strip for page 1 (site meta lives in PdfBrandHeader). */
export function ReportIntro({
  reportTitle,
  overallScore,
  severityCounts,
}: {
  reportTitle: string;
  websiteName?: string;
  websiteUrl?: string;
  scanDate?: string;
  overallScore: number | null;
  severityCounts: CoverSeverityCounts;
}) {
  const scoreLabel =
    overallScore === null || overallScore === undefined ? "—" : String(Math.round(overallScore));

  const chips: Array<{ label: string; value: string; color?: string }> = [
    { label: "Critical", value: String(severityCounts.critical), color: colors.critical },
    { label: "Major", value: String(severityCounts.major), color: colors.major },
    { label: "Minor", value: String(severityCounts.minor) },
    { label: "Total", value: String(severityCounts.total) },
  ];

  return (
    <View style={{ marginBottom: 10 }} wrap={false}>
      <Text style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 8 }}>
        {reportTitle}
      </Text>

      <View style={{ flexDirection: "row" }}>
        <View
          style={{
            width: 100,
            marginRight: 8,
            backgroundColor: colors.headerBg,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            borderRadius: 4,
            padding: 8,
          }}
        >
          <Text style={sharedStyles.scoreHeroLabel}>Overall</Text>
          <Text style={[sharedStyles.scoreHeroValue, { color: scoreColor(overallScore) }]}>
            {scoreLabel}
          </Text>
          <Text style={sharedStyles.scoreHeroSub}>/ 100</Text>
        </View>
        <View style={{ flexGrow: 1, flexDirection: "row" }}>
          {chips.map((chip, index) => {
            const isLast = index === chips.length - 1;
            return (
              <View
                key={chip.label}
                style={{
                  flexGrow: 1,
                  flexBasis: 0,
                  marginRight: isLast ? 0 : 6,
                  backgroundColor: colors.headerBg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 4,
                  paddingVertical: 8,
                  paddingHorizontal: 6,
                }}
              >
                <Text style={sharedStyles.metricChipLabel}>{chip.label}</Text>
                <Text
                  style={[
                    sharedStyles.metricChipValue,
                    ...(chip.color ? [{ color: chip.color }] : []),
                  ]}
                >
                  {chip.value}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

/** @deprecated Prefer ReportIntro */
export function PdfCoverPage(props: {
  websiteName: string;
  websiteUrl: string;
  scanDate: string;
  overallScore: number | null;
  severityCounts: CoverSeverityCounts;
  reportTitle?: string;
}) {
  return (
    <ReportIntro
      reportTitle={props.reportTitle ?? "Full audit report"}
      overallScore={props.overallScore}
      severityCounts={props.severityCounts}
    />
  );
}

export type ScoreCardItem = {
  label: string;
  score: number | null;
  delta?: number | null;
};

/** Overall score + category scores in one compact row. */
export function ScoreHero({
  overallScore,
  overallDelta,
  categories,
  hideOverall = false,
}: {
  overallScore: number | null;
  overallDelta?: number | null;
  categories: ScoreCardItem[];
  hideOverall?: boolean;
}) {
  const overallLabel =
    overallScore === null || overallScore === undefined ? "—" : String(Math.round(overallScore));

  return (
    <View style={sharedStyles.scoreHeroWrap} wrap={false}>
      {hideOverall ? null : (
        <View style={sharedStyles.scoreHeroMain}>
          <Text style={sharedStyles.scoreHeroLabel}>Overall</Text>
          <Text style={[sharedStyles.scoreHeroValue, { color: scoreColor(overallScore) }]}>
            {overallLabel}
          </Text>
          <Text style={sharedStyles.scoreHeroSub}>
            {`/ 100${
              overallDelta !== null && overallDelta !== undefined
                ? ` · ${overallDelta >= 0 ? "+" : ""}${overallDelta}`
                : ""
            }`}
          </Text>
        </View>
      )}
      <View style={sharedStyles.scoreCardRow}>
        {categories.map((item, index) => {
          const value =
            item.score === null || item.score === undefined ? "—" : String(Math.round(item.score));
          const delta = item.delta;
          const isLast = index === categories.length - 1;
          return (
            <View
              key={item.label}
              style={[sharedStyles.scoreCard, ...(isLast ? [sharedStyles.scoreCardLast] : [])]}
            >
              <Text style={sharedStyles.scoreCardLabel}>{item.label}</Text>
              <Text style={[sharedStyles.scoreCardValue, { color: scoreColor(item.score) }]}>
                {value}
              </Text>
              {delta !== null && delta !== undefined ? (
                <Text
                  style={[
                    sharedStyles.scoreCardDelta,
                    { color: delta >= 0 ? colors.scoreGood : colors.scoreBad },
                  ]}
                >
                  {`${delta >= 0 ? "+" : ""}${delta}`}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function SummaryMetricsRow({
  items,
}: {
  items: Array<{ label: string; value: string; valueColor?: string }>;
}) {
  return (
    <View style={sharedStyles.metricStrip} wrap={false}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <View
            key={item.label}
            style={[sharedStyles.metricChip, ...(isLast ? [sharedStyles.metricChipLast] : [])]}
          >
            <Text style={sharedStyles.metricChipLabel}>{item.label}</Text>
            <Text
              style={[
                sharedStyles.metricChipValue,
                ...(item.valueColor ? [{ color: item.valueColor }] : []),
              ]}
            >
              {item.value}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function severityPillColors(severity: string) {
  const key = severity.toUpperCase();
  if (key === "CRITICAL") {
    return { bg: "#fef2f2", fg: colors.critical, border: colors.critical };
  }
  if (key === "MAJOR") {
    return { bg: "#fffbeb", fg: colors.major, border: colors.major };
  }
  if (key === "MINOR") {
    return { bg: colors.accentSoft, fg: colors.minor, border: colors.minor };
  }
  return { bg: colors.headerBg, fg: colors.info, border: colors.border };
}

export function SeverityPill({ severity }: { severity: string }) {
  const { bg, fg } = severityPillColors(severity);
  return (
    <View style={[sharedStyles.severityPill, { backgroundColor: bg }]}>
      <Text style={[sharedStyles.severityPillText, { color: fg }]}>{severity}</Text>
    </View>
  );
}

export type FindingCardRow = {
  index: string;
  severity: string;
  title: string;
  description: string;
  location: string;
  action: string;
};

function findingAccent(severity: string) {
  const key = severity.toUpperCase();
  if (key === "CRITICAL") return colors.critical;
  if (key === "MAJOR") return colors.major;
  if (key === "MINOR") return colors.minor;
  return colors.borderStrong;
}

/**
 * Compact finding rows. wrap enabled so cards don't jump to next page leaving
 * large blank regions (wrap={false} caused empty Performance pages).
 */
export function FindingCardList({ rows }: { rows: FindingCardRow[] }) {
  if (rows.length === 0) {
    return <Text style={sharedStyles.empty}>No issues in this section.</Text>;
  }

  return (
    <View style={{ marginTop: 2, marginBottom: 4 }}>
      {rows.map((row) => (
        <View
          key={row.index}
          style={[sharedStyles.findingCard, { borderLeftColor: findingAccent(row.severity) }]}
          minPresenceAhead={36}
        >
          <View style={sharedStyles.findingCardHeader}>
            <Text style={[sharedStyles.tdStrong, { fontSize: 8 }]}>#{row.index}</Text>
            <SeverityPill severity={row.severity} />
          </View>
          <Text style={sharedStyles.findingCardTitle}>{row.title}</Text>
          {row.description ? (
            <Text style={[sharedStyles.tdMuted, sharedStyles.tdWrap]}>{row.description}</Text>
          ) : null}
          {row.location && row.location !== "—" ? (
            <Text style={[sharedStyles.tdMuted, sharedStyles.tdWrap, { marginTop: 2 }]}>
              <Text style={{ fontWeight: 700, color: colors.muted }}>Location: </Text>
              {row.location}
            </Text>
          ) : null}
          {row.action ? (
            <Text style={[sharedStyles.action, sharedStyles.tdWrap, { marginTop: 3 }]}>
              <Text style={{ fontWeight: 700 }}>Fix: </Text>
              {row.action}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

export function PdfHeadlineBox({
  title,
  items,
  ok = false,
}: {
  title: string;
  items: string[];
  ok?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <View style={ok ? [sharedStyles.headlineBox, sharedStyles.headlineBoxOk] : sharedStyles.headlineBox}>
      <Text style={ok ? [sharedStyles.headlineTitle, sharedStyles.headlineTitleOk] : sharedStyles.headlineTitle}>
        {title}
      </Text>
      {items.map((item) => (
        <Text
          key={item}
          style={ok ? [sharedStyles.headlineItem, sharedStyles.headlineItemOk] : sharedStyles.headlineItem}
        >
          • {item}
        </Text>
      ))}
    </View>
  );
}

export function SeverityText({ severity }: { severity: string }) {
  const key = severity.toLowerCase() as "critical" | "major" | "minor" | "info";
  const colorMap = {
    critical: colors.critical,
    major: colors.major,
    minor: colors.minor,
    info: colors.info,
  };

  return (
    <Text style={{ fontSize: 7, fontWeight: 700, color: colorMap[key] ?? colors.info }}>
      {severity}
    </Text>
  );
}

export type TableColumn = {
  key: string;
  label: string;
  flex: number;
  mono?: boolean;
  strong?: boolean;
  wrap?: boolean;
};

/**
 * Soft-wrap http(s) URL paths only. Leaves hostnames and surrounding prose intact
 * so we don't get "https:/ / example.com".
 */
export function pdfBreakableText(text: string): string {
  if (!text) return "—";
  return text.replace(
    /(https?:\/\/[^\s/?#]+)([^\s]*)/gi,
    (_full, host: string, rest: string) =>
      host + String(rest).replace(/([/?&=_#])/g, "$1\u200b"),
  );
}

export function PdfTable({
  columns,
  rows,
}: {
  columns: TableColumn[];
  rows: Record<string, string>[];
}) {
  if (rows.length === 0) {
    return <Text style={sharedStyles.empty}>No rows in this section.</Text>;
  }

  return (
    <View style={sharedStyles.table}>
      <View style={sharedStyles.tableHeader}>
        {columns.map((column) => (
          <Text key={column.key} style={[sharedStyles.th, { flex: column.flex }]}>
            {column.label}
          </Text>
        ))}
      </View>
      {rows.map((row, index) => (
        <View key={`${index}-${row[columns[0]?.key ?? "row"]}`} style={sharedStyles.tableRow}>
          {columns.map((column) => {
            const raw = row[column.key] ?? "—";
            const value = column.wrap ? pdfBreakableText(raw) : raw;
            return (
              <Text
                key={column.key}
                style={[
                  sharedStyles.td,
                  sharedStyles.tdWrap,
                  { flex: column.flex },
                  ...(column.mono ? [sharedStyles.mono] : []),
                  ...(column.strong ? [sharedStyles.tdStrong] : []),
                ]}
              >
                {value}
              </Text>
            );
          })}
        </View>
      ))}
    </View>
  );
}
export function BrokenLinksFindingTable({
  rows,
}: {
  rows: Array<{
    num: string;
    sev: string;
    status: string;
    url: string;
    page: string;
    element: string;
  }>;
}) {
  if (rows.length === 0) {
    return <Text style={sharedStyles.empty}>No unreachable URLs found in this scan.</Text>;
  }

  // Full-width stacked findings — narrow table columns force hyphenation and unreadable URLs.
  return (
    <View style={{ marginTop: 8, marginBottom: 18 }}>
      {rows.map((row) => (
        <View
          key={row.num}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 6,
            padding: 10,
            marginBottom: 8,
            backgroundColor: colors.headerBg,
          }}
          wrap={false}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={[sharedStyles.tdStrong, { fontSize: 9 }]}>#{row.num}</Text>
              <SeverityText severity={row.sev} />
              <Text style={[sharedStyles.tdStrong, { fontSize: 9 }]}>{row.status}</Text>
            </View>
          </View>

          <Text style={[sharedStyles.th, { marginBottom: 2 }]}>Unreachable URL</Text>
          <Text
            style={[
              sharedStyles.td,
              sharedStyles.tdWrap,
              { fontFamily: fonts.mono, fontSize: 8, color: colors.text, marginBottom: 8 },
            ]}
          >
            {pdfBreakableText(row.url)}
          </Text>

          <Text style={[sharedStyles.th, { marginBottom: 2 }]}>Found on page</Text>
          <Text
            style={[
              sharedStyles.td,
              sharedStyles.tdWrap,
              { fontFamily: fonts.mono, fontSize: 8, color: colors.muted, marginBottom: 8 },
            ]}
          >
            {pdfBreakableText(row.page)}
          </Text>

          <Text style={[sharedStyles.th, { marginBottom: 2 }]}>Element</Text>
          <Text
            style={[
              sharedStyles.td,
              sharedStyles.tdWrap,
              { fontFamily: fonts.mono, fontSize: 7.5, color: colors.muted },
            ]}
          >
            {pdfBreakableText(row.element)}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function GroupedBrokenLinksFindingTable({
  rows,
}: {
  rows: Array<{
    num: string;
    sev: string;
    status: string;
    url: string;
    pages: string[];
    pageCount: number;
  }>;
}) {
  if (rows.length === 0) {
    return <Text style={sharedStyles.empty}>No unreachable URLs found in this scan.</Text>;
  }

  return (
    <View style={{ marginTop: 8, marginBottom: 18 }}>
      {rows.map((row) => (
        <View
          key={row.num}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 6,
            padding: 10,
            marginBottom: 8,
            backgroundColor: colors.headerBg,
          }}
          wrap={false}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={[sharedStyles.tdStrong, { fontSize: 9 }]}>#{row.num}</Text>
              <SeverityText severity={row.sev} />
              <Text style={[sharedStyles.tdStrong, { fontSize: 9 }]}>{row.status}</Text>
            </View>
            <Text style={[sharedStyles.td, { fontSize: 8, color: colors.muted }]}>
              {row.pageCount} page{row.pageCount === 1 ? "" : "s"}
            </Text>
          </View>

          <Text style={[sharedStyles.th, { marginBottom: 2 }]}>Unreachable URL</Text>
          <Text
            style={[
              sharedStyles.td,
              sharedStyles.tdWrap,
              { fontFamily: fonts.mono, fontSize: 8, color: colors.text, marginBottom: 8 },
            ]}
          >
            {pdfBreakableText(row.url)}
          </Text>

          <Text style={[sharedStyles.th, { marginBottom: 2 }]}>Found on pages</Text>
          {row.pages.map((page, index) => (
            <Text
              key={`${row.num}-${index}`}
              style={[
                sharedStyles.td,
                sharedStyles.tdWrap,
                {
                  fontFamily: fonts.mono,
                  fontSize: 7.5,
                  color: colors.muted,
                  marginBottom: index < row.pages.length - 1 ? 4 : 0,
                },
              ]}
            >
              {pdfBreakableText(page)}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

export function FindingTable({
  rows,
}: {
  rows: Array<{
    index: string;
    severity: string;
    title: string;
    description: string;
    location: string;
    action: string;
  }>;
}) {
  if (rows.length === 0) {
    return <Text style={sharedStyles.empty}>No issues in this section.</Text>;
  }

  return (
    <View style={sharedStyles.table}>
      <View style={sharedStyles.tableHeader}>
        <Text style={[sharedStyles.th, { flex: 0.5 }]}>#</Text>
        <Text style={[sharedStyles.th, { flex: 0.8 }]}>Sev</Text>
        <Text style={[sharedStyles.th, { flex: 2.2 }]}>Finding</Text>
        <Text style={[sharedStyles.th, { flex: 1.8 }]}>Location</Text>
        <Text style={[sharedStyles.th, { flex: 2.2 }]}>Action required</Text>
      </View>
      {rows.map((row) => (
        <View key={row.index} style={sharedStyles.tableRow}>
          <Text style={[sharedStyles.td, { flex: 0.5 }]}>{row.index}</Text>
          <View style={{ flex: 0.8 }}>
            <SeverityText severity={row.severity} />
          </View>
          <View style={{ flex: 2.2, paddingRight: 6 }}>
            <Text style={sharedStyles.tdStrong}>{row.title}</Text>
            {row.description ? (
              <Text style={[sharedStyles.tdMuted, sharedStyles.tdWrap]}>
                {pdfBreakableText(row.description)}
              </Text>
            ) : null}
          </View>
          <Text style={[sharedStyles.td, sharedStyles.mono, sharedStyles.tdWrap, { flex: 1.8 }]}>
            {pdfBreakableText(row.location)}
          </Text>
          <Text style={[sharedStyles.td, sharedStyles.action, sharedStyles.tdWrap, { flex: 2.2 }]}>
            {pdfBreakableText(row.action)}
          </Text>
        </View>
      ))}
    </View>
  );
}
