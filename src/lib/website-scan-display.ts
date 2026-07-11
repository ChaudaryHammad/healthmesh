export interface WebsiteListScan {
  id: string;
  status: string;
  overallScore: number | null;
  performanceScore: number | null;
  accessibilityScore: number | null;
  seoScore: number | null;
  securityScore: number | null;
  phase?: string | null;
  statusMessage?: string | null;
  progressPercent?: number | null;
  startedAt?: Date | string | null;
  createdAt: Date | string;
}

export interface WebsiteScanDisplay {
  latestScan: WebsiteListScan | null;
  runningScan: WebsiteListScan | null;
  displayScan: WebsiteListScan | null;
}

export function resolveWebsiteScanDisplay(
  scans: WebsiteListScan[]
): WebsiteScanDisplay {
  const latestScan = scans[0] ?? null;
  const runningScan = scans.find((scan) => scan.status === "RUNNING") ?? null;
  const displayScan = scans.find((scan) => scan.status === "COMPLETED") ?? null;

  return { latestScan, runningScan, displayScan };
}
