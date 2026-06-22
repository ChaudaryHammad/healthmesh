export type CspGrade = "A" | "B" | "C" | "D" | "F";

export interface CspDirective {
  name: string;
  values: string[];
}

export interface CspFinding {
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
}

export interface CspRecommendations {
  basic: string[];
  intermediate: string[];
  advanced: string[];
}

export interface CspAnalysis {
  present: boolean;
  reportOnly: boolean;
  raw: string | null;
  directives: CspDirective[];
  grade: CspGrade;
  score: number;
  findings: CspFinding[];
  recommendations: CspRecommendations;
}

function parseDirectives(csp: string): CspDirective[] {
  return csp
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [name, ...rest] = part.split(/\s+/);
      return {
        name: name.toLowerCase(),
        values: rest.map((v) => v.replace(/'/g, "").toLowerCase()),
      };
    });
}

function directiveValues(directives: CspDirective[], name: string): string[] {
  return directives.find((d) => d.name === name)?.values ?? [];
}

function hasValue(values: string[], token: string): boolean {
  return values.some((v) => v === token || v.includes(token));
}

function gradeFromScore(score: number): CspGrade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

export function analyzeCsp(raw: string | null, reportOnly = false): CspAnalysis {
  const emptyRecommendations: CspRecommendations = {
    basic: [
      "Add a Content-Security-Policy header via your web server or framework middleware.",
      "Start with default-src 'self' to restrict resources to your own origin.",
      "Add object-src 'none' and base-uri 'self' to block common injection vectors.",
    ],
    intermediate: [
      "Avoid 'unsafe-inline' in script-src — use nonces (nonce-...) or hashes (sha256-...).",
      "Add frame-ancestors 'self' (or 'none') to prevent clickjacking via iframes.",
      "Add img-src, font-src, and connect-src explicitly instead of relying on wildcards.",
    ],
    advanced: [
      "Roll out changes using Content-Security-Policy-Report-Only first, then enforce.",
      "Use strict-dynamic with a nonce on trusted scripts for modern browsers.",
      "Add require-trusted-types-for 'script' and a trusted-types policy for DOM XSS hardening.",
    ],
  };

  if (!raw?.trim()) {
    return {
      present: false,
      reportOnly,
      raw: null,
      directives: [],
      grade: "F",
      score: 0,
      findings: [
        {
          severity: "critical",
          title: "No Content-Security-Policy detected",
          description:
            "Without CSP, browsers cannot restrict which scripts, styles, and resources load — increasing XSS risk.",
        },
      ],
      recommendations: emptyRecommendations,
    };
  }

  const directives = parseDirectives(raw);
  const findings: CspFinding[] = [];
  let score = 100;

  const defaultSrc = directiveValues(directives, "default-src");
  const scriptSrc = directiveValues(directives, "script-src");
  const styleSrc = directiveValues(directives, "style-src");
  const objectSrc = directiveValues(directives, "object-src");
  const baseUri = directiveValues(directives, "base-uri");
  const frameAncestors = directiveValues(directives, "frame-ancestors");
  const upgradeInsecure = directives.some((d) => d.name === "upgrade-insecure-requests");

  if (reportOnly) {
    findings.push({
      severity: "info",
      title: "Report-only policy",
      description:
        "This policy is in report-only mode — violations are logged but not blocked. Use this to test before enforcing.",
    });
    score -= 5;
  }

  if (!defaultSrc.length && !scriptSrc.length) {
    findings.push({
      severity: "critical",
      title: "No default-src or script-src directive",
      description: "Without a baseline directive, CSP provides little protection.",
    });
    score -= 25;
  }

  if (hasValue(scriptSrc.length ? scriptSrc : defaultSrc, "unsafe-inline")) {
    findings.push({
      severity: "critical",
      title: "unsafe-inline allowed in scripts",
      description:
        "'unsafe-inline' permits inline scripts, which defeats much of CSP's XSS protection.",
    });
    score -= 30;
  }

  if (hasValue(scriptSrc.length ? scriptSrc : defaultSrc, "unsafe-eval")) {
    findings.push({
      severity: "warning",
      title: "unsafe-eval allowed",
      description: "'unsafe-eval' permits eval() and similar — avoid unless strictly required.",
    });
    score -= 20;
  }

  const effectiveScript = scriptSrc.length ? scriptSrc : defaultSrc;
  if (hasValue(effectiveScript, "*")) {
    findings.push({
      severity: "warning",
      title: "Wildcard script source",
      description: "Allowing scripts from any origin (*) weakens CSP significantly.",
    });
    score -= 15;
  }

  if (hasValue(effectiveScript, "data:")) {
    findings.push({
      severity: "warning",
      title: "data: URIs in script-src",
      description: "data: script sources can be abused for XSS in some browsers.",
    });
    score -= 10;
  }

  if (!objectSrc.length || !hasValue(objectSrc, "none")) {
    findings.push({
      severity: "warning",
      title: "object-src not set to 'none'",
      description: "Plugins and embedded objects should be blocked with object-src 'none'.",
    });
    score -= 8;
  } else {
    score += 3;
  }

  if (!baseUri.length) {
    findings.push({
      severity: "warning",
      title: "base-uri not restricted",
      description: "Attackers can inject <base> tags to hijack relative URLs without base-uri.",
    });
    score -= 8;
  } else if (hasValue(baseUri, "self")) {
    score += 3;
  }

  if (!frameAncestors.length) {
    findings.push({
      severity: "info",
      title: "frame-ancestors not set",
      description: "Consider frame-ancestors 'self' or 'none' instead of relying only on X-Frame-Options.",
    });
    score -= 5;
  }

  if (hasValue(styleSrc.length ? styleSrc : defaultSrc, "unsafe-inline")) {
    findings.push({
      severity: "info",
      title: "unsafe-inline in styles",
      description:
        "Inline styles are common but allow CSS injection. Use nonces or hashes where possible.",
    });
    score -= 5;
  }

  if (upgradeInsecure) score += 5;

  const hasNonce = effectiveScript.some((v) => v.startsWith("nonce-") || v === "strict-dynamic");
  if (hasNonce) score += 10;

  const recommendations: CspRecommendations = { ...emptyRecommendations };

  if (!hasValue(objectSrc, "none")) {
    recommendations.basic.unshift("Add object-src 'none' to block Flash and plugin content.");
  }
  if (hasValue(effectiveScript, "unsafe-inline")) {
    recommendations.intermediate.unshift(
      "Replace inline scripts with external files, or use script-src 'nonce-RANDOM' on each script tag."
    );
  }
  if (!frameAncestors.length) {
    recommendations.intermediate.push("Add frame-ancestors 'none' if your site must not be embedded in iframes.");
  }
  if (score >= 70) {
    recommendations.advanced.unshift(
      "Monitor CSP violations with report-uri or report-to and refine directives based on real traffic."
    );
  }

  return {
    present: true,
    reportOnly,
    raw,
    directives,
    grade: gradeFromScore(Math.max(0, Math.min(100, score))),
    score: Math.max(0, Math.min(100, score)),
    findings,
    recommendations,
  };
}

export function cspGradeColor(grade: CspGrade): string {
  switch (grade) {
    case "A":
      return "text-emerald-400";
    case "B":
      return "text-lime-400";
    case "C":
      return "text-amber-400";
    case "D":
      return "text-orange-400";
    default:
      return "text-rose-400";
  }
}

export function cspGradeBadge(grade: CspGrade): string {
  switch (grade) {
    case "A":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
    case "B":
      return "bg-lime-500/10 text-lime-400 border-lime-500/25";
    case "C":
      return "bg-amber-500/10 text-amber-400 border-amber-500/25";
    case "D":
      return "bg-orange-500/10 text-orange-400 border-orange-500/25";
    default:
      return "bg-rose-500/10 text-rose-400 border-rose-500/25";
  }
}
