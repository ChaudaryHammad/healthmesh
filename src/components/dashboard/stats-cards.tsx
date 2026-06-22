import React from "react";
import { Globe, AlertTriangle, Play, ShieldAlert, BadgeCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatsCardsProps {
  totalWebsites: number;
  activeScans: number;
  criticalIssues: number;
  accessibilityIssues: number;
  seoIssues: number;
}

export function StatsCards({
  totalWebsites,
  activeScans,
  criticalIssues,
  accessibilityIssues,
  seoIssues,
}: StatsCardsProps) {
  const cards = [
    {
      title: "Total Websites",
      value: totalWebsites,
      description: "Connected web domains",
      icon: Globe,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Active Scans",
      value: activeScans,
      description: "Running audits in queue",
      icon: Play,
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      title: "Critical Issues",
      value: criticalIssues,
      description: "Errors requiring hotfixes",
      icon: ShieldAlert,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Accessibility Issues",
      value: accessibilityIssues,
      description: "A11y parsing warnings",
      icon: AlertTriangle,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "SEO Issues",
      value: seoIssues,
      description: "Indexing and tag warnings",
      icon: BadgeCheck,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="border-border/30 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription className="text-xs font-semibold tracking-tight">
                {card.title}
              </CardDescription>
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg border ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-2xl font-extrabold tabular-nums">{card.value}</CardTitle>
              <CardDescription className="text-[10px] leading-none mt-1">
                {card.description}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
