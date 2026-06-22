import React from "react";
import { Gauge, Award } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ScoreSummaryProps {
  performance: number;
  accessibility: number;
  seo: number;
  security: number;
  brokenLinks: number;
  scannedCount: number;
}

export function ScoreSummary({
  performance,
  accessibility,
  seo,
  security,
  brokenLinks,
  scannedCount,
}: ScoreSummaryProps) {
  const categories = [
    { name: "Performance", score: performance },
    { name: "Accessibility", score: accessibility },
    { name: "SEO", score: seo },
    { name: "Security", score: security },
    { name: "Broken Links", score: brokenLinks },
  ];

  const hasScores = scannedCount > 0;
  const overallAverage = hasScores
    ? Math.round((performance + accessibility + seo + security + brokenLinks) / 5)
    : null;

  const getScoreColorClass = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 90) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-destructive";
  };

  const getProgressClass = (score: number) => {
    if (score >= 90) return "[&_[data-slot=progress-indicator]]:bg-emerald-500";
    if (score >= 50) return "[&_[data-slot=progress-indicator]]:bg-amber-500";
    return "[&_[data-slot=progress-indicator]]:bg-destructive";
  };

  const getStrokeDashArray = (score: number) => {
    const circumference = 226.19;
    const offset = circumference - (score / 100) * circumference;
    return `${circumference - offset} ${offset}`;
  };

  return (
    <Card className="rounded-3xl border-border/30">
      <CardContent className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6">
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center border-b lg:border-b-0 lg:border-r border-border/20 pb-6 lg:pb-0 lg:pr-8">
          <CardTitle className="text-sm font-bold mb-6 flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            Average Network Score
          </CardTitle>

          {hasScores ? (
            <div className="space-y-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    className="stroke-secondary fill-transparent"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    className={`fill-transparent transition-all duration-1000 ${
                      overallAverage! >= 90
                        ? "stroke-emerald-500"
                        : overallAverage! >= 50
                        ? "stroke-amber-500"
                        : "stroke-destructive"
                    }`}
                    strokeWidth="8"
                    strokeDasharray={getStrokeDashArray(overallAverage!)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold text-foreground leading-none">
                    {overallAverage}
                  </span>
                  <span className="block text-[8px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                    / 100
                  </span>
                </div>
              </div>
              <CardDescription className="max-w-[160px] mx-auto leading-relaxed">
                Average score across all connected domains.
              </CardDescription>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-28 space-y-2">
              <Gauge className="w-8 h-8 text-muted-foreground/30 animate-pulse" />
              <CardDescription>Scan sites to see averages.</CardDescription>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 flex flex-col justify-center space-y-5">
          <CardTitle className="text-sm font-bold">Score Breakdown By Category</CardTitle>
          <div className="space-y-4">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-muted-foreground">{cat.name}</span>
                  <span className={`font-bold ${getScoreColorClass(hasScores ? cat.score : null)}`}>
                    {hasScores ? `${cat.score}/100` : "—"}
                  </span>
                </div>
                <Progress
                  value={hasScores ? cat.score : 0}
                  className={`h-2 ${hasScores ? getProgressClass(cat.score) : ""}`}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
