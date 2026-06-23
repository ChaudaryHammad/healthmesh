import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAccountSettingsAction } from "@/actions/settings";
import { BillingSettingsClient } from "@/components/settings/billing-settings-client";

export const metadata = {
  title: "Billing Settings",
};

/** Development plan limits until Stripe subscriptions ship */
const DEV_PLAN = {
  name: "Development",
  description: "Full access while billing is being set up",
  websiteLimit: 15,
};

export default async function SettingsBillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const result = await getAccountSettingsAction();
  if (!result.success || !result.data) {
    redirect("/login");
  }

  return (
    <BillingSettingsClient
      websiteCount={result.data.websiteCount}
      websiteLimit={DEV_PLAN.websiteLimit}
      planName={DEV_PLAN.name}
      planDescription={DEV_PLAN.description}
    />
  );
}
