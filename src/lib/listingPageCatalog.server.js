import { unstable_cache } from "next/cache";
import {
  fetchAllProjects,
  fetchCityData,
} from "@/app/_global_components/masterFunction";
import { buildListingPageSlugOptions } from "@/lib/listingPageSlugOptions";
import { getPublicApiBase } from "@/lib/publicApiBase";

export const getCachedListingPageOptions = unstable_cache(
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

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;
  return response.json();
}

async function fetchPagedSummaries(path) {
  const baseUrl = getPublicApiBase();
  if (!baseUrl) return [];

  const summaries = await fetchJson(`${baseUrl}${path}/summaries`);
  if (Array.isArray(summaries)) return summaries;

  const all = [];
  for (let page = 0; page < 50; page += 1) {
    const data = await fetchJson(
      `${baseUrl}${path}/get-all?page=${page}&size=100`,
    );
    if (Array.isArray(data)) return data;
    const content = data?.content;
    if (!Array.isArray(content) || content.length === 0) break;
    all.push(...content);
    if (page + 1 >= Number(data.totalPages || 1)) break;
  }
  return all;
}

export async function fetchFaqSummaries() {
  return fetchPagedSummaries("listing-page-faqs");
}

export async function fetchContentSummaries() {
  return fetchPagedSummaries("listing-page-contents");
}
