import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runBrokenLinkScan } from "@/lib/scanner/broken-link-runner";
import { ScanCancelledError } from "@/lib/scanner/scan-errors";
import { parseResourceTypes } from "@/lib/scanner/link-resource-types";
import type { BrokenLinkFinding } from "@/lib/scanner/types";

export const maxDuration = 300;

function mapFindings(findings: BrokenLinkFinding[]) {
  return findings.map((f) => ({
    href: f.href,
    sourcePageUrl: f.sourcePageUrl,
    statusCode: f.statusCode,
    errorMessage: f.errorMessage,
    elementTag: f.elementTag,
    elementId: f.elementId ?? null,
    elementClass: f.elementClass ?? null,
    elementText: f.elementText ?? null,
    selector: f.selector,
    attribute: f.attribute,
    severity: f.severity,
  }));
}

function scanResponse(
  findings: BrokenLinkFinding[],
  extra?: Record<string, unknown>
) {
  return NextResponse.json({
    success: true,
    brokenCount: findings.length,
    findings: mapFindings(findings),
    ...extra,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { resourceTypes?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const scan = await prisma.brokenLinkScan.findFirst({
    where: {
      id: scanId,
      website: { userId: session.user.id, deletedAt: null },
    },
    include: { website: { select: { url: true, name: true, userId: true } } },
  });

  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  if (scan.status !== "RUNNING") {
    return NextResponse.json({ error: "Scan is not runnable" }, { status: 409 });
  }

  const shouldCancel = async () => {
    const current = await prisma.brokenLinkScan.findUnique({
      where: { id: scanId },
      select: { status: true, phase: true },
    });
    return current?.status === "FAILED" && current?.phase === "cancelled";
  };

  try {
    const resourceTypes = parseResourceTypes(body.resourceTypes);

    const findings = await runBrokenLinkScan(
      scan.website.url,
      scan.mode,
      resourceTypes,
      async (progress) => {
        const cancelled = await shouldCancel();
        if (cancelled) return;

        await prisma.brokenLinkScan.update({
          where: { id: scanId },
          data: {
            status: "RUNNING",
            phase: progress.phase,
            statusMessage: progress.statusMessage,
            pagesDiscovered: progress.pagesDiscovered,
            pagesCrawled: progress.pagesCrawled,
            linksFound: progress.linksFound,
            linksChecked: progress.linksChecked,
            brokenCount: progress.brokenCount,
            progressPercent: progress.progressPercent,
          },
        });
      },
      shouldCancel
    );

    const alreadyCancelled = await shouldCancel();
    if (alreadyCancelled) {
      return scanResponse(findings, { cancelled: true });
    }

    await prisma.brokenLinkScan.update({
      where: { id: scanId },
      data: {
        status: "COMPLETED",
        phase: "completed",
        statusMessage: `Found ${findings.length} broken link(s)`,
        brokenCount: findings.length,
        progressPercent: 100,
        completedAt: new Date(),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: scan.website.userId,
        action: "BROKEN_LINK_SCAN_COMPLETED",
        description: `Broken link scan (${scan.mode.toLowerCase()}) for "${scan.website.name}" — ${findings.length} issue(s)`,
        metadata: {
          websiteId: scan.websiteId,
          scanId,
          mode: scan.mode,
          brokenCount: findings.length,
        },
      },
    });

    return scanResponse(findings);
  } catch (error) {
    if (error instanceof ScanCancelledError) {
      await prisma.brokenLinkScan.update({
        where: { id: scanId },
        data: {
          status: "FAILED",
          phase: "cancelled",
          statusMessage: "Scan halted by user",
          errorMessage: "Halted by user",
          brokenCount: error.findings.length,
          completedAt: new Date(),
        },
      });

      return scanResponse(error.findings, { cancelled: true });
    }

    console.error("Broken link scan error:", error);
    await prisma.brokenLinkScan.update({
      where: { id: scanId },
      data: {
        status: "FAILED",
        phase: "failed",
        errorMessage: error instanceof Error ? error.message : "Scan failed",
        statusMessage: "Scan failed",
        completedAt: new Date(),
      },
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scan failed" },
      { status: 500 }
    );
  }
}
