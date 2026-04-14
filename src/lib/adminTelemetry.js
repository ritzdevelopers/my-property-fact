import { getPublicApiBase } from "@/lib/publicApiBase";

const HEADER_PAGE = "X-MPF-Admin-Page";
const HEADER_DWELL = "X-MPF-Dwell-Ms";
const DWELL_CAP_MS = 86_400_000;

let adminPathname = "";
let adminPathEnteredAt = Date.now();

/**
 * Call when the admin dashboard route changes (see AdminTelemetryMount).
 */
export function setAdminTelemetryPath(pathname) {
  adminPathname = typeof pathname === "string" ? pathname : "";
  adminPathEnteredAt = Date.now();
}

/**
 * True when this URL should receive admin-shell telemetry headers (audit log task + page context).
 * Includes {@code /api/v1/admin/*} and same-origin {@code NEXT_PUBLIC_API_URL} calls from the dashboard.
 */
export function shouldSendAdminTelemetryForUrl(url) {
  if (typeof url !== "string" || !url) return false;
  if (url.includes("/api/v1/admin")) return true;
  const base = getPublicApiBase();
  if (!base) return false;
  const normalized = base.replace(/\/?$/, "");
  return url.startsWith(`${normalized}/`) || url === normalized;
}

/**
 * Headers sent with admin API calls so audit logs can record dwell time on the current page.
 */
export function getAdminTelemetryHeaders() {
  const dwell = Math.min(DWELL_CAP_MS, Math.max(0, Date.now() - adminPathEnteredAt));
  const page = adminPathname.length > 512 ? adminPathname.slice(0, 512) : adminPathname;
  return {
    [HEADER_PAGE]: page,
    [HEADER_DWELL]: String(Math.floor(dwell)),
  };
}
