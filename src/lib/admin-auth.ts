import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") {
    redirect("/dashboard");
  }
  return session;
}

export async function getAdminSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") {
    return null;
  }
  return session;
}
