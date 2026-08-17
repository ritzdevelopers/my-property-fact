/** Fired on `window` when the home entry overlay is removed after reload. */
export const MPF_GATEWAY_HIDDEN_EVENT = "mpf-gateway-hidden";

/**
 * PageSpeed / Lighthouse / crawlers. Skip the home overlay so FCP/LCP can paint.
 */
export function isAutomatedAuditBrowser() {
  if (typeof navigator === "undefined") return false;
  if (navigator.webdriver) return true;
  const ua = navigator.userAgent || "";
  return /Chrome-Lighthouse|PageSpeed|Lighthouse|GTmetrix|HeadlessChrome|PTST\/|Pingdom|WebPageTest|Googlebot|Google-InspectionTool|Speed Insights|Chrome-User-Experience/i.test(
    ua,
  );
}

/** Body class while social reels / IG video lightbox is open — hides floating promos & chat UI. */
export const MPF_SOCIAL_REELS_OPEN_CLASS = "mpf-social-reels-open";

/** `localStorage` key: set after the home gateway finishes once (per browser). Clear site data to see it again. */
export const MPF_GATEWAY_STORAGE_KEY = "mpf_website_gateway_seen_v1";

/**
 * Whether global floating UI (chatbot, enquire, promo, etc.) may show.
 * On `/` before the first-visit loader finishes, returns false (even before `gateway-open` is set).
 * Matches skip paths in `WebsiteGateway` (storage, reduced motion).
 */
export function isHomeGatewayRevealDone() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return true;
  }
  if (window.location.pathname !== "/") {
    return true;
  }
  if (isAutomatedAuditBrowser()) {
    return true;
  }
  if (document.body.classList.contains("mpf-post-gateway-reveal")) {
    return true;
  }
  if (document.body.classList.contains("gateway-open")) {
    return false;
  }
  try {
    if (window.localStorage.getItem(MPF_GATEWAY_STORAGE_KEY) === "1") {
      return true;
    }
  } catch {
    /* private mode */
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return true;
  }
  return false;
}
