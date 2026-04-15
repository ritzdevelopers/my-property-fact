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

function normalizePlaceToken(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
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
  limit = 8,
}) {
  const exclude =
    excludeSlugSet instanceof Set ? excludeSlugSet : new Set(excludeSlugSet || []);

  const projectsSortedLatest = [...normalizeProjectsArray(projects)]
    .filter((p) => p?.slugURL && p?.projectName)
    .sort((a, b) => projectLatestTimestamp(b) - projectLatestTimestamp(a));

  const listings = Array.isArray(latestPublicListings) ? latestPublicListings : [];

  const projectPool = projectsSortedLatest
    .filter((p) => !exclude.has(p.slugURL))
    .map((p) => ({
      itemKind: "project",
      sort: projectLatestTimestamp(p),
      tier: projectRegionTier(p, geoCity, geoState),
      payload: p,
    }))
    .filter((x) => x.tier > 0);

  const listingPool = listings
    .filter((row) => row?.slug && row?.title)
    .map((row) => ({
      itemKind: "property",
      sort: propertyListingLatestTimestamp(row),
      tier: listingRegionTier(row, geoCity, geoState),
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
