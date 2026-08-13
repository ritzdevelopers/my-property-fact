/**
 * Client-side lead intelligence tracker for MPF website.
 * Captures UTM, device, session, journey, and geo data for CRM enrichment.
 */

const STORAGE = {
  visitor: "mpf_visitor_id",
  session: "mpf_session_id",
  sessionStart: "mpf_session_start",
  utm: "mpf_utm_first_touch",
  journey: "mpf_lead_journey",
  geo: "mpf_lead_geo",
  gps: "mpf_gps_location",
  pages: "mpf_pages_visited",
  entryPage: "mpf_entry_page",
} as const;

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export interface LeadJourneyEvent {
  time: string;
  action: string;
  page?: string;
  detail?: string;
}

export interface LeadMetadataPayload {
  utm: Record<string, string | null>;
  device: Record<string, string | boolean | null>;
  geo: Record<string, string | number | null>;
  journey: LeadJourneyEvent[];
  session: Record<string, string | number | boolean | null>;
  analytics: Record<string, number | null>;
  property?: Record<string, string | null>;
}

export interface GpsLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  captured_at: string;
}

let gpsInFlight: Promise<GpsLocation | null> | null = null;
let locationWarmupAttached = false;

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function safeSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function uuid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

function readJson<T>(key: string, fallback: T): T {
  const ls = safeStorage();
  if (!ls) return fallback;
  try {
    const raw = ls.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  const ls = safeStorage();
  if (!ls) return;
  try {
    ls.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded */
  }
}

function captureUtmFromUrl(): Record<string, string | null> {
  if (typeof window === "undefined") {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
      gclid: null,
      fbclid: null,
      msclkid: null,
      referrer: null,
      landing_page: null,
      exit_page: null,
    };
  }

  const q = new URLSearchParams(window.location.search);
  return {
    utm_source: q.get("utm_source"),
    utm_medium: q.get("utm_medium"),
    utm_campaign: q.get("utm_campaign"),
    utm_term: q.get("utm_term") ?? q.get("utm_keyword"),
    utm_content: q.get("utm_content"),
    gclid: q.get("gclid"),
    fbclid: q.get("fbclid"),
    msclkid: q.get("msclkid"),
    referrer: typeof document !== "undefined" ? document.referrer || null : null,
    landing_page: `${window.location.host}${window.location.pathname}`,
    exit_page: `${window.location.host}${window.location.pathname}`,
  };
}

function persistFirstTouchUtm() {
  const existing = readJson<Record<string, string | null> | null>(STORAGE.utm, null);
  if (existing) return existing;

  const utm = captureUtmFromUrl();
  const hasUtm = Object.entries(utm).some(
    ([k, v]) => v && !["referrer", "landing_page", "exit_page"].includes(k),
  );
  if (hasUtm || utm.referrer) {
    writeJson(STORAGE.utm, utm);
    return utm;
  }
  writeJson(STORAGE.utm, utm);
  return utm;
}

function ensureVisitorSession() {
  const ls = safeStorage();
  const ss = safeSessionStorage();
  if (!ls || !ss) return { visitorId: null, sessionId: null, isNewSession: false };

  let visitorId = ls.getItem(STORAGE.visitor);
  if (!visitorId) {
    visitorId = uuid();
    ls.setItem(STORAGE.visitor, visitorId);
  }

  const now = Date.now();
  const sessionStart = Number(ss.getItem(STORAGE.sessionStart) || 0);
  let sessionId = ss.getItem(STORAGE.session);
  let isNewSession = false;

  if (!sessionId || now - sessionStart > SESSION_TIMEOUT_MS) {
    sessionId = uuid();
    ss.setItem(STORAGE.session, sessionId);
    ss.setItem(STORAGE.sessionStart, String(now));
    isNewSession = true;
  }

  return { visitorId, sessionId, isNewSession };
}

function parseUserAgent(ua: string) {
  const lower = ua.toLowerCase();
  let deviceType: "Desktop" | "Mobile" | "Tablet" | "Bot" = "Desktop";
  if (/bot|crawl|spider|slurp|mediapartners/i.test(ua)) deviceType = "Bot";
  else if (/ipad|tablet|playbook|silk/i.test(ua)) deviceType = "Tablet";
  else if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua)) deviceType = "Mobile";

  let browser = "Unknown";
  let browserVersion = "";
  if (/edg\//i.test(ua)) {
    browser = "Edge";
    browserVersion = ua.match(/Edg\/([\d.]+)/i)?.[1] ?? "";
  } else if (/chrome/i.test(ua) && !/chromium/i.test(ua)) {
    browser = "Chrome";
    browserVersion = ua.match(/Chrome\/([\d.]+)/i)?.[1] ?? "";
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    browser = "Safari";
    browserVersion = ua.match(/Version\/([\d.]+)/i)?.[1] ?? "";
  } else if (/firefox/i.test(ua)) {
    browser = "Firefox";
    browserVersion = ua.match(/Firefox\/([\d.]+)/i)?.[1] ?? "";
  }

  let os = "Unknown";
  if (/windows nt 10/i.test(ua)) os = "Windows 11";
  else if (/windows/i.test(ua)) os = "Windows";
  else if (/mac os x/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { browser, browserVersion, os, deviceType, lower };
}

function getDeviceInfo() {
  if (typeof navigator === "undefined") {
    return {
      ip_address: null,
      ip_version: null,
      browser: null,
      browser_version: null,
      os: null,
      device_type: null,
      device_brand: null,
      device_model: null,
      screen_resolution: null,
      language: null,
      timezone: null,
      cookies_enabled: null,
      js_enabled: true,
    };
  }

  const ua = navigator.userAgent;
  const parsed = parseUserAgent(ua);
  const screen = typeof window !== "undefined" ? `${window.screen.width}x${window.screen.height}` : null;

  return {
    ip_address: null as string | null,
    ip_version: null as string | null,
    browser: parsed.browser,
    browser_version: parsed.browserVersion || null,
    os: parsed.os,
    device_type: parsed.deviceType,
    device_brand: /iphone|ipad/i.test(ua) ? "Apple" : /android/i.test(ua) ? "Android" : null,
    device_model: null,
    screen_resolution: screen,
    language: navigator.language || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    cookies_enabled: navigator.cookieEnabled,
    js_enabled: true,
  };
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchGeo(): Promise<Record<string, string | number | null>> {
  const cached = readJson<Record<string, string | number | null> | null>(STORAGE.geo, null);
  if (cached?.city) return cached;

  try {
    const res = await fetchWithTimeout("https://ipapi.co/json/", 4000);
    if (!res.ok) throw new Error("geo failed");
    const data = (await res.json()) as Record<string, unknown>;
    const geo = {
      country: (data.country_name as string) ?? null,
      state: (data.region as string) ?? null,
      city: (data.city as string) ?? null,
      pincode: (data.postal as string) ?? null,
      latitude: typeof data.latitude === "number" ? data.latitude : null,
      longitude: typeof data.longitude === "number" ? data.longitude : null,
      isp: (data.org as string) ?? null,
      organization: (data.org as string) ?? null,
      asn: data.asn != null ? String(data.asn) : null,
      timezone: (data.timezone as string) ?? null,
      ip: (data.ip as string) ?? null,
    };
    writeJson(STORAGE.geo, geo);
    return geo;
  } catch {
    return {
      country: null,
      state: null,
      city: null,
      pincode: null,
      latitude: null,
      longitude: null,
      isp: null,
      organization: null,
      asn: null,
      timezone: null,
      ip: null,
    };
  }
}

function readCachedGps(): GpsLocation | null {
  return readJson<GpsLocation | null>(STORAGE.gps, null);
}

/** Request device GPS. Browser will show Allow/Block — cannot be skipped. */
export function requestLiveLocation(): Promise<GpsLocation | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  const cached = readCachedGps();
  if (cached) return Promise.resolve(cached);

  if (gpsInFlight) return gpsInFlight;

  gpsInFlight = new Promise<GpsLocation | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const gps: GpsLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          captured_at: new Date().toISOString(),
        };
        writeJson(STORAGE.gps, gps);
        resolve(gps);
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 600000 },
    );
  }).finally(() => {
    gpsInFlight = null;
  }) as Promise<GpsLocation | null>;

  return gpsInFlight;
}

/**
 * Prompt for location as early as possible (first click/touch/scroll, or when a form opens).
 * If the user clicks Allow once, future leads use cached GPS without asking again.
 */
export function warmUpLiveLocation() {
  void requestLiveLocation();
}

function attachLocationWarmupOnInteraction() {
  if (locationWarmupAttached || typeof window === "undefined") return;
  locationWarmupAttached = true;

  const trigger = () => {
    warmUpLiveLocation();
    window.removeEventListener("click", trigger, true);
    window.removeEventListener("touchstart", trigger, true);
    window.removeEventListener("scroll", trigger, { capture: true } as EventListenerOptions);
  };

  window.addEventListener("click", trigger, true);
  window.addEventListener("touchstart", trigger, true);
  window.addEventListener("scroll", trigger, { capture: true, passive: true });
}

async function resolveLiveLocation(maxWaitMs = 4000): Promise<GpsLocation | null> {
  const cached = readCachedGps();
  if (cached) return cached;

  warmUpLiveLocation();

  return Promise.race([
    requestLiveLocation(),
    new Promise<GpsLocation | null>((resolve) => setTimeout(() => resolve(readCachedGps()), maxWaitMs)),
  ]);
}

function mergeGeoWithGps(
  ipGeo: Record<string, string | number | null>,
  gps: GpsLocation | null,
): Record<string, string | number | null> {
  if (!gps) {
    return { ...ipGeo, location_type: "ip" };
  }

  return {
    ...ipGeo,
    latitude: gps.latitude,
    longitude: gps.longitude,
    location_type: "gps",
    accuracy_meters: Math.round(gps.accuracy),
    gps_captured_at: gps.captured_at,
    ip_city: ipGeo.city ?? null,
    ip_state: ipGeo.state ?? null,
  };
}

async function enrichGeoWithAddress(
  geo: Record<string, string | number | null>,
  userLocation?: string | null,
): Promise<Record<string, string | number | null>> {
  const trimmed = userLocation?.trim();
  if (trimmed) {
    return {
      ...geo,
      formatted_address: trimmed,
      user_provided_address: trimmed,
      address_source: "user",
    };
  }

  const lat = geo.latitude;
  const lon = geo.longitude;
  if (typeof lat !== "number" || typeof lon !== "number") return geo;

  try {
    const res = await fetchWithTimeout(
      `/api/lead/reverse-geocode?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`,
      5000,
    );
    if (!res.ok) return geo;

    const data = (await res.json()) as {
      success?: boolean;
      address?: Record<string, string | null>;
    };
    const addr = data.address;
    if (!addr?.formatted_address) return geo;

    return {
      ...geo,
      formatted_address: addr.formatted_address,
      street: addr.street ?? null,
      locality: addr.locality ?? null,
      area: addr.area ?? null,
      city: addr.city ?? geo.city ?? null,
      state: addr.state ?? geo.state ?? null,
      pincode: addr.pincode ?? geo.pincode ?? null,
      country: addr.country ?? geo.country ?? null,
      address_source: addr.source ?? "reverse_geocode",
    };
  } catch {
    return geo;
  }
}

export function trackLeadAction(action: string, detail?: string, page?: string) {
  const journey = readJson<LeadJourneyEvent[]>(STORAGE.journey, []);
  const currentPage =
    page ??
    (typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : undefined);

  journey.push({
    time: new Date().toISOString(),
    action,
    page: currentPage,
    detail,
  });

  if (journey.length > 50) journey.splice(0, journey.length - 50);
  writeJson(STORAGE.journey, journey);
}

export function trackPageView(pathname?: string, title?: string) {
  if (typeof window === "undefined") return;

  const path = pathname ?? window.location.pathname;
  const ls = safeStorage();
  const ss = safeSessionStorage();

  if (ls && !ls.getItem(STORAGE.entryPage)) {
    ls.setItem(STORAGE.entryPage, path);
  }

  const pages = Number(ls?.getItem(STORAGE.pages) ?? 0) + 1;
  ls?.setItem(STORAGE.pages, String(pages));

  const label = title || path;
  if (path === "/" || path === "") {
    trackLeadAction("Visited Homepage", undefined, path);
  } else if (path.includes("/blog")) {
    trackLeadAction("Visited Blog", label, path);
  } else if (
    path.includes("/projects") ||
    (!path.includes("/contact") && !path.includes("/admin") && path.split("/").filter(Boolean).length === 1)
  ) {
    trackLeadAction("Visited Property Page", label, path);
  } else {
    trackLeadAction("Visited Page", label, path);
  }

  const utm = readJson<Record<string, string | null>>(STORAGE.utm, captureUtmFromUrl());
  utm.exit_page = `${window.location.host}${path}`;
  writeJson(STORAGE.utm, utm);

  void ss; // session already managed in ensureVisitorSession
}

export function initLeadTracker() {
  if (typeof window === "undefined") return;

  persistFirstTouchUtm();
  ensureVisitorSession();
  attachLocationWarmupOnInteraction();

  document.addEventListener(
    "click",
    (e) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest("a, button, [data-lead-track]") as HTMLElement | null;
      if (!el) return;

      const trackAttr = el.getAttribute("data-lead-track");
      const href = el.getAttribute("href") ?? "";

      if (trackAttr === "brochure" || /brochure|download.*pdf|\.pdf/i.test(href)) {
        trackLeadAction("Downloaded Brochure", href || undefined);
      } else if (trackAttr === "gallery" || /gallery|lightbox/i.test(el.className)) {
        trackLeadAction("Viewed Gallery");
      } else if (
        trackAttr === "whatsapp" ||
        /wa\.me|api\.whatsapp|whatsapp/i.test(href) ||
        /whatsapp/i.test(el.textContent ?? "")
      ) {
        trackLeadAction("Opened WhatsApp", href || undefined);
      }
    },
    { capture: true },
  );
}

export async function getLeadMetadataForSubmit(extra?: {
  property?: Record<string, string | null>;
  whatsapp?: string | null;
  userLocation?: string | null;
}): Promise<LeadMetadataPayload> {
  const { visitorId, sessionId, isNewSession } = ensureVisitorSession();
  const utmStored = readJson<Record<string, string | null>>(STORAGE.utm, captureUtmFromUrl());
  const currentUtm = captureUtmFromUrl();
  const utm: Record<string, string | null> = { ...utmStored, exit_page: currentUtm.exit_page };

  trackLeadAction("Submitted Lead Form");

  const journey = readJson<LeadJourneyEvent[]>(STORAGE.journey, []);
  const device = getDeviceInfo();
  const [geoRaw, gps] = await Promise.all([fetchGeo(), resolveLiveLocation()]);
  const { ip, ...ipGeo } = geoRaw as typeof geoRaw & { ip?: string | null };
  let geo = mergeGeoWithGps(ipGeo, gps);
  geo = await enrichGeoWithAddress(geo, extra?.userLocation);
  if (ip) {
    device.ip_address = ip;
    device.ip_version = ip.includes(":") ? "IPv6" : "IPv4";
  }

  const ls = safeStorage();
  const ss = safeSessionStorage();
  const pagesVisited = Number(ls?.getItem(STORAGE.pages) ?? journey.length);
  const sessionStart = Number(ss?.getItem(STORAGE.sessionStart) ?? Date.now());
  const avgTimeSeconds = Math.max(0, Math.floor((Date.now() - sessionStart) / 1000));

  const numSessions = isNewSession
    ? Number(ls?.getItem("mpf_total_sessions") ?? 0) + 1
    : Number(ls?.getItem("mpf_total_sessions") ?? 1);
  if (isNewSession) ls?.setItem("mpf_total_sessions", String(numSessions));

  return {
    utm,
    device,
    geo,
    journey,
    session: {
      session_id: sessionId,
      visitor_id: visitorId,
      cookie_id: visitorId,
      local_storage_id: visitorId,
      num_sessions: numSessions,
      returning_visitor: numSessions > 1,
      pages_visited: pagesVisited,
      avg_time_seconds: avgTimeSeconds,
      bounce: pagesVisited <= 1,
      entry_page: ls?.getItem(STORAGE.entryPage) ?? utm.landing_page,
      exit_page: utm.exit_page,
    },
    analytics: {
      num_visits: pagesVisited,
      total_sessions: numSessions,
      avg_session_duration_seconds: avgTimeSeconds,
      conversion_time_seconds: avgTimeSeconds,
      repeat_visits: Math.max(0, numSessions - 1),
    },
    property: extra?.property,
  };
}

export async function buildEnquirySubmitData<T extends Record<string, unknown>>(
  base: T,
  extra?: {
    property?: Record<string, string | null>;
    whatsapp?: string | null;
    userLocation?: string | null;
  },
): Promise<T & { metadataJson: string; whatsapp?: string | null }> {
  try {
    const metadata = await getLeadMetadataForSubmit(extra);
    return {
      ...base,
      metadataJson: JSON.stringify(metadata),
      ...(extra?.whatsapp ? { whatsapp: extra.whatsapp } : {}),
    };
  } catch (err) {
    console.warn("Lead tracking failed, submitting without full metadata:", err);
    return {
      ...base,
      metadataJson: JSON.stringify({
        utm: captureUtmFromUrl(),
        journey: readJson<LeadJourneyEvent[]>(STORAGE.journey, []),
        property: extra?.property,
      }),
      ...(extra?.whatsapp ? { whatsapp: extra.whatsapp } : {}),
    };
  }
}
