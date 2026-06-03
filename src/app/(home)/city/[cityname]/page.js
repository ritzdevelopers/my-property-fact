import CityPage from "./citypage";
import axios from "axios";
import { cache } from "react";
import { redirect } from "next/navigation";
import {
  LEGACY_CITY_SLUGS_FOR_PAGE_MERGE,
  resolveCitySlug,
} from "@/app/_global_components/cityAliasUtils";
import { stripProjectListForClient } from "@/app/_global_components/siteData/stripProjectForClient";
import SeoNarrative from "@/app/_global_components/seo/SeoNarrative";

export const dynamic = "force-dynamic";

/** One upstream request per slug per render (shared by metadata + page). */
const fetchCityDataBySlug = cache(async (slug) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}city/get/${slug}`,
  );
  return response.data;
});

function mergeCityProjectLists(primary, secondary) {
  const primaryList = Array.isArray(primary?.projectList) ? primary.projectList : [];
  const secondaryList = Array.isArray(secondary?.projectList)
    ? secondary.projectList
    : [];
  if (!secondaryList.length) return primary;

  const seen = new Set(
    primaryList.map((p) => p?.id ?? p?.slugURL ?? p?.projectName).filter(Boolean),
  );
  const merged = [...primaryList];
  secondaryList.forEach((project) => {
    const key = project?.id ?? project?.slugURL ?? project?.projectName;
    if (key == null || seen.has(key)) return;
    seen.add(key);
    merged.push(project);
  });

  return {
    ...primary,
    projectList: stripProjectListForClient(merged),
  };
}

async function fetchCityDataWithAliases(canonicalSlug) {
  const cityData = await fetchCityDataBySlug(canonicalSlug);
  const legacySlugs = LEGACY_CITY_SLUGS_FOR_PAGE_MERGE[canonicalSlug];
  if (!legacySlugs?.length) {
    return {
      ...cityData,
      projectList: stripProjectListForClient(
        Array.isArray(cityData?.projectList) ? cityData.projectList : [],
      ),
    };
  }

  let merged = cityData;
  for (const legacySlug of legacySlugs) {
    try {
      const legacy = await fetchCityDataBySlug(legacySlug);
      merged = mergeCityProjectLists(merged, legacy);
    } catch {
      // skip missing legacy city payload
    }
  }
  return merged;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { cityname } = await params;
  const canonicalSlug = resolveCitySlug(cityname) || cityname;
  const cityData = await fetchCityDataWithAliases(canonicalSlug);
  return {
    title: cityData.metaTitle,
    description: cityData.metaDescription,
    alternates: {
      canonical: `/city/${canonicalSlug}`,
    },
  };
}

// Main page component
export default async function AllCityProjects({ params }) {
  const { cityname } = await params;
  const canonicalSlug = resolveCitySlug(cityname);
  if (canonicalSlug && canonicalSlug !== String(cityname).toLowerCase().trim()) {
    redirect(`/city/${canonicalSlug}`);
  }
  const cityData = await fetchCityDataWithAliases(canonicalSlug || cityname);

  const seoSummary = [cityData?.metaDescription, cityData?.metaTitle]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <SeoNarrative>{seoSummary}</SeoNarrative>
      <CityPage cityData={cityData} />
    </>
  );
}
