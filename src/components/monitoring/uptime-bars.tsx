"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
  upCount: number;
  downCount: number;
  /** Stacked series (percent of the hour's checks) */
  up: number;
  down: number;
  nodata: number;
  pct: number | null;
};

function isUp(result: string) {
  return result === "UP" || result === "DEGRADED";
}

function hourLabel(t: number): string {
  return new Date(t).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/* --------------------------------- tooltip --------------------------------- */

type TooltipEntry = { payload?: HourBucket };

function UptimeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
}) {
  const b = active && payload && payload.length > 0 ? payload[0].payload : undefined;
  if (!b) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-popover/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="whitespace-nowrap text-sm font-semibold tabular-nums text-foreground">
        {b.pct != null ? `${b.pct}% up` : "No data"}
      </p>
      <p className="mt-0.5 whitespace-nowrap text-[11px] text-muted-foreground">
        {hourLabel(b.start)} – {hourLabel(b.end)}
        {b.total > 0 ? (
          <>
            {" · "}
            <span className="text-emerald-400">{b.upCount} up</span>
            {b.downCount > 0 ? (
              <>
                {" / "}
                <span className="text-rose-400">{b.downCount} down</span>
              </>
            ) : null}
          </>
        ) : null}
      </p>
    </div>
  );
}

/* -------------------------------- component -------------------------------- */

/**
 * Hourly availability over the last 24 hours as a stacked bar chart:
 * emerald = successful checks, rose = failed checks, faint = no data.
 */
export function UptimeBars({
  checks,
  className,
}: {
  checks: UptimeCheckLite[];
  className?: string;
}) {
  const buckets = useMemo<HourBucket[]>(() => {
    const hourMs = 3_600_000;
    const endOfCurrent = Math.ceil(Date.now() / hourMs) * hourMs;
    const out: HourBucket[] = Array.from({ length: 24 }, (_, i) => {
      const start = endOfCurrent - (24 - i) * hourMs;
      return {
        start,
        end: start + hourMs,
        total: 0,
        upCount: 0,
        downCount: 0,
        up: 0,
        down: 0,
        nodata: 100,
        pct: null,
      };
    });
    for (const c of checks) {
      const t = new Date(c.checkedAt).getTime();
      const idx = Math.floor((t - out[0].start) / hourMs);
      if (idx < 0 || idx > 23) continue;
      out[idx].total += 1;
      if (isUp(c.result)) out[idx].upCount += 1;
      else out[idx].downCount += 1;
    }
    for (const b of out) {
      if (b.total > 0) {
        b.pct = Math.round((b.upCount / b.total) * 1000) / 10;
        b.up = (b.upCount / b.total) * 100;
        b.down = (b.downCount / b.total) * 100;
        b.nodata = 0;
      }
    }
    return out;
  }, [checks]);

  const covered = buckets.filter((b) => b.total > 0);
  const overallPct =
    covered.length > 0
      ? Math.round(
          (covered.reduce((s, b) => s + b.upCount, 0) /
            covered.reduce((s, b) => s + b.total, 0)) *
            1000
        ) / 10
      : null;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Availability</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Uptime per hour, last 24 hours</p>
        </div>
        {overallPct != null ? (
          <p
            className={cn(
              "text-sm font-semibold tabular-nums",
              overallPct >= 99 ? "text-emerald-400" : overallPct >= 95 ? "text-amber-400" : "text-rose-400"
            )}
          >
            {overallPct}%
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">No checks yet</p>
        )}
      </div>

      <div className="h-36 w-full [&_.recharts-surface]:outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={buckets}
            margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
            barCategoryGap="28%"
          >
            <CartesianGrid
              strokeDasharray="3 6"
              stroke="var(--border)"
              strokeOpacity={0.35}
              vertical={false}
            />
            <XAxis
              dataKey="start"
              tickFormatter={hourLabel}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)", strokeOpacity: 0.5 }}
              interval={3}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              content={<UptimeTooltip />}
              cursor={{ fill: "var(--foreground)", fillOpacity: 0.05 }}
              isAnimationActive={false}
            />
            <Bar dataKey="up" stackId="h" fill="#10b981" fillOpacity={0.85} isAnimationActive={false} />
            <Bar
              dataKey="down"
              stackId="h"
              fill="#f43f5e"
              fillOpacity={0.9}
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />
            <Bar
              dataKey="nodata"
              stackId="h"
              fill="var(--secondary)"
              fillOpacity={0.35}
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[2px] bg-emerald-500/85" /> Up
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[2px] bg-rose-500/90" /> Down
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[2px] bg-secondary/60" /> No data
        </span>
      </div>
    </div>
  );
}
