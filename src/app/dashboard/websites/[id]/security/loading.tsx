import { AuditPageLoader } from "@/components/websites/audit-page-loader";

export default function SecurityLoading() {
  return (
    <AuditPageLoader
      categoryLabel="Security"
      accentClass="text-rose-400"
      steps={[
        "Loading audit history…",
        "Fetching live HTTP security headers…",
        "Analyzing Content-Security-Policy…",
        "Grading CSP and building recommendations…",
      ]}
    />
  );
}
