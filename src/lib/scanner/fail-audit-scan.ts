import { prisma } from "@/lib/prisma";

export async function failAuditScan(scanId: string, errorMessage: string) {
  await prisma.scan.updateMany({
    where: { id: scanId, status: "RUNNING" },
    data: {
      status: "FAILED",
      errorMessage,
      completedAt: new Date(),
    },
  });
}
