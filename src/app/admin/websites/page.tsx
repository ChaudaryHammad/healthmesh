import { getAdminWebsites } from "@/lib/admin-data";
import { AdminWebsitesClient } from "@/components/admin/admin-websites-client";

export const metadata = { title: "Admin — Websites" };

export default async function AdminWebsitesPage() {
  const websites = await getAdminWebsites();

  return (
    <AdminWebsitesClient
      websites={websites.map((site) => ({
        id: site.id,
        name: site.name,
        url: site.url,
        deletedAt: site.deletedAt?.toISOString() ?? null,
        createdAt: site.createdAt.toISOString(),
        ownerEmail: site.user.email,
        ownerName: site.user.name,
        ownerBanned: Boolean(site.user.deletedAt),
        scanCount: site._count.scans,
        latestScan: site.scans[0]
          ? {
              status: site.scans[0].status,
              overallScore: site.scans[0].overallScore,
              createdAt: site.scans[0].createdAt.toISOString(),
            }
          : null,
      }))}
    />
  );
}
