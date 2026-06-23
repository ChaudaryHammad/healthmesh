import { prisma } from "@/lib/prisma";

export const AUDIT_HALTED_MESSAGE = "Halted by user";

export async function assertScanRunnable(scanId: string) {
  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    select: { status: true, errorMessage: true },
  });

  if (!scan || scan.status !== "RUNNING") {
    throw new Error(scan?.errorMessage ?? "Scan is no longer running.");
  }
}
