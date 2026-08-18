import { resolveCitySlug } from "../app/_global_components/cityAliasUtils.js";
import {
  floorSlugToListingLabel,
  normalizeFloorSlugSegment,
  parseCompoundListingKey,
  parseFloorInCitySlug,
} from "./listingFloorValidation.js";

const LISTING_HUBS = [
  { prefix: "new-projects-in-", hubCategory: "new-projects", label: "New Projects" },
  { prefix: "apartments-in-", hubCategory: "apartments", label: "Apartments" },
  { prefix: "flats-in-", hubCategory: "flats", label: "Flats" },
  {
    prefix: "commercial-property-in-",
    hubCategory: "commercial",
    label: "Commercial Property",
  },
  {
    prefix: "offices-and-shop-in-",
    hubCategory: "offices-and-shop",
    label: "Offices and Shop",
  },
];

const COMMERCIAL_CONFIG_SLUGS = new Set([
  "shops",
  "office",
  "kiosk",
  "food-court",
  "restaurant",
  "showroom",
  "sco-plots",
]);

function titleFromSlug(slug) {
  return String(slug || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function cityLabelFromSlug(citySlug) {
  return String(citySlug || "")
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function resolveCityDisplayName(citySlug, cityList = []) {
  const canonical = resolveCitySlug(citySlug);
  if (!canonical) return "";
  const match = cityList.find((city) => {
    const slug = resolveCitySlug(city?.slugURL || city?.slugUrl || "");
    return slug === canonical;
  });
  return String(match?.cityName || "").trim() || cityLabelFromSlug(canonical);
}

function hubPath(hubCategory, citySlug) {
  if (!citySlug) return "/projects";
  switch (hubCategory) {
    case "new-projects":
      return `/new-projects-in-${citySlug}`;
    case "apartments":
      return `/apartments-in-${citySlug}`;
    case "flats":
      return `/flats-in-${citySlug}`;
    case "commercial":
      return `/commercial-property-in-${citySlug}`;
    case "offices-and-shop":
      return `/offices-and-shop-in-${citySlug}`;
    default:
      return `/city/${citySlug}`;
  }
}

function floorSlugToFilter(floorSlug) {
  const slug = normalizeFloorSlugSegment(floorSlug);
  if (!slug) return { bhkType: "", configType: "" };

  const bhk = slug.match(/^(\d+)-bhk$/);
  if (bhk) return { bhkType: `${bhk[1]} BHK`, configType: "" };

  const rk = slug.match(/^(\d+)-rk-studio$/);
  if (rk) return { bhkType: `${rk[1]} RK`, configType: "" };

  if (slug === "plot") return { bhkType: "Plots", configType: "" };

  if (/^\d+-br-villa$/.test(slug)) return { bhkType: "Villa", configType: "" };

  if (COMMERCIAL_CONFIG_SLUGS.has(slug)) {
    return { bhkType: "", configType: slug };
  }

  return { bhkType: floorSlugToListingLabel(slug), configType: "" };
}

function activeTabForListing({ hubCategory, bhkType, configType }) {
  if (hubCategory === "apartments" || hubCategory === "flats") return "residential";
  if (hubCategory === "commercial" || hubCategory === "offices-and-shop") {
    return "commercial";
  }
  if (hubCategory === "new-projects") return "all";
  if (configType) return "commercial";
  if (bhkType) return "residential";
  return "all";
}

function parseHubSlug(slug) {
  const lower = String(slug || "").toLowerCase();
  for (const hub of LISTING_HUBS) {
    if (!lower.startsWith(hub.prefix)) continue;
    const citySlug = resolveCitySlug(lower.slice(hub.prefix.length));
    if (!citySlug) return null;
    return { ...hub, citySlug };
  }
  return null;
}

/**
 * Props for `ProjectsRedesigned` on city hub and config listing URLs
 * (`new-projects-in-delhi`, `3-bhk-new-projects-in-delhi`, `shops-in-delhi`).
 */
export function buildListingProjectsViewConfig({
  slug,
  cityList = [],
  compoundListing = null,
} = {}) {
  const title = titleFromSlug(slug) || "All Projects";
  const hub = parseHubSlug(slug);

  if (hub) {
    const cityName = resolveCityDisplayName(hub.citySlug, cityList);
    return {
      initialCity: cityName,
      initialActiveTab: activeTabForListing({ hubCategory: hub.hubCategory }),
      initialBhkType: "",
      initialConfigType: "",
      hubCategory: hub.hubCategory,
      lockCity: true,
      breadcrumbParent: { href: "/projects", label: "Projects" },
      breadcrumbLabel: title,
      pageHeading: title,
      pageTitle: title,
    };
  }

  const compound =
    compoundListing ||
    (() => {
      if (!slug || !String(slug).includes("-in-")) return null;
      const segments = String(slug).split("-in-");
      const parsed = parseCompoundListingKey(segments[0]);
      if (!parsed) return null;
      const citySlug = resolveCitySlug(segments.slice(1).join("-in-"));
      if (!citySlug) return null;
      return { ...parsed, citySlug };
    })();

  if (compound?.floorSlug && compound?.citySlug && compound?.categorySlug) {
    const cityName = resolveCityDisplayName(compound.citySlug, cityList);
    const { bhkType, configType } = floorSlugToFilter(compound.floorSlug);
    const hubLabel =
      LISTING_HUBS.find((item) => item.hubCategory === compound.categorySlug)
        ?.label || compound.categorySlug;
    return {
      initialCity: cityName,
      initialActiveTab: activeTabForListing({
        hubCategory: compound.categorySlug,
        bhkType,
        configType,
      }),
      initialBhkType: bhkType,
      initialConfigType: configType,
      hubCategory: compound.categorySlug,
      lockCity: true,
      breadcrumbParent: {
        href: hubPath(compound.categorySlug, compound.citySlug),
        label: `${hubLabel} in ${cityName}`,
      },
      breadcrumbLabel: title,
      pageHeading: title,
      pageTitle: title,
    };
  }

  const parsedFloor = parseFloorInCitySlug(slug);
  if (parsedFloor?.floorSlug && parsedFloor?.citySlug) {
    const cityName = resolveCityDisplayName(parsedFloor.citySlug, cityList);
    const { bhkType, configType } = floorSlugToFilter(parsedFloor.floorSlug);
    return {
      initialCity: cityName,
      initialActiveTab: activeTabForListing({ bhkType, configType }),
      initialBhkType: bhkType,
      initialConfigType: configType,
      hubCategory: "",
      lockCity: true,
      breadcrumbParent: { href: "/projects", label: "Projects" },
      breadcrumbLabel: title,
      pageHeading: title,
      pageTitle: title,
    };
  }

  return {
    initialCity: "",
    initialActiveTab: "all",
    initialBhkType: "",
    initialConfigType: "",
    hubCategory: "",
    lockCity: false,
    breadcrumbParent: { href: "/projects", label: "Projects" },
    breadcrumbLabel: title,
    pageHeading: title,
    pageTitle: title,
  };
}

/** Listing hubs and config pages (`new-projects-in-delhi`, `3-bhk-new-projects-in-delhi`). */
export function isListingSlugPath(pathname = "") {
  const slug = String(pathname || "")
    .replace(/^\//, "")
    .split(/[?#]/)[0]
    .toLowerCase();
  return Boolean(slug) && slug.includes("-in-");
}

const LISTING_ORIGIN_PATH_RE =
  /^\/(?:new-projects|apartments|flats|commercial-property|offices-and-shop)-in-[^/]+$/;
const COMPOUND_BHK_ORIGIN_PATH_RE =
  /^\/\d+-bhk-(?:new-projects|apartments|commercial|offices-and-shop)-in-[^/]+$/;

/** Hub or compound listing the user should return to after clearing a config. */
export function isListingOriginPath(pathname = "") {
  const path = String(pathname || "").split(/[?#]/)[0];
  return LISTING_ORIGIN_PATH_RE.test(path) || COMPOUND_BHK_ORIGIN_PATH_RE.test(path);
}
