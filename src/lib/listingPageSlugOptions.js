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
export function buildListingPageSlugOptions(cityList = [], projects = []) {
  const options = [
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
  const projectList = Array.isArray(projects) ? projects : [];

  for (const city of cityList) {
    const citySlug = city.slugURL || city.slugUrl || "";
    const cityName = city.cityName || city.name || citySlug;
    const stateName = city.stateName || "";
    const placeLabel = locationLabel(cityName, stateName);
    if (!citySlug) continue;

    options.push({
      pageSlug: citySlug,
      pageTitle: `Property in ${placeLabel}`,
    });

    for (const hub of LISTING_HUB_PREFIXES) {
      options.push({
        pageSlug: `${hub.prefix}${citySlug}`,
        pageTitle: `${hub.label} ${placeLabel}`,
      });
    }

    for (const floor of LISTING_FLOOR_TYPES) {
      if (!hasFloorListingDataInCity(projectList, citySlug, floor.slug)) continue;
      options.push({
        pageSlug: `${floor.slug}-in-${citySlug}`,
        pageTitle: `${floor.label} ${placeLabel}`,
      });
    }

    for (const n of LISTING_BHK_COUNTS) {
      const bhkSlug = `${n}-bhk`;
      if (hasFloorListingDataInCity(projectList, citySlug, bhkSlug)) {
        options.push({
          pageSlug: `${bhkSlug}-in-${citySlug}`,
          pageTitle: `${n} BHK in ${placeLabel}`,
        });
      }

      for (const category of LISTING_BHK_CATEGORIES) {
        const compoundKey = `${bhkSlug}-${category.segment}`;
        if (!hasCompoundListingDataInCity(projectList, citySlug, compoundKey)) {
          continue;
        }
        options.push({
          pageSlug: `${compoundKey}-in-${citySlug}`,
          pageTitle: `${n} BHK ${category.label} in ${placeLabel}`,
        });
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
