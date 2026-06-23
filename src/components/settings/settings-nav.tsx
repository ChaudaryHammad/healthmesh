"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard/settings", label: "Profile", icon: User, exact: true },
  {
    href: "/dashboard/settings/billing",
    label: "Billing",
    icon: CreditCard,
    exact: false,
  },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="inline-flex w-full max-w-md rounded-xl border border-border/40 bg-muted/30 p-1">
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
