import React from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { BrokenLinksClient } from "@/components/websites/broken-links-client";
import { ALL_LINK_RESOURCE_TYPES } from "@/lib/scanner/link-resource-types";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const w = await prisma.website.findUnique({ where: { id }, select: { name: true } });
  return { title: `${w?.name ?? "Website"} — Broken Links` };
}

export default async function BrokenLinksPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const website = await prisma.website.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    select: { id: true, name: true, url: true },
  });
  if (!website) notFound();

  const runningScan = await prisma.brokenLinkScan.findFirst({
    where: { websiteId: id, status: "RUNNING" },
    orderBy: { createdAt: "desc" },
  });

  const serializedScan = runningScan
    ? {
        id: runningScan.id,
        status: runningScan.status,
        mode: runningScan.mode,
        resourceTypes: [...ALL_LINK_RESOURCE_TYPES],
        phase: runningScan.phase,
        statusMessage: runningScan.statusMessage,
        pagesDiscovered: runningScan.pagesDiscovered,
        pagesCrawled: runningScan.pagesCrawled,
        linksFound: runningScan.linksFound,
        linksChecked: runningScan.linksChecked,
        brokenCount: runningScan.brokenCount,
        progressPercent: runningScan.progressPercent,
        errorMessage: runningScan.errorMessage,
        completedAt: runningScan.completedAt?.toISOString() ?? null,
        createdAt: runningScan.createdAt.toISOString(),
      }
    : null;

  return (
    <BrokenLinksClient
      websiteId={website.id}
      websiteName={website.name}
      websiteUrl={website.url}
      initialScan={serializedScan}
    />
  );
}
