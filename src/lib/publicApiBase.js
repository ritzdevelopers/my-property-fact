/**
 * Backend API origin for browser and Edge middleware.
 * Must be set at build time as NEXT_PUBLIC_API_URL (e.g. https://api.example.com/api/v1/)
 */
export function getPublicApiBase() {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (raw == null || String(raw).trim() === "") {
    return "";
  }
  return String(raw).trim().replace(/\/?$/, "/");
}
