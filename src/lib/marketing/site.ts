/** Canonical public site origin (no trailing slash). */
export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

export const SITE_NAME = "Health Mesh";
export const SITE_TAGLINE = "Know before your users do";

export const DEFAULT_DESCRIPTION =
  "Website health monitoring for uptime, Core Web Vitals, accessibility, SEO, security headers, and broken links — so you catch issues before customers do.";
