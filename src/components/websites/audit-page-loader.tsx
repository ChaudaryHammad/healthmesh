"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface AuditPageLoaderProps {
  categoryLabel: string;
  steps: string[];
  accentClass?: string;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-secondary/50 ${className ?? ""}`} />;
}

export function AuditPageLoader({
  categoryLabel,
  steps,
  accentClass = "text-primary",
}: AuditPageLoaderProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (steps.length <= 1) return;
    const id = setInterval(() => {
      setStepIndex((i) => (i + 1) % steps.length);
    }, 2200);
    return () => clearInterval(id);
  }, [steps]);

  const currentStep = steps[stepIndex] ?? steps[0] ?? "Loading…";

  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-2" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-2" />
        <Skeleton className="h-3 w-20" />
      </div>

      {/* Header skeleton */}
      <div className="rounded-2xl border border-border/30 bg-card p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div className="flex items-start gap-4 flex-1">
            <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-24 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Active loading panel */}
      <div className="rounded-2xl border border-border/30 bg-card p-8 md:p-12">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5">
          <div
            className={`flex items-center justify-center w-14 h-14 rounded-2xl border border-border/30 bg-secondary/20 ${accentClass}`}
          >
            <Loader2 className="w-7 h-7 animate-spin" aria-hidden />
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-foreground">
              Loading {categoryLabel.toLowerCase()} audit
            </h2>
            <p className="text-sm text-muted-foreground min-h-[1.25rem] transition-opacity duration-300">
              {currentStep}
            </p>
          </div>

          {steps.length > 1 && (
            <div className="flex items-center gap-2 pt-1">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === stepIndex
                      ? "w-6 bg-primary"
                      : i < stepIndex
                        ? "w-1.5 bg-primary/40"
                        : "w-1.5 bg-secondary"
                  }`}
                />
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground/80 pt-2">
            This may take a few seconds while we fetch and analyze your site.
          </p>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="rounded-2xl border border-border/30 bg-card p-6 md:p-8 space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <div className="space-y-3 pt-2">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
