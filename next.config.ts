import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard/broken-links",
        destination: "/dashboard/coverage",
        permanent: true,
      },
      {
        source: "/dashboard/websites/:id/broken-links",
        destination: "/dashboard/websites/:id/coverage",
        permanent: true,
      },
    ];
  },
  serverExternalPackages: [
    "puppeteer",
    "puppeteer-core",
    "@sparticuz/chromium",
    "@react-pdf/renderer",
    "lighthouse",
    "cheerio",
    "axe-core",
    "@trigger.dev/sdk",
    "@prisma/client",
    "@prisma/adapter-pg",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
