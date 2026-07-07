import { PROJECT_BUDGET_OPTIONS, matchesBudgetRangeForProject } from "./projectFilterUtils";
import { cityNameMatchesFilter } from "./cityAliasUtils";
import {
  normalizeProjectSearchText,
  scoreProjectSearchMatch,
} from "./projectSearchUtils";

const BUDGET_PATTERNS = [
  {
    pattern: /\b(?:below|under|upto|up\s*to|less\s*than)\s*(?:₹\s*)?(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)\b/i,
    bucket: (n) => {
      const v = Number(n);
      if (v <= 1) return "Up to 1Cr*";
      if (v < 3) return "1-3 Cr*";
      if (v < 5) return "3-5 Cr*";
      return "Above 5 Cr*";
    },
  },
  {
    pattern: /\b(?:above|over|more\s*than)\s*(?:₹\s*)?(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)\b/i,
    bucket: () => "Above 5 Cr*",
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
    pattern: /\b(?:₹\s*)?(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)\b/i,
    bucket: (n) => {
      const v = Number(n);
      if (v <= 1) return "Up to 1Cr*";
      if (v < 3) return "1-3 Cr*";
      if (v < 5) return "3-5 Cr*";
      return "Above 5 Cr*";
    },
  },
];

const TYPE_HINTS = [
  { pattern: /\b(?:new\s*launch(?:es)?|newly\s*launched)\b/i, tab: "New Launched" },
  { pattern: /\b(?:commercial|office|retail|shop|showroom)\b/i, tab: "Commercial" },
  { pattern: /\b(?:residential\s*land|(?<!sco\s)plots?)\b/i, tab: "Plots", bhkType: "Plots" },
  { pattern: /\b(?:residential|apartment|flat|villa|bhk|farm\s*house)\b/i, tab: "Residential" },
];

const BHK_PATTERN = /\b(\d+)\s*bhk\b/i;

export function parseSmartSearchQuery(rawQuery, { cities = [], projectTypes = [] } = {}) {
  const original = String(rawQuery || "").trim();
  let remaining = original;
  let budget = "";
  let cityId = "";
  let cityName = "";
  let quickTab = "";
  let bhkType = "";

  for (const { pattern, bucket } of BUDGET_PATTERNS) {
    const match = remaining.match(pattern);
    if (match) {
      budget = bucket(...match.slice(1));
      remaining = remaining.replace(match[0], " ").replace(/\s+/g, " ").trim();
      break;
    }
  }

  for (const { pattern, tab, bhkType: hintBhkType } of TYPE_HINTS) {
    if (pattern.test(remaining)) {
      quickTab = tab;
      if (hintBhkType) bhkType = hintBhkType;
      break;
    }
  }

  const bhkMatch = remaining.match(BHK_PATTERN);
  if (bhkMatch) {
    bhkType = `${bhkMatch[1]} BHK`;
  }

  const cityNorm = normalizeProjectSearchText(remaining);
  const sortedCities = [...cities].sort(
    (a, b) => String(b?.cityName || "").length - String(a?.cityName || "").length,
  );

  for (const city of sortedCities) {
    const name = String(city?.cityName || "").trim();
    if (!name) continue;
    const nameNorm = normalizeProjectSearchText(name);
    if (cityNorm.includes(nameNorm) || nameNorm.includes(cityNorm)) {
      cityId = String(city.id);
      cityName = name;
      remaining = remaining
        .replace(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), " ")
        .replace(/\s+/g, " ")
        .trim();
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

  const cleanQuery = remaining
    .replace(/\b(?:in|at|near|around)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    original,
    cleanQuery,
    budget: PROJECT_BUDGET_OPTIONS.includes(budget) ? budget : "",
    cityId,
    cityName,
    propertyTypeId,
    quickTab,
    bhkType,
  };
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

  if (parsed.bhkType && !matchesBhkInConfiguration(project.projectConfiguration, parsed.bhkType)) {
    return false;
  }

  if (parsed.budget && !matchesBudgetRangeForProject(project, parsed.budget)) {
    return false;
  }

  return Boolean(parsed.cityName || parsed.bhkType || parsed.budget);
}

function buildIntentLabel(parsed) {
  const parts = [];
  if (parsed.quickTab === "Plots" || parsed.bhkType === "Plots") {
    parts.push("Plots");
  } else if (parsed.bhkType) {
    parts.push(parsed.bhkType);
  }
  if (parsed.cityName) parts.push(`in ${parsed.cityName}`);
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

  if (parsed.cityName || parsed.bhkType || parsed.budget) {
    pushResult({
      kind: "intent",
      label: buildIntentLabel(parsed),
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

    if ((parsed.cityName || parsed.bhkType || parsed.budget) && projectMatchesParsedQuery(project, parsed)) {
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
    const qNorm = normalizeProjectSearchText(q);
    if (nameNorm.length < 2) continue;

    if (qNorm.includes(nameNorm) || nameNorm.startsWith(qNorm) || qNorm.startsWith(nameNorm)) {
      pushResult({
        kind: "city",
        item: city,
        label: name,
        meta: "City",
        score: qNorm.includes(nameNorm) ? 1 : 3,
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
