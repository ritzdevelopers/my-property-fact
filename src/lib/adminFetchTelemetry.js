import { getAdminTelemetryHeaders } from "@/lib/adminTelemetry";

let installDepth = 0;
let originalFetch = null;

function shouldAttachAdminTelemetry(url) {
  return typeof url === "string" && url.includes("/api/v1/admin");
}

/**
 * Wraps window.fetch so same-origin admin API calls include dwell telemetry headers.
 */
export function installAdminFetchTelemetry() {
  if (typeof window === "undefined") {
    return () => {};
  }

  if (installDepth === 0) {
    originalFetch = window.fetch.bind(window);
    window.fetch = (input, init = {}) => {
      const url = typeof input === "string" ? input : input?.url;
      if (shouldAttachAdminTelemetry(url)) {
        const nextInit = { ...init };
        const h = new Headers(init.headers || {});
        Object.entries(getAdminTelemetryHeaders()).forEach(([k, v]) => {
          h.set(k, v);
        });
        nextInit.headers = h;
        return originalFetch(input, nextInit);
      }
      return originalFetch(input, init);
    };
  }

  installDepth += 1;
  return () => {
    installDepth -= 1;
    if (installDepth <= 0 && originalFetch) {
      window.fetch = originalFetch;
      originalFetch = null;
      installDepth = 0;
    }
  };
}
