import { normalizePlaceToken } from "@/app/(home)/components/home/recommendedSpotlight";
import {
  cityNameMatchesFilter,
  normalizeCitySearchQuery,
} from "@/app/_global_components/cityAliasUtils";

/** Delhi-NCR cities used for "Popular right now" curated list. */
export const DELHI_NCR_CITY_NAMES = [
  "Delhi",
  "Noida",
  "Gurugram",
  "Gurgaon",
  "Faridabad",
  "Ghaziabad",
  "Greater Noida",
  "Noida Extension",
  "Sonipat",
  "Dwarka",
];

/**
 * Curated tick projects for Delhi-NCR (CT-1 list), in display order.
 * Slugs verified against production project data where available.
 */
export const DELHI_NCR_POPULAR_PROJECT_SLUGS = [
  "eldeco-la-vida-bella",
  "splendor-onyx-blue",
  "ats-homekraft-happy-trails", 
  "eldeco-aamantran",   
  "m3m-the-cullinan",
  "eldeco-7-peaks-residences", 
  "eldeco-edge", 
  "smartworld-elie-saab",
  "m3m-the-line-sector-72-noida",
  "ats-pristine",
  "arihant-arden",
  "gaur-city-center",
  "exotica-132", 
  "m3m-elie-saab-sector-98-noida", 
];

export const POPULAR_PROMO_MAX_ITEMS = 20;

function norm(s) {
  return normalizePlaceToken(s);
}

function cityMatchesNcr(cityNorm) {
  if (!cityNorm) return false;
  return DELHI_NCR_CITY_NAMES.some((name) => {
    const n = norm(name);
    return cityNorm === n || cityNorm.includes(n) || n.includes(cityNorm);
  });
}

/** Loose bbox covering Delhi-NCR when reverse geocode is ambiguous. */
export function isLikelyDelhiNcrCoords(lat, lon) {
  return lat >= 28.2 && lat <= 28.95 && lon >= 76.75 && lon <= 77.75;
}

export function isDelhiNcrUmbrellaLabel(city) {
  const n = norm(city);
  return n === "ncr" || n === "delhi ncr" || n.includes("delhi ncr");
}

export function isDelhiNcrProject(project) {
  if (!project || typeof project !== "object") return false;
  return isDelhiNcrRegion(
    project.cityName,
    project.stateName,
    [project.projectLocality, project.projectAddress, project.cityName].filter(Boolean),
  );
}

export function filterDelhiNcrProjects(projects) {
  return (Array.isArray(projects) ? projects : []).filter(isDelhiNcrProject);
}

/**
 * Home project rails stay inside Delhi-NCR.
 * A specific NCR city (Noida, Gurugram, …) still ranks first; anything else
 * (Delhi NCR umbrella, or a city outside NCR) uses the full NCR pool.
 */
export function scopeHomeProjectsToDelhiNcr({
  projects,
  city,
  state,
  geoTokens = [],
  lat = null,
  lon = null,
} = {}) {
  const ncrProjects = filterDelhiNcrProjects(projects);
  const inNcr = isDelhiNcrRegion(city, state, geoTokens, lat, lon);
  const specificNcrCity = inNcr && !isDelhiNcrUmbrellaLabel(city);

  if (specificNcrCity) {
    return {
      projects: ncrProjects,
      geoCity: city,
      geoState: state || "",
      geoTokens: Array.isArray(geoTokens) ? geoTokens : [],
      label: String(city || "").trim() || "Delhi NCR",
    };
  }

  return {
    projects: ncrProjects,
    geoCity: "",
    geoState: "",
    geoTokens: [...DELHI_NCR_CITY_NAMES, "NCR"],
    label: "Delhi NCR",
  };
}

function projectMatchesSelectedCity(project, cityName) {
  if (!project || !cityName) return false;

  const selectedNorm = normalizeCitySearchQuery(cityName);
  const projectCityNorm = normalizeCitySearchQuery(project.cityName || "");
  if (selectedNorm && projectCityNorm && selectedNorm === projectCityNorm) return true;

  // Header city filter must use the project city only. Address/locality substring
  // matches (e.g. "agra" inside "Bagral") leak other cities into the rails.
  return cityNameMatchesFilter(cityName, {
    cityName: project.cityName,
    projectAddress: "",
    projectLocality: "",
  });
}

/**
 * Filter home rails to a specific city from GPS / location API.
 * Delhi NCR umbrella still uses the full NCR pool.
 */
export function scopeHomeProjectsForLocation({
  projects,
  city,
  state,
  geoTokens = [],
  lat = null,
  lon = null,
} = {}) {
  const selectedCity = String(city || "").trim();
  const specificCity = selectedCity && !isDelhiNcrUmbrellaLabel(selectedCity);

  if (specificCity) {
    const list = Array.isArray(projects) ? projects : [];
    return {
      projects: list.filter((project) => projectMatchesSelectedCity(project, selectedCity)),
      geoCity: selectedCity,
      geoState: state || "",
      geoTokens: Array.isArray(geoTokens) && geoTokens.length ? geoTokens : [selectedCity],
      label: selectedCity,
      strict: true,
    };
  }

  return scopeHomeProjectsToDelhiNcr({
    projects,
    city,
    state,
    geoTokens,
    lat,
    lon,
  });
}

export function isDelhiNcrRegion(city, state, geoTokens = [], lat = null, lon = null) {
  const cityNorm = norm(city);
  const stateNorm = norm(state);

  if (cityMatchesNcr(cityNorm)) return true;

  if (
    cityNorm.includes("delhi") ||
    stateNorm.includes("delhi") ||
    stateNorm.includes("national capital")
  ) {
    return true;
  }

  const tokenList = Array.isArray(geoTokens) ? geoTokens : [];
  for (const raw of tokenList) {
    const t = norm(raw);
    if (!t) continue;
    if (t === "ncr" || t.includes("national capital")) return true;
    if (cityMatchesNcr(t)) return true;
  }

  if (typeof lat === "number" && typeof lon === "number" && isLikelyDelhiNcrCoords(lat, lon)) {
    return true;
  }

  return false;
}

export function resolvePopularProjectsFromSlugs(projects, slugs, limit = POPULAR_PROMO_MAX_ITEMS) {
  const bySlug = new Map();
  for (const p of projects || []) {
    const slug = p?.slugURL || p?.slugUrl;
    if (slug) bySlug.set(slug, p);
  }

  const result = [];
  for (const slug of slugs || []) {
    if (result.length >= limit) break;
    const project = bySlug.get(slug);
    if (project?.slugURL || project?.slugUrl) result.push(project);
  }
  return result;
}
