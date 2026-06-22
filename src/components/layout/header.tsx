import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";

export async function Header() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40 select-none">
      <div className="max-w-[88rem] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-foreground">
            LoopNode
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
          <Button variant="ghost" size="sm" render={<Link href="/features" />} nativeButton={false}>
            Features
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/pricing" />} nativeButton={false}>
            Pricing
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/blog" />} nativeButton={false}>
            Blog
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/contact" />} nativeButton={false}>
            Contact
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <ButtonLink href="/dashboard">Dashboard</ButtonLink>
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link href="/login" />} nativeButton={false}>
                Sign In
              </Button>
              <ButtonLink href="/register" className="hidden sm:inline-flex">
                Get Started
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
