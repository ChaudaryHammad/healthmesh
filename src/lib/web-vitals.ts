export type VitalRating = "good" | "needs-improvement" | "poor" | "unknown";

export interface VitalDefinition {
  key: string;
  abbr: string;
  name: string;
  unit: "ms" | "score";
  isCoreWebVital: boolean;
}

export const VITAL_DEFINITIONS: VitalDefinition[] = [
  { key: "lcp", abbr: "LCP", name: "Largest Contentful Paint", unit: "ms", isCoreWebVital: true },
  { key: "inp", abbr: "INP", name: "Interaction to Next Paint", unit: "ms", isCoreWebVital: true },
  { key: "cls", abbr: "CLS", name: "Cumulative Layout Shift", unit: "score", isCoreWebVital: true },
  { key: "fcp", abbr: "FCP", name: "First Contentful Paint", unit: "ms", isCoreWebVital: false },
  { key: "tbt", abbr: "TBT", name: "Total Blocking Time", unit: "ms", isCoreWebVital: false },
];

// Google thresholds (ms for paint metrics, unitless for CLS)
const THRESHOLDS: Record<string, [number, number]> = {
  lcp: [2500, 4000],
  inp: [200, 500],
  cls: [0.1, 0.25],
  fcp: [1800, 3000],
  tbt: [200, 600],
};

export function getVitalRating(key: string, value: number | null): VitalRating {
  if (value === null) return "unknown";
  const [good, poor] = THRESHOLDS[key] ?? [50, 80];
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

export function formatVitalValue(key: string, value: number | null): string {
  if (value === null) return "—";
  if (key === "cls") return value.toFixed(3);
  if (value >= 1000) return `${(value / 1000).toFixed(2)} s`;
  return `${Math.round(value)} ms`;
}

export function vitalRatingLabel(rating: VitalRating): string {
  switch (rating) {
    case "good":
      return "Good";
    case "needs-improvement":
      return "Needs work";
    case "poor":
      return "Poor";
    default:
      return "No data";
  }
}

export function vitalRatingClasses(rating: VitalRating): {
  text: string;
  badge: string;
  border: string;
} {
  switch (rating) {
    case "good":
      return {
        text: "text-emerald-400",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
        border: "border-emerald-500/20",
      };
    case "needs-improvement":
      return {
        text: "text-amber-400",
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/25",
        border: "border-amber-500/20",
      };
    case "poor":
      return {
        text: "text-rose-400",
        badge: "bg-rose-500/10 text-rose-400 border-rose-500/25",
        border: "border-rose-500/20",
      };
    default:
      return {
        text: "text-muted-foreground",
        badge: "bg-secondary/40 text-muted-foreground border-border/30",
        border: "border-border/20",
      };
  }
}
