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
  const sqFt = s.match(/^(\d+)-sq\.ft$/);
  if (sqFt) return `${sqFt[1]} Sq.ft`;
  if (s === "sco-plots") return "SCO Plots";
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

/** Canonical URL slug → config types in project data that belong on that page. */
const FLOOR_URL_CONFIG_TYPES = {
  shops: ["shops", "shop"],
  office: ["office", "offices"],
  plot: ["plot", "plots"],
  restaurant: ["restaurant", "restaurants"],
  showroom: ["showroom", "showrooms"],
  "sco-plots": ["sco plots", "sco plot"],
};

/**
 * Non-canonical URL segments → canonical listing slug.
 * shops-in-{city} | office-in-{city} | plot-in-{city} | restaurant-in-{city} | showroom-in-{city}
 */
const CANONICAL_FLOOR_URL_SLUG = {
  shop: "shops",
  offices: "office",
  plots: "plot",
  restaurants: "restaurant",
  showrooms: "showroom",
};

export function canonicalFloorSlugForUrl(floorSegment) {
  const normalized = normalizeFloorSlugSegment(floorSegment || "");
  if (!normalized) return "";
  return CANONICAL_FLOOR_URL_SLUG[normalized] || normalized;
}

export function buildCanonicalFloorInCitySlug(slug) {
  if (!slug || typeof slug !== "string" || !slug.includes("-in-")) return null;
  const segments = slug.split("-in-");
  if (segments.length < 2) return null;
  const floorNorm = canonicalFloorSlugForUrl(segments[0] || "");
  const citySlug = resolveCitySlug(
    segments
      .slice(1)
      .join("-in-")
      .trim()
      .toLowerCase()
      .replace(/%20/g, "-")
      .replace(/\s+/g, "-"),
  );
  if (!floorNorm || !citySlug) return null;
  return `${floorNorm}-in-${citySlug}`;
}

export function configTypesForFloorSlug(floorSlug) {
  const normalized = normalizeFloorSlugSegment(floorSlug || "");
  if (!normalized) return [];

  const aliases = FLOOR_URL_CONFIG_TYPES[normalized];
  if (aliases) {
    return aliases.map((value) => normalizeListingConfigType(value));
  }

  const sqFt = normalized.match(/^(\d+)-sq\.ft$/);
  if (sqFt?.[1]) {
    return [normalizeListingConfigType(`${sqFt[1]} sq ft`)];
  }

  const wanted = normalizeListingConfigType(
    floorSlugToListingLabel(normalized),
  );
  return wanted ? [wanted] : [];
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

  const sqFt = normalized.match(/^(\d+)\s*sq\.?\s*ft$/);
  if (sqFt) return `${sqFt[1]}-sq.ft`;

  if (/^sco\s*plots?$/.test(normalized)) return "sco-plots";

  const slug = normalized.replace(/\s+/g, "-");
  return canonicalFloorSlugForUrl(slug);
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

/** Plural / alias URL keys — redirect to canonical slug in `CANONICAL_FLOOR_URL_SLUG`. */
const BLOCKED_FLOOR_URL_SLUGS = new Set([
  "shop",
  "plots",
  "offices",
  "restaurants",
  "showrooms",
  "sco",
]);

export function resolveKnownFloorSlug(rawFloorSlug, knownSlugs) {
  const normalized = normalizeFloorSlugSegment(rawFloorSlug);
  if (!normalized || !knownSlugs?.size) return null;
  if (BLOCKED_FLOOR_URL_SLUGS.has(normalized)) return null;
  const canonical = canonicalFloorSlugForUrl(normalized);
  if (knownSlugs.has(canonical)) return canonical;
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

    // SCO-900 sq.ft style unit sizes are not "SCO Plots" property type.
    if (/^sco$/i.test(cleanedPart)) continue;

    if (/\bsco\s*plots?\b/i.test(cleanedPart)) {
      types.add("sco plots");
    }

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
      const sqFtStandalone = cleanedPart.match(/^(\d+)\s*sq\.?\s*ft$/i);
      if (sqFtStandalone?.[1]) {
        types.add(`${sqFtStandalone[1]} sq ft`);
        continue;
      }
      const norm = normalizeListingConfigType(cleanedPart);
      if (
        norm === "shop and sco plots" ||
        norm === "shops and sco plots" ||
        (/\bshops?\b/i.test(cleanedPart) && /\bsco\s*plots?\b/i.test(cleanedPart))
      ) {
        if (/\bshops?\b/i.test(cleanedPart)) types.add("shop");
        if (/\boffices?\b/i.test(cleanedPart)) types.add("office");
        continue;
      }
      if (norm === "offices and shop" || norm === "office and shop") {
        types.add("office");
        types.add("shop");
        continue;
      }
      types.add(norm);
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

  const sqFtSlug = normalizedFloor.match(/^(\d+)-sq\.ft$/);
  if (sqFtSlug?.[1]) {
    const wanted = normalizeListingConfigType(`${sqFtSlug[1]} sq ft`);
    const configTypes = extractTypesFromProjectConfiguration(
      projectConfiguration,
    );
    return configTypes.some(
      (type) => normalizeListingConfigType(type) === wanted,
    );
  }

  const wantedTypes = configTypesForFloorSlug(normalizedFloor);
  if (!wantedTypes.length) return false;

  const configTypes = extractTypesFromProjectConfiguration(
    projectConfiguration,
  );
  return configTypes.some((type) =>
    wantedTypes.some((wanted) => configTypeMatchesWanted(type, wanted)),
  );
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

export function projectHasOfficeOrShopConfiguration(projectConfiguration) {
  return extractTypesFromProjectConfiguration(projectConfiguration).some((type) => {
    const norm = normalizeListingConfigType(type);
    return (
      norm === "office" ||
      norm === "offices" ||
      norm === "shop" ||
      norm === "shops"
    );
  });
}

/** Hub pages above the footer: category + city, not floor-plan shape. */
export function projectMatchesListingHubCategory(project, hubKey) {
  const propType = String(project?.propertyTypeName || "").toLowerCase();
  const status = String(project?.projectStatusName || "").toLowerCase();
  switch (hubKey) {
    case "apartments":
    case "flats":
      return propType === "residential";
    case "new-projects":
    case "newProjects":
      return status === "new launched";
    case "commercial":
      return propType === "commercial";
    case "offices-and-shop":
      return (
        propType === "commercial" &&
        projectHasOfficeOrShopConfiguration(project?.projectConfiguration)
      );
    default:
      return false;
  }
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
