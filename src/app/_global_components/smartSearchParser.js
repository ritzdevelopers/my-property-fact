import { PROJECT_BUDGET_OPTIONS, matchesBudgetRangeForProject } from "./projectFilterUtils";
import {
  cityNameMatchesFilter,
  normalizeCitySearchQuery,
  queryTextMatchesCityName,
  removeCityMentionsFromQuery,
} from "./cityAliasUtils";
import {
  normalizeProjectSearchText,
  collapseProjectSearchText,
  expandProjectSearchQuery,
  scoreProjectSearchMatch,
  getMeaningfulQueryTokens,
  searchTokenMatchesHaystack,
} from "./projectSearchUtils";
import { extractTypesFromProjectConfiguration } from "@/lib/listingFloorValidation";

const CONFIG_TYPE_HINTS = [
  { pattern: /\bsco\s*plots?\b/i, configType: "sco-plots", label: "SCO Plots", tab: "Commercial" },
  { pattern: /\bfood\s*courts?\b/i, configType: "food-court", label: "Food Court", tab: "Commercial" },
  { pattern: /\brestaurants?\b/i, configType: "restaurant", label: "Restaurant", tab: "Commercial" },
  { pattern: /\bshowrooms?\b/i, configType: "showroom", label: "Showroom", tab: "Commercial" },
  { pattern: /\bkiosks?\b/i, configType: "kiosk", label: "Kiosk", tab: "Commercial" },
  {
    pattern: /\b(?:office\s*spaces?|offices?|coworking|co[\s-]?working)\b/i,
    configType: "office",
    label: "Office",
    tab: "Commercial",
  },
  { pattern: /\bretail\s*(?:spaces?|shops?|outlets?)?\b/i, configType: "shops", label: "Shops", tab: "Commercial" },
  { pattern: /\bshops?\b/i, configType: "shops", label: "Shops", tab: "Commercial" },
];

const RESIDENTIAL_CONFIG_HINTS = [
  { pattern: /\b(?:farm\s*houses?)\b/i, bhkType: "Villa", tab: "Residential" },
  { pattern: /\b(?:independent\s*house|villas?)\b/i, bhkType: "Villa", tab: "Residential" },
  { pattern: /\b(?:1\s*rk|studio\s*apartments?)\b/i, bhkType: "1 RK", tab: "Residential" },
  { pattern: /\bbuilder\s*floors?\b/i, bhkType: "2 BHK", tab: "Residential" },
];

const CONFIG_TYPE_LABELS = {
  office: "Office",
  shops: "Shops",
  showroom: "Showroom",
  "food-court": "Food Court",
  kiosk: "Kiosk",
  restaurant: "Restaurant",
  "sco-plots": "SCO Plots",
};

function normalizeConfigTypeKey(rawType) {
  const t = String(rawType || "").toLowerCase().trim().replace(/\s+/g, " ");
  if (!t) return null;
  if (t === "shop" || t === "shops") return "shops";
  if (t === "office" || t === "offices") return "office";
  if (t === "kiosk" || t === "kiosks") return "kiosk";
  if (t === "food court" || t === "food courts") return "food-court";
  if (t === "restaurant" || t === "restaurants") return "restaurant";
  if (t === "showroom" || t === "showrooms") return "showroom";
  if (t === "sco plots" || t === "sco plot") return "sco-plots";
  return null;
}

export function matchesConfigTypeInConfiguration(projectConfiguration, selectedKey) {
  const wanted = String(selectedKey || "").trim();
  if (!wanted) return true;
  const config = String(projectConfiguration || "");
  if (!config) return false;

  const types = extractTypesFromProjectConfiguration(config);
  const keys = new Set();
  for (const type of types) {
    const norm = normalizeConfigTypeKey(type);
    if (norm) keys.add(norm);
  }
  return keys.has(wanted);
}

const BUDGET_PATTERNS = [
  {
    // "below/under/up to 3 cr" → ceiling bucket at or under that amount
    pattern: /\b(?:below|under|upto|up\s*to|less\s*than)\s*(?:₹\s*)?(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)\b/i,
    bucket: (n) => {
      const v = Number(n);
      if (v <= 1) return "Up to 1Cr*";
      if (v <= 3) return "1-3 Cr*";
      if (v <= 5) return "3-5 Cr*";
      return "Above 5 Cr*";
    },
  },
  {
    pattern: /\b(?:above|over|more\s*than)\s*(?:₹\s*)?(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)\b/i,
    bucket: (n) => {
      const v = Number(n);
      if (v < 3) return "1-3 Cr*";
      if (v < 5) return "3-5 Cr*";
      return "Above 5 Cr*";
    },
  },
  {
    pattern: /\b(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)\s*[-–to]+\s*(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)\b/i,
    bucket: (a, b) => {
      const lo = Number(a);
      const hi = Number(b);
      if (lo <= 1 && hi <= 3) return "1-3 Cr*";
      if (lo >= 3 && hi <= 5) return "3-5 Cr*";
      return "Above 5 Cr*";
    },
  },
  {
    // Bare amount like "3 cr" ≈ that price band (3 sits on the 3-5 boundary)
    pattern: /\b(?:₹\s*)?(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)\b/i,
    bucket: (n) => {
      const v = Number(n);
      if (v <= 1) return "Up to 1Cr*";
      if (v < 3) return "1-3 Cr*";
      if (v <= 5) return "3-5 Cr*";
      return "Above 5 Cr*";
    },
  },
];

const TYPE_HINTS = [
  { pattern: /\b(?:new\s*launch(?:es)?|newly\s*launched)\b/i, tab: "New Launched" },
  { pattern: /\bcommercial\b/i, tab: "Commercial" },
  { pattern: /\b(?:residential\s*land|(?<!sco\s)plots?)\b/i, tab: "Plots", bhkType: "Plots" },
  { pattern: /\b(?:residential|apartments?|flats?|bhk)\b/i, tab: "Residential" },
];

const BHK_PATTERN_GLOBAL = /\b(\d+)\s*bhk\b/gi;

function extractAllBhkTypes(text) {
  const types = [];
  const seen = new Set();
  const source = String(text || "");
  let match;
  BHK_PATTERN_GLOBAL.lastIndex = 0;
  while ((match = BHK_PATTERN_GLOBAL.exec(source)) !== null) {
    const label = `${match[1]} BHK`;
    if (seen.has(label)) continue;
    seen.add(label);
    types.push(label);
  }
  return types;
}

function stripStructuredNoiseFromQuery(text) {
  return String(text || "")
    .replace(BHK_PATTERN_GLOBAL, " ")
    .replace(/\b(?:below|under|upto|up\s*to|less\s*than|above|over|more\s*than)\s*(?:₹\s*)?\d+(?:\.\d+)?\s*(?:cr|crore|crores)\b/gi, " ")
    .replace(/\b(?:₹\s*)?\d+(?:\.\d+)?\s*(?:cr|crore|crores)(?:\s*[-–to]+\s*(?:₹\s*)?\d+(?:\.\d+)?\s*(?:cr|crore|crores))?/gi, " ")
    .replace(/\b(?:new\s*launch(?:es)?|newly\s*launched|commercial|residential|apartments?|flats?|bhk)\b/gi, " ")
    .replace(/\b(?:in|at|near|around|for|with|and|or|,|=)\b/gi, " ")
    .replace(/[,/|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseSmartSearchQuery(rawQuery, { cities = [], projectTypes = [] } = {}) {
  const original = String(rawQuery || "").trim();
  let remaining = original;
  let budget = "";
  let cityId = "";
  let cityName = "";
  let quickTab = "";
  let bhkType = "";
  let bhkTypes = [];
  let configType = "";
  let configLabel = "";

  for (const { pattern, bucket } of BUDGET_PATTERNS) {
    const match = remaining.match(pattern);
    if (match) {
      budget = bucket(...match.slice(1));
      remaining = remaining.replace(match[0], " ").replace(/\s+/g, " ").trim();
      break;
    }
  }

  for (const { pattern, configType: hintConfigType, label, tab } of CONFIG_TYPE_HINTS) {
    if (pattern.test(remaining)) {
      configType = hintConfigType;
      configLabel = label;
      quickTab = tab;
      break;
    }
  }

  if (!bhkType) {
    for (const { pattern, bhkType: hintBhkType, tab } of RESIDENTIAL_CONFIG_HINTS) {
      if (pattern.test(remaining)) {
        bhkType = hintBhkType;
        bhkTypes = hintBhkType ? [hintBhkType] : [];
        if (!quickTab) quickTab = tab;
        break;
      }
    }
  }

  if (!quickTab) {
    for (const { pattern, tab, bhkType: hintBhkType } of TYPE_HINTS) {
      if (pattern.test(remaining)) {
        quickTab = tab;
        if (hintBhkType && !bhkType) {
          bhkType = hintBhkType;
          bhkTypes = [hintBhkType];
        }
        break;
      }
    }
  } else if (!bhkType) {
    for (const { pattern, tab, bhkType: hintBhkType } of TYPE_HINTS) {
      if (pattern.test(remaining) && hintBhkType) {
        bhkType = hintBhkType;
        bhkTypes = [hintBhkType];
        break;
      }
    }
  }

  const parsedBhkTypes = extractAllBhkTypes(remaining);
  if (parsedBhkTypes.length > 0) {
    bhkTypes = parsedBhkTypes;
    bhkType = parsedBhkTypes[0];
    if (!quickTab) quickTab = "Residential";
  }

  const cityNorm = normalizeCitySearchQuery(remaining);
  const sortedCities = [...cities].sort(
    (a, b) => String(b?.cityName || "").length - String(a?.cityName || "").length,
  );

  for (const city of sortedCities) {
    const name = String(city?.cityName || "").trim();
    if (!name) continue;
    const nameNorm = normalizeProjectSearchText(name);
    if (queryTextMatchesCityName(cityNorm, nameNorm)) {
      cityId = String(city.id);
      cityName = name;
      remaining = removeCityMentionsFromQuery(remaining, name);
      break;
    }
  }

  let propertyTypeId = "";
  if (quickTab) {
    const typeMeta = projectTypes.find((t) => {
      const n = normalizeProjectSearchText(t?.projectTypeName);
      if (quickTab === "New Launched") return n.includes("new launch");
      if (quickTab === "Commercial") return n === "commercial";
      if (quickTab === "Residential" || quickTab === "Plots") return n === "residential";
      return false;
    });
    if (typeMeta?.id != null) propertyTypeId = String(typeMeta.id);
  }

  const cleanQuery = stripStructuredNoiseFromQuery(remaining);
  const localityQuery = expandProjectSearchQuery(cleanQuery);

  return {
    original,
    cleanQuery,
    localityQuery,
    budget: PROJECT_BUDGET_OPTIONS.includes(budget) ? budget : "",
    cityId,
    cityName,
    propertyTypeId,
    quickTab,
    bhkType,
    bhkTypes,
    configType,
    configLabel: configLabel || CONFIG_TYPE_LABELS[configType] || "",
  };
}

export function hasStructuredSearchIntent(parsed) {
  if (!parsed) return false;
  return Boolean(
    parsed.cityId ||
      parsed.configType ||
      parsed.bhkType ||
      (parsed.bhkTypes && parsed.bhkTypes.length) ||
      parsed.budget ||
      parsed.quickTab ||
      parsed.localityQuery,
  );
}

export function projectMatchesSearchTokens(project, rawQuery) {
  const tokens = getMeaningfulQueryTokens(rawQuery);
  if (tokens.length === 0) return true;

  const haystack = normalizeProjectSearchText(
    [
      project?.projectName,
      project?.projectConfiguration,
      project?.cityName || project?.city,
      project?.builderName,
      project?.projectLocality,
      project?.projectAddress,
    ]
      .filter(Boolean)
      .join(" "),
  );
  const collapsed = collapseProjectSearchText(haystack);

  return tokens.every((token) =>
    searchTokenMatchesHaystack(token, haystack, collapsed),
  );
}

export function matchesBhkInConfiguration(projectConfiguration, bhkType) {
  const wanted = String(bhkType || "").trim();
  if (!wanted) return true;
  const config = String(projectConfiguration || "");
  if (!config) return false;

  if (/^plots?$/i.test(wanted)) {
    return /\bplot(s)?\b/i.test(config);
  }

  const bhk = wanted.match(/^(\d+)\s*BHK/i);
  if (bhk?.[1]) {
    return new RegExp(`\\b${bhk[1]}\\s*BHK\\b`, "i").test(config);
  }

  return normalizeProjectSearchText(config).includes(normalizeProjectSearchText(wanted));
}

export function projectMatchesParsedQuery(project, parsed) {
  if (!project || !parsed) return false;

  if (parsed.cityName && !cityNameMatchesFilter(parsed.cityName, project)) {
    return false;
  }

  const bhkOptions = Array.isArray(parsed.bhkTypes) && parsed.bhkTypes.length > 0
    ? parsed.bhkTypes
    : parsed.bhkType
      ? [parsed.bhkType]
      : [];
  if (
    bhkOptions.length > 0 &&
    !bhkOptions.some((bhk) =>
      matchesBhkInConfiguration(project.projectConfiguration, bhk),
    )
  ) {
    return false;
  }

  if (parsed.configType && !matchesConfigTypeInConfiguration(project.projectConfiguration, parsed.configType)) {
    return false;
  }

  if (parsed.budget && !matchesBudgetRangeForProject(project, parsed.budget)) {
    return false;
  }

  if (parsed.localityQuery) {
    if (!projectMatchesSearchTokens(project, parsed.localityQuery)) {
      return false;
    }
  }

  return Boolean(
    parsed.cityName ||
      parsed.bhkType ||
      (parsed.bhkTypes && parsed.bhkTypes.length) ||
      parsed.configType ||
      parsed.budget ||
      parsed.localityQuery,
  );
}

export function formatParsedSearchLabel(parsed) {
  const parts = [];
  if (parsed.configLabel) {
    parts.push(parsed.configLabel);
  } else if (parsed.quickTab === "Plots" || parsed.bhkType === "Plots") {
    parts.push("Plots");
  } else if (Array.isArray(parsed.bhkTypes) && parsed.bhkTypes.length > 1) {
    parts.push(parsed.bhkTypes.join(", "));
  } else if (parsed.bhkType) {
    parts.push(parsed.bhkType);
  } else if (parsed.quickTab === "Commercial") {
    parts.push("Commercial");
  } else if (parsed.quickTab === "Residential") {
    parts.push("Residential");
  }

  const place = parsed.localityQuery || parsed.cityName || "";
  if (place) {
    const prettyPlace = String(place)
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    parts.push(`in ${prettyPlace}`);
  }
  if (parsed.budget) parts.push(parsed.budget);
  if (parts.length > 0) return parts.join(" ");
  return parsed.original;
}

function formatProjectMeta(project) {
  const parts = [project?.projectLocality, project?.cityName || project?.city]
    .map((part) => String(part || "").trim())
    .filter(Boolean);
  const location = parts.join(", ") || "India";
  const config = String(project?.projectConfiguration || "").trim();
  return config ? `${location} · ${config}` : location;
}

/**
 * Build autocomplete suggestions for natural-language queries like "3 bhk in noida".
 */
export function buildSmartSearchSuggestions(
  rawQuery,
  { projectList = [], cities = [], builderList = [], projectTypes = [], limit = 8 } = {},
) {
  const q = String(rawQuery || "").trim();
  if (q.length < 2) return [];

  const parsed = parseSmartSearchQuery(q, { cities, projectTypes });
  const qLower = q.toLowerCase();
  const results = [];
  const seen = new Set();

  const pushResult = (entry) => {
    const key = `${entry.kind}:${entry.label}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push(entry);
  };

  if (parsed.cityName || parsed.bhkType || parsed.budget || parsed.configType) {
    pushResult({
      kind: "intent",
      label: formatParsedSearchLabel(parsed),
      meta: "Search all matching projects",
      parsed,
      score: -2,
    });
  }

  for (const project of projectList) {
    const name = String(project?.projectName || "").trim();
    if (!name) continue;

    const nameScore = scoreProjectSearchMatch(name, q);
    if (nameScore >= 0) {
      pushResult({
        kind: "project",
        item: project,
        label: name,
        meta: formatProjectMeta(project),
        score: nameScore,
      });
      continue;
    }

    if (
      (parsed.cityName || parsed.bhkType || parsed.budget || parsed.configType) &&
      projectMatchesParsedQuery(project, parsed)
    ) {
      pushResult({
        kind: "project",
        item: project,
        label: name,
        meta: formatProjectMeta(project),
        score: 6,
      });
    }
  }

  for (const city of cities) {
    const name = String(city?.cityName || "").trim();
    if (!name) continue;
    const nameNorm = normalizeProjectSearchText(name);
    if (nameNorm.length < 2) continue;

    const cityQueryNorm = normalizeCitySearchQuery(q);
    if (queryTextMatchesCityName(cityQueryNorm, nameNorm)) {
      pushResult({
        kind: "city",
        item: city,
        label: name,
        meta: "City",
        score: cityQueryNorm.includes(nameNorm) ? 1 : 3,
      });
    }
  }

  for (const builder of builderList) {
    const name = String(builder?.builderName || builder?.name || "").trim();
    if (!name) continue;
    const nameLower = name.toLowerCase();
    if (nameLower.startsWith(qLower) || nameLower.includes(qLower) || qLower.includes(nameLower)) {
      pushResult({
        kind: "builder",
        item: builder,
        label: name,
        meta: "Builder",
        score: nameLower.startsWith(qLower) ? 2 : 5,
      });
    }
  }

  const localityCounts = new Map();
  for (const project of projectList) {
    const locality = String(project?.projectLocality || "").trim();
    if (!locality || locality.length < 3) continue;
    if (!projectMatchesSearchTokens(project, q)) continue;
    const key = normalizeProjectSearchText(locality);
    const prev = localityCounts.get(key);
    if (prev) {
      prev.count += 1;
    } else {
      localityCounts.set(key, {
        label: locality,
        city: String(project?.cityName || project?.city || "").trim(),
        count: 1,
      });
    }
  }
  for (const entry of localityCounts.values()) {
    const localityNorm = normalizeProjectSearchText(entry.label);
    const collapsedLocality = collapseProjectSearchText(localityNorm);
    const queryNorm = normalizeProjectSearchText(q);
    const score =
      localityNorm === queryNorm || collapsedLocality === collapseProjectSearchText(q)
        ? 1
        : localityNorm.startsWith(queryNorm) || collapsedLocality.startsWith(collapseProjectSearchText(q))
          ? 2
          : 4;
    pushResult({
      kind: "locality",
      label: entry.label,
      meta: entry.city
        ? `Locality · ${entry.city} · ${entry.count} project${entry.count === 1 ? "" : "s"}`
        : `Locality · ${entry.count} project${entry.count === 1 ? "" : "s"}`,
      score,
    });
  }

  results.sort((a, b) => a.score - b.score || a.label.localeCompare(b.label));
  return results.slice(0, limit);
}

export const RECENT_SEARCHES_KEY = "mpf-recent-searches";
export const RECENT_SEARCHES_LIMIT = 5;

export function loadRecentSearches() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, RECENT_SEARCHES_LIMIT) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(label) {
  if (typeof window === "undefined" || !label) return;
  const trimmed = String(label).trim();
  if (!trimmed) return;
  const existing = loadRecentSearches().filter((s) => s !== trimmed);
  const next = [trimmed, ...existing].slice(0, RECENT_SEARCHES_LIMIT);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
}

export function removeRecentSearch(label) {
  if (typeof window === "undefined" || !label) return [];
  const trimmed = String(label).trim();
  const next = loadRecentSearches().filter((s) => s !== trimmed);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  return next;
}

export function clearRecentSearches() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}
