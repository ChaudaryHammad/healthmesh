import {
  prisma
} from "./chunk-E6VMBEN7.mjs";
import {
  __name,
  init_esm
} from "./chunk-244PAGAH.mjs";

// src/lib/scanner/complete-audit-scan.ts
init_esm();

// src/lib/scanner/audit-scan-control.ts
init_esm();
async function assertScanRunnable(scanId) {
  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    select: { status: true, errorMessage: true }
  });
  if (!scan || scan.status !== "RUNNING") {
    throw new Error(scan?.errorMessage ?? "Scan is no longer running.");
  }
}
__name(assertScanRunnable, "assertScanRunnable");

// src/lib/issue-service.ts
init_esm();

// src/lib/issues.ts
init_esm();
function computeIssueFingerprint(issue) {
  const selector = issue.selector?.trim() ?? "";
  const url = issue.url?.trim() ?? "";
  return `${issue.category}|${issue.title.trim()}|${selector}|${url}`;
}
__name(computeIssueFingerprint, "computeIssueFingerprint");

// src/lib/issue-service.ts
async function autoResolveIssuesAfterAudit(websiteId, currentScanId, newIssues) {
  const newFingerprints = new Set(newIssues.map((issue) => computeIssueFingerprint(issue)));
  const staleIssues = await prisma.issue.findMany({
    where: {
      status: { in: ["OPEN", "ACKNOWLEDGED"] },
      scan: {
        websiteId,
        status: "COMPLETED",
        id: { not: currentScanId }
      }
    },
    select: {
      id: true,
      fingerprint: true,
      category: true,
      title: true,
      selector: true,
      url: true
    }
  });
  const idsToResolve = staleIssues.filter((issue) => {
    const fingerprint = issue.fingerprint || computeIssueFingerprint({
      category: issue.category,
      title: issue.title,
      selector: issue.selector,
      url: issue.url
    });
    return !newFingerprints.has(fingerprint);
  }).map((issue) => issue.id);
  if (idsToResolve.length === 0) return 0;
  await prisma.issue.updateMany({
    where: { id: { in: idsToResolve } },
    data: { status: "RESOLVED", resolvedAt: /* @__PURE__ */ new Date() }
  });
  return idsToResolve.length;
}
__name(autoResolveIssuesAfterAudit, "autoResolveIssuesAfterAudit");

// src/lib/scanner/complete-audit-scan.ts
async function completeAuditScan(scanId, website) {
  await assertScanRunnable(scanId);
  const { runFullAudit } = await import("./audit-runner-GCJ3DONA.mjs");
  const result = await runFullAudit(website.url);
  await assertScanRunnable(scanId);
  const completedScan = await prisma.scan.update({
    where: { id: scanId },
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
      completedAt: /* @__PURE__ */ new Date(),
      issues: {
        create: result.issues.map((issue) => ({
          category: issue.category,
          severity: issue.severity,
          title: issue.title,
          description: issue.description,
          selector: issue.selector ?? null,
          url: issue.url ?? null,
          recommendation: issue.recommendation ?? null,
          fingerprint: computeIssueFingerprint(issue),
          status: "OPEN",
          metadata: issue.metadata ? JSON.parse(JSON.stringify(issue.metadata)) : void 0
        }))
      }
    }
  });
  await autoResolveIssuesAfterAudit(website.id, completedScan.id, result.issues);
  await prisma.activityLog.create({
    data: {
      userId: website.userId,
      action: "SCAN_COMPLETED",
      description: `Completed audit for "${website.name}" — overall score: ${result.overallScore}`,
      metadata: { websiteId: website.id, scanId, overallScore: result.overallScore }
    }
  });
  return completedScan;
}
__name(completeAuditScan, "completeAuditScan");
export {
  completeAuditScan
};
//# sourceMappingURL=complete-audit-scan-L7WTUDWP.mjs.map
