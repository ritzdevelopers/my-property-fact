import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import {
  fetchAllProjects,
  fetchCityData,
} from "@/app/_global_components/masterFunction";
import { buildListingPageSlugOptions } from "@/lib/listingPageSlugOptions";

const getListingPageOptions = unstable_cache(
  async () => {
    const [cityList, projects] = await Promise.all([
      fetchCityData(),
      fetchAllProjects(),
    ]);
    return buildListingPageSlugOptions(cityList, projects);
  },
  ["admin-listing-page-options"],
  { revalidate: 60 },
);

export async function GET() {
  try {
    const options = await getListingPageOptions();
    return NextResponse.json(Array.isArray(options) ? options : []);
  } catch (error) {
    console.error("Failed to build listing page options:", error);
    return NextResponse.json([], { status: 200 });
  }
}
