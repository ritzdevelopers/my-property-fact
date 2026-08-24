import Cookies from "js-cookie";

const TOKEN_COOKIE_KEYS = ["token", "accessToken"];

/**
 * JWT returned by app/auth (phone OTP, email OTP, Google).
 * Stored in a first-party cookie on the frontend host — not on the API host.
 */
export function extractAccessToken(payload) {
  if (!payload || typeof payload !== "object") return "";
  const nested = payload.data && typeof payload.data === "object" ? payload.data : null;
  const raw =
    payload.token ||
    payload.accessToken ||
    payload.access_token ||
    payload.jwt ||
    nested?.token ||
    nested?.accessToken ||
    "";
  return typeof raw === "string" ? raw.trim() : "";
}

export function getAccessToken() {
  if (typeof window === "undefined") return "";
  for (const key of TOKEN_COOKIE_KEYS) {
    const value = Cookies.get(key);
    if (value && String(value).trim()) return String(value).trim();
  }
  return "";
}

export function isMpfBackendUrl(url) {
  if (!url) return false;
  const value = String(url);
  if (value.startsWith("/api/v1/") || value.includes("/api/v1/")) return true;

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
  if (apiBase && value.startsWith(apiBase)) return true;

  return /apis\.mypropertyfact\.in/i.test(value) || /localhost:8005/i.test(value);
}

export function authorizationHeaders(extra = {}, token = getAccessToken()) {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}
