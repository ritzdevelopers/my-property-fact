/**
 * Legacy city aliases: hide from lists, redirect URLs, merge/filter projects on canonical city.
 * Gurgaon → Gurugram, Dwarka → Delhi.
 */

/** URL slug aliases → canonical slug (used in /city/{slug} and *-in-{slug} paths). */
export const CITY_SLUG_ALIASES = {
  gurgaon: "gurugram",
  dwarka: "delhi",
};

/** Cities omitted from nav, footer, and filter dropdowns. */
const HIDDEN_CITY_SLUGS = new Set(["gurgaon", "dwarka"]);
const HIDDEN_CITY_NAMES = new Set(["gurgaon", "dwarka"]);

/** Normalized names treated as the same city when filtering projects. */
const CITY_NAME_EQUIVALENTS = {
  gurugram: ["gurugram", "gurgaon"],
  gurgaon: ["gurugram", "gurgaon"],
  delhi: ["delhi", "dwarka"],
  dwarka: ["delhi", "dwarka"],
};

/** Legacy API slugs whose projects are merged into the canonical city page. */
export const LEGACY_CITY_SLUGS_FOR_PAGE_MERGE = {
  gurugram: ["gurgaon"],
  delhi: ["dwarka"],
};

/**
 * Normalized city names that must not match a shorter slug via substring checks
 * (e.g. "noida" must not swallow "noida extension" or "greater noida").
 */
const SUBSTRING_MATCH_BLOCKLIST = {
  noida: ["noida extension", "greater noida"],
};

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/%20/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ");
}

function slugify(value) {
  return normalizeKey(value).replace(/\s+/g, "-");
}

/** Canonical URL slug for a city segment (e.g. gurgaon → gurugram). */
export function resolveCitySlug(slug) {
  if (slug == null || slug === "") return "";
  const norm = String(slug).trim().toLowerCase().replace(/%20/g, "-");
  return CITY_SLUG_ALIASES[norm] || norm;
}

/** Resolve city segment in `{floor}-in-{city}` or `{category}-in-{city}` slugs. */
export function resolveCitySlugInCompoundSlug(slug) {
  if (!slug || typeof slug !== "string" || !slug.includes("-in-")) {
    return resolveCitySlug(slug);
  }
  const segments = slug.split("-in-");
  if (segments.length < 2) return resolveCitySlug(slug);
  const prefix = segments[0];
  const cityPart = segments.slice(1).join("-in-");
  const resolvedCity = resolveCitySlug(cityPart);
  if (resolvedCity === cityPart.trim().toLowerCase()) return slug;
  return `${prefix}-in-${resolvedCity}`;
}

export function isHiddenCity(city) {
  if (!city) return false;
  const slug = String(city.slugURL || "").toLowerCase().trim();
  const name = String(city.cityName || "").toLowerCase().trim();
  return HIDDEN_CITY_SLUGS.has(slug) || HIDDEN_CITY_NAMES.has(name);
}

/** City list for UI (header, footer, dropdowns) — excludes hidden legacy cities. */
export function getDisplayCityList(cities) {
  return (cities || []).filter((city) => !isHiddenCity(city));
}

function canonicalSlugFromCity(city) {
  if (!city) return "";
  const fromSlug = resolveCitySlug(city.slugURL);
  if (fromSlug) return fromSlug;
  return resolveCitySlug(slugify(city.cityName));
}

/** Normalized city names to match when filtering (e.g. gurugram + gurgaon). */
export function getEquivalentCityNames(cityOrSlugOrName) {
  const key =
    typeof cityOrSlugOrName === "object"
      ? canonicalSlugFromCity(cityOrSlugOrName)
      : resolveCitySlug(
          slugify(
            typeof cityOrSlugOrName === "string" ? cityOrSlugOrName : "",
          ),
        );
  const names = CITY_NAME_EQUIVALENTS[key] || [key];
  return new Set(names.map((n) => normalizeKey(n)).filter(Boolean));
}

function isBlockedSubstringCityField(fieldNorm, canonicalSlug) {
  const blocked = SUBSTRING_MATCH_BLOCKLIST[canonicalSlug];
  if (!blocked?.length || !fieldNorm) return false;
  return blocked.some(
    (name) =>
      fieldNorm === name ||
      fieldNorm.startsWith(`${name} `) ||
      fieldNorm.includes(` ${name}`),
  );
}

function fieldMatchesCityFilter(fieldNorm, matchName, canonicalSlug) {
  if (!fieldNorm || !matchName) return false;
  if (fieldNorm === matchName) return true;
  if (isBlockedSubstringCityField(fieldNorm, canonicalSlug)) return false;
  return fieldNorm.includes(matchName);
}

/** Sort city slugs so longer names (e.g. noida-extension) win over shorter ones (noida). */
export function sortCitySlugsBySpecificity(citySlugs) {
  return [...citySlugs].sort((a, b) => {
    const lenDiff = normalizeKey(b).length - normalizeKey(a).length;
    if (lenDiff !== 0) return lenDiff;
    return String(a).localeCompare(String(b));
  });
}

/** Whether a project row belongs to a city slug (sitemap + listing validation). */
export function projectMatchesCitySlug(project, citySlug) {
  const canonical = resolveCitySlug(citySlug);
  if (!canonical) return false;

  const matchNames = getEquivalentCityNames(canonical);
  const projectSlug = resolveCitySlug(project?.citySlug || project?.cityURL || "");
  if (projectSlug && projectSlug === canonical) return true;

  const cityNorm = normalizeKey(project?.cityName);
  const addrNorm = normalizeKey(project?.projectAddress);
  const localityNorm = normalizeKey(project?.projectLocality);

  for (const name of matchNames) {
    if (
      fieldMatchesCityFilter(cityNorm, name, canonical) ||
      fieldMatchesCityFilter(addrNorm, name, canonical) ||
      fieldMatchesCityFilter(localityNorm, name, canonical)
    ) {
      return true;
    }
  }
  return false;
}

/** All API city ids that map to the same canonical slug (e.g. Gurgaon + Gurugram). */
export function getEquivalentCityIds(city, allCities) {
  const ids = new Set();
  const matchNames = getEquivalentCityNames(city);
  const canonical = canonicalSlugFromCity(city);
  if (!canonical && !matchNames.size) return ids;
  (allCities || []).forEach((c) => {
    const id = Number(c?.id);
    if (!Number.isFinite(id)) return;
    const name = normalizeKey(c.cityName);
    if (matchNames.has(name) || canonicalSlugFromCity(c) === canonical) {
      ids.add(id);
    }
  });
  return ids;
}

/**
 * Whether a project row belongs to the selected city (includes legacy alias names/ids).
 */
export function projectMatchesCityFilter(
  item,
  city,
  allCities,
  { cityNorm, cityIdNum, projectAddressNorm, localityNorm } = {},
) {
  if (!city) return false;

  const matchNames = getEquivalentCityNames(city);
  const matchIds = getEquivalentCityIds(city, allCities);

  if (cityIdNum != null && matchIds.has(cityIdNum)) return true;

  const fields = [
    cityNorm,
    projectAddressNorm,
    localityNorm,
  ].filter(Boolean);

  const canonical = canonicalSlugFromCity(city);

  for (const name of matchNames) {
    if (!name) continue;
    for (const field of fields) {
      if (fieldMatchesCityFilter(field, name, canonical)) return true;
    }
  }
  return false;
}

/** Client-side city match for BHK / floor listing pages (cityName from URL). */
export function cityNameMatchesFilter(cityFilterName, item) {
  const ck = normalizeKey(cityFilterName);
  if (!ck) return false;

  const canonical = resolveCitySlug(cityFilterName);
  const matchNames = getEquivalentCityNames(cityFilterName);
  const cityNorm = normalizeKey(item?.cityName || "");
  const addrNorm = normalizeKey(item?.projectAddress || "");
  const localityNorm = normalizeKey(item?.projectLocality || "");

  for (const name of matchNames) {
    if (
      fieldMatchesCityFilter(cityNorm, name, canonical) ||
      fieldMatchesCityFilter(addrNorm, name, canonical) ||
      fieldMatchesCityFilter(localityNorm, name, canonical)
    ) {
      return true;
    }
  }
  return false;
}
