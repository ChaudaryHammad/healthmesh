"use client";

import React, { useEffect, useState } from "react";
import { formatNextScanAt, formatNextScanCountdown } from "@/lib/scan-schedule";
import { cn } from "@/lib/utils";

interface NextScanScheduleProps {
  nextScanAt: Date | string;
  timezone?: string;
  variant?: "block" | "inline" | "compact";
  className?: string;
}

export function NextScanSchedule({
  nextScanAt,
  timezone = "UTC",
  variant = "block",
  className,
}: NextScanScheduleProps) {
  const target = new Date(nextScanAt);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const formatted = formatNextScanAt(target, timezone);
  const countdown = formatNextScanCountdown(target, now, {
    compact: variant === "compact",
  });

  if (!formatted) return null;

  if (variant === "compact") {
    return (
      <span className={cn("inline-flex items-center gap-1", className)} title={formatted}>
        <span className="text-primary font-medium">Next in {countdown}</span>
      </span>
    );
  }

  if (variant === "inline") {
    return (
      <span className={cn("inline", className)}>
        {formatted}
        <span className="text-muted-foreground"> · </span>
        <span className="text-primary font-medium">{countdown}</span>
      </span>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <p className="font-medium text-foreground">{formatted}</p>
      <p className="text-xs text-primary font-medium">Next scan {countdown}</p>
    </div>
  );
}
