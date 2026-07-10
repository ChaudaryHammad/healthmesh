import React from "react";
import { auth } from "@/lib/auth";
import { getEntitlements } from "@/lib/entitlements";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import WebsitesClient from "./WebsitesClient";

export const metadata = {
  title: "Connected Websites",
};

export default async function WebsitesPage() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const [websites, entitlements] = await Promise.all([
    prisma.website.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
    },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  }),
    getEntitlements(session.user.id),
  ]);

  const serialized = websites.map((site) => ({
    id: site.id,
    name: site.name,
    url: site.url,
    scanFrequency: site.scanFrequency,
    scans: site.scans.map((scan) => ({
      id: scan.id,
      status: scan.status,
      overallScore: scan.overallScore,
      performanceScore: scan.performanceScore,
      accessibilityScore: scan.accessibilityScore,
      seoScore: scan.seoScore,
      securityScore: scan.securityScore,
      createdAt: scan.createdAt,
    })),
  }));

  return (
    <WebsitesClient
      initialWebsites={serialized}
      canScheduleScans={entitlements.canScheduleScans}
    />
  );
}
