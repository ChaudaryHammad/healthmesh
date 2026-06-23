import type { Issue } from "@prisma/client";
import { categoryLabel } from "@/lib/reports/types";

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export function generateIssuesCsv(
  websiteName: string,
  websiteUrl: string,
  scanCompletedAt: Date | null,
  issues: Issue[]
) {
  const header = [
    "Website",
    "URL",
    "Scan date",
    "Category",
    "Severity",
    "Status",
    "Title",
    "Description",
    "Recommendation",
    "Selector",
    "Affected URL",
  ];

  const scanDate = scanCompletedAt?.toISOString() ?? "";

  const rows = issues.map((issue) =>
    [
      websiteName,
      websiteUrl,
      scanDate,
      categoryLabel(issue.category),
      issue.severity,
      issue.status,
      issue.title,
      issue.description,
      issue.recommendation ?? "",
      issue.selector ?? "",
      issue.url ?? "",
    ]
      .map((cell) => escapeCsv(String(cell)))
      .join(",")
  );

  return Buffer.from([header.join(","), ...rows].join("\n"), "utf-8");
}
