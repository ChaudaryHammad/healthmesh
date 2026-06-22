import React from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { PerformanceAuditClient } from "@/components/websites/performance-audit-client";
import type { AuditIssue } from "@/components/websites/audit-shared";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const w = await prisma.website.findUnique({ where: { id }, select: { name: true } });
  return { title: `${w?.name ?? "Website"} — Performance Audit` };
}

export default async function PerformancePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const website = await prisma.website.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    select: { id: true, name: true, url: true },
  });
  if (!website) notFound();

  const latestScan = await prisma.scan.findFirst({
    where: { websiteId: id, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    include: {
      issues: {
        where: { category: "PERFORMANCE" },
        orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
      },
    },
  });

  const issues: AuditIssue[] =
    latestScan?.issues.map((i) => ({
      id: i.id,
      severity: i.severity as AuditIssue["severity"],
      title: i.title,
      description: i.description,
      selector: i.selector,
      url: i.url,
      recommendation: i.recommendation,
    })) ?? [];

  const metrics = latestScan
    ? {
        fcp: latestScan.fcp,
        lcp: latestScan.lcp,
        cls: latestScan.cls,
        inp: latestScan.inp,
        tbt: latestScan.tbt,
      }
    : null;

  return (
    <PerformanceAuditClient
      websiteId={website.id}
      websiteName={website.name}
      websiteUrl={website.url}
      score={latestScan?.performanceScore ?? null}
      issues={issues}
      lastScanned={latestScan?.completedAt?.toISOString() ?? null}
      metrics={metrics}
    />
  );
}
