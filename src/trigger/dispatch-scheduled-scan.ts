import { logger, task } from "@trigger.dev/sdk";

export const dispatchScheduledScanTask = task({
  id: "dispatch-scheduled-scan",
  machine: { preset: "small-1x" },
  retry: {
    maxAttempts: 2,
  },
  run: async (payload: { websiteId: string }) => {
    const { prisma } = await import("@/lib/prisma");
    const { runScheduledScanForWebsite } = await import("@/lib/scheduled-scan-dispatch");
    const { syncScheduledScanTrigger } = await import("@/lib/scheduled-scan-trigger");

    await prisma.website.updateMany({
      where: { id: payload.websiteId },
      data: { pendingScanRunId: null },
    });

    const result = await runScheduledScanForWebsite(payload.websiteId);
    logger.info("Dispatch scheduled scan", {
      websiteId: payload.websiteId,
      result,
    });

    try {
      await syncScheduledScanTrigger(payload.websiteId);
    } catch (error) {
      logger.error("Failed to queue next scheduled scan trigger", {
        websiteId: payload.websiteId,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return result;
  },
});
