"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

function CookieMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className={className}
    >
      <circle
        cx="24"
        cy="24"
        r="18.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.9"
      />
      <circle cx="16" cy="18" r="2.25" fill="currentColor" fillOpacity="0.85" />
      <circle cx="28.5" cy="15.5" r="1.6" fill="currentColor" fillOpacity="0.55" />
      <circle cx="32" cy="26" r="2.5" fill="currentColor" fillOpacity="0.75" />
      <circle cx="18.5" cy="29.5" r="1.85" fill="currentColor" fillOpacity="0.5" />
      <circle cx="26" cy="34" r="1.4" fill="currentColor" fillOpacity="0.7" />
    </svg>
  );
}

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = document.cookie
      .split("; ")
      .find((row) => row.startsWith("healthmesh-cookie-consent="));
    if (!consent) setShow(true);
  }, []);

  const handleConsent = (value: "accepted" | "declined") => {
    const d = new Date();
    d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
    document.cookie = `healthmesh-cookie-consent=${value};expires=${d.toUTCString()};path=/`;
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 12, opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="ln-cookie-banner fixed bottom-4 left-4 right-4 z-50 max-w-[22.5rem] overflow-hidden rounded-[16px] border border-[var(--ln-line)] shadow-[0_1px_1px_rgba(10,12,16,0.04),0_24px_56px_rgba(10,12,16,0.12)] sm:bottom-6 sm:left-auto sm:right-6"
          role="dialog"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-desc"
        >
          <div className="grid grid-cols-[4.75rem_1fr] sm:grid-cols-[5.25rem_1fr]">
            {/* Visual rail — texture + mark */}
            <div className="ln-cookie-rail relative flex items-center justify-center">
              <div className="ln-cookie-rail-texture absolute inset-0" aria-hidden />
              <CookieMark className="relative size-9 text-[var(--ln-signal)] sm:size-10" />
            </div>

            {/* Content */}
            <div className="relative flex flex-col bg-[var(--ln-surface)] px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-[1.125rem]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[radial-gradient(ellipse_at_0%_0%,rgba(13,122,111,0.06),transparent_70%)]" />

              <div className="relative">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ln-faint)]">
                  Preferences
                </p>
                <h2
                  id="cookie-banner-title"
                  className="mt-1 font-display text-[15px] font-semibold tracking-tight text-[var(--ln-ink)]"
                >
                  We use cookies
                </h2>
                <p
                  id="cookie-banner-desc"
                  className="mt-2 text-[12px] leading-[1.55] text-[var(--ln-muted)]"
                >
                  Not the edible ones — the kind that notice you visited.
                  Essential ones stay either way.{" "}
                  <Link
                    href="/cookies"
                    className="font-medium text-[var(--ln-ink-soft)] underline decoration-[var(--ln-line-strong)] underline-offset-[3px] transition-colors hover:decoration-[var(--ln-ink)]"
                  >
                    Fine print
                  </Link>
                </p>
              </div>

              <div className="relative mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleConsent("declined")}
                  className="h-9 flex-1 rounded-[var(--ln-radius-sm)] border border-[var(--ln-line-strong)] bg-[var(--ln-bg)] text-[12px] font-medium text-[var(--ln-ink-soft)] transition-colors hover:border-[var(--ln-ink)]/20 hover:bg-[var(--ln-bg-deep)]"
                >
                  No thanks
                </button>
                <button
                  type="button"
                  onClick={() => handleConsent("accepted")}
                  className="h-9 flex-1 rounded-[var(--ln-radius-sm)] bg-[var(--ln-ink)] text-[12px] font-medium text-white transition-colors hover:bg-[var(--ln-ink-soft)]"
                >
                  Sure, why not
                </button>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
