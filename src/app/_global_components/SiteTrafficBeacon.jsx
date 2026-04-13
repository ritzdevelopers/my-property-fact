"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { getPublicApiBase } from "@/lib/publicApiBase";

function clientSessionIdForTraffic() {
  if (typeof window === "undefined") return "";
  try {
    const key = "mpf_traffic_sid";
    let id = sessionStorage.getItem(key);
    if (!id || !/^[a-zA-Z0-9_-]{8,64}$/.test(id)) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      id = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return "";
  }
}

function postTraffic(payload) {
  const base = getPublicApiBase();
  if (!base) return;
  const body = JSON.stringify({
    ...payload,
    clientSessionId: clientSessionIdForTraffic() || undefined,
  });
  const url = `${base}public/site-traffic`;
  const opts = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  };
  try {
    void fetch(url, opts).catch(() => {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon(url, blob);
      }
    });
  } catch {
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon(url, blob);
      }
    } catch {
      /* ignore */
    }
  }
}

/**
 * Records public route views: completed visits send path + dwellMs when navigating away or closing the tab.
 */
export default function SiteTrafficBeacon() {
  const pathname = usePathname();
  const pathEnteredAtRef = useRef(null);
  const currentPathRef = useRef(null);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin") || pathname.startsWith("/portal")) return;

    const now = Date.now();
    const prev = currentPathRef.current;
    const prevAt = pathEnteredAtRef.current;
    if (prev != null && prevAt != null && prev !== pathname) {
      postTraffic({ path: prev, dwellMs: now - prevAt });
    }
    currentPathRef.current = pathname;
    pathEnteredAtRef.current = now;
    // Real-time counts: record a view as soon as the route is active (throttled server-side per IP+path).
    postTraffic({ path: pathname });
  }, [pathname]);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin") || pathname.startsWith("/portal")) return;

    const flush = () => {
      const p = currentPathRef.current;
      const at = pathEnteredAtRef.current;
      if (p == null || at == null) return;
      const dwellMs = Date.now() - at;
      if (dwellMs > 0 && dwellMs < 50) return;
      postTraffic({ path: p, dwellMs });
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
    };
  }, [pathname]);

  return null;
}
