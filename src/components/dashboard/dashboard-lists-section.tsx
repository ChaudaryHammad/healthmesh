import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RecentScans } from "@/components/dashboard/recent-scans";
import { getDashboardLists } from "@/lib/dashboard-data";

export async function DashboardListsSection({ userId }: { userId: string }) {
  const { activityLogs, scansList } = await getDashboardLists(userId);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <RecentScans scans={scansList} />
      <RecentActivity logs={activityLogs} />
    </div>
  );
}
