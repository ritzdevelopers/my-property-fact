import { getDisplayCityList } from "../cityAliasUtils";
import { slimProjectListForListing } from "@/lib/slimProjectListing";

const fetchInit =
  typeof window === "undefined" ? { next: { revalidate: 60 } } : {};

/**
 * Cities, builders, types, and statuses only — safe to embed in root layout HTML.
 * Project catalog is loaded client-side to keep document size under 2MB.
 */
export async function fetchSiteMetaFromApi() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";

  const [citiesRes, buildersRes, typesRes, statusesRes] = await Promise.all([
    fetch(`${apiBase}city/all`, fetchInit),
    fetch(`${apiBase}builder/get-all`, fetchInit),
    fetch(`${apiBase}project-types/get-all`, fetchInit),
    fetch(`${apiBase}project-status`, fetchInit),
  ]);

  const [cities, buildersData, typesData, statusesData] = await Promise.all([
    citiesRes.json(),
    buildersRes.json(),
    typesRes.json(),
    statusesRes.json(),
  ]);

  const allCities = cities || [];
  return {
    cityList: getDisplayCityList(allCities),
    allCityList: allCities,
    builderList: buildersData?.builders || [],
    projectTypes: typesData || [],
    projectStatuses: statusesData || [],
  };
}

/**
 * Full site data including slim project catalog.
 * Used client-side by SiteDataContext (not embedded in SSR HTML).
 */
export async function fetchSiteDataFromApi() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const meta = await fetchSiteMetaFromApi();

  const projectsRes = await fetch(`${apiBase}projects`, fetchInit);
  const projectsData = await projectsRes.json();

  return {
    ...meta,
    projectList: slimProjectListForListing(
      Array.isArray(projectsData) ? projectsData : [],
    ),
  };
}
