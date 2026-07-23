"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Share, X } from "lucide-react";
import { BRAND_ICONS } from "@/lib/brand-icons";

const DISMISS_KEY = "healthmesh-pwa-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return true;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mq || iosStandalone;
}

function isIosSafari() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua);
  const chromeIos = /CriOS|FxiOS|EdgiOS/.test(ua);
  return iOS && webkit && !chromeIos;
}

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    let cancelled = false;
    let iosTimer: number | undefined;
    let consentPoll: number | undefined;

    const cookieSettled = () =>
      document.cookie.split("; ").some((row) => row.startsWith("healthmesh-cookie-consent="));

    const revealWhenReady = (mode: "chrome" | "ios") => {
      const show = () => {
        if (cancelled || localStorage.getItem(DISMISS_KEY) === "1" || isStandalone()) return;
        if (mode === "ios") setIosHelp(true);
        setVisible(true);
      };

      if (cookieSettled()) {
        show();
        return;
      }

      // Wait for cookie banner choice so prompts don't stack on mobile.
      let tries = 0;
      consentPoll = window.setInterval(() => {
        tries += 1;
        if (cookieSettled() || tries > 60) {
          if (consentPoll) window.clearInterval(consentPoll);
          show();
        }
      }, 500);
    };

    const onBip = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setIosHelp(false);
      revealWhenReady("chrome");
    };

    window.addEventListener("beforeinstallprompt", onBip);

    if (isIosSafari()) {
      iosTimer = window.setTimeout(() => {
        revealWhenReady("ios");
      }, 4500);
    }

    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
      localStorage.setItem(DISMISS_KEY, "1");
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      cancelled = true;
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
      if (iosTimer) window.clearTimeout(iosTimer);
      if (consentPoll) window.clearInterval(consentPoll);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  const install = async () => {
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      setVisible(false);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 z-[60] mx-auto w-full max-w-md overflow-hidden rounded-[14px] border border-[var(--ln-line)] bg-[var(--ln-surface)] p-4 shadow-[0_1px_1px_rgba(10,12,16,0.04),0_20px_48px_rgba(10,12,16,0.14)] sm:left-6 sm:right-auto sm:bottom-6"
          role="dialog"
          aria-label="Install Health Mesh"
        >
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={BRAND_ICONS.icon192}
              alt=""
              width={44}
              height={44}
              className="size-11 shrink-0 rounded-[10px] border border-[var(--ln-line)]"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ln-faint)]">
                    Install app
                  </p>
                  <p className="mt-1 font-display text-[15px] font-semibold tracking-tight text-[var(--ln-ink)]">
                    Add Health Mesh to your device
                  </p>
                </div>
                <button
                  type="button"
                  onClick={dismiss}
                  className="rounded-[6px] p-1 text-[var(--ln-faint)] transition-colors hover:bg-[var(--ln-bg)] hover:text-[var(--ln-ink)]"
                  aria-label="Dismiss install prompt"
                >
                  <X className="size-4" />
                </button>
              </div>

              {iosHelp ? (
                <p className="mt-2 text-[12px] leading-relaxed text-[var(--ln-muted)]">
                  Tap <Share className="mx-0.5 inline size-3.5 align-text-bottom" /> Share, then{" "}
                  <span className="font-medium text-[var(--ln-ink-soft)]">Add to Home Screen</span>.
                </p>
              ) : (
                <p className="mt-2 text-[12px] leading-relaxed text-[var(--ln-muted)]">
                  Launch faster from your home screen or desktop — works offline for the basics.
                </p>
              )}

              <div className="mt-3.5 flex gap-2">
                {!iosHelp && deferred ? (
                  <button
                    type="button"
                    onClick={() => void install()}
                    disabled={installing}
                    className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[var(--ln-radius-sm)] bg-[var(--ln-ink)] text-[12px] font-medium text-white transition-colors hover:bg-[var(--ln-ink-soft)] disabled:opacity-60"
                  >
                    <Download className="size-3.5" />
                    {installing ? "Installing…" : "Install"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={dismiss}
                  className="h-9 flex-1 rounded-[var(--ln-radius-sm)] border border-[var(--ln-line-strong)] bg-[var(--ln-bg)] text-[12px] font-medium text-[var(--ln-ink-soft)] transition-colors hover:bg-[var(--ln-bg-deep)]"
                >
                  {iosHelp ? "Got it" : "Not now"}
                </button>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
