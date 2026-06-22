import React from "react";
import Link from "next/link";
import { Activity, ArrowRight, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
        <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500 uppercase text-[10px]">
          <CheckCircle2 />
          Success
        </Badge>
      );
    case "FAILED":
      return (
        <Badge variant="destructive" className="uppercase text-[10px]">
          <XCircle />
          Failed
        </Badge>
      );
    case "RUNNING":
      return (
        <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/20 text-cyan-500 uppercase text-[10px] animate-pulse">
          <Loader2 className="animate-spin" />
          Auditing
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="uppercase text-[10px]">
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
    <Card className="rounded-3xl border-border/30 flex flex-col h-[380px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Recent Scans
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
                <TableHead className="text-[10px] uppercase text-center">Score</TableHead>
                <TableHead className="text-[10px] uppercase text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scans.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell className="max-w-[120px]">
                    <span className="block font-semibold text-foreground truncate">{scan.website.name}</span>
                    <span className="block text-[10px] text-muted-foreground truncate">
                      {scan.website.url.replace(/^https?:\/\//, "")}
                    </span>
                  </TableCell>
                  <TableCell><StatusBadge status={scan.status} /></TableCell>
                  <TableCell className="text-center"><ScoreBadge score={scan.overallScore} /></TableCell>
                  <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                    {formatDateTime(scan.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground space-y-2 py-10">
            <Activity className="w-8 h-8 text-muted-foreground/40 animate-pulse" />
            <p className="text-xs">No scan reports recorded yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
