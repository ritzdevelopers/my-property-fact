/**
 * Official IP-geolocation providers used by My Property Fact.
 * Only these HTTPS endpoints are allowed. Do not add unofficial mirrors.
 *
 * 1. ipwho.is  — https://ipwho.is/           (primary)
 * 2. ipapi.co  — https://ipapi.co/{ip}/json/ (fallback)
 *
 * Not used: ip-api.com (HTTP-only on the free tier; different company from ipapi.co).
 */

export const IP_GEO_PROVIDERS = [
  {
    id: "ipwho.is",
    name: "ipwho.is",
    official: "https://ipwho.is/",
    urlFor: (ip) =>
      ip ? `https://ipwho.is/${encodeURIComponent(ip)}` : "https://ipwho.is/",
  },
  {
    id: "ipapi.co",
    name: "ipapi.co",
    official: "https://ipapi.co/json/",
    urlFor: (ip) =>
      ip
        ? `https://ipapi.co/${encodeURIComponent(ip)}/json/`
        : "https://ipapi.co/json/",
  },
];

function isPrivateIp(ip) {
  if (!ip) return true;
  const v = String(ip).replace(/^::ffff:/, "").trim();
  if (!v || v === "::1" || v === "127.0.0.1" || v === "localhost") return true;
  if (v.startsWith("10.")) return true;
  if (v.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(v)) return true;
  return false;
}

function firstPublicIp(raw) {
  if (!raw) return "";
  for (const part of String(raw).split(",")) {
    const ip = part.trim();
    if (ip && !isPrivateIp(ip)) return ip;
  }
  return "";
}

/** Visitor public IP from genuine proxy headers (Cloudflare / Vercel / nginx). */
export function resolveClientIp(request) {
  if (!request?.headers) return "";
  const headers = request.headers;
  const candidates = [
    headers.get("cf-connecting-ip"),
    headers.get("x-vercel-forwarded-for"),
    headers.get("x-real-ip"),
    headers.get("x-forwarded-for"),
    headers.get("true-client-ip"),
  ];
  for (const value of candidates) {
    const ip = firstPublicIp(value);
    if (ip) return ip;
  }
  return "";
}

export async function lookupIpGeo(ip) {
  for (const provider of IP_GEO_PROVIDERS) {
    try {
      const res = await fetch(provider.urlFor(ip), {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) continue;
      const data = await res.json();
      const parsed =
        provider.id === "ipwho.is"
          ? parseIpWho(data)
          : parseIpApiCo(data);
      if (parsed?.city) {
        return { ...parsed, provider: provider.id };
      }
    } catch {
      /* try next official provider */
    }
  }
  return null;
}

function parseIpWho(data) {
  if (!data || data.success === false) return null;
  const city = String(data.city || "").trim();
  if (!city) return null;
  return {
    ip: data.ip || "",
    city,
    region: String(data.region || data.region_code || "").trim(),
    country: String(data.country || "").trim(),
    countryCode: String(data.country_code || "").trim(),
    isp: data.connection?.isp || data.connection?.org || data.org || "",
    timezone: data.timezone?.id || data.timezone || "",
    lat: data.latitude,
    lon: data.longitude,
    source: "ip",
  };
}

function parseIpApiCo(data) {
  if (!data || data.error) return null;
  const city = String(data.city || "").trim();
  if (!city) return null;
  return {
    ip: data.ip || "",
    city,
    region: String(data.region || "").trim(),
    country: String(data.country_name || "").trim(),
    countryCode: String(data.country_code || "").trim(),
    isp: data.org || "",
    timezone: data.timezone || "",
    lat: data.latitude,
    lon: data.longitude,
    source: "ip",
  };
}
