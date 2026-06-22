import { AuditPageLoader } from "@/components/websites/audit-page-loader";

export default function AccessibilityLoading() {
  return (
    <AuditPageLoader
      categoryLabel="Accessibility"
      accentClass="text-violet-400"
      steps={[
        "Loading your latest audit results…",
        "Grouping WCAG violations by rule…",
        "Preparing accessibility report…",
      ]}
    />
  );
}
