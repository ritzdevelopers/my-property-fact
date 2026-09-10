import { NextResponse } from "next/server";
import { lookupIpGeo, resolveClientIp } from "@/lib/ipGeoProviders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** City-level IP geolocation via official ipwho.is / ipapi.co only. */
export async function GET(request) {
  try {
    const ip = resolveClientIp(request);
    const geo = await lookupIpGeo(ip);
    const city = String(geo?.city || "").trim();

    if (!city) {
      return NextResponse.json({
        success: false,
        city: "",
        region: "",
        source: "ip",
        provider: "",
      });
    }

    return NextResponse.json({
      success: true,
      city,
      region: geo.region || "",
      country: geo.country || "",
      source: "ip",
      provider: geo.provider || "",
    });
  } catch (error) {
    console.error("ip-city:", error);
    return NextResponse.json(
      { success: false, city: "", region: "", source: "ip", provider: "" },
      { status: 500 },
    );
  }
}
