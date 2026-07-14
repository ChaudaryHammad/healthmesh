"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type UptimeCheckLite = {
  id: string;
  result: string;
  checkedAt: string;
};

type HourBucket = {
  start: number;
  end: number;
  total: number;
  up: number;
  pct: number | null;
};

function isUp(result: string) {
  return result === "UP" || result === "DEGRADED";
}

function bucketTone(pct: number | null): string {
  if (pct == null) return "bg-secondary/60";
  if (pct >= 99) return "bg-emerald-500/85";
  if (pct >= 90) return "bg-amber-400/90";
  return "bg-rose-500/90";
}

function hourLabel(t: number): string {
  return new Date(t).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/**
 * Hourly availability over the last 24 hours, Better-Stack style.
 * Hours with no checks render as neutral "no data" segments.
 */
export function UptimeBars({
  checks,
  className,
}: {
  checks: UptimeCheckLite[];
  className?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const buckets = useMemo<HourBucket[]>(() => {
    const now = Date.now();
    const hourMs = 3_600_000;
    // Align to the top of the current hour so segments are stable.
    const endOfCurrent = Math.ceil(now / hourMs) * hourMs;
    const out: HourBucket[] = Array.from({ length: 24 }, (_, i) => {
      const start = endOfCurrent - (24 - i) * hourMs;
      return { start, end: start + hourMs, total: 0, up: 0, pct: null };
    });
    for (const c of checks) {
      const t = new Date(c.checkedAt).getTime();
      const idx = Math.floor((t - out[0].start) / hourMs);
      if (idx < 0 || idx > 23) continue;
      out[idx].total += 1;
      if (isUp(c.result)) out[idx].up += 1;
    }
    for (const b of out) {
      b.pct = b.total > 0 ? Math.round((b.up / b.total) * 1000) / 10 : null;
    }
    return out;
  }, [checks]);

  const covered = buckets.filter((b) => b.total > 0);
  const overallPct =
    covered.length > 0
      ? Math.round(
          (covered.reduce((s, b) => s + b.up, 0) /
            covered.reduce((s, b) => s + b.total, 0)) *
            1000
        ) / 10
      : null;

  const active = hover != null ? buckets[hover] : null;

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-baseline justify-between gap-3 text-[11px] text-muted-foreground">
        <span className="font-medium uppercase tracking-[0.14em]">Availability · 24h</span>
        <span className="tabular-nums">
          {active
            ? active.pct != null
              ? `${hourLabel(active.start)}–${hourLabel(active.end)} · ${active.pct}% up · ${active.total} check${active.total === 1 ? "" : "s"}`
              : `${hourLabel(active.start)}–${hourLabel(active.end)} · no data`
            : overallPct != null
              ? `${overallPct}% of checks succeeded`
              : "No checks in the last 24 hours"}
        </span>
      </div>

      <div
        className="flex h-8 items-stretch gap-[3px]"
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label="Hourly availability for the last 24 hours"
      >
        {buckets.map((b, i) => (
          <div
            key={b.start}
            onMouseEnter={() => setHover(i)}
            className={cn(
              "flex-1 cursor-default rounded-[3px] transition-all",
              bucketTone(b.pct),
              hover === i && "scale-y-110 opacity-100",
              hover != null && hover !== i && "opacity-55"
            )}
          />
        ))}
      </div>

      <div className="flex justify-between text-[10px] text-muted-foreground/70">
        <span>24h ago</span>
        <span>now</span>
      </div>
    </div>
  );
}
