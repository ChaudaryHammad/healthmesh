import type { Metadata } from "next";
import { marketingMetadata } from "@/lib/marketing/seo";
import { JsonLd } from "@/components/marketing/json-ld";
import { breadcrumbJsonLd } from "@/lib/marketing/json-ld";

export const metadata: Metadata = marketingMetadata({
  title: "Contact Website Monitoring Support",
  description:
    "Contact the Health Mesh team about product questions, agency rollouts, onboarding, or partnership inquiries for website health monitoring.",
  path: "/contact",
  keywords: ["contact Health Mesh", "website monitoring support"],
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      {children}
    </>
  );
}
