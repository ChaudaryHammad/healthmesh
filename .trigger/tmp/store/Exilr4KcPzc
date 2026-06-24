import {
  prisma
} from "./chunk-SGR3AGN2.mjs";
import {
  __name,
  init_esm
} from "./chunk-244PAGAH.mjs";

// src/lib/scanner/fail-audit-scan.ts
init_esm();
async function failAuditScan(scanId, errorMessage) {
  await prisma.scan.updateMany({
    where: { id: scanId, status: "RUNNING" },
    data: {
      status: "FAILED",
      errorMessage,
      completedAt: /* @__PURE__ */ new Date()
    }
  });
}
__name(failAuditScan, "failAuditScan");
export {
  failAuditScan
};
//# sourceMappingURL=fail-audit-scan-LEP6LKER.mjs.map
