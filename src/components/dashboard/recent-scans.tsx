import React from "react";
import Link from "next/link";
import { Activity, ArrowRight, CheckCircle2, XCircle, AlertCircle, Loader2, Plus } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Scan {
  id: string;
  status: string;
  overallScore: number | null;
  createdAt: Date;
  website: {
    id: string;
    name: string;
    url: string;
  };
}

interface RecentScansProps {
  scans: Scan[];
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/20 bg-emerald-500/10 text-[10px] uppercase text-emerald-500"
        >
          <CheckCircle2 />
          Success
        </Badge>
      );
    case "FAILED":
      return (
        <Badge variant="destructive" className="text-[10px] uppercase">
          <XCircle />
          Failed
        </Badge>
      );
    case "RUNNING":
      return (
        <Badge
          variant="outline"
          className="animate-pulse border-cyan-500/20 bg-cyan-500/10 text-[10px] uppercase text-cyan-500"
        >
          <Loader2 className="animate-spin" />
          Auditing
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="text-[10px] uppercase">
          <AlertCircle />
          Pending
        </Badge>
      );
  }
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-muted-foreground">—</span>;

  let className = "text-destructive bg-destructive/10 border-destructive/20";
  if (score >= 90) className = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  else if (score >= 50) className = "text-amber-500 bg-amber-500/10 border-amber-500/20";

  return (
    <Badge variant="outline" className={`tabular-nums font-bold ${className}`}>
      {score}
    </Badge>
  );
}

export function RecentScans({ scans }: RecentScansProps) {
  return (
    <Card className="flex h-[380px] flex-col rounded-2xl border-border/40">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Activity className="h-4 w-4 text-primary" />
          Recent scans
        </CardTitle>
        {scans.length > 0 && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs font-semibold"
            render={<Link href="/dashboard/websites" />}
            nativeButton={false}
          >
            All sites
            <ArrowRight />
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto pr-1">
        {scans.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] uppercase">Website</TableHead>
                <TableHead className="text-[10px] uppercase">Status</TableHead>
                <TableHead className="text-center text-[10px] uppercase">Score</TableHead>
                <TableHead className="text-right text-[10px] uppercase">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scans.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell className="max-w-[120px]">
                    <Link
                      href={`/dashboard/websites/${scan.website.id}`}
                      className="block truncate font-semibold text-foreground hover:text-primary"
                    >
                      {scan.website.name}
                    </Link>
                    <span className="block truncate text-[10px] text-muted-foreground">
                      {scan.website.url.replace(/^https?:\/\//, "")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={scan.status} />
                  </TableCell>
                  <TableCell className="text-center">
                    <ScoreBadge score={scan.overallScore} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right text-muted-foreground">
                    {formatDateTime(scan.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex h-full flex-col items-center justify-center space-y-3 py-10 text-center text-muted-foreground">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-border/60">
              <Activity className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p className="max-w-[220px] text-xs">
              No scan reports yet. Add a website to run your first audit.
            </p>
            <Button
              render={<Link href="/dashboard/websites" />}
              nativeButton={false}
              size="sm"
              variant="outline"
            >
              <Plus className="h-3.5 w-3.5" />
              Add website
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
