/**
 * Legacy city aliases: hide from lists, redirect URLs, merge/filter projects on canonical city.
 * Gurgaon → Gurugram, Dwarka → Delhi.
 * Also powers smart-search typo / abbreviation tolerance for NCR and other cities.
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
  noida: ["noida extension", "greater noida", "noida extn", "noida ext"],
};

/**
 * Multi-word / shorthand phrases expanded before city matching.
 * Longer patterns must come first.
 */
const CITY_PHRASE_EXPANSIONS = [
  { pattern: /\bgreater\s+noida\s+west\b/g, replacement: "greater noida west" },
  { pattern: /\bgr(?:eater)?\.?\s*noida\s+west\b/g, replacement: "greater noida west" },
  { pattern: /\bnoida\s+ext(?:ension|n)?\b/g, replacement: "noida extension" },
  { pattern: /\bnoida\s+ext\b/g, replacement: "noida extension" },
  { pattern: /\bgr(?:eater)?\.?\s*noida\b/g, replacement: "greater noida" },
  { pattern: /\bg\.?\s*noida\b/g, replacement: "greater noida" },
  { pattern: /\bnew\s+delhi\b/g, replacement: "delhi" },
];

/**
 * Single-token (and a few multi-word) search aliases → canonical city name.
 * Applied after phrase expansions. Keys are normalized lowercase.
 */
export const CITY_SEARCH_ALIASES = {
  // Gurugram
  gurgaon: "gurugram",
  gurgram: "gurugram",
  gururam: "gurugram",
  gurguram: "gurugram",
  gurugaon: "gurugram",
  gurgaom: "gurugram",

  // Noida family
  noid: "noida",
  noide: "noida",
  noiada: "noida",
  "noida extn": "noida extension",
  "noida ext": "noida extension",
  "gr noida": "greater noida",
  "g noida": "greater noida",

  // Delhi / NCR shorthand
  "new delhi": "delhi",
  dwarka: "delhi",

  // Ghaziabad
  gzb: "ghaziabad",
  ghaziabd: "ghaziabad",
  ghaziabbad: "ghaziabad",
  gazhiabad: "ghaziabad",
  ghaziabadh: "ghaziabad",
  gaziyabad: "ghaziabad",

  // Faridabad
  faridbad: "faridabad",
  faridabd: "faridabad",
  fridabad: "faridabad",
  fbd: "faridabad",

  // Bangalore
  banglore: "bangalore",
  benglore: "bangalore",
  bengaluru: "bangalore",
  bengluru: "bangalore",
  blr: "bangalore",

  // Others commonly misspelled
  chenai: "chennai",
  dehradoon: "dehradun",
  aggra: "agra",
  hydrabad: "hyderabad",
  hyderbad: "hyderabad",
  jaipurr: "jaipur",
  lucknw: "lucknow",
  luknow: "lucknow",
  trivandrum: "thiruvananthapuram",
};

const LOCATION_STOPWORDS = new Set([
  "in",
  "at",
  "near",
  "around",
  "for",
  "under",
  "below",
  "above",
  "over",
  "upto",
  "the",
  "a",
  "an",
  "of",
  "to",
  "with",
  "and",
  "or",
  "bhk",
  "rk",
  "cr",
  "crore",
  "crores",
  "lakh",
  "lac",
  "lakhs",
  "rs",
  "inr",
  "flat",
  "flats",
  "apartment",
  "apartments",
  "project",
  "projects",
  "property",
  "properties",
  "residential",
  "commercial",
  "plot",
  "plots",
  "villa",
  "villas",
  "house",
  "budget",
  "price",
]);

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/%20/g, " ")
    .replace(/-/g, " ")
    .replace(/[.]/g, " ")
    .replace(/\s+/g, " ");
}

function slugify(value) {
  return normalizeKey(value).replace(/\s+/g, "-");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function levenshteinDistance(a, b) {
  const s = String(a || "");
  const t = String(b || "");
  if (s === t) return 0;
  if (!s.length) return t.length;
  if (!t.length) return s.length;

  const prev = new Array(t.length + 1);
  const curr = new Array(t.length + 1);
  for (let j = 0; j <= t.length; j += 1) prev[j] = j;

  for (let i = 1; i <= s.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= t.length; j += 1) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= t.length; j += 1) prev[j] = curr[j];
  }
  return prev[t.length];
}

function fuzzyThresholdFor(word) {
  const len = String(word || "").length;
  if (len <= 4) return 1;
  if (len <= 8) return 2;
  return 2;
}

function tokenFuzzyMatches(token, candidate) {
  const a = String(token || "");
  const b = String(candidate || "");
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length < 3 || b.length < 3) return false;
  const distance = levenshteinDistance(a, b);
  if (distance > fuzzyThresholdFor(b)) return false;
  // Avoid near-empty matches like very short typos collapsing cities.
  return distance < Math.max(2, Math.floor(b.length / 2));
}

/** Expand shorthand / aliases in a free-text city query. */
export function normalizeCitySearchQuery(value) {
  let norm = normalizeKey(value);
  if (!norm) return "";

  for (const { pattern, replacement } of CITY_PHRASE_EXPANSIONS) {
    norm = norm.replace(pattern, replacement);
  }

  // Longer alias keys first so "noida extn" wins over "noid".
  const aliasKeys = Object.keys(CITY_SEARCH_ALIASES).sort((a, b) => b.length - a.length);
  for (const alias of aliasKeys) {
    const canonical = CITY_SEARCH_ALIASES[alias];
    if (!canonical || alias === canonical) continue;
    const re = new RegExp(`\\b${escapeRegExp(alias)}\\b`, "g");
    norm = norm.replace(re, canonical);
  }

  return norm.replace(/\s+/g, " ").trim();
}

/** @deprecated Use normalizeCitySearchQuery */
export function stripCityExtensionAbbreviations(value) {
  return normalizeCitySearchQuery(value);
}

/** All searchable spellings that should resolve to a city display name. */
export function getCitySearchVariants(cityName) {
  const nameNorm = normalizeKey(cityName);
  if (!nameNorm) return [];

  const variants = new Set([nameNorm]);

  for (const [alias, canonical] of Object.entries(CITY_SEARCH_ALIASES)) {
    if (normalizeKey(canonical) === nameNorm) {
      variants.add(normalizeKey(alias));
    }
  }

  // Equivalents used for listing merge (gurgaon ↔ gurugram, etc.).
  const equivalents = CITY_NAME_EQUIVALENTS[nameNorm] || CITY_NAME_EQUIVALENTS[slugify(nameNorm)];
  if (equivalents) {
    equivalents.forEach((item) => variants.add(normalizeKey(item)));
  }

  return [...variants].filter(Boolean).sort((a, b) => b.length - a.length);
}

function extractLocationTokens(queryNorm) {
  return String(queryNorm || "")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter((part) => {
      if (!part || LOCATION_STOPWORDS.has(part)) return false;
      if (/^\d+(?:\.\d+)?$/.test(part)) return false;
      return part.length >= 3;
    });
}

function softTokenMatchesCity(token, nameNorm, variants) {
  if (!token) return false;

  for (const variant of variants) {
    if (token === variant) return true;
  }

  // Multi-word cities are resolved at query level (all words), not via one token.
  if (nameNorm.includes(" ")) {
    if (tokenFuzzyMatches(token, nameNorm)) return true;
    for (const variant of variants) {
      if (variant.includes(" ") && (token === variant || tokenFuzzyMatches(token, variant))) {
        return true;
      }
    }
    return false;
  }

  if (nameNorm.startsWith(token) && token.length >= 3) return true;
  if (token.startsWith(nameNorm) && nameNorm.length >= 3) return true;
  if (tokenFuzzyMatches(token, nameNorm)) return true;

  for (const variant of variants) {
    if (variant.includes(" ")) continue;
    if (variant.startsWith(token) && token.length >= 3) return true;
    if (tokenFuzzyMatches(token, variant)) return true;
  }

  return false;
}

function multiWordCityMatchesQuery(queryNorm, nameNorm, tokens) {
  const words = nameNorm.split(/\s+/).filter((w) => w.length >= 3);
  if (words.length < 2) return false;

  return words.every((word) =>
    tokens.some(
      (token) =>
        token === word ||
        (word.startsWith(token) && token.length >= 4) ||
        (token.startsWith(word) && word.length >= 4) ||
        tokenFuzzyMatches(token, word),
    ),
  );
}

/**
 * Whether user query text matches a city name for search / autocomplete.
 * Supports aliases, abbreviations, truncated tokens ("noid"), and light typos.
 */
export function queryTextMatchesCityName(cityQueryNorm, cityNameNorm) {
  const queryNorm = normalizeCitySearchQuery(cityQueryNorm);
  const nameNorm = normalizeKey(cityNameNorm);
  if (!queryNorm || !nameNorm) return false;

  // If the query clearly names a longer sibling city, don't let the short city win
  // (e.g. "greater noida" must not also match "Noida" via includes).
  const blockedLonger = SUBSTRING_MATCH_BLOCKLIST[nameNorm] || [];
  for (const longer of blockedLonger) {
    const longerNorm = normalizeCitySearchQuery(longer);
    if (longerNorm && longerNorm !== nameNorm && queryNorm.includes(longerNorm)) {
      return false;
    }
  }

  // Strict matches first (unchanged winners for correct spellings).
  if (queryNorm === nameNorm) return true;
  if (queryIncludesWholeCity(queryNorm, nameNorm)) return true;
  if (queryNorm.startsWith(`${nameNorm} `)) return true;

  // Whole-query autocomplete: "noi" → Noida, but not multi-word cities via short prefix.
  if (!nameNorm.includes(" ") && nameNorm.startsWith(queryNorm) && queryNorm.length >= 3) {
    return true;
  }
  if (nameNorm.startsWith(queryNorm) && queryNorm.length >= Math.max(6, nameNorm.length - 1)) {
    return true;
  }

  // Keep Noida Extension from stealing bare "noida" / "noid" queries.
  if (nameNorm.includes(" extension") && !/\bextension\b/.test(queryNorm)) {
    return false;
  }

  // Keep Greater Noida from stealing bare "noida" unless "greater" (or expanded alias) is present.
  if (
    nameNorm.startsWith("greater ") &&
    !/\bgreater\b/.test(queryNorm) &&
    !queryIncludesWholeCity(queryNorm, nameNorm)
  ) {
    return false;
  }

  const variants = getCitySearchVariants(nameNorm);
  const tokens = extractLocationTokens(queryNorm);

  for (const variant of variants) {
    if (variant === nameNorm) continue;
    if (variant.length >= 3 && queryIncludesWholeCity(queryNorm, variant)) return true;
  }

  // Multi-word cities need all words represented (so "greater noida" ≠ "Greater Noida West").
  if (nameNorm.includes(" ")) {
    if (multiWordCityMatchesQuery(queryNorm, nameNorm, tokens)) return true;
    for (const variant of variants) {
      if (variant.includes(" ") && multiWordCityMatchesQuery(queryNorm, variant, tokens)) {
        return true;
      }
    }
    return false;
  }

  for (const token of tokens) {
    if (softTokenMatchesCity(token, nameNorm, variants)) return true;
  }

  // Adjacent token pairs for leftover shorthand pairs.
  for (let i = 0; i < tokens.length - 1; i += 1) {
    const pair = `${tokens[i]} ${tokens[i + 1]}`;
    if (softTokenMatchesCity(pair, nameNorm, variants)) return true;
    if (variants.some((variant) => variant === pair)) return true;
  }

  return false;
}

function queryIncludesWholeCity(queryNorm, nameNorm) {
  if (!queryNorm || !nameNorm) return false;
  if (queryNorm === nameNorm) return true;
  const re = new RegExp(`(?:^|\\s)${escapeRegExp(nameNorm)}(?:\\s|$)`);
  return re.test(queryNorm);
}

/** Strip matched city name / aliases from remaining query text after parse. */
export function removeCityMentionsFromQuery(text, cityName) {
  let next = String(text || "");
  if (!next) return "";

  const variants = getCitySearchVariants(cityName);
  for (const variant of variants) {
    if (!variant) continue;
    next = next.replace(new RegExp(`\\b${escapeRegExp(variant)}\\b`, "gi"), " ");
  }

  return next
    .replace(/\bnoida\s+extn\b/gi, " ")
    .replace(/\bnoida\s+ext\b/gi, " ")
    .replace(/\bgr(?:eater)?\.?\s*noida\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
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

  const canonical = canonicalSlugFromCity(city);
  const itemCityNorm = cityNorm ?? normalizeKey(item?.cityName);
  if (itemCityNorm && isBlockedSubstringCityField(itemCityNorm, canonical)) {
    return false;
  }

  const fields = [
    cityNorm,
    projectAddressNorm,
    localityNorm,
  ].filter(Boolean);

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

  // Primary city wins: Noida Extension rows must not appear under a Noida-only filter.
  if (cityNorm && isBlockedSubstringCityField(cityNorm, canonical)) {
    return false;
  }

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
