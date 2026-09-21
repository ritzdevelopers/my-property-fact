import {
  hasCompoundListingDataInCity,
  hasFloorListingDataInCity,
} from "./listingFloorValidation.js";

/** Hub page prefixes used in footer links (e.g. new-projects-in-noida). */
export const LISTING_HUB_PREFIXES = [
  { prefix: "new-projects-in-", label: "New Projects in" },
  { prefix: "apartments-in-", label: "Apartments in" },
  { prefix: "flats-in-", label: "Flats in" },
  { prefix: "commercial-property-in-", label: "Commercial Property in" },
  { prefix: "offices-and-shop-in-", label: "Offices and Shop in" },
];

/** Config-type listing pages (e.g. shops-in-noida, food-court-in-noida). */
export const LISTING_FLOOR_TYPES = [
  { slug: "shops", label: "Shops in" },
  { slug: "office", label: "Office in" },
  { slug: "kiosk", label: "Kiosk in" },
  { slug: "food-court", label: "Food Court in" },
  { slug: "restaurant", label: "Restaurant in" },
  { slug: "showroom", label: "Showroom in" },
  { slug: "sco-plots", label: "SCO Plots in" },
];

/** BHK counts for listing FAQ pages (e.g. 3-bhk-in-noida). */
export const LISTING_BHK_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8];

/**
 * Compound BHK category pages (e.g. 3-bhk-apartments-in-noida).
 * Matches live public listing URL categories.
 */
export const LISTING_BHK_CATEGORIES = [
  { segment: "apartments", label: "Apartments" },
  { segment: "new-projects", label: "New Projects" },
  { segment: "commercial", label: "Commercial" },
];

function locationLabel(placeName, stateName) {
  if (stateName && stateName.toLowerCase() !== String(placeName).toLowerCase()) {
    return `${placeName} (${stateName})`;
  }
  return placeName;
}

/**
 * Build selectable page slug options for admin FAQ management.
 * Floor / BHK / compound pages are included only when live project data
 * would make the public URL resolve (avoids 404 pages).
 *
 * @param {Array} cityList - cities from /city/all API
 * @param {Array} [projects] - projects from /projects (required to filter live pages)
 */
const HUB_CATEGORY_BY_PREFIX = {
  "new-projects-in-": "new-projects",
  "apartments-in-": "apartments",
  "flats-in-": "flats",
  "commercial-property-in-": "commercial",
  "offices-and-shop-in-": "offices",
};

function hubMatchesCategory(hub, category) {
  if (!category || category === "all") return true;
  return HUB_CATEGORY_BY_PREFIX[hub.prefix] === category;
}

function includeIndiaHubPage(category, pageSlug) {
  if (!category || category === "all") return true;
  if (pageSlug === "projects/commercial") return category === "commercial";
  if (pageSlug === "projects/new-launches") return category === "new-projects";
  if (pageSlug === "projects/residential") return category === "apartments";
  return false;
}

/**
 * @param {Array} cityList
 * @param {Array} [projects]
 * @param {string} [category] - filter slug generation to one listing group
 */
export function buildListingPageSlugOptions(
  cityList = [],
  projects = [],
  category = "all",
) {
  const cat = category || "all";
  const options = [];
  const indiaPages = [
    {
      pageSlug: "projects/commercial",
      pageTitle: "Commercial Property in India",
    },
    {
      pageSlug: "projects/new-launches",
      pageTitle: "New Projects in India",
    },
    {
      pageSlug: "projects/residential",
      pageTitle: "Residential Property in India",
    },
  ];

  indiaPages.forEach((page) => {
    if (includeIndiaHubPage(cat, page.pageSlug)) {
      options.push(page);
    }
  });

  const projectList = Array.isArray(projects) ? projects : [];
  const includeCityPages = cat === "all" || cat === "city";
  const includeHubPages =
    cat === "all" ||
    ["commercial", "new-projects", "apartments", "flats", "offices"].includes(cat);
  const includeConfigPages = cat === "all" || cat === "config";
  const includeBhkPages = cat === "all" || cat === "bhk";

  for (const city of cityList) {
    const citySlug = city.slugURL || city.slugUrl || "";
    const cityName = city.cityName || city.name || citySlug;
    const stateName = city.stateName || "";
    const placeLabel = locationLabel(cityName, stateName);
    if (!citySlug) continue;

    if (includeCityPages) {
      options.push({
        pageSlug: citySlug,
        pageTitle: `Property in ${placeLabel}`,
      });
    }

    if (includeHubPages) {
      for (const hub of LISTING_HUB_PREFIXES) {
        if (!hubMatchesCategory(hub, cat)) continue;
        options.push({
          pageSlug: `${hub.prefix}${citySlug}`,
          pageTitle: `${hub.label} ${placeLabel}`,
        });
      }
    }

    if (includeConfigPages) {
      for (const floor of LISTING_FLOOR_TYPES) {
        if (!hasFloorListingDataInCity(projectList, citySlug, floor.slug)) continue;
        options.push({
          pageSlug: `${floor.slug}-in-${citySlug}`,
          pageTitle: `${floor.label} ${placeLabel}`,
        });
      }
    }

    if (includeBhkPages) {
      for (const n of LISTING_BHK_COUNTS) {
        const bhkSlug = `${n}-bhk`;
        if (hasFloorListingDataInCity(projectList, citySlug, bhkSlug)) {
          options.push({
            pageSlug: `${bhkSlug}-in-${citySlug}`,
            pageTitle: `${n} BHK in ${placeLabel}`,
          });
        }

        for (const bhkCategory of LISTING_BHK_CATEGORIES) {
          const compoundKey = `${bhkSlug}-${bhkCategory.segment}`;
          if (!hasCompoundListingDataInCity(projectList, citySlug, compoundKey)) {
            continue;
          }
          options.push({
            pageSlug: `${compoundKey}-in-${citySlug}`,
            pageTitle: `${n} BHK ${bhkCategory.label} in ${placeLabel}`,
          });
        }
      }
    }
  }

  return options.sort((a, b) => a.pageTitle.localeCompare(b.pageTitle));
}

export const LISTING_CONTENT_CATEGORIES = [
  { id: "all", label: "All pages" },
  { id: "commercial", label: "Commercial Property" },
  { id: "new-projects", label: "New Projects" },
  { id: "apartments", label: "Apartments" },
  { id: "flats", label: "Flats" },
  { id: "offices", label: "Offices & Shop" },
  { id: "config", label: "Shops / Config" },
  { id: "bhk", label: "BHK listings" },
  { id: "city", label: "City pages" },
];

/** Group a listing slug for the SEO content admin filters. */
export function getListingPageCategory(slug = "") {
  const value = String(slug || "").toLowerCase();
  if (value === "projects/commercial" || value.startsWith("commercial-property-in-")) {
    return "commercial";
  }
  if (value === "projects/new-launches" || value.startsWith("new-projects-in-")) {
    return "new-projects";
  }
  if (value === "projects/residential" || value.startsWith("apartments-in-")) {
    return "apartments";
  }
  if (value.startsWith("flats-in-")) return "flats";
  if (value.startsWith("offices-and-shop-in-")) return "offices";
  if (/^\d+-bhk-/.test(value)) return "bhk";
  if (
    /^(shops|office|kiosk|food-court|restaurant|showroom|sco-plots)-in-/.test(
      value,
    )
  ) {
    return "config";
  }
  return "city";
}

export function getListingPageCategoryLabel(slug = "") {
  const match = LISTING_CONTENT_CATEGORIES.find(
    (item) => item.id === getListingPageCategory(slug),
  );
  return match?.label || "Other";
}
