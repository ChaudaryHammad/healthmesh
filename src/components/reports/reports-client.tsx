"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  deleteReportAction,
  generateReportAction,
  getWebsiteScansForReportsAction,
} from "@/actions/reports";
import { REPORT_TYPE_LABELS, buildReportTitle } from "@/lib/reports/types";
import { formatDateTime } from "@/lib/utils";
import type { ReportType } from "@prisma/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SerializedReport = {
  id: string;
  title: string;
  type: ReportType;
  format: string;
  previewUrl: string;
  downloadUrl: string;
  fileSize: number | null;
  scanId: string | null;
  websiteId: string;
  websiteName: string;
  createdAt: string;
};

interface ReportsClientProps {
  websites: { id: string; name: string; url: string }[];
  reports: SerializedReport[];
}

type ScanOption = {
  id: string;
  completedAt: Date | string | null;
  overallScore: number | null;
  createdAt: Date | string;
};

const REPORT_TYPES: ReportType[] = ["FULL_AUDIT", "EXECUTIVE_SUMMARY", "ISSUES_CSV"];

function formatFileSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function typeIcon(type: ReportType) {
  if (type === "ISSUES_CSV") return <FileSpreadsheet className="size-4" />;
  return <FileText className="size-4" />;
}

function formatScanLabel(scan: ScanOption) {
  if (scan.completedAt) {
    return `${formatDateTime(scan.completedAt)} — score ${scan.overallScore ?? "—"}/100`;
  }
  return `Scan from ${formatDateTime(scan.createdAt)}`;
}

function formatWebsiteUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function sanitizeFilename(name: string) {
  return name.replace(/[<>:"/\\|?*]/g, "-").slice(0, 120);
}

function reportMimeType(format: string) {
  return format === "csv" ? "text/csv" : "application/pdf";
}

function triggerDownload(base64: string, filename: string, mimeType: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ReportsClient({ websites, reports: initialReports }: ReportsClientProps) {
  const router = useRouter();
  const [reports, setReports] = useState(initialReports);
  const [search, setSearch] = useState("");
  const [websiteFilter, setWebsiteFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState<ReportType | "ALL">("ALL");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState("");
  const [selectedScanId, setSelectedScanId] = useState("");
  const [selectedType, setSelectedType] = useState<ReportType>("FULL_AUDIT");
  const [customTitle, setCustomTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [saveToLibrary, setSaveToLibrary] = useState(true);
  const [scans, setScans] = useState<ScanOption[]>([]);
  const [loadingScans, setLoadingScans] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isGenerating, startGenerateTransition] = useTransition();

  useEffect(() => {
    setReports(initialReports);
  }, [initialReports]);

  useEffect(() => {
    if (!selectedWebsiteId) {
      setScans([]);
      setSelectedScanId("");
      return;
    }

    setLoadingScans(true);
    getWebsiteScansForReportsAction(selectedWebsiteId).then((res) => {
      if (res.success) {
        setScans(res.data);
        setSelectedScanId(res.data[0]?.id ?? "");
      } else {
        setScans([]);
        setSelectedScanId("");
      }
      setLoadingScans(false);
    });
  }, [selectedWebsiteId]);

  const selectedWebsite = websites.find((site) => site.id === selectedWebsiteId);
  const selectedScan = scans.find((scan) => scan.id === selectedScanId);

  useEffect(() => {
    if (!selectedWebsite || !selectedScan || titleTouched) return;

    setCustomTitle(
      buildReportTitle(
        selectedType,
        selectedWebsite.name,
        selectedScan.completedAt ? new Date(selectedScan.completedAt) : null
      )
    );
  }, [selectedWebsite, selectedScan, selectedType, titleTouched]);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reports.filter((report) => {
      if (websiteFilter !== "ALL" && report.websiteId !== websiteFilter) return false;
      if (typeFilter !== "ALL" && report.type !== typeFilter) return false;
      if (!query) return true;
      return (
        report.title.toLowerCase().includes(query) ||
        report.websiteName.toLowerCase().includes(query)
      );
    });
  }, [reports, search, websiteFilter, typeFilter]);

  const stats = useMemo(
    () => ({
      total: reports.length,
      pdf: reports.filter((r) => r.format === "pdf").length,
      csv: reports.filter((r) => r.format === "csv").length,
      sites: new Set(reports.map((r) => r.websiteId)).size,
    }),
    [reports]
  );

  const websiteTriggerLabel = selectedWebsite?.name ?? "Select website";
  const scanTriggerLabel = loadingScans
    ? "Loading scans…"
    : scans.length === 0
      ? "No completed scans"
      : selectedScan
        ? formatScanLabel(selectedScan)
        : "Select scan";
  const reportTypeTriggerLabel = REPORT_TYPE_LABELS[selectedType];

  const openGenerateDialog = () => {
    setError(null);
    setMessage(null);
    setSelectedWebsiteId(websites[0]?.id ?? "");
    setSelectedType("FULL_AUDIT");
    setCustomTitle("");
    setTitleTouched(false);
    setSaveToLibrary(true);
    setDialogOpen(true);
  };

  const handleGenerate = () => {
    if (!selectedWebsiteId || !selectedScanId) {
      setError("Select a website and scan.");
      return;
    }

    setError(null);
    startGenerateTransition(async () => {
      const res = await generateReportAction({
        websiteId: selectedWebsiteId,
        scanId: selectedScanId,
        type: selectedType,
        customTitle: customTitle.trim() || undefined,
        saveToLibrary,
      });

      if (res.success && res.data) {
        const data = res.data;
        setDialogOpen(false);

        if (data.saved) {
          const savedReport: SerializedReport = {
            id: data.id,
            title: data.title,
            type: data.type,
            format: data.format,
            previewUrl: data.previewUrl,
            downloadUrl: data.downloadUrl,
            fileSize: data.fileSize,
            scanId: data.scanId,
            websiteId: data.websiteId,
            websiteName: data.websiteName,
            createdAt: data.createdAt,
          };
          setReports((prev) => [savedReport, ...prev]);
          setMessage(res.message ?? "Report saved to your library.");
          router.refresh();
        } else {
          triggerDownload(
            data.fileBase64,
            `${sanitizeFilename(data.title)}.${data.format}`,
            reportMimeType(data.format)
          );
          setMessage(res.message ?? "Report downloaded.");
        }
      } else {
        setError(res.error ?? "Failed to generate report.");
      }
    });
  };

  const handleDelete = (reportId: string, title: string) => {
    if (!confirm(`Delete "${title}"? This removes the file from Cloudinary.`)) return;

    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await deleteReportAction(reportId);
      if (res.success) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
        setMessage(res.message ?? "Report deleted.");
        router.refresh();
      } else {
        setError(res.error ?? "Failed to delete report.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Downloadable audit snapshots for your sites — PDF summaries and CSV exports.
          </p>
        </div>
        <Button onClick={openGenerateDialog} disabled={websites.length === 0}>
          <Plus />
          Generate report
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-border/30">
          <CardHeader className="pb-2">
            <CardDescription>Total reports</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl border-border/30">
          <CardHeader className="pb-2">
            <CardDescription>PDF reports</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{stats.pdf}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl border-border/30">
          <CardHeader className="pb-2">
            <CardDescription>CSV exports</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{stats.csv}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl border-border/30">
          <CardHeader className="pb-2">
            <CardDescription>Sites covered</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{stats.sites}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/30">
        <CardHeader className="gap-4 border-b border-border/30 pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Saved reports</CardTitle>
                <Badge variant="secondary">{reports.length}</Badge>
              </div>
              <CardDescription>
                Reports saved to your library are stored in the cloud and listed here.
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reports or sites…"
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={websiteFilter === "ALL" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setWebsiteFilter("ALL")}
            >
              All sites
            </Button>
            {websites.map((site) => (
              <Button
                key={site.id}
                variant={websiteFilter === site.id ? "secondary" : "outline"}
                size="sm"
                onClick={() => setWebsiteFilter(websiteFilter === site.id ? "ALL" : site.id)}
              >
                {site.name}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={typeFilter === "ALL" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("ALL")}
            >
              All types
            </Button>
            {REPORT_TYPES.map((type) => (
              <Button
                key={type}
                variant={typeFilter === type ? "secondary" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(typeFilter === type ? "ALL" : type)}
              >
                {typeIcon(type)}
                {REPORT_TYPE_LABELS[type]}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {error && (
            <Alert variant="destructive" className="m-4 mb-0">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {message && (
            <Alert className="m-4 mb-0">
              <AlertDescription className="flex items-center justify-between gap-2">
                {message}
                <Button variant="ghost" size="icon-xs" onClick={() => setMessage(null)}>
                  <X />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {websites.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
              <FileText className="size-10 text-muted-foreground" />
              <div className="space-y-1">
                <CardTitle className="text-base">No websites yet</CardTitle>
                <CardDescription>
                  Connect a website and run an audit before generating reports.
                </CardDescription>
              </div>
              <ButtonLink href="/dashboard/websites">Connect a website</ButtonLink>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
              <FileText className="size-10 text-muted-foreground" />
              <div className="space-y-1">
                <CardTitle className="text-base">No saved reports yet</CardTitle>
                <CardDescription>
                  Generate a report and enable &quot;Save to library&quot; to keep it here for later.
                </CardDescription>
              </div>
              <Button onClick={openGenerateDialog}>
                <Plus />
                Generate your first report
              </Button>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <CardTitle className="text-base">No reports match your filters</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setWebsiteFilter("ALL");
                  setTypeFilter("ALL");
                }}
              >
                Reset filters
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead className="hidden md:table-cell">Website</TableHead>
                  <TableHead className="hidden lg:table-cell">Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Generated</TableHead>
                  <TableHead className="hidden sm:table-cell">Size</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 text-primary">{typeIcon(report.type)}</div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{report.title}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1">
                            <Badge variant="outline" className="uppercase text-[10px]">
                              {report.format}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px]">
                              Saved
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Link
                        href={`/dashboard/websites/${report.websiteId}`}
                        className="text-sm font-medium hover:text-primary hover:underline"
                      >
                        {report.websiteName}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {REPORT_TYPE_LABELS[report.type]}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {formatDateTime(report.createdAt)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm tabular-nums">
                      {formatFileSize(report.fileSize)}
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex items-center justify-end gap-1">
                        {report.format === "pdf" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Preview PDF"
                            nativeButton={false}
                            render={
                              <a
                                href={report.previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              />
                            }
                          >
                            <Eye />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Download"
                          nativeButton={false}
                          render={
                            <a
                              href={report.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          }
                        >
                          <Download />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Delete"
                          disabled={isPending}
                          onClick={() => handleDelete(report.id, report.title)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate report</DialogTitle>
            <DialogDescription>
              Name your report, pick a scan, and choose whether to save it to your library or
              download only.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Website</Label>
              <Select
                value={selectedWebsiteId}
                onValueChange={(value) => setSelectedWebsiteId(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <span className="truncate text-left">{websiteTriggerLabel}</span>
                </SelectTrigger>
                <SelectContent>
                  {websites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      <span className="flex flex-col items-start gap-0.5">
                        <span>{site.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatWebsiteUrl(site.url)}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Scan</Label>
              <Select
                value={selectedScanId}
                onValueChange={(value) => setSelectedScanId(value ?? "")}
                disabled={loadingScans || scans.length === 0}
              >
                <SelectTrigger className="w-full">
                  <span className="truncate text-left">{scanTriggerLabel}</span>
                </SelectTrigger>
                <SelectContent>
                  {scans.map((scan) => (
                    <SelectItem key={scan.id} value={scan.id}>
                      {formatScanLabel(scan)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-name">Report name</Label>
              <Input
                id="report-name"
                value={customTitle}
                onChange={(e) => {
                  setTitleTouched(true);
                  setCustomTitle(e.target.value);
                }}
                placeholder="e.g. Q2 audit — My Site"
                maxLength={120}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to use the auto-generated name.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Report type</Label>
              <Select
                value={selectedType}
                onValueChange={(value) => {
                  if (value) setSelectedType(value as ReportType);
                }}
              >
                <SelectTrigger className="w-full">
                  <span className="truncate text-left">{reportTypeTriggerLabel}</span>
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {REPORT_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/40 px-3 py-3">
              <div className="space-y-0.5">
                <Label htmlFor="save-to-library" className="text-sm font-medium">
                  Save to library
                </Label>
                <p className="text-xs text-muted-foreground">
                  {saveToLibrary
                    ? "Stored in the cloud and listed under Saved reports."
                    : "Download immediately without saving to your library."}
                </p>
              </div>
              <Switch
                id="save-to-library"
                checked={saveToLibrary}
                onCheckedChange={setSaveToLibrary}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedScanId || loadingScans}
            >
              {isGenerating && <Loader2 className="animate-spin" />}
              {saveToLibrary ? "Save report" : "Download"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
