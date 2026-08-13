/**
 * Fire-and-forget IP / scan hit reporting from Edge middleware.
 * Captures bots/scanners that never run client JavaScript.
 */

import { getPublicApiBase } from "./publicApiBase";
import { isSuspectedScanPath } from "./scanPathUtils";

export { isSuspectedScanPath, scanProbeKind } from "./scanPathUtils";

/**
 * Report a hit to the backend IP tracker. Never throws; never blocks the response.
 * Records scan probes always; normal public paths are also reported (server throttles).
 */
export function reportIpTrackHit(req, pathname) {
  try {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/portal")) {
      return;
    }
    if (pathname.startsWith("/_next") || pathname.startsWith("/api/")) {
      return;
    }
    // Skip common static / health noise
    if (
      pathname === "/favicon.ico" ||
      pathname === "/robots.txt" ||
      pathname === "/sitemap.xml" ||
      pathname.startsWith("/.well-known/")
    ) {
      return;
    }

    const apiBase = getPublicApiBase();
    if (!apiBase) return;

    const ua = req.headers.get("user-agent") || "";
    const body = JSON.stringify({
      path: pathname.length > 512 ? pathname.slice(0, 512) : pathname,
      method: req.method || "GET",
      userAgent: ua.length > 512 ? ua.slice(0, 512) : ua,
      source: isSuspectedScanPath(pathname) ? "middleware-scan" : "middleware",
    });

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    const cfIp = req.headers.get("cf-connecting-ip");
    const xff = req.headers.get("x-forwarded-for");
    const xReal = req.headers.get("x-real-ip");
    if (cfIp) headers["CF-Connecting-IP"] = cfIp;
    if (xff) headers["X-Forwarded-For"] = xff;
    if (xReal) headers["X-Real-IP"] = xReal;

    void fetch(`${apiBase}public/ip-track`, {
      method: "POST",
      headers,
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* never break the request */
  }
}
