import axios from "axios";
import ManageListingContent from "./manageListingContent";
import {
  fetchAllProjects,
  fetchCityData,
} from "@/app/_global_components/masterFunction";
import { buildListingPageSlugOptions } from "@/lib/listingPageSlugOptions";
import { getPublicApiBase } from "@/lib/publicApiBase";

export const dynamic = "force-dynamic";

const fetchListingContents = async () => {
  try {
    const response = await axios.get(
      `${getPublicApiBase()}listing-page-contents/get-all`,
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(
      "Failed to fetch listing page contents:",
      error?.message || error,
    );
    return [];
  }
};

export default async function ManageListingContentPage() {
  const [savedRows, cityList, projects] = await Promise.all([
    fetchListingContents(),
    fetchCityData(),
    fetchAllProjects(),
  ]);
  const pageOptions = buildListingPageSlugOptions(cityList, projects);

  return (
    <ManageListingContent savedRows={savedRows} pageOptions={pageOptions} />
  );
}
