"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { runFullAudit } from "@/lib/scanner/audit-runner";

export async function triggerScanAction(websiteId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  const userId = session.user.id;

  const website = await prisma.website.findFirst({
    where: { id: websiteId, userId, deletedAt: null },
  });

  if (!website) {
    return { success: false, error: "Website not found or access denied." };
  }

  const running = await prisma.scan.findFirst({
    where: { websiteId, status: "RUNNING" },
  });
  if (running) {
    return { success: false, error: "A scan is already running for this website." };
  }

  const scan = await prisma.scan.create({
    data: {
      websiteId,
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  try {
    const result = await runFullAudit(website.url);

    const completedScan = await prisma.scan.update({
      where: { id: scan.id },
      data: {
        status: "COMPLETED",
        overallScore: result.overallScore,
        performanceScore: result.performanceScore,
        accessibilityScore: result.accessibilityScore,
        seoScore: result.seoScore,
        securityScore: result.securityScore,
        fcp: result.fcp,
        lcp: result.lcp,
        cls: result.cls,
        inp: result.inp,
        tbt: result.tbt,
        completedAt: new Date(),
        issues: {
          create: result.issues.map((issue) => ({
            category: issue.category,
            severity: issue.severity,
            title: issue.title,
            description: issue.description,
            selector: issue.selector ?? null,
            url: issue.url ?? null,
            recommendation: issue.recommendation ?? null,
            metadata: issue.metadata ? JSON.parse(JSON.stringify(issue.metadata)) : undefined,
          })),
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: "SCAN_COMPLETED",
        description: `Completed audit for "${website.name}" — overall score: ${result.overallScore}`,
        metadata: { websiteId, scanId: scan.id, overallScore: result.overallScore },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/websites");
    revalidatePath(`/dashboard/websites/${websiteId}`);

    return { success: true, data: completedScan };
  } catch (error) {
    console.error("Scan error:", error);
    await prisma.scan.update({
      where: { id: scan.id },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Scan failed",
        completedAt: new Date(),
      },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete scan. Please try again.",
    };
  }
}

export async function getScanDetailsAction(scanId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized." };

  const scan = await prisma.scan.findFirst({
    where: {
      id: scanId,
      website: { userId: session.user.id, deletedAt: null },
    },
    include: {
      issues: { orderBy: [{ severity: "asc" }, { category: "asc" }] },
      website: { select: { id: true, name: true, url: true } },
    },
  });

  if (!scan) return { success: false, error: "Scan not found." };

  return { success: true, data: scan };
}
