"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Menu, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
  onMenuClick?: () => void;
}

export function Topbar({ user, onMenuClick }: TopbarProps) {
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [{ name: "Dashboard", href: "/dashboard" }];

    return segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      let name = segment.charAt(0).toUpperCase() + segment.slice(1);

      if (name.length > 15 && (name.startsWith("Cl") || name.match(/[0-9]/))) {
        name = "Details";
      }

      if (name === "Dashboard") name = "Overview";
      if (name === "Websites") name = "Websites";
      if (name === "Reports") name = "Reports";
      if (name === "Issues") name = "Issues";

      return { name, href };
    });
  };

  const breadcrumbs = getBreadcrumbs();
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "US";

  return (
    <header className="flex items-center h-16 px-6 bg-card border-b border-border/40 justify-between shrink-0">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon-sm" className="md:hidden" onClick={onMenuClick}>
          <Menu />
        </Button>

        <nav className="hidden sm:flex items-center space-x-1.5 text-sm font-medium text-muted-foreground">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.href}>
              {idx > 0 && <span className="text-muted-foreground/30 font-normal">/</span>}
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-foreground font-semibold">{crumb.name}</span>
              ) : (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-muted-foreground"
                  render={<Link href={crumb.href} />}
                  nativeButton={false}
                >
                  {crumb.name}
                </Button>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="gap-2 pl-1.5 pr-2">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt="Avatar"
                    className="w-7 h-7 rounded-lg object-cover border border-border/30"
                  />
                ) : (
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                    {userInitials}
                  </div>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            }
          />

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-bold text-foreground truncate">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
              <Badge variant="outline" className="mt-1.5 text-[10px] uppercase tracking-wider">
                {user?.role || "User"}
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
              <User />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/dashboard/settings/account" />}>
              <Settings />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => logoutAction()}>
              <LogOut />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
