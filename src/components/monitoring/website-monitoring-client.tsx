"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Bell,
  BellRing,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Gauge,
  Globe,
  Loader2,
  Lock,
  Pause,
  Play,
  RefreshCw,
  Shield,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  acknowledgeIncidentAction,
  disableMonitorAction,
  pauseMonitorAction,
  runMonitorNowAction,
  upsertMonitorAction,
} from "@/actions/uptime";
import {
  formatIncidentDuration,
  formatInterval,
  formatLatency,
  formatUptimePct,
  monitorStatusClass,
  monitorStatusLabel,
} from "@/lib/uptime/format";
import { UPTIME_INTERVAL_OPTIONS } from "@/lib/uptime/constants";
import { ResponseTimeChart } from "@/components/monitoring/response-time-chart";
import { UptimeBars } from "@/components/monitoring/uptime-bars";
import { toast } from "@/lib/toast";
import { cn, formatDateTime } from "@/lib/utils";
import type { KeywordMatchMode, MonitorHttpMethod } from "@prisma/client";

export type MonitorDetail = {
  id: string;
  enabled: boolean;
  paused: boolean;
  url: string;
  method: MonitorHttpMethod;
  expectedStatusMin: number;
  expectedStatusMax: number;
  intervalSeconds: number;
  timeoutMs: number;
  followRedirects: boolean;
  keyword: string | null;
  keywordMode: KeywordMatchMode;
  alertEmail: boolean;
  alertOnRecovery: boolean;
  failureThreshold: number;
  slowThresholdMs: number | null;
  checkSsl: boolean;
  sslWarnDays: number;
  lastStatus: string;
  lastLatencyMs: number | null;
  lastHttpStatus: number | null;
  lastError: string | null;
  lastCheckedAt: string | null;
  nextCheckAt: string | null;
  uptimePercent24h: number | null;
  uptimePercent7d: number | null;
  uptimePercent30d: number | null;
  avgLatency24h: number | null;
  sslDaysRemaining: number | null;
  sslExpiresAt: string | null;
  consecutiveFailures: number;
  createdAt: string;
};

export type CheckRow = {
  id: string;
  result: string;
  httpStatus: number | null;
  latencyMs: number | null;
  errorMessage: string | null;
  checkedAt: string;
};

export type IncidentRow = {
  id: string;
  kind: string;
  startedAt: string;
  resolvedAt: string | null;
  failCount: number;
  lastError: string | null;
  lastHttpStatus: number | null;
  acknowledgedAt: string | null;
};

interface Props {
  website: { id: string; name: string; url: string };
  monitor: MonitorDetail | null;
  /** Recent checks, newest first */
  checks: CheckRow[];
  totalCheckCount: number;
  incidents: IncidentRow[];
  minIntervalSeconds: number;
  canUseMonitoring: boolean;
  alertEmailTo: string | null;
}

const AUTO_REFRESH_MS = 30_000;
const HISTORY_PAGE_SIZE = 12;

/* ---------------------------------- time ---------------------------------- */

function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "Never";
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();

  if (diff < 0) {
    const sec = Math.floor(-diff / 1000);
    if (sec < 5) return "Just now";
    if (sec < 60) return `in ${sec}s`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `in ${min}m`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `in ${hr}h`;
    return formatDateTime(date);
  }

  const sec = Math.floor(diff / 1000);
  if (sec < 5) return "Just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return formatDateTime(date);
}

function formatNextCheck(iso: string | null | undefined): string {
  if (!iso) return "—";
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) {
    const overdueSec = Math.floor(-diff / 1000);
    if (overdueSec < 60) return "Any moment";
    const min = Math.floor(overdueSec / 60);
    if (min < 60) return `Overdue by ${min}m`;
    return `Overdue by ${Math.floor(min / 60)}h`;
  }
  return formatRelativeTime(iso);
}

function formatDurationSince(iso: string): string {
  const sec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const d = Math.floor(sec / 86_400);
  const h = Math.floor((sec % 86_400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${sec}s`;
}

/** "Up for 3d 4h" / "Down for 12m" based on incident history. */
function statusSince(
  status: string,
  incidents: IncidentRow[],
  monitorCreatedAt: string | null
): { label: string; duration: string } | null {
  if (status === "DOWN") {
    const open = incidents.find((i) => !i.resolvedAt && i.kind === "DOWN") ??
      incidents.find((i) => !i.resolvedAt);
    if (open) return { label: "Down for", duration: formatDurationSince(open.startedAt) };
    return null;
  }
  if (status === "UP" || status === "DEGRADED") {
    const lastResolved = incidents
      .filter((i) => i.resolvedAt)
      .map((i) => i.resolvedAt as string)
      .sort()
      .pop();
    const since = lastResolved ?? monitorCreatedAt;
    if (since) return { label: "Up for", duration: formatDurationSince(since) };
  }
  return null;
}

/* ------------------------------ settings form ------------------------------ */

type MonitorFormState = {
  enabled: boolean;
  url: string;
  method: MonitorHttpMethod;
  intervalSeconds: number;
  expectedMin: number;
  expectedMax: number;
  failureThreshold: number;
  slowThresholdMs: string;
  keyword: string;
  keywordMode: KeywordMatchMode;
  alertEmail: boolean;
  alertOnRecovery: boolean;
  checkSsl: boolean;
  sslWarnDays: number;
};

function buildFormState(
  monitor: MonitorDetail | null,
  fallbackUrl: string,
  minIntervalSeconds: number
): MonitorFormState {
  return {
    enabled: monitor?.enabled ?? true,
    url: monitor?.url ?? fallbackUrl,
    method: monitor?.method ?? "GET",
    intervalSeconds: monitor?.intervalSeconds ?? Math.max(900, minIntervalSeconds),
    expectedMin: monitor?.expectedStatusMin ?? 200,
    expectedMax: monitor?.expectedStatusMax ?? 399,
    failureThreshold: monitor?.failureThreshold ?? 2,
    slowThresholdMs: monitor?.slowThresholdMs?.toString() ?? "",
    keyword: monitor?.keyword ?? "",
    keywordMode: monitor?.keywordMode ?? "NONE",
    alertEmail: monitor?.alertEmail ?? true,
    alertOnRecovery: monitor?.alertOnRecovery ?? true,
    checkSsl: monitor?.checkSsl ?? true,
    sslWarnDays: monitor?.sslWarnDays ?? 14,
  };
}

/* --------------------------------- component -------------------------------- */

export function WebsiteMonitoringClient({
  website,
  monitor,
  checks,
  totalCheckCount,
  incidents,
  minIntervalSeconds,
  canUseMonitoring,
  alertEmailTo,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState("overview");
  const [historyFilter, setHistoryFilter] = useState<"all" | "failed">("all");
  const [historyPage, setHistoryPage] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<number>(() => Date.now());

  // Settings form — one state object with dirty tracking against server values.
  const serverForm = useMemo(
    () => buildFormState(monitor, website.url, minIntervalSeconds),
    [monitor, website.url, minIntervalSeconds]
  );
  const [form, setForm] = useState<MonitorFormState>(serverForm);
  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(serverForm),
    [form, serverForm]
  );
  function patch<K extends keyof MonitorFormState>(key: K, value: MonitorFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const isLive = Boolean(monitor && monitor.enabled && !monitor.paused);

  // Live data: silently re-fetch the RSC payload while the tab is visible.
  // Also ticks relative timestamps so "2m ago" stays honest.
  useEffect(() => {
    if (!isLive) return;
    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      router.refresh();
      setLastSyncedAt(Date.now());
    }, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [isLive, router]);

  const [, setClockTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setClockTick((t) => t + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  const ascChecks = useMemo(() => [...checks].reverse(), [checks]);

  const filteredChecks = useMemo(
    () =>
      historyFilter === "failed"
        ? checks.filter((c) => c.result === "DOWN" || c.result === "ERROR")
        : checks,
    [checks, historyFilter]
  );
  const historyPageCount = Math.max(1, Math.ceil(filteredChecks.length / HISTORY_PAGE_SIZE));
  const safeHistoryPage = Math.min(historyPage, historyPageCount - 1);
  const pagedHistory = useMemo(
    () =>
      filteredChecks.slice(
        safeHistoryPage * HISTORY_PAGE_SIZE,
        (safeHistoryPage + 1) * HISTORY_PAGE_SIZE
      ),
    [filteredChecks, safeHistoryPage]
  );

  const failedCount = useMemo(
    () => checks.filter((c) => c.result === "DOWN" || c.result === "ERROR").length,
    [checks]
  );

  function changeHistoryFilter(filter: "all" | "failed") {
    setHistoryFilter(filter);
    setHistoryPage(0);
  }

  const status = monitor
    ? monitor.paused || !monitor.enabled
      ? "PAUSED"
      : monitor.lastStatus
    : "UNKNOWN";
  const isDown = status === "DOWN";
  const isDegraded = status === "DEGRADED";
  const openIncidents = incidents.filter((i) => !i.resolvedAt);
  const monitorUrl = monitor?.url ?? website.url;
  const since = monitor ? statusSince(status, incidents, monitor.createdAt) : null;

  /* --------------------------------- actions --------------------------------- */

  function save() {
    startTransition(async () => {
      const result = await upsertMonitorAction({
        websiteId: website.id,
        enabled: form.enabled,
        paused: monitor?.paused ?? false,
        url: form.url,
        method: form.keywordMode !== "NONE" ? "GET" : form.method,
        expectedStatusMin: form.expectedMin,
        expectedStatusMax: form.expectedMax,
        intervalSeconds: form.intervalSeconds,
        timeoutMs: monitor?.timeoutMs ?? 10000,
        followRedirects: true,
        keyword: form.keywordMode === "NONE" ? null : form.keyword,
        keywordMode: form.keywordMode,
        alertEmail: form.alertEmail,
        alertOnRecovery: form.alertOnRecovery,
        failureThreshold: form.failureThreshold,
        slowThresholdMs: form.slowThresholdMs.trim() ? Number(form.slowThresholdMs) : null,
        checkSsl: form.checkSsl,
        sslWarnDays: form.sslWarnDays,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Settings saved.");
      router.refresh();
      setLastSyncedAt(Date.now());
    });
  }

  function runNow() {
    if (monitor?.paused) {
      toast.error("Monitoring is paused. Resume it first, then run a check.");
      return;
    }
    if (monitor && !monitor.enabled) {
      toast.error("Monitoring is disabled. Enable it in Settings to run a check.");
      return;
    }
    startTransition(async () => {
      const result = await runMonitorNowAction(website.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      const down = result.result === "DOWN" || result.result === "ERROR";
      const text = `Check finished: ${result.result}${
        result.latencyMs > 0 ? ` in ${result.latencyMs} ms` : ""
      }`;
      if (down) toast.error(text);
      else toast.success(text);
      router.refresh();
      setLastSyncedAt(Date.now());
    });
  }

  function togglePause() {
    if (!monitor) return;
    startTransition(async () => {
      const result = await pauseMonitorAction(website.id, !monitor.paused);
      if (!result.success) toast.error(result.error);
      else {
        toast.success(monitor.paused ? "Monitoring resumed." : "Monitoring paused.");
        router.refresh();
      }
    });
  }

  function turnOff() {
    startTransition(async () => {
      const result = await disableMonitorAction(website.id);
      if (!result.success) toast.error(result.error);
      else {
        patch("enabled", false);
        toast.success("Monitor disabled.");
        router.refresh();
      }
    });
  }

  function acknowledge(incidentId: string) {
    startTransition(async () => {
      const result = await acknowledgeIncidentAction(incidentId);
      if (!result.success) toast.error(result.error);
      else {
        toast.success("Incident acknowledged.");
        router.refresh();
      }
    });
  }

  /* ---------------------------------- render ---------------------------------- */

  return (
    <div className="w-full max-w-6xl space-y-7 pb-12">
      {/* ============================== Hero header ============================== */}
      <header className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <StatusOrb status={status} />
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-semibold tracking-tight md:text-[28px]">
                  {website.name}
                </h1>
                <Badge
                  variant="outline"
                  className={cn("text-[11px]", monitorStatusClass(status))}
                >
                  {monitorStatusLabel(status)}
                </Badge>
                {openIncidents.length > 0 ? (
                  <Badge
                    variant="outline"
                    className="border-rose-500/25 bg-rose-500/10 text-[11px] text-rose-400"
                  >
                    {openIncidents.length} open incident{openIncidents.length === 1 ? "" : "s"}
                  </Badge>
                ) : null}
              </div>
              <a
                href={monitorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-full items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <span className="truncate">{monitorUrl.replace(/^https?:\/\//, "")}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
              {since ? (
                <p className="text-sm text-muted-foreground">
                  <span className="text-muted-foreground/70">{since.label}</span>{" "}
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      isDown ? "text-rose-400" : "text-emerald-400"
                    )}
                  >
                    {since.duration}
                  </span>
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {isLive ? (
              <span
                className="mr-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-2.5 py-1 text-[11px] font-medium text-emerald-400"
                title={`Auto-refreshes every ${AUTO_REFRESH_MS / 1000}s · Synced ${formatRelativeTime(
                  new Date(lastSyncedAt).toISOString()
                )}`}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Live
              </span>
            ) : null}
            <Button
              onClick={runNow}
              disabled={
                pending ||
                !canUseMonitoring ||
                Boolean(monitor?.paused) ||
                Boolean(monitor && !monitor.enabled)
              }
              size="sm"
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Run check
            </Button>
            {monitor?.enabled ? (
              <Button variant="outline" onClick={togglePause} disabled={pending} size="sm">
                {monitor.paused ? (
                  <Play className="h-3.5 w-3.5" />
                ) : (
                  <Pause className="h-3.5 w-3.5" />
                )}
                {monitor.paused ? "Resume" : "Pause"}
              </Button>
            ) : null}
          </div>
        </div>

        {!canUseMonitoring ? (
          <Callout tone="warn" icon={<AlertTriangle className="h-4 w-4" />}>
            Uptime monitoring isn&apos;t available on your current plan.
          </Callout>
        ) : null}

        {isDown && monitor?.lastError ? (
          <Callout tone="down" icon={<XCircle className="h-4 w-4" />} title="Monitor is down">
            {monitor.lastError}
          </Callout>
        ) : isDegraded && monitor?.lastError ? (
          <Callout tone="warn" icon={<AlertTriangle className="h-4 w-4" />}>
            {monitor.lastError}
          </Callout>
        ) : null}

        {!monitor ? (
          <Callout tone="info" icon={<Activity className="h-4 w-4" />} title="Monitoring isn't set up yet">
            Run a first check to start with sensible defaults, or configure everything in
            Settings first.
          </Callout>
        ) : null}
      </header>

      {/* ============================== KPI ribbon ============================== */}
      <section className="overflow-hidden rounded-xl border border-border/40 bg-card">
        <div className="grid grid-cols-2 divide-y divide-border/30 sm:grid-cols-3 lg:grid-cols-6 lg:divide-x lg:divide-y-0">
          <MetricCell
            label="Uptime 24h"
            value={formatUptimePct(monitor?.uptimePercent24h)}
            tone={uptimeTone(monitor?.uptimePercent24h)}
          />
          <MetricCell
            label="Uptime 7d"
            value={formatUptimePct(monitor?.uptimePercent7d)}
            tone={uptimeTone(monitor?.uptimePercent7d)}
          />
          <MetricCell
            label="Uptime 30d"
            value={formatUptimePct(monitor?.uptimePercent30d)}
            tone={uptimeTone(monitor?.uptimePercent30d)}
          />
          <MetricCell
            label="Avg response 24h"
            value={formatLatency(
              monitor?.avgLatency24h != null ? Math.round(monitor.avgLatency24h) : null
            )}
          />
          <MetricCell
            label="SSL certificate"
            value={
              monitor?.sslDaysRemaining != null ? `${monitor.sslDaysRemaining}d left` : "—"
            }
            hint={
              monitor?.sslExpiresAt
                ? `Expires ${new Date(monitor.sslExpiresAt).toLocaleDateString()}`
                : undefined
            }
            tone={
              monitor?.sslDaysRemaining == null
                ? "muted"
                : monitor.sslDaysRemaining <= 14
                  ? "warn"
                  : "good"
            }
            icon={<Shield className="h-3.5 w-3.5" />}
          />
          <MetricCell
            label="Total checks"
            value={totalCheckCount > 0 ? totalCheckCount.toLocaleString() : "—"}
            hint={
              monitor
                ? `Every ${formatInterval(monitor.intervalSeconds)}`
                : undefined
            }
          />
        </div>
      </section>

      {/* Operational context */}
      <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <MetaItem
          label="Last check"
          value={formatRelativeTime(monitor?.lastCheckedAt)}
          title={
            monitor?.lastCheckedAt
              ? new Date(monitor.lastCheckedAt).toLocaleString()
              : undefined
          }
        />
        <MetaItem
          label="Response"
          value={
            monitor?.lastLatencyMs != null
              ? `${formatLatency(monitor.lastLatencyMs)}${
                  monitor.lastHttpStatus != null ? ` · HTTP ${monitor.lastHttpStatus}` : ""
                }`
              : "—"
          }
        />
        {monitor?.nextCheckAt && !monitor.paused && monitor.enabled ? (
          <MetaItem label="Next check" value={formatNextCheck(monitor.nextCheckAt)} />
        ) : null}
        {isLive ? (
          <MetaItem
            label="Synced"
            value={formatRelativeTime(new Date(lastSyncedAt).toISOString())}
          />
        ) : null}
      </dl>

      {/* ================================= Tabs ================================= */}
      <Tabs value={tab} onValueChange={setTab} className="flex w-full flex-col gap-6">
        <div className="w-full border-b border-border/40">
          <TabsList
            variant="line"
            className="h-auto w-full justify-start gap-0 overflow-visible rounded-none bg-transparent p-0"
          >
            <TabsTrigger value="overview" className="flex-none rounded-none px-4 pb-3 pt-1">
              Overview
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-none rounded-none px-4 pb-3 pt-1">
              History
              {checks.length > 0 ? (
                <span className="ml-1.5 text-muted-foreground tabular-nums">
                  {checks.length}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="incidents" className="flex-none rounded-none px-4 pb-3 pt-1">
              Incidents
              {openIncidents.length > 0 ? (
                <span className="ml-1.5 tabular-nums text-rose-400">{openIncidents.length}</span>
              ) : incidents.length > 0 ? (
                <span className="ml-1.5 text-muted-foreground tabular-nums">
                  {incidents.length}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-none rounded-none px-4 pb-3 pt-1">
              Settings
              {dirty ? <span className="ml-1.5 text-amber-400">•</span> : null}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ------------------------------- Overview ------------------------------- */}
        <TabsContent value="overview" className="mt-0 w-full space-y-6 outline-none">
          <section className="rounded-xl border border-border/40 bg-card px-5 py-4">
            <UptimeBars checks={checks} />
          </section>

          <section className="rounded-xl border border-border/40 bg-card">
            <div className="border-b border-border/30 px-5 py-4">
              <h2 className="text-sm font-medium">Response time</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Latency per check — failed checks are highlighted in red
              </p>
            </div>
            <div className="p-4 md:p-5">
              <ResponseTimeChart points={ascChecks} />
            </div>
          </section>

          {incidents.length > 0 ? (
            <section className="overflow-hidden rounded-xl border border-border/40 bg-card">
              <div className="flex items-center justify-between border-b border-border/30 px-5 py-4">
                <h2 className="text-sm font-medium">Latest incidents</h2>
                <button
                  type="button"
                  onClick={() => setTab("incidents")}
                  className="text-xs font-medium text-primary transition-opacity hover:opacity-80"
                >
                  View all
                </button>
              </div>
              <ul className="divide-y divide-border/25">
                {incidents.slice(0, 3).map((i) => (
                  <IncidentItem key={i.id} incident={i} compact />
                ))}
              </ul>
            </section>
          ) : null}
        </TabsContent>

        {/* ------------------------------- History -------------------------------- */}
        <TabsContent value="history" className="mt-0 w-full outline-none">
          <section className="overflow-hidden rounded-xl border border-border/40 bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/30 px-5 py-4">
              <div>
                <h2 className="text-sm font-medium">Check history</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {totalCheckCount > 0
                    ? `${filteredChecks.length.toLocaleString()} recent check${filteredChecks.length === 1 ? "" : "s"} loaded · ${totalCheckCount.toLocaleString()} total`
                    : "Every probe result, newest first"}
                </p>
              </div>
              <div className="inline-flex items-center gap-0.5 rounded-lg border border-border/40 bg-secondary/30 p-0.5">
                <FilterPill
                  active={historyFilter === "all"}
                  onClick={() => changeHistoryFilter("all")}
                >
                  All
                </FilterPill>
                <FilterPill
                  active={historyFilter === "failed"}
                  onClick={() => changeHistoryFilter("failed")}
                >
                  Failures{failedCount > 0 ? ` (${failedCount})` : ""}
                </FilterPill>
              </div>
            </div>

            {pagedHistory.length === 0 ? (
              <EmptyState>
                {totalCheckCount === 0 ? (
                  <>
                    No checks yet. Use <span className="text-foreground">Run check</span> or
                    wait for the schedule.
                  </>
                ) : (
                  "No failed checks in the loaded history. Nice."
                )}
              </EmptyState>
            ) : (
              <>
                <CheckTable rows={pagedHistory} />
                {historyPageCount > 1 ? (
                  <div className="flex items-center justify-between border-t border-border/30 px-5 py-3">
                    <p className="text-xs tabular-nums text-muted-foreground">
                      Page {safeHistoryPage + 1} of {historyPageCount}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={safeHistoryPage === 0}
                        onClick={() => setHistoryPage(safeHistoryPage - 1)}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Newer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={safeHistoryPage >= historyPageCount - 1}
                        onClick={() => setHistoryPage(safeHistoryPage + 1)}
                      >
                        Older
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </section>
        </TabsContent>

        {/* ------------------------------ Incidents ------------------------------- */}
        <TabsContent value="incidents" className="mt-0 w-full outline-none">
          <section className="overflow-hidden rounded-xl border border-border/40 bg-card">
            <div className="border-b border-border/30 px-5 py-4">
              <h2 className="text-sm font-medium">Incidents</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Outages confirmed after {monitor?.failureThreshold ?? 2} consecutive failed
                check{(monitor?.failureThreshold ?? 2) === 1 ? "" : "s"}
              </p>
            </div>
            {incidents.length === 0 ? (
              <EmptyState>No incidents yet. That&apos;s a good sign.</EmptyState>
            ) : (
              <ul className="divide-y divide-border/25">
                {incidents.map((i) => (
                  <IncidentItem
                    key={i.id}
                    incident={i}
                    onAcknowledge={!i.resolvedAt && !i.acknowledgedAt ? acknowledge : undefined}
                    pending={pending}
                  />
                ))}
              </ul>
            )}
          </section>
        </TabsContent>

        {/* ------------------------------- Settings ------------------------------- */}
        <TabsContent value="settings" className="mt-0 w-full outline-none">
          <div className="space-y-5">
            <SettingsSection
              icon={<Activity className="h-4 w-4" />}
              title="Monitoring"
              description="Turn scheduled checks on or off for this website."
            >
              <ToggleRow
                title="Enable monitoring"
                description="Run scheduled uptime checks for this URL"
                checked={form.enabled}
                onChange={(v) => patch("enabled", v)}
              />
            </SettingsSection>

            <SettingsSection
              icon={<Globe className="h-4 w-4" />}
              title="Probe"
              description="What we request, how often, and which responses count as healthy."
            >
              <div className="space-y-5">
                <Field label="URL to check">
                  <Input value={form.url} onChange={(e) => patch("url", e.target.value)} />
                </Field>

                <Field label="Check interval" hint="Faster intervals catch outages sooner">
                  <div className="flex flex-wrap gap-2">
                    {UPTIME_INTERVAL_OPTIONS.map((o) => {
                      const locked = o.seconds < minIntervalSeconds;
                      const selected = form.intervalSeconds === o.seconds;
                      return (
                        <button
                          key={o.seconds}
                          type="button"
                          disabled={locked}
                          title={locked ? `Available on the ${o.minPlan} plan` : undefined}
                          onClick={() => patch("intervalSeconds", o.seconds)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors",
                            selected
                              ? "border-primary/50 bg-primary/10 text-foreground"
                              : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground",
                            locked && "cursor-not-allowed opacity-45 hover:border-border/40 hover:text-muted-foreground"
                          )}
                        >
                          {locked ? <Lock className="h-3 w-3" /> : null}
                          Every {formatInterval(o.seconds)}
                          {locked ? (
                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              {o.minPlan}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="HTTP method">
                    <Select
                      value={form.method}
                      onValueChange={(v) => v && patch("method", v as MonitorHttpMethod)}
                      disabled={form.keywordMode !== "NONE"}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder={form.method} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET — recommended</SelectItem>
                        <SelectItem value="HEAD">HEAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Accepted status codes" hint="Responses in this range count as up">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="tabular-nums"
                        value={form.expectedMin}
                        onChange={(e) => patch("expectedMin", Number(e.target.value))}
                      />
                      <span className="shrink-0 text-sm text-muted-foreground">–</span>
                      <Input
                        type="number"
                        className="tabular-nums"
                        value={form.expectedMax}
                        onChange={(e) => patch("expectedMax", Number(e.target.value))}
                      />
                    </div>
                  </Field>
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              icon={<Gauge className="h-4 w-4" />}
              title="Detection"
              description="How many failures open an incident, and what counts as slow."
            >
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Failures before incident"
                    hint="Consecutive failed checks needed to confirm an outage"
                  >
                    <div className="inline-flex items-center gap-0.5 rounded-lg border border-border/40 bg-secondary/30 p-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => patch("failureThreshold", n)}
                          className={cn(
                            "h-8 w-9 rounded-md text-xs font-medium tabular-nums transition-colors",
                            form.failureThreshold === n
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Slow alert threshold (ms)" hint="Leave empty to disable slow alerts">
                    <Input
                      type="number"
                      placeholder="e.g. 2000"
                      value={form.slowThresholdMs}
                      onChange={(e) => patch("slowThresholdMs", e.target.value)}
                    />
                  </Field>
                </div>

                <Field label="Keyword check" hint="Verify the page body — keyword checks force GET">
                  <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                    <Select
                      value={form.keywordMode}
                      onValueChange={(v) => v && patch("keywordMode", v as KeywordMatchMode)}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">Off</SelectItem>
                        <SelectItem value="CONTAINS">Must contain</SelectItem>
                        <SelectItem value="NOT_CONTAINS">Must not contain</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.keywordMode !== "NONE" ? (
                      <Input
                        value={form.keyword}
                        onChange={(e) => patch("keyword", e.target.value)}
                        placeholder="Keyword text"
                      />
                    ) : null}
                  </div>
                </Field>
              </div>
            </SettingsSection>

            <SettingsSection
              icon={<Bell className="h-4 w-4" />}
              title="Alerts"
              description={
                <>
                  Emails go to{" "}
                  <span className="font-medium text-foreground">
                    {alertEmailTo ?? "your account email"}
                  </span>
                  .
                </>
              }
            >
              <div className="divide-y divide-border/25">
                <ToggleRow
                  title="Email when down"
                  description="Alert as soon as an incident is confirmed"
                  checked={form.alertEmail}
                  onChange={(v) => patch("alertEmail", v)}
                />
                <ToggleRow
                  title="Email when recovered"
                  description="Follow-up once the site is back up"
                  checked={form.alertOnRecovery}
                  onChange={(v) => patch("alertOnRecovery", v)}
                />
                <ToggleRow
                  title="Watch SSL expiry"
                  description="Track the certificate and warn before it expires"
                  checked={form.checkSsl}
                  onChange={(v) => patch("checkSsl", v)}
                />
                {form.checkSsl ? (
                  <div className="pt-4">
                    <Field label="Warn this many days before expiry">
                      <Input
                        type="number"
                        className="max-w-[160px]"
                        value={form.sslWarnDays}
                        onChange={(e) => patch("sslWarnDays", Number(e.target.value))}
                      />
                    </Field>
                  </div>
                ) : null}
              </div>
            </SettingsSection>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/30 pt-5">
              <Button onClick={save} disabled={pending || !canUseMonitoring || !dirty}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save settings
              </Button>
              {monitor?.enabled ? (
                <Button
                  variant="ghost"
                  onClick={turnOff}
                  disabled={pending}
                  className="text-muted-foreground hover:text-rose-400"
                >
                  Disable monitor
                </Button>
              ) : null}
            </div>

            {/* Sticky unsaved-changes bar */}
            {dirty ? (
              <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-card/95 px-4 py-3 shadow-xl backdrop-blur">
                <p className="flex items-center gap-2 text-sm">
                  <BellRing className="h-4 w-4 text-amber-400" />
                  You have unsaved changes
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setForm(serverForm)}
                    disabled={pending}
                  >
                    Discard
                  </Button>
                  <Button size="sm" onClick={save} disabled={pending || !canUseMonitoring}>
                    {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    Save changes
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* -------------------------------- sub-parts -------------------------------- */

function uptimeTone(pct: number | null | undefined): "default" | "good" | "warn" | "muted" {
  if (pct == null) return "muted";
  if (pct >= 99.5) return "good";
  if (pct >= 98) return "default";
  return "warn";
}

function StatusOrb({ status }: { status: string }) {
  const color =
    status === "UP"
      ? "text-emerald-400"
      : status === "DOWN"
        ? "text-rose-400"
        : status === "DEGRADED"
          ? "text-amber-400"
          : "text-muted-foreground";
  const bg =
    status === "UP"
      ? "bg-emerald-500/10 border-emerald-500/20"
      : status === "DOWN"
        ? "bg-rose-500/10 border-rose-500/20"
        : status === "DEGRADED"
          ? "bg-amber-500/10 border-amber-500/20"
          : "bg-secondary/40 border-border/40";
  return (
    <div
      className={cn(
        "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border",
        bg,
        color
      )}
      aria-hidden
    >
      <span className="relative flex h-3 w-3">
        {(status === "DOWN" || status === "DEGRADED") && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-40" />
        )}
        <span className="relative inline-flex h-3 w-3 rounded-full bg-current" />
      </span>
    </div>
  );
}

function Callout({
  tone,
  icon,
  title,
  children,
}: {
  tone: "down" | "warn" | "info";
  icon: React.ReactNode;
  title?: string;
  children: React.ReactNode;
}) {
  const styles =
    tone === "down"
      ? "border-rose-500/20 bg-rose-500/[0.06] text-rose-300"
      : tone === "warn"
        ? "border-amber-500/20 bg-amber-500/[0.06] text-amber-300"
        : "border-primary/20 bg-primary/[0.05] text-foreground";
  return (
    <div className={cn("flex gap-3 rounded-xl border px-4 py-3", styles)}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 space-y-0.5">
        {title ? <p className="text-sm font-medium">{title}</p> : null}
        <p className={cn("text-sm", title ? "opacity-80" : "")}>{children}</p>
      </div>
    </div>
  );
}

function MetaItem({
  label,
  value,
  title,
}: {
  label: string;
  value: string;
  title?: string;
}) {
  return (
    <div className="flex items-baseline gap-1.5" title={title}>
      <dt className="text-muted-foreground/70">{label}</dt>
      <dd className="font-medium text-foreground/90">{value}</dd>
    </div>
  );
}

function MetricCell({
  label,
  value,
  hint,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "good" | "warn" | "muted";
  icon?: React.ReactNode;
}) {
  const valueClass =
    tone === "good"
      ? "text-emerald-400"
      : tone === "warn"
        ? "text-amber-400"
        : tone === "muted"
          ? "text-muted-foreground"
          : "text-foreground";

  return (
    <div className="px-4 py-4 sm:px-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 flex items-center gap-1.5 text-xl font-semibold tabular-nums tracking-tight",
          valueClass
        )}
      >
        {icon}
        {value}
      </p>
      {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function CheckTable({ rows }: { rows: CheckRow[] }) {
  const maxLatency = Math.max(...rows.map((r) => r.latencyMs ?? 0), 1);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border/30 text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="px-5 py-3 font-medium">Result</th>
            <th className="px-5 py-3 font-medium">HTTP</th>
            <th className="px-5 py-3 font-medium">Latency</th>
            <th className="px-5 py-3 font-medium">When</th>
            <th className="px-5 py-3 font-medium">Detail</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr
              key={c.id}
              className="border-b border-border/20 last:border-0 hover:bg-secondary/10"
            >
              <td className="px-5 py-2.5">
                <ResultPill result={c.result} />
              </td>
              <td className="px-5 py-2.5 tabular-nums text-muted-foreground">
                {c.httpStatus ?? "—"}
              </td>
              <td className="px-5 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-16 tabular-nums text-muted-foreground">
                    {formatLatency(c.latencyMs)}
                  </span>
                  <span className="hidden h-1 w-20 overflow-hidden rounded-full bg-secondary/60 sm:block">
                    <span
                      className={cn(
                        "block h-full rounded-full",
                        c.result === "UP"
                          ? "bg-primary/60"
                          : c.result === "DEGRADED"
                            ? "bg-amber-400/70"
                            : "bg-rose-500/70"
                      )}
                      style={{
                        width: `${Math.max(((c.latencyMs ?? 0) / maxLatency) * 100, 3)}%`,
                      }}
                    />
                  </span>
                </div>
              </td>
              <td className="whitespace-nowrap px-5 py-2.5 text-muted-foreground">
                <span title={formatDateTime(c.checkedAt)}>
                  {formatRelativeTime(c.checkedAt)}
                </span>
              </td>
              <td className="max-w-[280px] truncate px-5 py-2.5 text-muted-foreground">
                {c.errorMessage ?? "OK"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IncidentItem({
  incident,
  compact = false,
  onAcknowledge,
  pending,
}: {
  incident: IncidentRow;
  compact?: boolean;
  onAcknowledge?: (id: string) => void;
  pending?: boolean;
}) {
  const kindClass =
    incident.kind === "DOWN"
      ? "border-rose-500/25 text-rose-400"
      : incident.kind === "SLOW"
        ? "border-amber-500/25 text-amber-400"
        : "border-sky-500/25 text-sky-400";
  return (
    <li className="flex gap-4 px-5 py-4">
      <div
        className={cn(
          "mt-1 h-2 w-2 shrink-0 rounded-full",
          incident.resolvedAt ? "bg-muted-foreground/40" : "bg-rose-400"
        )}
      />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">
              {incident.resolvedAt ? "Resolved" : "Ongoing"}
            </span>
            <span
              className={cn(
                "inline-flex rounded-md border px-1.5 py-px text-[10px] font-medium uppercase tracking-wide",
                kindClass
              )}
            >
              {incident.kind}
            </span>
            {incident.acknowledgedAt ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <CheckCircle2 className="h-3 w-3" /> Acknowledged
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs tabular-nums text-muted-foreground">
              {formatIncidentDuration(incident.startedAt, incident.resolvedAt)}
            </span>
            {onAcknowledge ? (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs"
                disabled={pending}
                onClick={() => onAcknowledge(incident.id)}
              >
                Acknowledge
              </Button>
            ) : null}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Started {new Date(incident.startedAt).toLocaleString()}
          {incident.resolvedAt
            ? ` · Ended ${new Date(incident.resolvedAt).toLocaleString()}`
            : ""}
          {!compact && incident.failCount > 0
            ? ` · ${incident.failCount} failed check${incident.failCount === 1 ? "" : "s"}`
            : ""}
        </p>
        {incident.lastError && !compact ? (
          <p className="text-xs leading-relaxed text-foreground/75">{incident.lastError}</p>
        ) : null}
      </div>
    </li>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <CheckCircle2 className="mb-3 h-5 w-5 text-muted-foreground/50" />
      <p className="max-w-sm text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function ResultPill({ result }: { result: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium",
        result === "UP" && "border-emerald-500/25 text-emerald-400",
        result === "DEGRADED" && "border-amber-500/25 text-amber-400",
        result !== "UP" && result !== "DEGRADED" && "border-rose-500/25 text-rose-400"
      )}
    >
      {result}
    </span>
  );
}

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/40 bg-card">
      <div className="grid gap-5 p-5 lg:grid-cols-[230px_1fr] lg:gap-10 lg:p-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            {icon ? (
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/40 bg-secondary/40 text-muted-foreground">
                {icon}
              </span>
            ) : null}
            <h2 className="text-sm font-semibold">{title}</h2>
          </div>
          {description ? (
            <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {hint ? <p className="text-[11px] text-muted-foreground/70">{hint}</p> : null}
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
