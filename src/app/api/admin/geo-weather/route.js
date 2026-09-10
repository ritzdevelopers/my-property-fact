import { NextResponse } from "next/server";
import { lookupIpGeo, resolveClientIp } from "@/lib/ipGeoProviders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function reverseGeocode(lat, lon) {
  try {
    const url =
      `https://api.bigdatacloud.net/data/reverse-geocode-client` +
      `?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      city: data.city || data.locality || data.principalSubdivision || "",
      region: data.principalSubdivision || "",
      country: data.countryName || "",
      countryCode: data.countryCode || "",
      timezone: data.localityInfo?.informative?.find?.(() => false)?.name || "",
    };
  } catch {
    return null;
  }
}

async function fetchWeather(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}` +
    `&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility,precipitation,rain,showers,is_day` +
    `&timezone=auto`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const wx = await res.json();
  const cur = wx?.current;
  if (!cur) return null;

  const precipitation = Number(cur.precipitation) || 0;
  const rain = Number(cur.rain) || 0;
  const showers = Number(cur.showers) || 0;
  const precipMm = Math.max(precipitation, rain, showers);

  return {
    temp: cur.temperature_2m,
    feelsLike: cur.apparent_temperature,
    humidity: cur.relative_humidity_2m,
    wind: cur.wind_speed_10m,
    visibility:
      cur.visibility != null ? Math.round(cur.visibility / 1000) : null,
    code: cur.weather_code,
    precipitation: precipMm,
    isDay: cur.is_day === 1,
    observedAt: cur.time || null,
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gpsLat = searchParams.get("lat");
    const gpsLon = searchParams.get("lon");

    const ip = resolveClientIp(request);
    const ipGeo = await lookupIpGeo(ip);

    let geo = ipGeo
      ? { ...ipGeo }
      : {
          ip: ip || "Unknown",
          city: "",
          region: "",
          country: "",
          countryCode: "",
          isp: "",
          timezone: "",
          lat: null,
          lon: null,
          source: "unknown",
        };

    // Prefer browser GPS when provided — more accurate than IP city
    if (gpsLat != null && gpsLon != null) {
      const lat = Number(gpsLat);
      const lon = Number(gpsLon);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        const place = await reverseGeocode(lat, lon);
        geo = {
          ...geo,
          lat,
          lon,
          city: place?.city || geo.city,
          region: place?.region || geo.region,
          country: place?.country || geo.country,
          countryCode: place?.countryCode || geo.countryCode,
          source: "gps",
        };
      }
    }

    let weather = null;
    if (geo.lat != null && geo.lon != null) {
      weather = await fetchWeather(geo.lat, geo.lon);
    }

    return NextResponse.json(
      {
        success: true,
        geo,
        weather,
        fetchedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      },
    );
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e.message || "Failed to resolve location" },
      { status: 500 },
    );
  }
}
