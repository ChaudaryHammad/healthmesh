import React from "react";
import { Globe, AlertTriangle, Play, ShieldAlert, BadgeCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  totalWebsites: number;
  activeScans: number;
  criticalIssues: number;
  accessibilityIssues: number;
  seoIssues: number;
}

type Tone = "blue" | "cyan" | "rose" | "purple" | "amber";

const TONE_CLASSES: Record<Tone, { icon: string; ring: string }> = {
  blue: { icon: "bg-blue-500/10 text-blue-400 border-blue-500/20", ring: "hover:border-blue-500/30" },
  cyan: { icon: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", ring: "hover:border-cyan-500/30" },
  rose: { icon: "bg-rose-500/10 text-rose-400 border-rose-500/20", ring: "hover:border-rose-500/30" },
  purple: { icon: "bg-purple-500/10 text-purple-400 border-purple-500/20", ring: "hover:border-purple-500/30" },
  amber: { icon: "bg-amber-500/10 text-amber-400 border-amber-500/20", ring: "hover:border-amber-500/30" },
};

export function StatsCards({
  totalWebsites,
  activeScans,
  criticalIssues,
  accessibilityIssues,
  seoIssues,
}: StatsCardsProps) {
  const cards: {
    title: string;
    value: number;
    description: string;
    icon: LucideIcon;
    tone: Tone;
    emphasize?: boolean;
  }[] = [
    {
      title: "Websites",
      value: totalWebsites,
      description: "Connected domains",
      icon: Globe,
      tone: "blue",
    },
    {
      title: "Active scans",
      value: activeScans,
      description: "Running right now",
      icon: Play,
      tone: "cyan",
    },
    {
      title: "Critical issues",
      value: criticalIssues,
      description: "Need a hotfix",
      icon: ShieldAlert,
      tone: "rose",
      emphasize: criticalIssues > 0,
    },
    {
      title: "Accessibility",
      value: accessibilityIssues,
      description: "A11y warnings",
      icon: AlertTriangle,
      tone: "purple",
    },
    {
      title: "SEO issues",
      value: seoIssues,
      description: "Indexing & tags",
      icon: BadgeCheck,
      tone: "amber",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const tone = TONE_CLASSES[card.tone];
        return (
          <div
            key={card.title}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-border/40 bg-card p-4 transition-colors",
              tone.ring,
              card.emphasize && "border-rose-500/25 bg-rose-500/[0.04]"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {card.title}
              </p>
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-transform group-hover:scale-105",
                  tone.icon
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p
              className={cn(
                "mt-3 text-[28px] font-semibold leading-none tabular-nums tracking-tight",
                card.emphasize ? "text-rose-400" : "text-foreground"
              )}
            >
              {card.value.toLocaleString()}
            </p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{card.description}</p>
          </div>
        );
      })}
    </div>
  );
}
