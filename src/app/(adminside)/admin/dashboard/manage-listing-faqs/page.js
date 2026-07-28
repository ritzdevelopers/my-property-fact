import axios from "axios";
import ManageListingFaqs from "./manageListingFaqs";
import { fetchCityData } from "@/app/_global_components/masterFunction";
import { buildListingPageSlugOptions } from "@/lib/listingPageSlugOptions";
import { getPublicApiBase } from "@/lib/publicApiBase";

export const dynamic = "force-dynamic";

const fetchListingFaqs = async () => {
  try {
    const response = await axios.get(
      `${getPublicApiBase()}listing-page-faqs/get-all`,
    );
    const res = Array.isArray(response.data) ? response.data : [];
    return res.map((item, index) => ({
      ...item,
      index: index + 1,
      id: item.pageSlug,
      noOfFaqs: item.faqs?.length ?? 0,
    }));
  } catch (error) {
    console.error("Failed to fetch listing page FAQs:", error?.message || error);
    return [];
  }
};

export default async function ManageListingFaqsPage() {
  const [list, cityList] = await Promise.all([fetchListingFaqs(), fetchCityData()]);
  const pageOptions = buildListingPageSlugOptions(cityList);

  return (
    <ManageListingFaqs list={list} pageOptions={pageOptions} />
  );
}
