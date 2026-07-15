const STORAGE_KEY = "mpf-listing-scroll-v1";
const MAX_AGE_MS = 30 * 60 * 1000;

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
