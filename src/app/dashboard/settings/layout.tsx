import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAccountSettingsAction } from "@/actions/settings";
import { SettingsHeader } from "@/components/settings/settings-header";
import { SettingsNav } from "@/components/settings/settings-nav";

export const metadata = {
  title: "Settings",
};

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const result = await getAccountSettingsAction();
  if (!result.success || !result.data) redirect("/login");

  return (
    <div className="space-y-6">
      <SettingsHeader user={result.data} />
      <SettingsNav />
      {children}
    </div>
  );
}
