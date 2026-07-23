/** Raster brand assets in /public — use these for favicons, OG, PWA, and embeds. */
export const BRAND_ICONS = {
  faviconIco: "/favicon.ico",
  favicon16: "/favicon-16x16.png",
  favicon32: "/favicon-32x32.png",
  appleTouch: "/apple-touch-icon.png",
  icon192: "/icon-192.png",
  icon512: "/icon-512.png",
  icon512Maskable: "/icon-512-maskable.png",
  /** Prefer for Open Graph / schema when a square mark is enough */
  social: "/icon-512.png",
  /** Source vector mark (UI components still use inline SVG) */
  markSvg: "/healthmesh-mark.svg",
  manifest: "/site.webmanifest",
} as const;
