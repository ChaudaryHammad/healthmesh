"use client";

import { RefreshCw, Square, Zap } from "lucide-react";
import { useAuditScan } from "@/hooks/use-audit-scan";
import { Button } from "@/components/ui/button";

interface AuditScanControlsProps {
  websiteId: string;
  runningScanId?: string | null;
  label?: string;
  runningLabel?: string;
  iconOnly?: boolean;
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
  className?: string;
  runVariant?: "default" | "link" | "outline" | "ghost" | "secondary";
}

export function AuditScanControls({
  websiteId,
  runningScanId,
  label = "Audit now",
  runningLabel = "Auditing…",
  iconOnly = false,
  size = "sm",
  className,
  runVariant = "link",
}: AuditScanControlsProps) {
  const { startScan, cancelScan, isRunning, isCancelling, error } = useAuditScan({
    websiteId,
    initialRunningScanId: runningScanId ?? null,
  });

  if (isRunning) {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
        <Button variant={runVariant} size={size} disabled className="gap-2">
          <RefreshCw className="animate-spin" />
          {!iconOnly && runningLabel}
        </Button>
        <Button
          variant="destructive"
          size={size}
          onClick={() => void cancelScan()}
          disabled={isCancelling}
        >
          {isCancelling ? (
            <RefreshCw className="animate-spin" />
          ) : (
            <Square className="fill-current" />
          )}
          {!iconOnly && (isCancelling ? "Stopping…" : "Stop")}
        </Button>
        {error && !iconOnly && (
          <span className="w-full text-xs text-destructive">{error}</span>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        variant={runVariant}
        size={size}
        onClick={() => void startScan()}
        title={iconOnly ? label : undefined}
        className={iconOnly ? undefined : "gap-2"}
      >
        {iconOnly ? <Zap /> : label}
      </Button>
      {error && !iconOnly && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

/** @deprecated Use AuditScanControls */
export function AuditTriggerButton(props: AuditScanControlsProps) {
  return <AuditScanControls {...props} />;
}
