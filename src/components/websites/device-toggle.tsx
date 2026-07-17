"use client";

import { Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export type ScanDevice = "desktop" | "mobile";

const OPTIONS = [
  {
    value: "desktop" as const,
    label: "Desktop",
    icon: Monitor,
    hint: "Desktop lab (default) — no CPU/network throttling",
  },
  {
    value: "mobile" as const,
    label: "Mobile",
    icon: Smartphone,
    hint: "Mobile lab — slow 4G + 4x CPU throttle, matches Google's mobile default",
  },
];

interface DeviceToggleProps {
  value: ScanDevice;
  onChange: (device: ScanDevice) => void;
  /** Icon-only compact variant for tight layouts. */
  compact?: boolean;
  className?: string;
}

/** Segmented control for picking the Lighthouse device, with a sliding active thumb. */
export function DeviceToggle({ value, onChange, compact = false, className }: DeviceToggleProps) {
  const activeIndex = value === "mobile" ? 1 : 0;

  return (
    <div
      role="radiogroup"
      aria-label="Lighthouse device"
      className={cn(
        "relative grid grid-cols-2 items-stretch rounded-full border border-border/50 bg-secondary/30 p-1",
        className
      )}
    >
      {/* Sliding thumb */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-background shadow-sm",
          "ring-1 ring-border/60 transition-transform duration-200 ease-out",
          activeIndex === 1 && "translate-x-full"
        )}
      />
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            title={option.hint}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 inline-flex items-center justify-center gap-1.5 rounded-full outline-none",
              compact ? "h-7 px-2.5" : "h-8 px-3.5",
              "text-xs font-medium transition-colors duration-200",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
              selected ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
            )}
          >
            <Icon className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4", selected && "text-primary")} />
            {!compact && <span>{option.label}</span>}
            <span className="sr-only">{option.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
