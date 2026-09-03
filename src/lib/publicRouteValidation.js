/**
 * Public URL validation — catches typos of static pages (e.g. /about-ussdnm)
 * before they hit the root `[slug]` catch-all and crash or render incorrectly.
 */

/** Exact public pages (no trailing slash). */
export const PUBLIC_STATIC_EXACT = new Set([
  "/",
  "/about-us",
  "/contact-us",
  "/join-our-team",
  "/projects",
  "/blog",
  "/emi-calculator",
  "/market-analysis",
  "/property-rate-and-trend",
  "/locate-score",
  "/privacy-policy",
  "/properties",
  "/clients-speak",
  "/dashboard",
]);

/** First path segment of static or reserved routes — used to detect typos. */
export const PUBLIC_STATIC_SEGMENTS = [
  "about-us",
  "contact-us",
  "join-our-team",
  "projects",
  "blog",
  "emi-calculator",
  "market-analysis",
  "property-rate-and-trend",
  "locate-score",
  "privacy-policy",
  "properties",
  "clients-speak",
  "dashboard",
  "city",
  "builder",
  "detail",
];

/** Known multi-segment route prefixes (first segment). */
export const PUBLIC_KNOWN_PREFIXES = new Set([
  "city",
  "builder",
  "blog",
  "projects",
  "properties",
  "property-rate-and-trend",
  "detail",
  "landing-pages",
  "admin",
  "portal",
  "components",
  "lavidabella",
  "subh-anandam",
  "api",
  "Eldeco-terra&sol",
  "eldeco-terra%26sol",
  "eldeco-echoes-of-eden",
]);

const CITY_HUB_PREFIXES = [
  "apartments-in-",
  "flats-in-",
  "new-projects-in-",
  "commercial-property-in-",
  "offices-and-shop-in-",
];

const SKIP_PATH_PREFIXES = [
  "/_next",
  "/api",
  "/static",
  "/favicon",
];

const SKIP_PATH_EXTENSIONS = /\.(svg|png|jpe?g|gif|webp|ico|css|js|woff2?|txt|xml|json|map)$/i;

export const NOT_FOUND_TRIGGER_PATH = "/not-found-trigger";

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

/**
 * True when segment is a static route + glued junk (e.g. about-us2, about-ussdnm, city2).
 * Does NOT treat hyphen-continued slugs as typos (e.g. city-towers is a valid project slug).
 */
export function isStaticSegmentTypo(segment) {
  if (!segment || typeof segment !== "string") return false;
  const s = segment.toLowerCase();
  for (const base of PUBLIC_STATIC_SEGMENTS) {
    if (s === base || !s.startsWith(base)) continue;
    const next = s.charAt(base.length);
    // New hyphen-delimited word → project/listing slug, not a typo of the static route.
    if (next === "-") continue;
    return true;
  }
  return false;
}

const CITY_HUB_BASES = [
  "apartments",
  "flats",
  "new-projects",
  "commercial-property",
  "offices-and-shop",
];

/**
 * Typos like `flats2-in-gurugram` (should be `flats-in-gurugram`).
 */
export function isInvalidCityHubTypo(slug) {
  if (!slug || typeof slug !== "string" || !slug.includes("-in-")) return false;
  const lower = slug.toLowerCase();
  const inIdx = lower.indexOf("-in-");
  const before = lower.slice(0, inIdx);
  if (!before) return false;

  for (const base of CITY_HUB_BASES) {
    if (!before.startsWith(base) || before === base) continue;
    if (before.startsWith(`${base}-`)) continue;
    return true;
  }
  return false;
}

/** Typo of a root static page slug handled by `(projects)/[slug]`. */
export function isStaticRootSlugTypo(slug) {
  if (!slug || typeof slug !== "string") return false;
  return isStaticSegmentTypo(slug) || isInvalidCityHubTypo(slug);
}

function looksLikeListingSlug(slug) {
  const lower = String(slug).toLowerCase();
  if (CITY_HUB_PREFIXES.some((p) => lower.startsWith(p))) return true;
  if (lower.includes("-in-")) return true;
  return false;
}

/** Slug shapes that may be valid on `(projects)/[slug]` (project or listing URL). */
export function mayBeValidRootCatchAllSlug(slug) {
  if (!slug || typeof slug !== "string") return false;
  if (isStaticRootSlugTypo(slug)) return false;
  const lower = slug.trim().toLowerCase();
  if (!lower || lower.includes("/")) return false;
  if (looksLikeListingSlug(lower)) return true;
  if (/^[a-z0-9]+(-[a-z0-9]+)*$/.test(lower)) return true;
  return false;
}

/**
 * Middleware-safe check: paths that should never reach a page handler.
 * Returns true → rewrite to not-found-trigger.
 */
export function isDefinitelyInvalidPublicPath(pathname) {
  const path = normalizePath(pathname);

  if (path === NOT_FOUND_TRIGGER_PATH) return false;

  for (const prefix of SKIP_PATH_PREFIXES) {
    if (path.startsWith(prefix)) return false;
  }
  if (SKIP_PATH_EXTENSIONS.test(path)) return false;

  if (PUBLIC_STATIC_EXACT.has(path)) return false;

  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return false;

  if (segments.length === 1) {
    return isStaticSegmentTypo(segments[0]) || isInvalidCityHubTypo(segments[0]);
  }

  const [first] = segments;

  if (isStaticSegmentTypo(first)) return true;

  if (segments.length === 2) {
    const prefix = first.toLowerCase();
    if (!PUBLIC_KNOWN_PREFIXES.has(prefix) && !PUBLIC_KNOWN_PREFIXES.has(first)) {
      return true;
    }
    return false;
  }

  if (segments.length >= 3) {
    const prefix = first.toLowerCase();
    if (prefix === "landing-pages") return false;
    if (prefix === "admin" || prefix === "portal") return false;
    if (prefix === "components") return false;
    if (first === "Eldeco-terra&sol" || first.toLowerCase() === "eldeco-terra%26sol") return false;
    if (prefix === "subh-anandam" || prefix === "lavidabella") return false;
    if (prefix === "eldeco-echoes-of-eden") return false;
    if (prefix === "api") return false;
    return true;
  }

  return false;
}
