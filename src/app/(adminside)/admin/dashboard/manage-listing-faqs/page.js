import ManageListingFaqs from "./manageListingFaqs";
import {
  fetchAllProjects,
  fetchCityData,
} from "@/app/_global_components/masterFunction";
import { buildListingPageSlugOptions } from "@/lib/listingPageSlugOptions";

export const dynamic = "force-dynamic";

export default async function ManageListingFaqsPage() {
  const [cityList, projects] = await Promise.all([
    fetchCityData(),
    fetchAllProjects(),
  ]);
  const pageOptions = buildListingPageSlugOptions(cityList, projects);

  return <ManageListingFaqs pageOptions={pageOptions} />;
}
