import { redirect } from "next/navigation";

/** Legacy route — topbar previously linked here */
export default function SettingsAccountRedirectPage() {
  redirect("/dashboard/settings/billing");
}
