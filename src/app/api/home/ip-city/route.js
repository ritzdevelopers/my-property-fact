import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isPrivateIp(ip) {
  if (!ip) return true;
  const v = ip.replace(/^::ffff:/, "");
  if (v === "::1" || v === "127.0.0.1" || v === "localhost") return true;
  if (v.startsWith("10.")) return true;
  if (v.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(v)) return true;
  return false;
}

function clientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first && !isPrivateIp(first)) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp && !isPrivateIp(realIp.trim())) return realIp.trim();
  // Localhost / private IP → let provider detect the egress public IP
  return null;
}

async function lookupIpCity(ip) {
  const urls = [
    ip ? `https://ipwho.is/${encodeURIComponent(ip)}` : "https://ipwho.is/",
    "https://ipapi.co/json/",
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) continue;
      const data = await res.json();

      if (url.includes("ipwho.is") && data?.success !== false) {
        const city = String(data.city || "").trim();
        if (!city) continue;
        return {
          city,
          region: String(data.region || data.region_code || "").trim(),
          country: String(data.country || "").trim(),
        };
      }

      if (url.includes("ipapi.co") && !data?.error) {
        const city = String(data.city || "").trim();
        if (!city) continue;
        return {
          city,
          region: String(data.region || "").trim(),
          country: String(data.country_name || "").trim(),
        };
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

/** City-level IP geolocation only — never returns lat/lon for client use. */
export async function GET(request) {
  try {
    const ip = clientIp(request);
    const geo = await lookupIpCity(ip);
    const city = String(geo?.city || "").trim();

    if (!city) {
      return NextResponse.json({
        success: false,
        city: "",
        region: "",
        source: "ip",
      });
    }

    return NextResponse.json({
      success: true,
      city,
      region: geo.region || "",
      country: geo.country || "",
      source: "ip",
    });
  } catch (error) {
    console.error("ip-city:", error);
    return NextResponse.json(
      { success: false, city: "", region: "", source: "ip" },
      { status: 500 },
    );
  }
}
