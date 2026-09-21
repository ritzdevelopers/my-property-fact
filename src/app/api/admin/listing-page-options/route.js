import { NextResponse } from "next/server";
import { getCachedListingPageOptions } from "@/lib/listingPageCatalog.server";

export async function GET() {
  try {
    const options = await getCachedListingPageOptions();
    return NextResponse.json(Array.isArray(options) ? options : []);
  } catch (error) {
    console.error("Failed to build listing page options:", error);
    return NextResponse.json([], { status: 200 });
  }
}
