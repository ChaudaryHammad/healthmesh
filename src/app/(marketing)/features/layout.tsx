import type { Metadata } from "next";
import { marketingMetadata } from "@/lib/marketing/seo";
import { JsonLd } from "@/components/marketing/json-ld";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/marketing/json-ld";

export const metadata: Metadata = marketingMetadata({
  title: "Website Monitoring Features — Uptime, CWV, A11y, SEO & Security",
  description:
    "Explore Health Mesh capabilities: uptime checks, Core Web Vitals, WCAG accessibility scans, technical SEO, HTTP security headers, and broken-link coverage in one calm system.",
  path: "/features",
  keywords: [
    "website monitoring features",
    "uptime checks",
    "Core Web Vitals audit",
    "WCAG accessibility scan",
    "security header monitoring",
    "broken link coverage",
  ],
});

const FEATURES_FAQS = [
  {
    question: "Do audits use real engines?",
    answer:
      "Yes. Performance runs Lighthouse in Chrome. Accessibility uses axe-core. Coverage crawls separately.",
  },
  {
    question: "Can it audit authenticated pages?",
    answer: "Not yet — public URLs only. Authenticated flows are on the roadmap.",
  },
  {
    question: "How is coverage different from an audit?",
    answer:
      "Coverage maps reachability. Audits score the quality of what loads.",
  },
];

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Features", path: "/features" },
        ])}
      />
      <JsonLd data={faqPageJsonLd(FEATURES_FAQS)} />
      {children}
    </>
  );
}
