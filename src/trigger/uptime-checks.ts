import { logger, schedules } from "@trigger.dev/sdk";
import {
  UPTIME_CHECK_RETENTION_DAYS,
  UPTIME_CRON_BATCH_SIZE,
} from "@/lib/uptime/constants";

/**
 * Primary uptime scheduler.
 *
 * Runs every minute so Agency (1m), Pro (5m), and Starter (15m) intervals
 * are honored. Each tick only probes monitors whose `nextCheckAt` is due.
 *
 * Keep `/api/cron/uptime-checks` as a daily Vercel safety net.
 */
export const uptimeChecksTask = schedules.task({
  id: "uptime-checks",
  cron: "* * * * *",
  machine: { preset: "small-1x" },
  retry: {
    maxAttempts: 1,
  },
  run: async () => {
    const { processDueUptimeChecks, pruneOldUptimeChecks } = await import(
      "@/lib/uptime/run-check"
    );

    const { processed, errors } = await processDueUptimeChecks(UPTIME_CRON_BATCH_SIZE);

    // Retention cleanup hourly — avoid a deleteMany on every minute tick
    let pruned = 0;
    if (new Date().getMinutes() === 0) {
      pruned = await pruneOldUptimeChecks(UPTIME_CHECK_RETENTION_DAYS);
    }

    logger.info("Uptime checks tick", { processed, errors, pruned });

    return { processed, errors, pruned };
  },
});
