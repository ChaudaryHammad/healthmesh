import { launchBrowser } from "./launch-browser";
import { runPerformanceAudit } from "./lighthouse-runner";
import { runAccessibilityAudit } from "./accessibility-runner";
import { runSeoAudit } from "./seo-runner";
import { runSecurityAudit } from "./security-runner";
import type { AuditResult } from "./types";

export async function runFullAudit(url: string): Promise<AuditResult> {
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

  const securityPromise = runSecurityAudit(normalizedUrl);

  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(normalizedUrl, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    const html = await page.content();

    const [performance, accessibility, seo, security] = await Promise.all([
      runPerformanceAudit(normalizedUrl, browser),
      runAccessibilityAudit(page),
      runSeoAudit(normalizedUrl, html),
      securityPromise,
    ]);

    const overallScore = Math.round(
      (performance.score +
        accessibility.score +
        seo.score +
        security.score) /
        4
    );

    return {
      performanceScore: performance.score,
      accessibilityScore: accessibility.score,
      seoScore: seo.score,
      securityScore: security.score,
      overallScore,
      fcp: performance.fcp,
      lcp: performance.lcp,
      cls: performance.cls,
      inp: performance.inp,
      tbt: performance.tbt,
      issues: [
        ...performance.issues,
        ...accessibility.issues,
        ...seo.issues,
        ...security.issues,
      ],
    };
  } finally {
    await browser.close();
  }
}
