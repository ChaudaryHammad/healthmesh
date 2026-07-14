import React, { Suspense } from "react";
import Link from "next/link";
import { Globe, Plus, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getEntitlements } from "@/lib/entitlements";
import { getUserDisplayName } from "@/lib/user-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardListsSection } from "@/components/dashboard/dashboard-lists-section";
import { DashboardStatsSection } from "@/components/dashboard/dashboard-stats-section";
import {
  DashboardListsLoader,
  DashboardStatsLoader,
} from "@/components/layout/page-loaders";

export const metadata = {
  title: "Dashboard Overview",
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const entitlements = await getEntitlements(userId);
  const firstName = getUserDisplayName(session.user.name, session.user.email).split(" ")[0];
  const atLimit = entitlements.websitesRemaining <= 0;

  return (
    <div className="space-y-8 select-none">
      {/* ============================== Page header ============================== */}
      <div className="flex flex-col gap-5 border-b border-border/20 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight md:text-[26px]">
              {greeting()}, {firstName}
            </h1>
            <Badge
              variant="outline"
              className="border-primary/25 bg-primary/[0.08] text-[11px] font-medium text-primary"
            >
              <Sparkles className="h-3 w-3" />
              {entitlements.planLabel}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Uptime, audits, and issues across your connected websites.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            render={<Link href="/dashboard/websites" />}
            nativeButton={false}
            title={atLimit ? `${entitlements.planLabel} plan limit reached` : undefined}
          >
            <Plus className="h-4 w-4" />
            Add website
          </Button>
        </div>
      </div>

      {entitlements.websiteCount === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card to-card px-6 py-8 sm:px-8">
          <div
            aria-hidden
            className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
          />
          <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Globe className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-semibold">Connect your first website</h2>
                <p className="max-w-md text-sm text-muted-foreground">
                  Add a site to start auditing performance, SEO, accessibility, and
                  security — plus uptime monitoring, in minutes.
                </p>
              </div>
            </div>
            <Button
              render={<Link href="/dashboard/websites" />}
              nativeButton={false}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add website
            </Button>
          </div>
        </div>
      ) : null}

      <Suspense fallback={<DashboardStatsLoader />}>
        <DashboardStatsSection userId={userId} />
      </Suspense>

      <Suspense fallback={<DashboardListsLoader />}>
        <DashboardListsSection userId={userId} />
      </Suspense>
    </div>
  );
}
