import CityPage from "./citypage";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import {
  LEGACY_CITY_SLUGS_FOR_PAGE_MERGE,
  resolveCitySlug,
} from "@/app/_global_components/cityAliasUtils";
import { fetchCityDetailsBySlug, isKnownCitySlug } from "@/app/_global_components/masterFunction";
import { slimProjectListForListing } from "@/lib/slimProjectListing";
import JsonLdScript from "@/app/_global_components/jsonLd/JsonLdScript";
import {
  buildFaqJsonLd,
  resolveCityFaqItemsForSchema,
} from "@/app/_global_components/jsonLd/buildJsonLd";
import { fetchListingPageFaqsBySlug } from "@/lib/fetchListingPageFaqs";

export const dynamic = "force-dynamic";

function resolvePageCitySlug(cityname) {
  return resolveCitySlug(cityname) || String(cityname || "").toLowerCase().trim();
}

async function ensureKnownCityOrNotFound(cityname) {
  const slugToCheck = resolvePageCitySlug(cityname);
  if (!slugToCheck || !(await isKnownCitySlug(slugToCheck))) {
    notFound();
  }
  return slugToCheck;
}

/** One upstream request per slug per render (shared by metadata + page). */
const fetchCityDataBySlug = cache(async (slug) => {
  const data = await fetchCityDetailsBySlug(slug);
  if (!data) return null;
  return data;
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

  return { ...primary, projectList: merged };
}

async function fetchCityDataWithAliases(canonicalSlug) {
  const cityData = await fetchCityDataBySlug(canonicalSlug);
  if (!cityData) return null;
  const legacySlugs = LEGACY_CITY_SLUGS_FOR_PAGE_MERGE[canonicalSlug];
  if (!legacySlugs?.length) return cityData;

  let merged = cityData;
  for (const legacySlug of legacySlugs) {
    const legacy = await fetchCityDataBySlug(legacySlug);
    if (legacy) {
      merged = mergeCityProjectLists(merged, legacy);
    }
  }
  return merged;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { cityname } = await params;
  const canonicalSlug = await ensureKnownCityOrNotFound(cityname);
  const cityData = await fetchCityDataWithAliases(canonicalSlug);
  if (!cityData) {
    notFound();
  }
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
  const slugToCheck = await ensureKnownCityOrNotFound(cityname);
  const [cityData, listingFaqs] = await Promise.all([
    fetchCityDataWithAliases(slugToCheck),
    fetchListingPageFaqsBySlug(slugToCheck),
  ]);
  if (!cityData) {
    notFound();
  }

  const { projectList: _projectList, ...cityMeta } = cityData;
  const projectList = slimProjectListForListing(cityData.projectList || []);
  const faqItems = listingFaqs.length
    ? listingFaqs
    : resolveCityFaqItemsForSchema(cityMeta);

  return (
    <>
      <JsonLdScript data={buildFaqJsonLd(faqItems)} />
      <CityPage
        citySlug={slugToCheck}
        cityData={cityMeta}
        initialProjects={projectList}
      />
    </>
  );
}
