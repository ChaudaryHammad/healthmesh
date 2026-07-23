import React from "react";
import { auth } from "@/lib/auth";
import { HomeHero } from "@/components/marketing/home-hero";
import { HomeSections } from "@/components/marketing/home-sections";
import { marketingMetadata } from "@/lib/marketing/seo";
import { JsonLd } from "@/components/marketing/json-ld";
import { breadcrumbJsonLd } from "@/lib/marketing/json-ld";

export const metadata = marketingMetadata({
  title: "Website Health Monitoring Software — Uptime, Performance & SEO",
  absoluteTitle: true,
  description:
    "Health Mesh monitors website uptime, Core Web Vitals, accessibility, SEO, security headers, and broken links in one dashboard. Catch production issues before your users do.",
  path: "/",
  keywords: [
    "website health monitoring",
    "website monitoring software",
    "uptime monitoring",
    "Core Web Vitals monitoring",
    "website accessibility audit",
    "technical SEO monitoring",
  ],
});

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="flex flex-1 flex-col">
      <JsonLd
        data={breadcrumbJsonLd([{ name: "Home", path: "/" }])}
      />
      <HomeHero isLoggedIn={isLoggedIn} />
      <HomeSections isLoggedIn={isLoggedIn} />
    </div>
  );
}
