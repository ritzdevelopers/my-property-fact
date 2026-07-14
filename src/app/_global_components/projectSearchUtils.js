/** Normalize user/project text for case-insensitive search. */
export function normalizeProjectSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
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
]);

/** Query tokens used for matching, with filler words removed. */
export function getMeaningfulQueryTokens(rawQuery) {
  return normalizeProjectSearchText(rawQuery)
    .split(/\s+/)
    .filter((token) => token && !SEARCH_STOP_WORDS.has(token));
}

function projectNameWords(nameNorm) {
  return nameNorm.split(/\s+/).filter(Boolean);
}

function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  if (Math.abs(m - n) > Math.max(m, n)) return Math.max(m, n);

  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j += 1) prev[j] = j;

  for (let i = 1; i <= m; i += 1) {
    curr[0] = i;
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= n; j += 1) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function levenshteinSimilarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const dist = levenshteinDistance(a, b);
  return 1 - dist / Math.max(a.length, b.length);
}

function diceBigramSimilarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const counts = new Map();
  for (let i = 0; i < a.length - 1; i += 1) {
    const gram = a.slice(i, i + 2);
    counts.set(gram, (counts.get(gram) || 0) + 1);
  }

  let overlap = 0;
  let bCount = 0;
  for (let i = 0; i < b.length - 1; i += 1) {
    const gram = b.slice(i, i + 2);
    bCount += 1;
    const available = counts.get(gram) || 0;
    if (available > 0) {
      overlap += 1;
      counts.set(gram, available - 1);
    }
  }

  const aCount = Math.max(a.length - 1, 1);
  return (2 * overlap) / (aCount + bCount);
}

/** Jaro-Winkler similarity — strong for typos like "croessfridgdg" → "crossing". */
function jaroWinklerSimilarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const aLen = a.length;
  const bLen = b.length;
  const matchDistance = Math.max(0, Math.floor(Math.max(aLen, bLen) / 2) - 1);
  const aMatches = new Array(aLen).fill(false);
  const bMatches = new Array(bLen).fill(false);

  let matches = 0;
  for (let i = 0; i < aLen; i += 1) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, bLen);
    for (let j = start; j < end; j += 1) {
      if (bMatches[j] || a[i] !== b[j]) continue;
      aMatches[i] = true;
      bMatches[j] = true;
      matches += 1;
      break;
    }
  }
  if (matches === 0) return 0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < aLen; i += 1) {
    if (!aMatches[i]) continue;
    while (!bMatches[k]) k += 1;
    if (a[i] !== b[k]) transpositions += 1;
    k += 1;
  }

  const jaro =
    (matches / aLen + matches / bLen + (matches - transpositions / 2) / matches) / 3;

  let prefix = 0;
  const maxPrefix = Math.min(4, aLen, bLen);
  while (prefix < maxPrefix && a[prefix] === b[prefix]) prefix += 1;

  return jaro + prefix * 0.1 * (1 - jaro);
}

/** Combined 0–1 similarity for two tokens. */
export function tokenSimilarity(a, b) {
  const left = String(a || "");
  const right = String(b || "");
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (right.startsWith(left) || left.startsWith(right)) {
    const shorter = Math.min(left.length, right.length);
    const longer = Math.max(left.length, right.length);
    return Math.max(0.9, shorter / longer);
  }

  return Math.max(
    jaroWinklerSimilarity(left, right),
    levenshteinSimilarity(left, right),
    diceBigramSimilarity(left, right),
  );
}

function fuzzyTokenThreshold(tokenLength) {
  if (tokenLength <= 3) return 0.92;
  if (tokenLength <= 5) return 0.84;
  if (tokenLength <= 8) return 0.8;
  return 0.78;
}

/**
 * Whether one query token matches a target word (exact, prefix, or typo-tolerant).
 */
export function queryTokenMatchesWord(token, word) {
  if (!token) return true;
  if (!word) return false;

  if (word === token || word.startsWith(token)) return true;
  if (token.length >= 5 && word.includes(token)) return true;
  if (token.length >= 4 && token.includes(word) && word.length >= 4) return true;

  // Typo / misspelling tolerance (e.g. "republik" → "republic", "croessfridgdg" → "crossing")
  if (token.length < 3) return false;

  const maxLen = Math.max(token.length, word.length);
  const minLen = Math.min(token.length, word.length);
  if (maxLen > minLen * 2.4 && minLen < 6) return false;

  const similarity = tokenSimilarity(token, word);
  if (similarity >= fuzzyTokenThreshold(token.length)) return true;

  const editDistance = levenshteinDistance(token, word);
  if (token.length <= 5 && editDistance <= 1) return true;
  if (token.length <= 8 && editDistance <= 2) return true;
  if (token.length > 8 && editDistance <= Math.ceil(token.length * 0.35)) return true;

  return false;
}

/**
 * Whether one query token matches the target text.
 * Prefers whole-word / word-prefix matches so "ram" hits "Ram Raghu Ananda"
 * but not "Program Heights".
 */
function queryTokenMatchesTarget(token, nameNorm, nameWords) {
  if (!token) return true;
  const words = nameWords ?? projectNameWords(nameNorm);

  if (words.some((w) => queryTokenMatchesWord(token, w))) return true;

  // Longer tokens may still match inside the full name (e.g. builder suffix).
  if (token.length >= 5 && nameNorm.includes(token)) return true;

  // Collapsed fuzzy: "crossingrepublik" style queries against multi-word names
  if (token.length >= 6) {
    const collapsed = nameNorm.replace(/\s+/g, "");
    if (collapsed.includes(token)) return true;
    if (tokenSimilarity(token, collapsed) >= 0.82) return true;
  }

  return false;
}

function bestTokenSimilarity(token, nameWords) {
  let best = 0;
  for (const word of nameWords) {
    best = Math.max(best, tokenSimilarity(token, word));
  }
  return best;
}

/**
 * True when every word in the user's query matches the target text (typo-tolerant).
 */
export function textMatchesSearch(targetText, rawQuery) {
  const name = normalizeProjectSearchText(targetText);
  const q = normalizeProjectSearchText(rawQuery);
  if (!q) return true;
  if (!name) return false;
  if (name === q) return true;

  const queryTokens = getMeaningfulQueryTokens(rawQuery);
  if (queryTokens.length === 0) return true;
  const words = projectNameWords(name);

  if (queryTokens.every((token) => queryTokenMatchesTarget(token, name, words))) {
    return true;
  }

  // Whole-string fuzzy for smashed typos / wrong spacing
  const collapsedQuery = q.replace(/\s+/g, "");
  const collapsedName = name.replace(/\s+/g, "");
  if (collapsedQuery.length >= 6) {
    if (collapsedName.includes(collapsedQuery) || collapsedQuery.includes(collapsedName)) {
      return true;
    }
    if (tokenSimilarity(collapsedQuery, collapsedName) >= 0.82) return true;
  }

  return false;
}

/**
 * True when every word in the user's query matches the project name.
 */
export function projectNameMatchesSearch(projectName, rawQuery) {
  return textMatchesSearch(projectName, rawQuery);
}

/**
 * Lower score = better match (for sorting suggestions / auto-pick).
 * Exact matches stay in 0–5; typo-tolerant matches land in 7–14 so they
 * still surface, but beneath clean hits.
 */
export function scoreTextSearchMatch(targetText, rawQuery) {
  const name = normalizeProjectSearchText(targetText);
  const q = normalizeProjectSearchText(rawQuery);
  if (!q || !name) return -1;
  if (!textMatchesSearch(targetText, rawQuery)) return -1;

  const queryTokens = getMeaningfulQueryTokens(rawQuery);
  const words = projectNameWords(name);
  if (queryTokens.length === 0) return -1;

  if (name === q) return 0;
  if (name.startsWith(q)) return 1;

  const allExactWord = queryTokens.every((t) => words.some((w) => w === t));
  const allPrefix = queryTokens.every((t) =>
    words.some((w) => w === t || w.startsWith(t)),
  );
  const usedFuzzy = queryTokens.some(
    (t) => !words.some((w) => w === t || w.startsWith(t) || (t.length >= 5 && w.includes(t))),
  );

  if (!usedFuzzy) {
    if (words[0] === queryTokens[0] || words[0]?.startsWith(queryTokens[0])) return 2;
    if (allExactWord) return 3;
    if (allPrefix) return 4;
    return 5;
  }

  const avgSim =
    queryTokens.reduce((sum, token) => sum + bestTokenSimilarity(token, words), 0) /
    queryTokens.length;

  // 7 = near-perfect typo correction, 14 = weak but usable
  return Math.min(14, Math.max(7, Math.round(7 + (1 - avgSim) * 10)));
}

/** Lower score = better match (for sorting suggestions / auto-pick). */
export function scoreProjectSearchMatch(projectName, rawQuery) {
  return scoreTextSearchMatch(projectName, rawQuery);
}

/** Best score across multiple candidate queries (e.g. raw + cleaned). */
export function scoreTextAgainstQueries(targetText, queries = []) {
  let best = -1;
  for (const query of queries) {
    const q = String(query || "").trim();
    if (!q) continue;
    const score = scoreTextSearchMatch(targetText, q);
    if (score < 0) continue;
    if (best < 0 || score < best) best = score;
  }
  return best;
}

/**
 * Best fuzzy score across project name, locality, city, builder, and address.
 * Lower is better; -1 means no match.
 */
export function scoreProjectFieldsSearchMatch(project, rawQuery, extraQueries = []) {
  if (!project) return -1;

  const queries = [rawQuery, ...extraQueries];
  const fields = [
    project.projectName,
    project.projectLocality,
    project.cityName || project.city,
    project.builderName,
    project.projectAddress,
  ];

  let best = -1;
  for (const field of fields) {
    const text = String(field || "").trim();
    if (!text) continue;
    const score = scoreTextAgainstQueries(text, queries);
    if (score < 0) continue;
    if (best < 0 || score < best) best = score;
  }

  // Combined haystack for queries that span multiple fields
  if (best < 0) {
    const haystack = fields.filter(Boolean).join(" ");
    best = scoreTextAgainstQueries(haystack, queries);
  }

  return best;
}

/** Unique localities from the project catalog (for area / typo correction). */
export function collectProjectLocalities(projectList = []) {
  const map = new Map();
  for (const project of projectList) {
    const name = String(project?.projectLocality || "").trim();
    if (name.length < 3) continue;
    const key = normalizeProjectSearchText(name);
    if (!key) continue;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      continue;
    }
    map.set(key, {
      name,
      cityName: String(project?.cityName || project?.city || "").trim(),
      count: 1,
    });
  }
  return [...map.values()];
}

/**
 * Best corrected phrase for a messy query — localities, project names, builders, cities.
 * Used for "Did you mean: Crossing Republik" style suggestions.
 */
export function findBestSearchCorrection(
  rawQuery,
  { projectList = [], builderList = [], cities = [], cleanQuery = "" } = {},
) {
  const queries = [rawQuery, cleanQuery].map((q) => String(q || "").trim()).filter(Boolean);
  if (queries.length === 0) return null;

  const queryNorm = normalizeProjectSearchText(queries[0]);
  const candidates = [];

  for (const loc of collectProjectLocalities(projectList)) {
    candidates.push({
      kind: "locality",
      label: loc.name,
      meta: loc.cityName ? `Area · ${loc.cityName}` : "Area",
      item: loc,
      score: scoreTextAgainstQueries(loc.name, queries),
    });
  }

  for (const builder of builderList) {
    const name = String(builder?.builderName || builder?.name || "").trim();
    if (!name) continue;
    candidates.push({
      kind: "builder",
      label: name,
      meta: "Builder",
      item: builder,
      score: scoreTextAgainstQueries(name, queries),
    });
  }

  for (const city of cities) {
    const name = String(city?.cityName || "").trim();
    if (!name) continue;
    candidates.push({
      kind: "city",
      label: name,
      meta: "City",
      item: city,
      score: scoreTextAgainstQueries(name, queries),
    });
  }

  const pickBest = (list) => {
    let best = null;
    for (const candidate of list) {
      if (candidate.score < 0) continue;
      const candidateNorm = normalizeProjectSearchText(candidate.label);
      const isCorrection = candidateNorm !== queryNorm;
      const rankBoost = isCorrection && candidate.score >= 7 ? -0.5 : 0;
      const rankedScore = candidate.score + rankBoost;
      if (
        !best ||
        rankedScore < best.rankedScore ||
        (rankedScore === best.rankedScore && candidate.label.length > best.label.length)
      ) {
        best = { ...candidate, rankedScore, isCorrection };
      }
    }
    return best;
  };

  let best = pickBest(candidates);

  // Only scan project titles when no strong area/builder/city correction exists
  if (!best || best.score > 8) {
    const projectCandidates = [];
    for (const project of projectList) {
      const name = String(project?.projectName || "").trim();
      if (!name) continue;
      projectCandidates.push({
        kind: "project",
        label: name,
        meta: "Project",
        item: project,
        score: scoreTextAgainstQueries(name, queries),
      });
    }
    const projectBest = pickBest(projectCandidates);
    if (
      projectBest &&
      (!best ||
        projectBest.rankedScore < best.rankedScore ||
        (projectBest.rankedScore === best.rankedScore && projectBest.score < best.score))
    ) {
      best = projectBest;
    }
  }

  if (!best) return null;
  if (!best.isCorrection && best.score > 3) return null;
  return best;
}

/** Best single project for a query, or null if none match. */
export function findBestProjectBySearch(raw, list, extraQueries = []) {
  const pool = Array.isArray(list) ? list : [];
  const q = normalizeProjectSearchText(raw);
  if (!q) return null;

  let best = null;
  let bestScore = Infinity;

  for (const item of pool) {
    const score = scoreProjectFieldsSearchMatch(item, raw, extraQueries);
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

/** True when the project NAME itself matches (not only locality/address). */
export function projectNameLooksLikeDirectMatch(project, rawQuery, extraQueries = []) {
  const name = String(project?.projectName || "").trim();
  if (!name) return false;
  const score = scoreTextAgainstQueries(name, [rawQuery, ...extraQueries]);
  return score >= 0 && score <= 10;
}
