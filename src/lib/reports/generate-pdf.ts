import { buildAuditReportPdfBuffer } from "@/lib/reports/pdf/audit-document";
import { buildReportTitle, type ReportScanContext } from "@/lib/reports/types";
import type { ReportType } from "@prisma/client";

export async function generateReportPdf(type: ReportType, context: ReportScanContext) {
  return buildAuditReportPdfBuffer(type, context);
}

export async function generateFullAuditPdf(context: ReportScanContext) {
  return generateReportPdf("FULL_AUDIT", context);
}

export async function generateExecutiveSummaryPdf(context: ReportScanContext) {
  return generateReportPdf("EXECUTIVE_SUMMARY", context);
}

export { buildReportTitle };
