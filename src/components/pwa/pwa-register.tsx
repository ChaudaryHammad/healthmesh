"use client";

import { useEffect } from "react";

/** Registers the Health Mesh service worker (production + secure contexts). */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    // Allow localhost testing; require secure context elsewhere.
    if (!window.isSecureContext && !isLocalhost) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch {
        // Silent — installability simply won't unlock if registration fails.
      }
    };

    // Defer so it doesn't compete with first paint / hydration.
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        void register();
      });
    } else {
      window.setTimeout(() => {
        void register();
      }, 1200);
    }
  }, []);

  return null;
}
