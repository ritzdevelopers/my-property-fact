import { normalizePlaceToken } from "@/app/(home)/components/home/recommendedSpotlight";

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
