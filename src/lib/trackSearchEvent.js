import { getPublicApiBase } from "@/lib/publicApiBase";

function clientSessionIdForSearch() {
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

/**
 * Fire-and-forget public search analytics ping.
 * @param {{ query: string, searchType?: 'property'|'blog'|'keyword', targetRef?: string, targetLabel?: string, resultCount?: number, sourcePath?: string }} payload
 */
export function trackSearchEvent(payload) {
  if (typeof window === "undefined") return;
  const query = String(payload?.query || "").trim();
  if (query.length < 2) return;

  const base = getPublicApiBase();
  if (!base) return;

  const body = JSON.stringify({
    query,
    searchType: payload.searchType || "keyword",
    targetRef: payload.targetRef || undefined,
    targetLabel: payload.targetLabel || undefined,
    resultCount:
      typeof payload.resultCount === "number" ? payload.resultCount : undefined,
    sourcePath:
      payload.sourcePath ||
      (typeof window !== "undefined" ? window.location?.pathname : undefined),
    clientSessionId: clientSessionIdForSearch() || undefined,
  });

  const url = `${base}public/search-event`;
  const opts = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  };

  try {
    void fetch(url, opts).catch(() => {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
      }
    });
  } catch {
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
      }
    } catch {
      /* ignore */
    }
  }
}
