import { AuditPageLoader } from "@/components/websites/audit-page-loader";

export default function PerformanceLoading() {
  return (
    <AuditPageLoader
      categoryLabel="Performance"
      accentClass="text-emerald-400"
      steps={[
        "Loading your latest audit results…",
        "Fetching Core Web Vitals data…",
        "Preparing Lighthouse findings…",
      ]}
    />
  );
}
