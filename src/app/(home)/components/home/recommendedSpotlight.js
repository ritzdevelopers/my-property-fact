import { getAllProjects } from "@/app/_global_components/masterFunction";
import { transformPublicPropertyList } from "@/app/(home)/properties/transformPublicProperties";

export async function loadPublicPropertiesForSpotlight() {
  const raw = process.env.NEXT_PUBLIC_API_URL || "";
  const base = raw.endsWith("/") ? raw.slice(0, -1) : raw;
  if (!base) return [];

  try {
    const res = await fetch(`${base}/public/properties`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    if (data?.success && Array.isArray(data.properties)) {
      return transformPublicPropertyList(data.properties);
    }
    return [];
  } catch {
    return [];
  }
}

export function normalizeProjectsArray(projectsResponse) {
  if (Array.isArray(projectsResponse)) return projectsResponse;
  if (projectsResponse?.data && Array.isArray(projectsResponse.data)) {
    return projectsResponse.data;
  }
  return [];
}

export function propertyListingLatestTimestamp(listing) {
  const raw = listing?.raw?.updatedAt ?? listing?.raw?.createdAt ?? null;
  if (raw == null) return 0;
  const ms = new Date(raw).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

export function projectLatestTimestamp(project) {
  if (!project || typeof project !== "object") return 0;
  const raw =
    project.updatedAt ??
    project.updated_at ??
    project.createdAt ??
    project.created_at ??
    project.modifiedAt ??
    project.dateCreated ??
    null;
  if (raw == null) {
    const id = project.id ?? project.projectId;
    return typeof id === "number" ? id : 0;
  }
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const ms = new Date(raw).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

export function normalizePlaceToken(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** Matches projects list "New Launch" tab logic (`projectStatusName`). */
export function isNewLaunchProject(project) {
  const s = normalizePlaceToken(project?.projectStatusName || "");
  return s.includes("new launch") || s.includes("new launched");
}

/**
 * Home "Recommended Properties": new launches first (newest activity first),
 * then latest other projects to fill up to `limit`.
 */
export function pickRecommendedPropertiesShowcase(projects, limit = 8) {
  const list = [...normalizeProjectsArray(projects)].filter(
    (p) => p?.slugURL && p?.projectName,
  );
  const newLaunchSorted = list
    .filter(isNewLaunchProject)
    .sort((a, b) => projectLatestTimestamp(b) - projectLatestTimestamp(a));
  const head = newLaunchSorted.slice(0, limit);
  if (head.length >= limit) return head;
  const used = new Set(head.map((p) => p.slugURL));
  const rest = list
    .filter((p) => !used.has(p.slugURL))
    .sort((a, b) => projectLatestTimestamp(b) - projectLatestTimestamp(a));
  return [...head, ...rest.slice(0, limit - head.length)];
}

const TOKEN_STOPWORDS = new Set([
  "india",
  "asia",
  "unnamed road",
  "road",
  "state",
  "city",
]);

function isUsefulToken(t) {
  const n = normalizePlaceToken(t);
  return n.length >= 3 && !TOKEN_STOPWORDS.has(n);
}

/** 1 = city-level match, 2 = state-only match, 0 = no match */
export function projectRegionTier(project, geoCity, geoState) {
  const city = normalizePlaceToken(geoCity);
  const state = normalizePlaceToken(geoState);
  if (!city && !state) return 0;

  const pcity = normalizePlaceToken(project?.cityName);
  const pstate = normalizePlaceToken(project?.stateName);

  const cityMatches =
    !!city &&
    !!pcity &&
    (pcity === city || pcity.includes(city) || city.includes(pcity));
  const stateMatches =
    !!state &&
    !!pstate &&
    (pstate === state || pstate.includes(state) || state.includes(pstate));

  if (cityMatches) return 1;
  if (stateMatches) return 2;
  return 0;
}

/**
 * Match project against every place label from reverse geocode (locality, district, etc.)
 * and against project locality / address (sectors, area names).
 */
export function projectRegionTierFromTokens(project, geoTokens) {
  if (!Array.isArray(geoTokens) || geoTokens.length === 0) return 0;

  const pcity = normalizePlaceToken(project?.cityName);
  const pstate = normalizePlaceToken(project?.stateName);
  const locality = normalizePlaceToken(project?.projectLocality);
  const addr = normalizePlaceToken(project?.projectAddress);

  let best = 0;

  for (const rawT of geoTokens) {
    if (!isUsefulToken(rawT)) continue;
    const t = normalizePlaceToken(rawT);

    if (pcity && (pcity === t || pcity.includes(t) || t.includes(pcity))) {
      best = Math.max(best, 1);
      continue;
    }
    if (locality && (locality.includes(t) || t.includes(locality))) {
      best = Math.max(best, 1);
      continue;
    }
    if (addr && t.length >= 3 && addr.includes(t)) {
      best = Math.max(best, 1);
      continue;
    }
    if (pstate && (pstate === t || pstate.includes(t) || t.includes(pstate))) {
      best = Math.max(best, 2);
    }
  }

  return best;
}

export function combinedProjectRegionTier(project, geoCity, geoState, geoTokens) {
  const a = projectRegionTier(project, geoCity, geoState);
  const b = projectRegionTierFromTokens(project, geoTokens);
  if (a === 1 || b === 1) return 1;
  if (a === 2 || b === 2) return 2;
  return 0;
}

/** 1 = city-level match in listing text, 2 = state only */
export function listingRegionTier(listing, geoCity, geoState) {
  const city = normalizePlaceToken(geoCity);
  const state = normalizePlaceToken(geoState);
  if (!city && !state) return 0;

  const raw = listing?.raw || {};
  const blob = normalizePlaceToken(
    [raw.city, raw.state, raw.locality, raw.address, listing?.location]
      .filter(Boolean)
      .join(" "),
  );
  if (!blob) return 0;

  const cityMatches = !!city && blob.includes(city);
  const stateMatches = !!state && blob.includes(state);

  if (cityMatches) return 1;
  if (stateMatches) return 2;
  return 0;
}

export function listingRegionTierFromTokens(listing, geoTokens) {
  if (!Array.isArray(geoTokens) || geoTokens.length === 0) return 0;

  const raw = listing?.raw || {};
  const blob = normalizePlaceToken(
    [raw.city, raw.state, raw.locality, raw.address, listing?.location]
      .filter(Boolean)
      .join(" "),
  );
  if (!blob) return 0;

  let best = 0;
  for (const rawT of geoTokens) {
    if (!isUsefulToken(rawT)) continue;
    const t = normalizePlaceToken(rawT);
    if (!blob.includes(t)) continue;

    const rawState = normalizePlaceToken(raw.state);
    if (rawState && (rawState === t || rawState.includes(t) || t.includes(rawState))) {
      best = Math.max(best, 2);
    } else {
      best = Math.max(best, 1);
    }
  }
  return best;
}

export function combinedListingRegionTier(listing, geoCity, geoState, geoTokens) {
  const a = listingRegionTier(listing, geoCity, geoState);
  const b = listingRegionTierFromTokens(listing, geoTokens);
  if (a === 1 || b === 1) return 1;
  if (a === 2 || b === 2) return 2;
  return 0;
}

export function buildSubtitleForRegion(geoCity, geoState) {
  const c = String(geoCity || "").trim();
  const s = String(geoState || "").trim();
  if (c && s) return `Latest projects & listings near ${c}, ${s}`;
  if (c) return `Latest projects & listings near ${c}`;
  if (s) return `Latest projects & listings in ${s}`;
  return "";
}

export function buildMixedRecommendationsForRegion({
  projects,
  latestPublicListings,
  excludeSlugSet,
  geoCity,
  geoState,
  geoTokens = [],
  limit = 8,
}) {
  const exclude =
    excludeSlugSet instanceof Set ? excludeSlugSet : new Set(excludeSlugSet || []);

  const tokenList = Array.isArray(geoTokens) ? geoTokens : [];

  const projectsSortedLatest = [...normalizeProjectsArray(projects)]
    .filter((p) => p?.slugURL && p?.projectName)
    .sort((a, b) => projectLatestTimestamp(b) - projectLatestTimestamp(a));

  const listings = Array.isArray(latestPublicListings) ? latestPublicListings : [];

  const projectPool = projectsSortedLatest
    .filter((p) => !exclude.has(p.slugURL))
    .map((p) => ({
      itemKind: "project",
      sort: projectLatestTimestamp(p),
      tier: combinedProjectRegionTier(p, geoCity, geoState, tokenList),
      payload: p,
    }))
    .filter((x) => x.tier > 0);

  const listingPool = listings
    .filter((row) => row?.slug && row?.title)
    .map((row) => ({
      itemKind: "property",
      sort: propertyListingLatestTimestamp(row),
      tier: combinedListingRegionTier(row, geoCity, geoState, tokenList),
      payload: row,
    }))
    .filter((x) => x.tier > 0);

  const combined = [...projectPool, ...listingPool].sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return b.sort - a.sort;
  });

  return combined.slice(0, limit).map(({ itemKind, payload }) => ({ itemKind, ...payload }));
}

export async function fetchSpotlightDataForApi() {
  const [projects, latestPublicListings] = await Promise.all([
    getAllProjects(),
    loadPublicPropertiesForSpotlight(),
  ]);
  return { projects, latestPublicListings };
}
