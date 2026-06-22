import { readFile } from "fs/promises";
import path from "path";
import type { Page } from "puppeteer";
import type { ScanIssueInput } from "./types";

const IMPACT_TO_SEVERITY: Record<string, ScanIssueInput["severity"]> = {
  critical: "CRITICAL",
  serious: "MAJOR",
  moderate: "MINOR",
  minor: "INFO",
};

async function loadAxeSource(): Promise<string> {
  const axePath = path.join(process.cwd(), "node_modules/axe-core/axe.min.js");
  return readFile(axePath, "utf8");
}

export async function runAccessibilityAudit(page: Page): Promise<{
  score: number;
  issues: ScanIssueInput[];
}> {
  const axeSource = await loadAxeSource();
  await page.evaluate(axeSource);
  const results = await page.evaluate(async () => {
    // @ts-expect-error axe injected at runtime
    return await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "best-practice"] },
    });
  });

  const issues: ScanIssueInput[] = results.violations.map((v: {
    id: string;
    impact?: string;
    help: string;
    description: string;
    helpUrl: string;
    nodes: Array<{
      target: string[];
      html: string;
      failureSummary?: string;
    }>;
  }) => {
    const node = v.nodes[0];
    const selector = node?.target?.join(" > ") ?? null;
    return {
      category: "ACCESSIBILITY" as const,
      severity: IMPACT_TO_SEVERITY[v.impact ?? "moderate"] ?? "MINOR",
      title: v.help,
      description: node?.failureSummary
        ? `${v.description} — ${node.failureSummary}`
        : v.description,
      selector,
      recommendation: `See ${v.helpUrl} for remediation guidance.`,
      metadata: { axeId: v.id, html: node?.html?.slice(0, 200) },
    };
  });

  const violationPenalty = results.violations.reduce(
    (sum: number, v: { impact?: string }) => {
      const weights: Record<string, number> = {
        critical: 15,
        serious: 10,
        moderate: 5,
        minor: 2,
      };
      return sum + (weights[v.impact ?? "moderate"] ?? 5);
    },
    0
  );

  const score = Math.max(0, Math.round(100 - violationPenalty));

  return { score, issues };
}
