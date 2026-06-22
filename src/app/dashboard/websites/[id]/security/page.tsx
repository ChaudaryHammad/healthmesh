import React from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { SecurityAuditClient } from "@/components/websites/security-audit-client";
import { fetchSecurityHeaderAudit } from "@/lib/security/fetch-security-headers";
import { Shield } from "lucide-react";
import type { AuditIssue } from "@/components/websites/audit-shared";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const w = await prisma.website.findUnique({ where: { id }, select: { name: true } });
  return { title: `${w?.name ?? "Website"} — Security Audit` };
}

export default async function SecurityPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const website = await prisma.website.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    select: { id: true, name: true, url: true },
  });
  if (!website) notFound();

  const [latestScan, headerAudit] = await Promise.all([
    prisma.scan.findFirst({
      where: { websiteId: id, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      include: {
        issues: {
          where: { category: "SECURITY" },
          orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
        },
      },
    }),
    fetchSecurityHeaderAudit(website.url),
  ]);

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

  return (
    <SecurityAuditClient
      websiteId={website.id}
      websiteName={website.name}
      websiteUrl={website.url}
      score={latestScan?.securityScore ?? null}
      issues={issues}
      lastScanned={latestScan?.completedAt?.toISOString() ?? null}
      headerAudit={headerAudit}
    />
  );
}
