import { NextResponse } from "next/server";
import {
  buildMixedRecommendationsForRegion,
  buildSubtitleForRegion,
  fetchSpotlightDataForApi,
  normalizeProjectsArray,
  projectLatestTimestamp,
} from "@/app/(home)/components/home/recommendedSpotlight";

function parseCoord(value) {
  const n = Number.parseFloat(String(value ?? ""));
  return Number.isFinite(n) ? n : null;
}

async function reverseGeocodeCityState(lat, lon) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "en");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "MyPropertyFact/1.0 (https://mypropertyfact.com)",
    },
    next: { revalidate: 86_400 },
  });

  if (!res.ok) return null;
  const data = await res.json();
  const a = data?.address || {};
  const city =
    a.city ||
    a.town ||
    a.village ||
    a.suburb ||
    a.hamlet ||
    a.city_district ||
    a.county ||
    "";
  const state = a.state || "";

  return {
    city: typeof city === "string" ? city.trim() : "",
    state: typeof state === "string" ? state.trim() : "",
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseCoord(searchParams.get("lat"));
    const lon = parseCoord(searchParams.get("lon"));

    if (lat == null || lon == null || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json(
        { success: false, message: "Valid lat and lon are required" },
        { status: 400 },
      );
    }

    const region = await reverseGeocodeCityState(lat, lon);
    if (!region || (!region.city && !region.state)) {
      return NextResponse.json({
        success: false,
        message: "Could not resolve location",
        items: [],
      });
    }

    const { projects, latestPublicListings } = await fetchSpotlightDataForApi();
    const list = normalizeProjectsArray(projects);
    const projectsSortedLatest = [...list]
      .filter((p) => p?.slugURL && p?.projectName)
      .sort((a, b) => projectLatestTimestamp(b) - projectLatestTimestamp(a));
    const recommendedTop = projectsSortedLatest.slice(0, 8);
    const excludeSlugSet = new Set(recommendedTop.map((p) => p.slugURL));

    const items = buildMixedRecommendationsForRegion({
      projects,
      latestPublicListings,
      excludeSlugSet,
      geoCity: region.city,
      geoState: region.state,
      limit: 8,
    });

    const subtitle = buildSubtitleForRegion(region.city, region.state);

    return NextResponse.json({
      success: true,
      items,
      subtitle,
      region,
    });
  } catch (error) {
    console.error("recommended-by-location:", error);
    return NextResponse.json(
      { success: false, message: "Failed to build recommendations", items: [] },
      { status: 500 },
    );
  }
}
