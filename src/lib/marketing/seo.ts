import type { Metadata } from "next";
import { SITE_NAME, getSiteUrl } from "@/lib/marketing/site";

type MarketingMetaInput = {
  title: string;
  description: string;
  path: string;
  /** Use absolute title (skip "%s | Health Mesh" template). */
  absoluteTitle?: boolean;
  keywords?: string[];
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
};

export function marketingMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  keywords,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  noIndex = false,
}: MarketingMetaInput): Metadata {
  const site = getSiteUrl();
  const url = path === "/" ? site : `${site}${path.startsWith("/") ? path : `/${path}`}`;
  const ogTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: keywords?.length ? keywords : undefined,
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type,
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title: ogTitle,
      description,
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(authors?.length ? { authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
  };
}
