import { AuditPageLoader } from "@/components/websites/audit-page-loader";

export default function SeoLoading() {
  return (
    <AuditPageLoader
      categoryLabel="SEO"
      accentClass="text-amber-400"
      steps={[
        "Loading audit history…",
        "Fetching your page HTML…",
        "Checking title, meta tags, and headings…",
        "Verifying robots.txt and sitemap…",
      ]}
    />
  );
}
