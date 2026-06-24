import {
  task
} from "../../chunk-TG7QAFZ3.mjs";
import "../../chunk-MR3CJWU5.mjs";
import "../../chunk-OBPVLPAA.mjs";
import "../../chunk-KD5NJFYZ.mjs";
import "../../chunk-USHNXJ63.mjs";
import {
  __name,
  init_esm
} from "../../chunk-244PAGAH.mjs";

// src/trigger/run-audit.ts
init_esm();
var runAuditTask = task({
  id: "run-audit",
  maxDuration: 300,
  retry: {
    maxAttempts: 1
  },
  run: /* @__PURE__ */ __name(async (payload) => {
    const { prisma } = await import("../../prisma-KUJI2VHF.mjs");
    const { completeAuditScan } = await import("../../complete-audit-scan-WER3KETH.mjs");
    const { failAuditScan } = await import("../../fail-audit-scan-GQTWXWOL.mjs");
    const scan = await prisma.scan.findFirst({
      where: { id: payload.scanId, status: "RUNNING" },
      include: {
        website: { select: { id: true, name: true, url: true, userId: true } }
      }
    });
    if (!scan) {
      throw new Error("Scan not found or not in RUNNING state.");
    }
    try {
      const completed = await completeAuditScan(payload.scanId, scan.website);
      return {
        scanId: completed.id,
        overallScore: completed.overallScore
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Scan failed";
      await failAuditScan(payload.scanId, message);
      throw error;
    }
  }, "run")
});
export {
  runAuditTask
};
//# sourceMappingURL=run-audit.mjs.map
