/** Normalize user/project text for case-insensitive search. */
export function normalizeProjectSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/** Collapse spaces/hyphens so "rajnagar" can match "raj nagar". */
export function collapseProjectSearchText(value) {
  return normalizeProjectSearchText(value).replace(/[\s-]+/g, "");
}

/**
 * Locality / place shorthand expansions applied before tokenizing.
 * Longer patterns must come first.
 */
const LOCALITY_PHRASE_EXPANSIONS = [
  { pattern: /\braj\s*nagar\s*ext(?:ension|n)?\b/g, replacement: "raj nagar extension" },
  { pattern: /\brajnagar\b/g, replacement: "raj nagar" },
  { pattern: /\bindirapuram\s*ext(?:ension|n)?\b/g, replacement: "indirapuram extension" },
  { pattern: /\bgomti\s*nagar\s*ext(?:ension|n)?\b/g, replacement: "gomti nagar extension" },
];

/** Expand common locality spellings (e.g. rajnagar → raj nagar). */
export function expandProjectSearchQuery(value) {
  let norm = normalizeProjectSearchText(value).replace(/-/g, " ");
  if (!norm) return "";

  for (const { pattern, replacement } of LOCALITY_PHRASE_EXPANSIONS) {
    norm = norm.replace(pattern, replacement);
  }

  return normalizeProjectSearchText(norm);
}

const SEARCH_STOP_WORDS = new Set([
  "in",
  "at",
  "on",
  "the",
  "a",
  "an",
  "for",
  "to",
  "near",
  "around",
  "and",
  "or",
  "of",
  "with",
  "project",
  "projects",
  "property",
  "properties",
  "flat",
  "flats",
  "apartment",
  "apartments",
  "residential",
  "commercial",
]);

/** Query tokens used for matching, with filler words removed. */
export function getMeaningfulQueryTokens(rawQuery) {
  return expandProjectSearchQuery(rawQuery)
    .split(/\s+/)
    .filter((token) => token && !SEARCH_STOP_WORDS.has(token));
}

/** Whether a search token appears in spaced or collapsed haystack text. */
export function searchTokenMatchesHaystack(token, haystack, collapsedHaystack = "") {
  const t = String(token || "").trim();
  if (!t) return true;
  if (haystack.includes(t)) return true;

  const collapsedToken = collapseProjectSearchText(t);
  const collapsed =
    collapsedHaystack || collapseProjectSearchText(haystack);
  return collapsedToken.length >= 4 && collapsed.includes(collapsedToken);
}

function projectNameWords(nameNorm) {
  return nameNorm.split(/\s+/).filter(Boolean);
}

/**
 * Whether one query token matches the project name.
 * Prefers whole-word / word-prefix matches so "ram" hits "Ram Raghu Ananda"
 * but not "Program Heights".
 */
function queryTokenMatchesProjectName(token, nameNorm, nameWords) {
  if (!token) return true;
  const words = nameWords ?? projectNameWords(nameNorm);

  if (words.some((w) => w === token || w.startsWith(token))) {
    return true;
  }

  // Longer tokens may still match inside the full name (e.g. builder suffix).
  if (token.length >= 5 && nameNorm.includes(token)) {
    return true;
  }

  return false;
}

/**
 * True when every word in the user's query matches the project name.
 */
export function projectNameMatchesSearch(projectName, rawQuery) {
  const name = normalizeProjectSearchText(projectName);
  const q = normalizeProjectSearchText(rawQuery);
  if (!q) return true;
  if (!name) return false;
  if (name === q) return true;

  const queryTokens = getMeaningfulQueryTokens(rawQuery);
  if (queryTokens.length === 0) return true;
  const words = projectNameWords(name);
  return queryTokens.every((token) =>
    queryTokenMatchesProjectName(token, name, words),
  );
}

/** Lower score = better match (for sorting suggestions / auto-pick). */
export function scoreProjectSearchMatch(projectName, rawQuery) {
  const name = normalizeProjectSearchText(projectName);
  const q = normalizeProjectSearchText(rawQuery);
  if (!q || !name) return -1;
  if (!projectNameMatchesSearch(projectName, rawQuery)) return -1;

  const queryTokens = getMeaningfulQueryTokens(rawQuery);
  const words = projectNameWords(name);

  if (queryTokens.length === 0) return -1;

  if (name === q) return 0;
  if (name.startsWith(q)) return 1;
  if (words[0] === queryTokens[0] || words[0]?.startsWith(queryTokens[0])) {
    return 2;
  }
  if (queryTokens.every((t) => words.some((w) => w === t))) return 3;
  if (queryTokens.every((t) => words.some((w) => w.startsWith(t)))) return 4;
  return 5;
}

/** Best single project for a query, or null if none match. */
export function findBestProjectBySearch(raw, list) {
  const pool = Array.isArray(list) ? list : [];
  const q = normalizeProjectSearchText(raw);
  if (!q) return null;

  let best = null;
  let bestScore = Infinity;

  for (const item of pool) {
    const name = String(item?.projectName || "").trim();
    if (!name) continue;
    const score = scoreProjectSearchMatch(name, raw);
    if (score < 0) continue;
    if (score < bestScore) {
      bestScore = score;
      best = item;
    }
  }

  return best;
}

/** Whether a query looks like a direct project/builder name lookup. */
export function isLikelyProjectNameQuery(rawQuery) {
  const tokens = getMeaningfulQueryTokens(rawQuery);
  return tokens.length > 0 && tokens.length <= 4;
}
