import { getAdminNewsletterSubscribers } from "@/lib/admin-data";
import { AdminNewsletterClient } from "@/components/admin/admin-newsletter-client";

export const metadata = { title: "Admin — Newsletter" };

export default async function AdminNewsletterPage() {
  const subscribers = await getAdminNewsletterSubscribers();

  return (
    <AdminNewsletterClient
      subscribers={subscribers.map((sub) => ({
        id: sub.id,
        email: sub.email,
        subscribedAt: sub.subscribedAt.toISOString(),
        unsubscribedAt: sub.unsubscribedAt?.toISOString() ?? null,
      }))}
    />
  );
}
