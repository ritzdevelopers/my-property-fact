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

/**
 * Build selectable page slug options for admin FAQ management.
 * @param {Array} cityList - cities from /city/all API
 */
export function buildListingPageSlugOptions(cityList = []) {
  const options = [];

  for (const city of cityList) {
    const citySlug = city.slugURL || city.slugUrl || "";
    const cityName = city.cityName || city.name || citySlug;
    if (!citySlug) continue;

    for (const hub of LISTING_HUB_PREFIXES) {
      options.push({
        pageSlug: `${hub.prefix}${citySlug}`,
        pageTitle: `${hub.label} ${cityName}`,
      });
    }

    for (const floor of LISTING_FLOOR_TYPES) {
      options.push({
        pageSlug: `${floor.slug}-in-${citySlug}`,
        pageTitle: `${floor.label} ${cityName}`,
      });
    }
  }

  return options.sort((a, b) => a.pageTitle.localeCompare(b.pageTitle));
}
