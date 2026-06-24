import { getAdminContactMessages } from "@/lib/admin-data";
import { AdminContactsClient } from "@/components/admin/admin-contacts-client";

export const metadata = { title: "Admin — Support" };

export default async function AdminContactsPage() {
  const messages = await getAdminContactMessages();

  return (
    <AdminContactsClient
      messages={messages.map((msg) => ({
        id: msg.id,
        name: msg.name,
        email: msg.email,
        subject: msg.subject,
        message: msg.message,
        status: msg.status,
        createdAt: msg.createdAt.toISOString(),
      }))}
    />
  );
}
