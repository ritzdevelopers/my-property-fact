/**
 * Backend API origin for browser and Edge middleware.
 * Must be set at build time as NEXT_PUBLIC_API_URL (e.g. https://apis.mypropertyfact.in/api/v1/)
 *
 * Legacy: some deployments used https://apis.mypropertyfact.in/ (host root) without /api/v1/.
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
