import { ScanFrequency } from "@prisma/client";
import { useTriggerDev } from "@/lib/env";
import { getEntitlements } from "@/lib/entitlements";
import { prisma } from "@/lib/prisma";

export async function cancelScheduledScanTrigger(
  runId: string | null | undefined
): Promise<void> {
  if (!runId || !useTriggerDev()) {
    return;
  }

  try {
    const { runs } = await import("@trigger.dev/sdk");
    await runs.cancel(runId);
  } catch {
    // Run may have already started, completed, or been cancelled.
  }
}

export async function syncScheduledScanTrigger(websiteId: string): Promise<void> {
  if (!useTriggerDev()) {
    return;
  }

  const website = await prisma.website.findFirst({
    where: { id: websiteId, deletedAt: null },
    select: {
      id: true,
      userId: true,
      scanFrequency: true,
      nextScanAt: true,
      pendingScanRunId: true,
    },
  });

  if (!website) {
    return;
  }

  await cancelScheduledScanTrigger(website.pendingScanRunId);

  if (website.scanFrequency === ScanFrequency.MANUAL || !website.nextScanAt) {
    await prisma.website.update({
      where: { id: websiteId },
      data: { pendingScanRunId: null },
    });
    return;
  }

  const entitlements = await getEntitlements(website.userId);
  if (!entitlements.canScheduleScans || entitlements.isReadOnly) {
    await prisma.website.update({
      where: { id: websiteId },
      data: { pendingScanRunId: null },
    });
    return;
  }

  const runAt = website.nextScanAt;
  const { tasks } = await import("@trigger.dev/sdk");
  const handle = await tasks.trigger(
    "dispatch-scheduled-scan",
    { websiteId },
    {
      delay: runAt.getTime() <= Date.now() ? new Date() : runAt,
      idempotencyKey: `scheduled-scan:${websiteId}:${runAt.toISOString()}`,
      ttl: "26h",
    }
  );

  await prisma.website.update({
    where: { id: websiteId },
    data: { pendingScanRunId: handle.id },
  });
}

export async function syncMissingScheduledScanTriggers(limit = 25): Promise<number> {
  if (!useTriggerDev()) {
    return 0;
  }

  const websites = await prisma.website.findMany({
    where: {
      deletedAt: null,
      scanFrequency: { not: ScanFrequency.MANUAL },
      nextScanAt: { not: null },
      pendingScanRunId: null,
    },
    select: { id: true },
    take: limit,
    orderBy: { nextScanAt: "asc" },
  });

  for (const website of websites) {
    await syncScheduledScanTrigger(website.id);
  }

  return websites.length;
}
