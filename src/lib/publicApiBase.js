/**
 * Backend API origin for browser and Edge middleware.
 * Must be set at build time as NEXT_PUBLIC_API_URL (e.g. https://apis.mypropertyfact.in/api/v1/)
 *
 * Legacy: some deployments used https://apis.mypropertyfact.in/ (host root), which produced
 * wrong URLs like .../web-story/{slug} instead of .../api/v1/web-story/{slug}.
 */
function normalizePublicApiUrl(raw) {
  if (raw == null || String(raw).trim() === "") {
    return raw;
  }
  const trimmed = String(raw).trim();
  const withoutTrailingSlashes = trimmed.replace(/\/+$/, "");
  if (/^https?:\/\/apis\.mypropertyfact\.in$/i.test(withoutTrailingSlashes)) {
    return `${withoutTrailingSlashes}/api/v1/`;
  }
  return trimmed.replace(/\/?$/, "/");
}

export function getPublicApiBase() {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (raw == null || String(raw).trim() === "") {
    return "";
  }
  return normalizePublicApiUrl(raw);
}

/** Public AMP/web-story document URL on the API host (includes /api/v1/). */
export function getWebStoryApiUrl(categorySlug) {
  const slug = String(categorySlug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  return `${getPublicApiBase()}web-story/${slug}`;
}
