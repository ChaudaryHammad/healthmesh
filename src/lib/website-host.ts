/** Normalize user-entered website URL to a storable http(s) URL. */
export function normalizeWebsiteUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    if (!parsed.hostname) return null;
    return withProtocol.toLowerCase();
  } catch {
    return null;
  }
}

/** Normalize a website URL to a stable hostname for slot tracking. */
export function normalizeWebsiteHost(rawUrl: string): string | null {
  const normalized = normalizeWebsiteUrl(rawUrl);
  if (!normalized) return null;

  try {
    const host = new URL(normalized).hostname.toLowerCase();
    if (!host) return null;
    return host.startsWith("www.") ? host.slice(4) : host;
  } catch {
    return null;
  }
}
