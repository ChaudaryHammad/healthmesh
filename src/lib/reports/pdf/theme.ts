/**
 * Print-friendly light PDF palette.
 * Headers use a slate/gray scheme; severity and score colors stay semantic.
 */
export const colors = {
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  borderStrong: "#cbd5e1",
  headerBg: "#f8fafc",
  surface: "#ffffff",
  /** Neutral slate accents (headers / rules) — not brand blue */
  accent: "#475569",
  accentSoft: "#f1f5f9",
  accentBorder: "#e2e8f0",
  accentDark: "#334155",
  headerText: "#334155",
  headerMuted: "#64748b",
  critical: "#b91c1c",
  major: "#b45309",
  minor: "#1d4ed8",
  info: "#64748b",
  action: "#166534",
  actionSoft: "#f0fdf4",
  headlineBg: "#fef2f2",
  headlineBorder: "#fecaca",
  headlineText: "#991b1b",
  headlineItem: "#7f1d1d",
  okBg: "#f0fdf4",
  okBorder: "#bbf7d0",
  okTitle: "#166534",
  okItem: "#14532d",
  footer: "#94a3b8",
  scoreGood: "#15803d",
  scoreWarn: "#b45309",
  scoreBad: "#b91c1c",
  coverMuted: "#94a3b8",
};

export const fonts = {
  body: "Helvetica",
  mono: "Courier",
};

export function scoreColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return colors.muted;
  if (score >= 90) return colors.scoreGood;
  if (score >= 50) return colors.scoreWarn;
  return colors.scoreBad;
}
