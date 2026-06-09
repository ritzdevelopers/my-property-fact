import {
  cityNameMatchesFilter,
  resolveCitySlug,
} from "../app/_global_components/cityAliasUtils.js";

export function normalizeListingConfigType(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/%20/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeFloorSlugSegment(segment) {
  if (segment == null || segment === "") return "";
  const s = String(segment)
    .trim()
    .toLowerCase()
    .replace(/%20/g, "-");
  if (/^\d+bhk$/.test(s)) {
    return s.replace(/^(\d+)(bhk)$/, "$1-$2");
  }
  return s;
}

export function floorSlugToListingLabel(floorSlug) {
  if (!floorSlug) return "";
  const s = String(floorSlug).toLowerCase();
  const bhk = s.match(/^(\d+)-bhk$/);
  if (bhk) return `${bhk[1]} BHK`;
  const brVilla = s.match(/^(\d+)-br-villa$/);
  if (brVilla) return `${brVilla[1]} BR Villa`;
  const rkStudio = s.match(/^(\d+)-rk-studio$/);
  if (rkStudio) return `${rkStudio[1]} RK Studio`;
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function parseFloorInCitySlug(slug, knownFloorSlugs = null) {
  if (!slug || typeof slug !== "string" || !slug.includes("-in-")) return null;
  const segments = slug.split("-in-");
  if (segments.length < 2) return null;
  let floorSlug = normalizeFloorSlugSegment(segments[0] || "");
  const citySlug = resolveCitySlug(
    segments
      .slice(1)
      .join("-in-")
      .trim()
      .toLowerCase()
      .replace(/%20/g, "-")
      .replace(/\s+/g, "-"),
  );
  if (!floorSlug || !citySlug) return null;

  if (knownFloorSlugs) {
    const resolved = resolveKnownFloorSlug(floorSlug, knownFloorSlugs);
    if (!resolved) return null;
    floorSlug = resolved;
  }

  return { floorSlug, citySlug };
}

export function configTypeMatchesWanted(type, wanted) {
  if (!type || !wanted) return false;
  if (type === wanted) return true;

  // Longer config label contains the wanted phrase (e.g. "1 rk studio apartment" → "1 rk studio").
  if (type.startsWith(`${wanted} `)) return true;

  return false;
}

export function configTypeToFloorSlug(configType) {
  const normalized = normalizeListingConfigType(configType);
  if (!normalized) return "";

  const bhk = normalized.match(/^(\d+) bhk$/);
  if (bhk) return `${bhk[1]}-bhk`;

  const brVilla = normalized.match(/^(\d+) br villa$/);
  if (brVilla) return `${brVilla[1]}-br-villa`;

  const rkStudio = normalized.match(/^(\d+) rk studio(?: apartment)?$/);
  if (rkStudio) return `${rkStudio[1]}-rk-studio`;

  return normalized.replace(/\s+/g, "-");
}

/** All `{floor}` segments that exist in project configuration data. */
export function collectKnownFloorSlugs(projects) {
  const slugs = new Set();
  if (!Array.isArray(projects)) return slugs;

  for (const project of projects) {
    for (const configType of extractTypesFromProjectConfiguration(
      project?.projectConfiguration,
    )) {
      const slug = configTypeToFloorSlug(configType);
      if (slug) slugs.add(slug);
    }
  }

  return slugs;
}

/** Wrong URL keys — only the canonical slug should resolve (e.g. `shops` not `shop`). */
const BLOCKED_FLOOR_URL_SLUGS = new Set([
  "shop",
  "plots",
  "offices",
  "restaurants",
  "showrooms",
]);

/** Exact match only — no singular/plural aliasing in URLs. */
export function resolveKnownFloorSlug(rawFloorSlug, knownSlugs) {
  const normalized = normalizeFloorSlugSegment(rawFloorSlug);
  if (!normalized || !knownSlugs?.size) return null;
  if (BLOCKED_FLOOR_URL_SLUGS.has(normalized)) return null;
  if (knownSlugs.has(normalized)) return normalized;
  return null;
}

export function extractTypesFromProjectConfiguration(value = "") {
  if (!value || typeof value !== "string") return [];
  const types = new Set();
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  for (const part of parts) {
    const cleanedPart = part
      .replace(/\s*-\s*\d+\s*(?:sq\.?\s*ft|sq\.?ft)\s*/gi, "")
      .trim();
    if (!cleanedPart) continue;

    const bhkRegex = /(\d+)\s*(?:\/|&|and|-)?\s*(\d+)?\s*BHK/gi;
    let bhkMatch;
    let foundBhk = false;
    while ((bhkMatch = bhkRegex.exec(cleanedPart)) !== null) {
      foundBhk = true;
      if (bhkMatch[1]) types.add(`${bhkMatch[1]} bhk`);
      if (bhkMatch[2]) types.add(`${bhkMatch[2]} bhk`);
    }

    const brVillaRegex = /(\d+)\s*br\s*villa/gi;
    let brVillaMatch;
    let foundBrVilla = false;
    while ((brVillaMatch = brVillaRegex.exec(cleanedPart)) !== null) {
      foundBrVilla = true;
      if (brVillaMatch[1]) types.add(`${brVillaMatch[1]} br villa`);
    }

    if (!foundBhk && !foundBrVilla) {
      types.add(normalizeListingConfigType(cleanedPart));
    }
  }

  return Array.from(types);
}

export function projectConfigurationIncludesBhk(projectConfiguration, bhkNumber) {
  const wanted = `${String(bhkNumber).trim()} bhk`;
  if (!wanted || wanted === " bhk") return false;
  return extractTypesFromProjectConfiguration(projectConfiguration).includes(
    wanted,
  );
}

export function projectConfigurationIncludesFloorSlug(
  projectConfiguration,
  floorSlug,
) {
  const normalizedFloor = normalizeFloorSlugSegment(floorSlug || "");
  if (!normalizedFloor) return false;

  const bhk = normalizedFloor.match(/^(\d+)-bhk$/);
  if (bhk?.[1]) {
    return projectConfigurationIncludesBhk(
      projectConfiguration,
      bhk[1],
    );
  }

  const brVilla = normalizedFloor.match(/^(\d+)-br-villa$/);
  if (brVilla?.[1]) {
    const wanted = `${brVilla[1]} br villa`;
    const configTypes = extractTypesFromProjectConfiguration(
      projectConfiguration,
    );
    return configTypes.some((type) => configTypeMatchesWanted(type, wanted));
  }

  const wanted = normalizeListingConfigType(
    floorSlugToListingLabel(normalizedFloor),
  );
  if (!wanted) return false;

  const configTypes = extractTypesFromProjectConfiguration(
    projectConfiguration,
  );
  return configTypes.some((type) => configTypeMatchesWanted(type, wanted));
}

export function projectMatchesFloorListing(project, citySlug, floorSlug) {
  const canonicalCity = resolveCitySlug(citySlug);
  const normalizedFloor = normalizeFloorSlugSegment(floorSlug || "");
  if (!canonicalCity || !normalizedFloor || !project) return false;
  return (
    cityNameMatchesFilter(canonicalCity, project) &&
    projectConfigurationIncludesFloorSlug(
      project.projectConfiguration,
      normalizedFloor,
    )
  );
}

export function getFloorListingProjectsInCity(projects, citySlug, floorSlug) {
  if (!Array.isArray(projects)) return [];
  return projects.filter((project) =>
    projectMatchesFloorListing(project, citySlug, floorSlug),
  );
}

export function getCompoundListingProjectsInCity(
  projects,
  citySlug,
  compoundKey,
) {
  const parsed = parseCompoundListingKey(compoundKey);
  if (!parsed?.floorSlug || !parsed?.categorySlug || !Array.isArray(projects)) {
    return [];
  }

  const canonicalCity = resolveCitySlug(citySlug);
  if (!canonicalCity) return [];

  const bhkNumber = String(parsed.floorSlug).match(/^(\d+)-bhk$/)?.[1];
  if (!bhkNumber) return [];

  return projects.filter(
    (project) =>
      cityNameMatchesFilter(canonicalCity, project) &&
      projectMatchesCompoundCategory(project, parsed.categorySlug) &&
      projectConfigurationIncludesBhk(project.projectConfiguration, bhkNumber),
  );
}

export function projectMatchesCompoundCategory(project, categorySlug) {
  const propType = String(project?.propertyTypeName || "").toLowerCase();
  const status = String(project?.projectStatusName || "").toLowerCase();
  switch (categorySlug) {
    case "new-projects":
      return status === "new launched";
    case "apartments":
    case "flats":
      return propType === "residential";
    case "commercial":
    case "offices-and-shop":
      return propType === "commercial";
    default:
      return false;
  }
}

const COMPOUND_CATEGORY_SUFFIXES = [
  "new-projects",
  "offices-and-shop",
  "apartments",
  "commercial",
];

export function parseCompoundListingKey(compoundKey) {
  if (!compoundKey || typeof compoundKey !== "string") return null;
  const lower = compoundKey.toLowerCase();
  for (const cat of COMPOUND_CATEGORY_SUFFIXES) {
    const suffix = `-${cat}`;
    if (lower.endsWith(suffix)) {
      const floorSlug = lower.slice(0, -suffix.length);
      if (!floorSlug) return null;
      return {
        floorSlug: normalizeFloorSlugSegment(floorSlug),
        categorySlug: cat,
      };
    }
  }
  return null;
}

/** Sync check — used by sitemap and server page validation. */
export function hasFloorListingDataInCity(projects, citySlug, floorSlug) {
  return getFloorListingProjectsInCity(projects, citySlug, floorSlug).length > 0;
}

export function hasCompoundListingDataInCity(projects, citySlug, compoundKey) {
  return (
    getCompoundListingProjectsInCity(projects, citySlug, compoundKey).length > 0
  );
}
