/** City lookup: GPS first, then official IP providers via /api/home/ip-city. */

async function readJson(url) {
  const res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function cityFromPayload(data) {
  const city = String(data?.city || "").trim();
  return city || "";
}

export async function resolveIpCity() {
  try {
    const data = await readJson("/api/home/ip-city");
    return cityFromPayload(data);
  } catch {
    return "";
  }
}

function readBrowserCoords() {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.reject(new Error("geolocation unavailable"));
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      reject,
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60_000,
      },
    );
  });
}

export async function resolveCityFromCoords(coords) {
  const lat = coords?.latitude;
  const lon = coords?.longitude;
  if (lat == null || lon == null) return "";
  const q = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    intent: "projects",
  });
  const data = await readJson(`/api/home/recommended-by-location?${q}`);
  return cityFromPayload(data?.region);
}

/**
 * Prefer the device GPS city (Noida vs Gurugram). IP is only a fallback —
 * NCR ISPs often geolocate Noida devices as Gurugram/Delhi.
 */
export async function resolveDeviceCity() {
  try {
    const coords = await readBrowserCoords();
    const gpsCity = await resolveCityFromCoords(coords);
    if (gpsCity) return { city: gpsCity, source: "gps" };
  } catch {
    /* permission denied, timeout, or unsupported */
  }

  const ipCity = await resolveIpCity();
  return { city: ipCity, source: "ip" };
}
