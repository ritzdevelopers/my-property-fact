import { getDisplayCityList } from "../cityAliasUtils";
import { stripProjectListForClient } from "./stripProjectForClient";

/**
 * Shared site data fetch (cities, builders, types, statuses, projects).
 * Safe to call from Server Components and from the client fallback in SiteDataContext.
 */
export async function fetchSiteDataFromApi() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const init =
    typeof window === "undefined" ? { next: { revalidate: 60 } } : {};

  const [citiesRes, buildersRes, typesRes, statusesRes, projectsRes] =
    await Promise.all([
      fetch(`${apiBase}city/all`, init),
      fetch(`${apiBase}builder/get-all`, init),
      fetch(`${apiBase}project-types/get-all`, init),
      fetch(`${apiBase}project-status`, init),
      fetch(`${apiBase}projects`, init),
    ]);

  const [cities, buildersData, typesData, statusesData, projectsData] =
    await Promise.all([
      citiesRes.json(),
      buildersRes.json(),
      typesRes.json(),
      statusesRes.json(),
      projectsRes.json(),
    ]);

  const allCities = cities || [];
  return {
    cityList: getDisplayCityList(allCities),
    allCityList: allCities,
    builderList: buildersData?.builders || [],
    projectTypes: typesData || [],
    projectStatuses: statusesData || [],
    projectList: stripProjectListForClient(projectsData || []),
  };
}
