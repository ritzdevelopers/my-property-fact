/** Permanent header city pick. Survives refreshes and later visits in the same browser profile. */
export const HEADER_CHOSEN_CITY_KEY = "mpf_header_chosen_city";
/** Same-tab / same-session GPS city only. */
export const HEADER_SESSION_CITY_KEY = "mpf_header_city";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365 * 10;

export function isSpecificHeaderCity(cityName) {
  const n = String(cityName || "").trim().toLowerCase();
  return Boolean(n) && n !== "ncr" && n !== "delhi ncr" && !n.includes("delhi ncr");
}

function readCookie(name) {
  if (typeof document === "undefined") return "";
  const parts = String(document.cookie || "").split(";");
  for (const part of parts) {
    const [rawKey, ...rest] = part.split("=");
    if (String(rawKey || "").trim() !== name) continue;
    try {
      return decodeURIComponent(rest.join("=").trim());
    } catch {
      return rest.join("=").trim();
    }
  }
  return "";
}

function writeCookie(name, value) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${COOKIE_MAX_AGE_SEC}; Path=/; SameSite=Lax`;
}

function clearCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export function readChosenHeaderCity() {
  if (typeof window === "undefined") return "";
  try {
    const fromStorage = String(
      window.localStorage.getItem(HEADER_CHOSEN_CITY_KEY) || "",
    ).trim();
    if (isSpecificHeaderCity(fromStorage)) return fromStorage;
  } catch {
    /* private mode */
  }
  const fromCookie = String(readCookie(HEADER_CHOSEN_CITY_KEY) || "").trim();
  return isSpecificHeaderCity(fromCookie) ? fromCookie : "";
}

export function writeChosenHeaderCity(cityName) {
  const next = String(cityName || "").trim();
  if (!isSpecificHeaderCity(next)) {
    clearChosenHeaderCity();
    return;
  }
  try {
    window.localStorage.setItem(HEADER_CHOSEN_CITY_KEY, next);
    window.localStorage.removeItem(HEADER_SESSION_CITY_KEY);
  } catch {
    /* private mode / quota */
  }
  writeCookie(HEADER_CHOSEN_CITY_KEY, next);
}

export function clearChosenHeaderCity() {
  try {
    window.localStorage.removeItem(HEADER_CHOSEN_CITY_KEY);
    window.localStorage.removeItem(HEADER_SESSION_CITY_KEY);
  } catch {
    /* ignore */
  }
  clearCookie(HEADER_CHOSEN_CITY_KEY);
}

export function readSessionHeaderCity() {
  if (typeof window === "undefined") return "";
  try {
    const saved = String(
      window.sessionStorage.getItem(HEADER_SESSION_CITY_KEY) || "",
    ).trim();
    return isSpecificHeaderCity(saved) ? saved : "";
  } catch {
    return "";
  }
}

export function writeSessionHeaderCity(cityName) {
  const next = String(cityName || "").trim();
  try {
    if (isSpecificHeaderCity(next)) {
      window.sessionStorage.setItem(HEADER_SESSION_CITY_KEY, next);
    } else {
      window.sessionStorage.removeItem(HEADER_SESSION_CITY_KEY);
    }
  } catch {
    /* ignore */
  }
}
