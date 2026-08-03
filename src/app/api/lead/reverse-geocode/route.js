import { NextResponse } from "next/server";
import { reverseGeocodeCoordinates } from "@/lib/reverseGeocode";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ success: false, error: "lat and lon are required" }, { status: 400 });
  }

  try {
    const address = await reverseGeocodeCoordinates(lat, lon);
    if (!address) {
      return NextResponse.json({ success: false, error: "Could not resolve address" }, { status: 404 });
    }
    return NextResponse.json({ success: true, address });
  } catch {
    return NextResponse.json({ success: false, error: "Geocoding failed" }, { status: 500 });
  }
}
