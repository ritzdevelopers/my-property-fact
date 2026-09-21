import { unstable_cache } from "next/cache";
import {
  fetchAllProjects,
  fetchCityData,
} from "@/app/_global_components/masterFunction";
import {
  buildListingPageSlugOptions,
  getListingPageCategory,
  getListingPageCategoryLabel,
} from "@/lib/listingPageSlugOptions";
import { getPublicApiBase } from "@/lib/publicApiBase";

const CATALOG_REVALIDATE_SECONDS = 120;

export const getCachedListingPageOptions = unstable_cache(
  async () => {
    const [cityList, projects] = await Promise.all([
      fetchCityData(),
      fetchAllProjects(),
    ]);
    return buildListingPageSlugOptions(cityList, projects, "all");
  },
  ["admin-listing-page-options-all"],
  { revalidate: CATALOG_REVALIDATE_SECONDS },
);

const catalogCacheByCategory = new Map();

function getCachedListingPageOptionsForCategory(category = "all") {
  const cat = category || "all";
  if (!catalogCacheByCategory.has(cat)) {
    catalogCacheByCategory.set(
      cat,
      unstable_cache(
        async () => {
          const [cityList, projects] = await Promise.all([
            fetchCityData(),
            fetchAllProjects(),
          ]);
          return buildListingPageSlugOptions(cityList, projects, cat);
        },
        ["admin-listing-page-options", cat],
        { revalidate: CATALOG_REVALIDATE_SECONDS },
      ),
    );
  }
  return catalogCacheByCategory.get(cat)();
}

async function fetchJson(url) {
  const response = await fetch(url, { next: { revalidate: CATALOG_REVALIDATE_SECONDS } });
  if (!response.ok) return null;
  return response.json();
}

const getCachedContentSummaries = unstable_cache(
  async () => {
    const baseUrl = getPublicApiBase();
    if (!baseUrl) return [];
    const summaries = await fetchJson(`${baseUrl}listing-page-contents/summaries`);
    return Array.isArray(summaries) ? summaries : [];
  },
  ["admin-listing-content-summaries"],
  { revalidate: CATALOG_REVALIDATE_SECONDS },
);

const getCachedFaqSummaries = unstable_cache(
  async () => {
    const baseUrl = getPublicApiBase();
    if (!baseUrl) return [];
    const summaries = await fetchJson(`${baseUrl}listing-page-faqs/summaries`);
    return Array.isArray(summaries) ? summaries : [];
  },
  ["admin-listing-faq-summaries"],
  { revalidate: CATALOG_REVALIDATE_SECONDS },
);

function buildContentRows(options, summaries) {
  const savedBySlug = new Map();
  summaries.forEach((row) => {
    if (row?.pageSlug) savedBySlug.set(row.pageSlug, row);
  });

  const rows = (options || []).map((option) => {
    const saved = savedBySlug.get(option.pageSlug);
    return {
      pageSlug: option.pageSlug,
      pageTitle: saved?.pageTitle || option.pageTitle,
      heading: saved?.heading || "",
      metaTitle: saved?.metaTitle || "",
      id: saved?.id || 0,
      recordId: saved?.id || 0,
      hasContent: Boolean(saved?.hasContent),
      category: getListingPageCategory(option.pageSlug),
      categoryLabel: getListingPageCategoryLabel(option.pageSlug),
    };
  });

  const known = new Set(rows.map((row) => row.pageSlug));
  summaries.forEach((saved) => {
    if (!saved?.pageSlug || known.has(saved.pageSlug)) return;
    rows.push({
      pageSlug: saved.pageSlug,
      pageTitle: saved.pageTitle || saved.pageSlug,
      heading: saved.heading || "",
      metaTitle: saved.metaTitle || "",
      id: saved.id || 0,
      recordId: saved.id || 0,
      hasContent: Boolean(saved.hasContent),
      category: getListingPageCategory(saved.pageSlug),
      categoryLabel: getListingPageCategoryLabel(saved.pageSlug),
    });
  });

  return rows;
}

function buildFaqRows(options, summaries) {
  const savedBySlug = new Map();
  summaries.forEach((row) => {
    if (row?.pageSlug) savedBySlug.set(row.pageSlug, row);
  });

  const rows = (options || []).map((option) => {
    const saved = savedBySlug.get(option.pageSlug);
    return {
      pageSlug: option.pageSlug,
      pageTitle: saved?.pageTitle || option.pageTitle,
      noOfFaqs: Number(saved?.noOfFaqs) || 0,
      category: getListingPageCategory(option.pageSlug),
      categoryLabel: getListingPageCategoryLabel(option.pageSlug),
    };
  });

  const known = new Set(rows.map((row) => row.pageSlug));
  summaries.forEach((saved) => {
    if (!saved?.pageSlug || known.has(saved.pageSlug)) return;
    rows.push({
      pageSlug: saved.pageSlug,
      pageTitle: saved.pageTitle || saved.pageSlug,
      noOfFaqs: Number(saved.noOfFaqs) || 0,
      category: getListingPageCategory(saved.pageSlug),
      categoryLabel: getListingPageCategoryLabel(saved.pageSlug),
    });
  });

  return rows;
}

const mergedContentCacheByCategory = new Map();
const mergedFaqCacheByCategory = new Map();

function getMergedContentCache(category = "all") {
  const cat = category || "all";
  if (!mergedContentCacheByCategory.has(cat)) {
    mergedContentCacheByCategory.set(
      cat,
      unstable_cache(
        async () => {
          const [options, summaries] = await Promise.all([
            getCachedListingPageOptionsForCategory(cat),
            getCachedContentSummaries(),
          ]);
          return buildContentRows(options, summaries);
        },
        ["admin-listing-content-catalog", cat],
        { revalidate: CATALOG_REVALIDATE_SECONDS },
      ),
    );
  }
  return mergedContentCacheByCategory.get(cat);
}

function getMergedFaqCache(category = "all") {
  const cat = category || "all";
  if (!mergedFaqCacheByCategory.has(cat)) {
    mergedFaqCacheByCategory.set(
      cat,
      unstable_cache(
        async () => {
          const [options, summaries] = await Promise.all([
            getCachedListingPageOptionsForCategory(cat),
            getCachedFaqSummaries(),
          ]);
          return buildFaqRows(options, summaries);
        },
        ["admin-listing-faq-catalog", cat],
        { revalidate: CATALOG_REVALIDATE_SECONDS },
      ),
    );
  }
  return mergedFaqCacheByCategory.get(cat);
}

export async function getCachedContentCatalogRows(category = "all") {
  return getMergedContentCache(category)();
}

export async function getCachedFaqCatalogRows(category = "all") {
  return getMergedFaqCache(category)();
}

export async function fetchFaqSummaries() {
  return getCachedFaqSummaries();
}

export async function fetchContentSummaries() {
  return getCachedContentSummaries();
}
