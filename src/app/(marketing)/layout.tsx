import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/marketing/cookie-banner";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { JsonLd } from "@/components/marketing/json-ld";
import {
  organizationJsonLd,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from "@/lib/marketing/json-ld";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing flex min-h-screen flex-col">
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={softwareApplicationJsonLd()} />
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
      <CookieBanner />
      <ScrollToTop />
    </div>
  );
}
