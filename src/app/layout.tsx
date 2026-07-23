import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AppToaster } from "@/components/ui/app-toaster";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { THEME_BOOT_SCRIPT } from "@/lib/security/csp";
import { DEFAULT_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/marketing/site";
import { BRAND_ICONS } from "@/lib/brand-icons";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} — Website Health Monitoring`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "website monitoring",
    "website health monitoring",
    "uptime monitoring",
    "Core Web Vitals monitoring",
    "accessibility audit",
    "SEO audit tool",
    "security headers checker",
    "broken link checker",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f3f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0C10" },
  ],
  icons: {
    icon: [
      { url: BRAND_ICONS.faviconIco, sizes: "48x48" },
      { url: BRAND_ICONS.favicon16, sizes: "16x16", type: "image/png" },
      { url: BRAND_ICONS.favicon32, sizes: "32x32", type: "image/png" },
      { url: BRAND_ICONS.icon192, sizes: "192x192", type: "image/png" },
      { url: BRAND_ICONS.icon512, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: BRAND_ICONS.appleTouch, sizes: "180x180", type: "image/png" }],
    shortcut: BRAND_ICONS.faviconIco,
  },
  manifest: BRAND_ICONS.manifest,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: getSiteUrl(),
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Website Health Monitoring`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: BRAND_ICONS.social,
        width: 512,
        height: 512,
        alt: `${SITE_NAME} logo`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — Website Health Monitoring`,
    description: DEFAULT_DESCRIPTION,
    images: [BRAND_ICONS.social],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Browsers strip nonce from the DOM after execution — suppress the false hydration diff. */}
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider defaultTheme="dark">
          {children}
          <PwaRegister />
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
