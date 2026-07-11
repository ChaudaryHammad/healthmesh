import { ScanFrequency } from "@prisma/client";
import { dispatchAuditScan } from "@/lib/audit-dispatch";
import { getEntitlements } from "@/lib/entitlements";
import { prisma } from "@/lib/prisma";
import { computeNextScanAt } from "@/lib/scan-schedule";

const websiteScheduleSelect = {
  id: true,
  name: true,
  url: true,
  userId: true,
  scanFrequency: true,
  scanTimezone: true,
  scanTimeOfDay: true,
  scanDayOfWeek: true,
  scanDayOfMonth: true,
  nextScanAt: true,
} as const;

export type ScheduledScanDispatchResult =
  | { outcome: "started"; scanId: string }
  | { outcome: "skipped"; reason: string }
  | { outcome: "not_due"; reason: string };

export async function runScheduledScanForWebsite(
  websiteId: string,
  options: { now?: Date } = {}
): Promise<ScheduledScanDispatchResult> {
  const now = options.now ?? new Date();

  const website = await prisma.website.findFirst({
    where: {
      id: websiteId,
      deletedAt: null,
      scanFrequency: { not: ScanFrequency.MANUAL },
    },
    select: websiteScheduleSelect,
  });

  if (!website) {
    return { outcome: "skipped", reason: "website_not_found_or_manual" };
  }

  if (!website.nextScanAt) {
    return { outcome: "skipped", reason: "no_next_scan_at" };
  }

  if (website.nextScanAt.getTime() > now.getTime()) {
    return { outcome: "not_due", reason: "next_scan_in_future" };
  }

  const entitlements = await getEntitlements(website.userId);
  if (!entitlements.canScheduleScans || entitlements.isReadOnly) {
    await prisma.website.update({
      where: { id: website.id },
      data: {
        nextScanAt: computeNextScanAt(
          {
            frequency: website.scanFrequency,
            timezone: website.scanTimezone,
            timeOfDay: website.scanTimeOfDay,
            dayOfWeek: website.scanDayOfWeek,
            dayOfMonth: website.scanDayOfMonth,
          },
          now
        ),
      },
    });
    return { outcome: "skipped", reason: "plan_or_read_only" };
  }

  const running = await prisma.scan.findFirst({
    where: { websiteId: website.id, status: "RUNNING" },
  });
  if (running) {
    await prisma.website.update({
      where: { id: website.id },
      data: {
        nextScanAt: computeNextScanAt(
          {
            frequency: website.scanFrequency,
            timezone: website.scanTimezone,
            timeOfDay: website.scanTimeOfDay,
            dayOfWeek: website.scanDayOfWeek,
            dayOfMonth: website.scanDayOfMonth,
          },
          now
        ),
      },
    });
    return { outcome: "skipped", reason: "scan_already_running" };
  }

  const scan = await prisma.scan.create({
    data: {
      websiteId: website.id,
      status: "RUNNING",
      startedAt: new Date(),
      phase: "queued",
      statusMessage: "Scheduled audit queued…",
      progressPercent: 2,
    },
  });

  try {
    await dispatchAuditScan(scan.id, { forceTrigger: true });

    await prisma.website.update({
      where: { id: website.id },
      data: {
        lastScheduledAt: now,
        nextScanAt: computeNextScanAt(
          {
            frequency: website.scanFrequency,
            timezone: website.scanTimezone,
            timeOfDay: website.scanTimeOfDay,
            dayOfWeek: website.scanDayOfWeek,
            dayOfMonth: website.scanDayOfMonth,
          },
          now
        ),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: website.userId,
        action: "SCAN_STARTED",
        description: `Scheduled audit started for "${website.name}"`,
        metadata: { websiteId: website.id, scanId: scan.id, scheduled: true },
      },
    });

    return { outcome: "started", scanId: scan.id };
  } catch (error) {
    const { failAuditScan } = await import("@/lib/scanner/fail-audit-scan");
    const message =
      error instanceof Error
        ? error.message
        : "Scheduled scan failed to queue on the audit worker.";
    await failAuditScan(scan.id, message);
    return { outcome: "skipped", reason: message };
  }
}
