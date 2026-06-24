import { prisma } from "@/lib/prisma";

export async function getDashboardStats(userId: string) {
  const [totalWebsites, activeScans, websites] = await Promise.all([
    prisma.website.count({
      where: { userId, deletedAt: null },
    }),
    prisma.scan.count({
      where: {
        website: { userId, deletedAt: null },
        status: "RUNNING",
      },
    }),
    prisma.website.findMany({
      where: { userId, deletedAt: null },
      select: { id: true },
    }),
  ]);

  const websiteIds = websites.map((w) => w.id);

  if (websiteIds.length === 0) {
    return {
      totalWebsites,
      activeScans,
      criticalIssues: 0,
      accessibilityIssues: 0,
      seoIssues: 0,
      avgPerformance: 0,
      avgAccessibility: 0,
      avgSeo: 0,
      avgSecurity: 0,
      avgBrokenLinks: 0,
      scannedCount: 0,
    };
  }

  const completedScans = await prisma.scan.findMany({
    where: {
      websiteId: { in: websiteIds },
      status: "COMPLETED",
    },
    orderBy: { createdAt: "desc" },
    include: {
      issues: {
        select: { severity: true, category: true },
      },
    },
  });

  const latestByWebsite = new Map<string, (typeof completedScans)[number]>();
  for (const scan of completedScans) {
    if (!latestByWebsite.has(scan.websiteId)) {
      latestByWebsite.set(scan.websiteId, scan);
    }
  }

  const activeCompletedScans = [...latestByWebsite.values()];

  let performanceSum = 0;
  let accessibilitySum = 0;
  let seoSum = 0;
  let securitySum = 0;
  let brokenLinksSum = 0;
  let criticalIssues = 0;
  let accessibilityIssues = 0;
  let seoIssues = 0;

  for (const scan of activeCompletedScans) {
    performanceSum += scan.performanceScore ?? 0;
    accessibilitySum += scan.accessibilityScore ?? 0;
    seoSum += scan.seoScore ?? 0;
    securitySum += scan.securityScore ?? 0;
    brokenLinksSum += scan.overallScore ?? 0;

    for (const issue of scan.issues) {
      if (issue.severity === "CRITICAL") criticalIssues++;
      if (issue.category === "ACCESSIBILITY") accessibilityIssues++;
      if (issue.category === "SEO") seoIssues++;
    }
  }

  const scannedCount = activeCompletedScans.length;

  return {
    totalWebsites,
    activeScans,
    criticalIssues,
    accessibilityIssues,
    seoIssues,
    avgPerformance: scannedCount > 0 ? Math.round(performanceSum / scannedCount) : 0,
    avgAccessibility: scannedCount > 0 ? Math.round(accessibilitySum / scannedCount) : 0,
    avgSeo: scannedCount > 0 ? Math.round(seoSum / scannedCount) : 0,
    avgSecurity: scannedCount > 0 ? Math.round(securitySum / scannedCount) : 0,
    avgBrokenLinks: scannedCount > 0 ? Math.round(brokenLinksSum / scannedCount) : 0,
    scannedCount,
  };
}

export async function getDashboardLists(userId: string) {
  const [activityLogs, scansList] = await Promise.all([
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.scan.findMany({
      where: {
        website: { userId, deletedAt: null },
      },
      orderBy: { createdAt: "desc" },
      include: {
        website: {
          select: { id: true, name: true, url: true },
        },
      },
      take: 5,
    }),
  ]);

  return { activityLogs, scansList };
}
