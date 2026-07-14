"use client";

import { useId, useMemo, useState } from "react";
import {
  Area,
  ComposedChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatLatency } from "@/lib/uptime/format";
import { cn } from "@/lib/utils";

export type ResponsePoint = {
  id: string;
  result: string;
  httpStatus: number | null;
  latencyMs: number | null;
  checkedAt: string;
};

type RangeKey = "1h" | "6h" | "24h" | "all";

const RANGES: { key: RangeKey; label: string; ms: number }[] = [
  { key: "1h", label: "1H", ms: 3_600_000 },
  { key: "6h", label: "6H", ms: 21_600_000 },
  { key: "24h", label: "24H", ms: 86_400_000 },
  { key: "all", label: "All", ms: Number.POSITIVE_INFINITY },
];

const MAX_RENDER_POINTS = 150;
const RESULT_SEVERITY: Record<string, number> = { UP: 0, DEGRADED: 1, ERROR: 2, DOWN: 3 };

type Datum = {
  t: number;
  latency: number | null;
  /** Set only for DOWN/ERROR points so the scatter layer can mark them */
  fail: number | null;
  /** Set only for DEGRADED points */
  degraded: number | null;
  result: string;
  httpStatus: number | null;
  samples: number;
};

function isUp(result: string) {
  return result === "UP" || result === "DEGRADED";
}

function toDatum(p: ResponsePoint): Datum {
  const latency = p.latencyMs;
  return {
    t: new Date(p.checkedAt).getTime(),
    latency,
    fail: !isUp(p.result) ? latency ?? 0 : null,
    degraded: p.result === "DEGRADED" ? latency ?? 0 : null,
    result: p.result,
    httpStatus: p.httpStatus,
    samples: 1,
  };
}

/** Merge dense series into ~MAX_RENDER_POINTS buckets: mean latency, worst result. */
function downsample(points: Datum[]): Datum[] {
  if (points.length <= MAX_RENDER_POINTS) return points;
  const size = Math.ceil(points.length / MAX_RENDER_POINTS);
  const out: Datum[] = [];
  for (let i = 0; i < points.length; i += size) {
    const slice = points.slice(i, i + size);
    const withLatency = slice.filter((p) => p.latency != null);
    const worst = slice.reduce((a, b) =>
      (RESULT_SEVERITY[b.result] ?? 0) > (RESULT_SEVERITY[a.result] ?? 0) ? b : a
    );
    const latency = withLatency.length
      ? Math.round(withLatency.reduce((s, p) => s + (p.latency as number), 0) / withLatency.length)
      : null;
    out.push({
      t: slice[Math.floor(slice.length / 2)].t,
      latency,
      fail: !isUp(worst.result) ? latency ?? 0 : null,
      degraded: worst.result === "DEGRADED" ? latency ?? 0 : null,
      result: worst.result,
      httpStatus: worst.httpStatus,
      samples: slice.length,
    });
  }
  return out;
}

function axisLabel(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(ms >= 10_000 ? 0 : 1)}s`;
  return `${Math.round(ms)}ms`;
}

function timeLabel(t: number, spanMs: number): string {
  const d = new Date(t);
  if (spanMs > 86_400_000 * 1.5) {
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit" });
  }
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * q));
  return sorted[idx];
}

/* --------------------------------- tooltip --------------------------------- */

type TooltipEntry = { payload?: Datum };

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
}) {
  const d = active && payload && payload.length > 0 ? payload[0].payload : undefined;
  if (!d) return null;
  const toneClass =
    d.result === "UP"
      ? "text-emerald-400"
      : d.result === "DEGRADED"
        ? "text-amber-400"
        : "text-rose-400";
  return (
    <div className="rounded-lg border border-border/50 bg-popover/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="whitespace-nowrap text-sm font-semibold tabular-nums text-foreground">
        {d.latency != null ? formatLatency(d.latency) : "No response"}
        {d.httpStatus != null ? (
          <span className="ml-1.5 font-normal text-muted-foreground">HTTP {d.httpStatus}</span>
        ) : null}
      </p>
      <p className="mt-0.5 whitespace-nowrap text-[11px] text-muted-foreground">
        <span className={toneClass}>{d.result}</span>
        {" · "}
        {new Date(d.t).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
        {d.samples > 1 ? ` · avg of ${d.samples} checks` : ""}
      </p>
    </div>
  );
}

/* -------------------------------- component -------------------------------- */

export function ResponseTimeChart({
  points,
  className,
}: {
  /** Checks in ascending time order */
  points: ResponsePoint[];
  className?: string;
}) {
  const gid = useId().replace(/:/g, "");
  const [range, setRange] = useState<RangeKey>("24h");

  const availableRanges = useMemo(() => {
    if (points.length === 0) return RANGES;
    const oldest = new Date(points[0].checkedAt).getTime();
    const span = Date.now() - oldest;
    return RANGES.filter((r, i) => {
      if (r.key === "all") return true;
      if (i === 0) return true;
      return RANGES[i - 1].ms < span;
    });
  }, [points]);

  const chart = useMemo(() => {
    const rangeMs = RANGES.find((r) => r.key === range)?.ms ?? Number.POSITIVE_INFINITY;
    const cutoff = Number.isFinite(rangeMs) ? Date.now() - rangeMs : 0;
    const all = points.map(toDatum).filter((p) => p.t >= cutoff);
    if (all.length === 0) return null;

    const data = downsample(all);
    const latencies = all.map((p) => p.latency).filter((v): v is number => v != null);
    const sorted = [...latencies].sort((a, b) => a - b);
    const avg = latencies.length
      ? Math.round(latencies.reduce((s, v) => s + v, 0) / latencies.length)
      : 0;
    const p50 = quantile(sorted, 0.5);
    const p95 = quantile(sorted, 0.95);
    const max = latencies.length ? Math.max(...latencies) : 0;

    const upCount = all.filter((p) => isUp(p.result)).length;
    const upPct = Math.round((upCount / all.length) * 1000) / 10;
    const spanMs = data.length > 1 ? data[data.length - 1].t - data[0].t : 0;

    return { data, avg, p50, p95, max, upPct, spanMs, sparse: data.length <= 2 };
  }, [points, range]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Stats + range selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <InlineStat label="Avg" value={chart ? formatLatency(chart.avg) : "—"} />
          <InlineStat label="Median" value={chart ? formatLatency(chart.p50) : "—"} />
          <InlineStat label="p95" value={chart ? formatLatency(chart.p95) : "—"} />
          <InlineStat label="Max" value={chart ? formatLatency(chart.max) : "—"} />
          <InlineStat
            label="Success"
            value={chart ? `${chart.upPct}%` : "—"}
            tone={
              chart ? (chart.upPct >= 99 ? "good" : chart.upPct >= 95 ? "warn" : "bad") : undefined
            }
          />
        </div>
        <div className="inline-flex items-center gap-0.5 rounded-lg border border-border/40 bg-secondary/30 p-0.5">
          {availableRanges.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                range === r.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {!chart ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border/40 text-sm text-muted-foreground">
          No checks in this window — try a wider range or run a check.
        </div>
      ) : (
        <div className="h-64 w-full sm:h-72 [&_.recharts-surface]:outline-none">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chart.data}
              margin={{ top: 12, right: 12, bottom: 4, left: 0 }}
            >
              <defs>
                <linearGradient id={`rt-${gid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 6"
                stroke="var(--border)"
                strokeOpacity={0.4}
                vertical={false}
              />

              <XAxis
                dataKey="t"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(t: number) => timeLabel(t, chart.spanMs)}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)", strokeOpacity: 0.5 }}
                minTickGap={48}
              />
              <YAxis
                tickFormatter={axisLabel}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                width={52}
                domain={[0, "auto"]}
              />

              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "var(--foreground)", strokeOpacity: 0.2 }}
                isAnimationActive={false}
              />

              {chart.p95 > 0 ? (
                <ReferenceLine
                  y={chart.p95}
                  stroke="#fbbf24"
                  strokeOpacity={0.5}
                  strokeDasharray="6 5"
                  label={{
                    value: "p95",
                    position: "insideTopRight",
                    fill: "#fbbf24",
                    fontSize: 9,
                    opacity: 0.8,
                  }}
                />
              ) : null}

              <Area
                type="monotone"
                dataKey="latency"
                stroke="var(--primary)"
                strokeWidth={2.25}
                fill={`url(#rt-${gid})`}
                dot={chart.sparse ? { r: 3, fill: "var(--primary)", strokeWidth: 0 } : false}
                activeDot={{
                  r: 4.5,
                  fill: "var(--primary)",
                  stroke: "var(--background)",
                  strokeWidth: 2,
                }}
                connectNulls
                isAnimationActive={false}
              />

              {/* Degraded checks — amber dots on the line */}
              <Scatter
                dataKey="degraded"
                fill="#fbbf24"
                stroke="var(--background)"
                strokeWidth={1.5}
                isAnimationActive={false}
              />
              {/* Failed checks — red dots (pinned to 0 when there was no response) */}
              <Scatter
                dataKey="fail"
                fill="#f43f5e"
                stroke="var(--background)"
                strokeWidth={1.5}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function InlineStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "warn" | "bad";
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-semibold tabular-nums",
          tone === "good" && "text-emerald-400",
          tone === "warn" && "text-amber-400",
          tone === "bad" && "text-rose-400",
          !tone && "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}
