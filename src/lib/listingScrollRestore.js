const STORAGE_KEY = "mpf-listing-scroll-v1";
const MAX_AGE_MS = 30 * 60 * 1000;

let footerNavScrollPending = false;
let footerNavScrollClearTimer = 0;

/**
 * Instantly jump to the top of the page.
 * Overrides `html { scroll-behavior: smooth }` so Next.js route changes
 * from the footer do not stay parked at the previous scroll offset.
 */
export function scrollWindowToTop() {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  const previousRoot = root.style.scrollBehavior;
  const previousBody = document.body?.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  if (document.body) document.body.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.scrollTop = 0;
  if (document.body) document.body.scrollTop = 0;
  root.style.scrollBehavior = previousRoot;
  if (document.body) document.body.style.scrollBehavior = previousBody;
}

/** Mark that the next route change came from a footer link. */
export function markFooterNavScrollTop() {
  footerNavScrollPending = true;
  scrollWindowToTop();
  if (typeof window === "undefined") return;
  if (footerNavScrollClearTimer) window.clearTimeout(footerNavScrollClearTimer);
  footerNavScrollClearTimer = window.setTimeout(() => {
    footerNavScrollPending = false;
    footerNavScrollClearTimer = 0;
  }, 2000);
}

export function isFooterNavScrollPending() {
  return footerNavScrollPending;
}

function readListingReturnState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.pathname) return null;
    if (Date.now() - (data.ts || 0) > MAX_AGE_MS) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Persist listing scroll so returning from a project detail restores position.
 * @param {{ pathname: string; search?: string; slug?: string; scrollY?: number; page?: number }} state
 */
export function saveListingReturnState(state) {
  if (typeof window === "undefined" || !state?.pathname) return;
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        pathname: state.pathname,
        search: state.search || "",
        slug: state.slug || "",
        scrollY: Number.isFinite(state.scrollY) ? state.scrollY : window.scrollY || 0,
        page: state.page > 0 ? state.page : 1,
        ts: Date.now(),
      }),
    );
  } catch {
    // ignore quota / private mode
  }
}

/** Peek saved listing return without clearing it (detail Back button). */
export function peekListingReturnState() {
  return readListingReturnState();
}

const ORIGIN_KEY = "mpf-listing-origin-v1";
const ORIGIN_MAX_AGE_MS = 30 * 60 * 1000;

/**
 * Remember the listing hub the user was on before opening a config/BHK page
 * (`/new-projects-in-delhi` → `/kiosk-in-delhi`).
 */
export function saveListingOriginPath(pathname) {
  if (typeof window === "undefined" || !pathname) return;
  try {
    sessionStorage.setItem(
      ORIGIN_KEY,
      JSON.stringify({ pathname: String(pathname), ts: Date.now() }),
    );
  } catch {
    // ignore quota / private mode
  }
}

export function peekListingOriginPath() {
  if (typeof window === "undefined") return "";
  try {
    const raw = sessionStorage.getItem(ORIGIN_KEY);
    if (!raw) return "";
    const data = JSON.parse(raw);
    if (!data?.pathname) return "";
    if (Date.now() - (data.ts || 0) > ORIGIN_MAX_AGE_MS) return "";
    return String(data.pathname);
  } catch {
    return "";
  }
}

export function consumeListingOriginPath() {
  const pathname = peekListingOriginPath();
  if (typeof window === "undefined") return pathname;
  try {
    sessionStorage.removeItem(ORIGIN_KEY);
  } catch {
    // ignore
  }
  return pathname;
}

/**
 * Read and clear a matching saved listing return state.
 * @param {string} pathname
 * @param {string} [search]
 */
export function consumeListingReturnState(pathname, search = "") {
  if (typeof window === "undefined" || !pathname) return null;
  try {
    const data = readListingReturnState();
    sessionStorage.removeItem(STORAGE_KEY);
    if (!data || data.pathname !== pathname) return null;
    if ((data.search || "") !== (search || "")) return null;
    return data;
  } catch {
    return null;
  }
}
