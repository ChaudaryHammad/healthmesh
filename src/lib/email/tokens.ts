import { createHmac, timingSafeEqual, randomBytes } from "crypto";

export function generateSecureToken(): string {
  return randomBytes(32).toString("hex");
}

export function createNewsletterUnsubscribeToken(email: string): string {
  const normalized = email.toLowerCase().trim();
  const hmac = createHmac("sha256", process.env.AUTH_SECRET!)
    .update(`newsletter-unsub:${normalized}`)
    .digest("hex");
  return Buffer.from(`${normalized}:${hmac}`).toString("base64url");
}

export function parseNewsletterUnsubscribeToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const colonIndex = decoded.lastIndexOf(":");
    if (colonIndex === -1) return null;

    const email = decoded.slice(0, colonIndex);
    const hmac = decoded.slice(colonIndex + 1);
    if (!email || !hmac) return null;

    const expected = createHmac("sha256", process.env.AUTH_SECRET!)
      .update(`newsletter-unsub:${email}`)
      .digest("hex");

    const a = Buffer.from(hmac);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    return email;
  } catch {
    return null;
  }
}

export function newsletterUnsubscribeUrl(email: string, appUrl: string): string {
  const token = createNewsletterUnsubscribeToken(email);
  return `${appUrl}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}
