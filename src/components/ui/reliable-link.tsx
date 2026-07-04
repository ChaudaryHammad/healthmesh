"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type ReliableLinkProps = ComponentProps<typeof Link>;

function resolveHref(href: ReliableLinkProps["href"]): string {
  if (typeof href === "string") return href;
  if (typeof href === "object" && href.pathname) return href.pathname;
  return String(href);
}

/**
 * Next.js client navigation can stall when the router is busy (e.g. during scan polling).
 * This link tries soft navigation first, then falls back to a full page load.
 */
export function ReliableLink({ href, onClick, ...props }: ReliableLinkProps) {
  const target = resolveHref(href);

  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }

        const startPath = window.location.pathname;
        window.setTimeout(() => {
          if (window.location.pathname === startPath) {
            window.location.assign(target);
          }
        }, 400);
      }}
      {...props}
    />
  );
}
