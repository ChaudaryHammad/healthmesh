import { StatsCards } from "@/components/dashboard/stats-cards";
import { ScoreSummary } from "@/components/dashboard/score-summary";
import { getDashboardStats } from "@/lib/dashboard-data";

export async function DashboardStatsSection({ userId }: { userId: string }) {
  const stats = await getDashboardStats(userId);

  return (
    <>
      <StatsCards
        totalWebsites={stats.totalWebsites}
        activeScans={stats.activeScans}
        criticalIssues={stats.criticalIssues}
        accessibilityIssues={stats.accessibilityIssues}
        seoIssues={stats.seoIssues}
      />
      <ScoreSummary
        performance={stats.avgPerformance}
        accessibility={stats.avgAccessibility}
        seo={stats.avgSeo}
        security={stats.avgSecurity}
        brokenLinks={stats.avgBrokenLinks}
        scannedCount={stats.scannedCount}
      />
    </>
  );
}
