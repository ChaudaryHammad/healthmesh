import { getAdminUsers } from "@/lib/admin-data";
import { AdminUsersClient } from "@/components/admin/admin-users-client";

export const metadata = { title: "Admin — Users" };

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <AdminUsersClient
      users={users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified?.toISOString() ?? null,
        deletedAt: user.deletedAt?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
        websiteCount: user._count.websites,
        subscription: user.subscription
          ? {
              status: user.subscription.status,
              plan: user.subscription.plan,
              trialEndsAt: user.subscription.trialEndsAt?.toISOString() ?? null,
            }
          : null,
      }))}
    />
  );
}
