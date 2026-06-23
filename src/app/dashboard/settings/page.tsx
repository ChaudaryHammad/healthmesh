import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAccountSettingsAction } from "@/actions/settings";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";

export const metadata = {
  title: "Profile Settings",
};

export default async function SettingsProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const result = await getAccountSettingsAction();
  if (!result.success || !result.data) {
    redirect("/login");
  }

  const user = result.data;

  return (
    <ProfileSettingsForm
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        role: user.role,
        createdAt: user.createdAt,
        image: user.image,
      }}
    />
  );
}
