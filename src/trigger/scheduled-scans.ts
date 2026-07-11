import { logger, schedules } from "@trigger.dev/sdk";
import { ScanFrequency } from "@prisma/client";

export const scheduledScansTask = schedules.task({
  id: "scheduled-scans",
  // Safety net: recover overdue scans and backfill missing delayed triggers.
  cron: "*/5 * * * *",
  run: async () => {
    const { prisma } = await import("@/lib/prisma");
    const { runScheduledScanForWebsite } = await import("@/lib/scheduled-scan-dispatch");
    const { syncMissingScheduledScanTriggers } = await import("@/lib/scheduled-scan-trigger");
    const { reaperStaleRunningScans } = await import("@/lib/scanner/fail-audit-scan");

    await reaperStaleRunningScans();

    const synced = await syncMissingScheduledScanTriggers();
    const now = new Date();
    const dueWebsites = await prisma.website.findMany({
      where: {
        deletedAt: null,
        scanFrequency: { not: ScanFrequency.MANUAL },
        nextScanAt: { lte: now },
      },
      select: { id: true },
      take: 25,
      orderBy: { nextScanAt: "asc" },
    });

    logger.info("Scheduled scan safety tick", {
      synced,
      dueCount: dueWebsites.length,
    });

    let started = 0;
    let skipped = 0;

    for (const website of dueWebsites) {
      const result = await runScheduledScanForWebsite(website.id, { now });
      if (result.outcome === "started") {
        started += 1;
        const { syncScheduledScanTrigger } = await import("@/lib/scheduled-scan-trigger");
        try {
          await syncScheduledScanTrigger(website.id);
        } catch (error) {
          logger.error("Failed to queue next scheduled scan trigger", {
            websiteId: website.id,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      } else if (result.outcome === "skipped") {
        skipped += 1;
      }
    }

    return { synced, due: dueWebsites.length, started, skipped };
  },
});
