"use client";

import React from "react";
import { Award, Gauge } from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  Cell,
  RadialBar,
  RadialBarChart,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ScoreSummaryProps {
  performance: number;
  accessibility: number;
  seo: number;
  security: number;
  brokenLinks: number;
  scannedCount: number;
}

function scoreTone(score: number): "good" | "warn" | "bad" {
  if (score >= 90) return "good";
  if (score >= 50) return "warn";
  return "bad";
}

const TONE_HEX: Record<"good" | "warn" | "bad", string> = {
  good: "#10b981",
  warn: "#f59e0b",
  bad: "#ef4444",
};

const TONE_TEXT: Record<"good" | "warn" | "bad", string> = {
  good: "text-emerald-500",
  warn: "text-amber-500",
  bad: "text-destructive",
};

type CategoryBar = { name: string; score: number };

function CategoryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: CategoryBar }[];
}) {
  const d = active && payload && payload.length > 0 ? payload[0].payload : undefined;
  if (!d) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-popover/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-xs font-medium text-muted-foreground">{d.name}</p>
      <p
        className={cn(
          "text-sm font-semibold tabular-nums",
          TONE_TEXT[scoreTone(d.score)]
        )}
      >
        {d.score}/100
      </p>
    </div>
  );
}

export function ScoreSummary({
  performance,
  accessibility,
  seo,
  security,
  brokenLinks,
  scannedCount,
}: ScoreSummaryProps) {
  const categories: CategoryBar[] = [
    { name: "Performance", score: performance },
    { name: "Accessibility", score: accessibility },
    { name: "SEO", score: seo },
    { name: "Security", score: security },
    { name: "Coverage", score: brokenLinks },
  ];

  const hasScores = scannedCount > 0;
  const overallAverage = hasScores
    ? Math.round((performance + accessibility + seo + security + brokenLinks) / 5)
    : 0;
  const overallTone = scoreTone(overallAverage);
  const radialData = [{ name: "score", value: overallAverage, fill: TONE_HEX[overallTone] }];

  return (
    <Card className="rounded-2xl border-border/40">
      <CardContent className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-12">
        {/* -------------------------- Overall score gauge -------------------------- */}
        <div className="flex flex-col items-center justify-center border-b border-border/20 pb-6 text-center lg:col-span-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
          <CardTitle className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Award className="h-4 w-4 text-primary" />
            Average network score
          </CardTitle>

          {hasScores ? (
            <div className="space-y-3">
              <div className="relative h-36 w-36">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="78%"
                    outerRadius="100%"
                    data={radialData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <RadialBar
                      dataKey="value"
                      background={{ fill: "var(--secondary)" }}
                      cornerRadius={10}
                      isAnimationActive={false}
                    >
                      <Cell fill={TONE_HEX[overallTone]} />
                    </RadialBar>
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold leading-none tabular-nums text-foreground">
                    {overallAverage}
                  </span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    / 100
                  </span>
                </div>
              </div>
              <CardDescription className="mx-auto max-w-[180px] leading-relaxed">
                Average score across all connected domains.
              </CardDescription>
            </div>
          ) : (
            <div className="flex h-36 flex-col items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-border/60">
                <Gauge className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <div className="space-y-1">
                <CardDescription>Run a scan to see your average score.</CardDescription>
                <Button
                  render={<Link href="/dashboard/websites" />}
                  nativeButton={false}
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                >
                  Go to websites →
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ----------------------------- Category chart ----------------------------- */}
        <div className="flex flex-col justify-center space-y-4 lg:col-span-8">
          <CardTitle className="text-sm font-semibold">Score breakdown by category</CardTitle>
          {hasScores ? (
            <div className="h-[220px] w-full [&_.recharts-surface]:outline-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categories}
                  layout="vertical"
                  margin={{ top: 4, right: 24, bottom: 4, left: 4 }}
                  barCategoryGap="30%"
                >
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    ticks={[0, 50, 100]}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "var(--foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    width={92}
                  />
                  <Tooltip
                    content={<CategoryTooltip />}
                    cursor={{ fill: "var(--foreground)", fillOpacity: 0.04 }}
                    isAnimationActive={false}
                  />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={18} isAnimationActive={false}>
                    {categories.map((c) => (
                      <Cell key={c.name} fill={TONE_HEX[scoreTone(c.score)]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">
                    {cat.name}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary/50" />
                  <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">—</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
