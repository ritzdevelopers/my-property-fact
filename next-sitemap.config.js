/** @type {import('next-sitemap').IConfig} */

const path = require("path");
const { pathToFileURL } = require("url");

// ─── Env normalisation ────────────────────────────────────────────────────────
(function normalizeLegacyPublicApiEnv() {
  const v = process.env.NEXT_PUBLIC_API_URL;
  if (typeof v !== "string" || !v.trim()) return;
  const withoutTrailing = v.trim().replace(/\/+$/, "");
  if (/^https?:\/\/apis\.mypropertyfact\.in$/i.test(withoutTrailing)) {
    process.env.NEXT_PUBLIC_API_URL = `${withoutTrailing}/api/v1/`;
  }
})();

function resolveSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_UI_URL ||
    process.env.NEXT_PUBLIC_ROOT_URL ||
    "https://mypropertyfact.in";
  const url = String(raw).trim().replace(/\/+$/, "");
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url)) {
    return "https://mypropertyfact.in";
  }
  return url;
}

const SITE_URL = resolveSiteUrl();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toPathSlug(value) {
  return String(value || "").trim().replace(/^\/+|\/+$/g, "");
}

function coerceArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.content)) return payload.content;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.blogs)) return payload.blogs;
  return [];
}

function resolveSitemapApiBase() {
  const raw = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  const normalized = raw.replace(/\/+$/, "");
  if (
    raw &&
    !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(normalized)
  ) {
    return raw.endsWith("/") ? raw : `${raw}/`;
  }
  return "https://apis.mypropertyfact.in/api/v1/";
}

function webStoryCategorySlug(item) {
  return toPathSlug(item?.categoryName || item?.slugURL || item?.slugUrl);
}

function blogSlug(item) {
  return toPathSlug(item?.slugUrl || item?.slugURL || "");
}

function sitemapEntry(loc, { changefreq = "weekly", priority = 0.68, lastmod } = {}) {
  return {
    loc,
    changefreq,
    priority,
    lastmod: lastmod || new Date().toISOString(),
  };
}

// ─── City slug helpers ────────────────────────────────────────────────────────

function listingCitySlug(city) {
  if (!city || typeof city !== "object") return "";
  const fromName = String(city.cityName || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  if (fromName) return fromName;
  return toPathSlug(city.slugURL || city.slugUrl || "");
}

const CITY_SLUG_ALIASES = {
  gurgaon: "gurugram",
  dwarka: "delhi",
};

const CITY_NAME_EQUIVALENTS = {
  gurugram: ["gurugram", "gurgaon"],
  gurgaon:  ["gurugram", "gurgaon"],
  delhi:    ["delhi", "dwarka"],
  dwarka:   ["delhi", "dwarka"],
};

function resolveCitySlug(slug) {
  const s = String(slug || "").trim().toLowerCase().replace(/\s+/g, "-");
  if (!s) return "";
  return CITY_SLUG_ALIASES[s] || s;
}

function normalizeCityKey(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/%20/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ");
}

function projectMatchesCitySlug(project, citySlug) {
  const canonical = resolveCitySlug(citySlug);
  if (!canonical) return false;
  const matchNames   = CITY_NAME_EQUIVALENTS[canonical] || [canonical];
  const matchNameSet = new Set(matchNames.map(normalizeCityKey).filter(Boolean));
  const projectSlug  = resolveCitySlug(project?.citySlug || project?.cityURL || "");
  if (projectSlug && projectSlug === canonical) return true;
  const cityNorm     = normalizeCityKey(project?.cityName);
  const addrNorm     = normalizeCityKey(project?.projectAddress);
  const localityNorm = normalizeCityKey(project?.projectLocality);
  for (const name of matchNameSet) {
    if (
      cityNorm === name ||
      cityNorm.includes(name) ||
      addrNorm.includes(name) ||
      localityNorm.includes(name)
    ) return true;
  }
  return false;
}

// ─── Floor slug helpers ───────────────────────────────────────────────────────

const EXCLUDED_FLOOR_SLUGS = new Set([
  "1-br", "2-br", "1br", "2br", "bhk", "office-and-shop",
  "shop", "plots", "offices", "restaurants", "showrooms", "sco",
]);

const FLOOR_TYPE_ALIASES = {
  shops: "shops",
  "sco plots": "sco-plots",
  "sco plot": "sco-plots",
  "food courts": "food-court",
  plot: "plot",
  office: "office",
  "1 rk studio apartment": "1-rk-studio",
  "1 rk studio": "1-rk-studio",
  restaurant: "restaurant",
  showroom: "showroom",
};

const COMBINED_FLOOR_TYPES = new Set([
  "offices and shop",
  "office and shop",
  "shop and sco plots",
  "shops and sco plots",
]);

function isBareNumberSlug(slug) {
  return /^\d+$/.test(String(slug || "").replace(/-/g, ""));
}

function isSqftOrSizeOnlySlug(slug) {
  const s = String(slug || "").toLowerCase();
  if (!s) return true;
  if (/sq\.?ft/.test(s)) return true;
  if (/^\d+(-sq\.?ft)?$/.test(s)) return true;
  if (/^\d+-sq/.test(s)) return true;
  return false;
}

function isBhkFloorSlug(slug) {
  return /^\d+-bhk$/.test(String(slug || ""));
}

// "flats" intentionally excluded — BHK links to /{bhk}-in-{city} only
const BHK_COMPOUND_LISTING_CATEGORIES = [
  { segment: "apartments",   hubKey: "apartments"  },
  { segment: "new-projects", hubKey: "newProjects" },
  { segment: "commercial",   hubKey: "commercial"  },
];

function extractIndividualBhkTypes(value) {
  const out = [];
  const bhkRegex = /(\d+)\s*bhk/gi;
  let match;
  while ((match = bhkRegex.exec(String(value || ""))) !== null) {
    out.push(`${match[1]} BHK`);
  }
  return out;
}

function normalizeFloorSlugFromPlanType(value = "") {
  if (!value || typeof value !== "string") return "";
  const withoutSqft = value
    .replace(/\s*-\s*[\d,]+\s*(?:sq\.ft|sq\s*ft)\s*/gi, "")
    .trim();
  const normalized = withoutSqft.toLowerCase().trim().replace(/\s+/g, " ");
  if (!normalized || COMBINED_FLOOR_TYPES.has(normalized)) return "";
  if (FLOOR_TYPE_ALIASES[normalized]) return FLOOR_TYPE_ALIASES[normalized];
  let slugType = normalized.replace(/\s+/g, "-");
  if (/^\d+bhk$/.test(slugType)) {
    slugType = slugType.replace(/^(\d+)(bhk)$/, "$1-$2");
  }
  return slugType;
}

function addFloorSlug(target, slug) {
  const normalized = normalizeFloorSlugFromPlanType(slug);
  if (
    !normalized ||
    EXCLUDED_FLOOR_SLUGS.has(normalized) ||
    isBareNumberSlug(normalized) ||
    isSqftOrSizeOnlySlug(normalized)
  ) return;
  target.add(normalized);
}

function splitProjectConfiguration(config) {
  return String(config || "")
    .split(/,\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Mirrors listing-page config parsing — only types backed by a real project row. */
function normalizeConfigType(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/%20/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTypesFromProjectConfiguration(value = "") {
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
      const norm = normalizeConfigType(cleanedPart);
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
      if (norm === "sco") continue;
      types.add(norm);
    }
  }

  return Array.from(types);
}

function configTypeToFloorSlug(configType) {
  const norm = normalizeConfigType(configType);
  if (!norm) return "";
  const bhk = norm.match(/^(\d+)\s*bhk$/);
  if (bhk) return `${bhk[1]}-bhk`;
  if (norm === "shop" || norm === "shops") return "shops";
  if (norm === "office" || norm === "offices") return "office";
  if (norm === "plots") return "plot";
  if (norm === "restaurants") return "restaurant";
  if (norm === "showrooms") return "showroom";
  if (/^sco\s*plots?$/.test(norm)) return "sco-plots";
  return normalizeFloorSlugFromPlanType(norm);
}

function addVerifiedFloorSlug(target, slug) {
  const normalized = normalizeFloorSlugFromPlanType(slug);
  if (
    !normalized ||
    EXCLUDED_FLOOR_SLUGS.has(normalized) ||
    isBareNumberSlug(normalized) ||
    isSqftOrSizeOnlySlug(normalized)
  ) {
    return "";
  }
  target.add(normalized);
  return normalized;
}

function projectMatchesListingCategory(project, hubKey) {
  const propType = String(project?.propertyTypeName || "").toLowerCase();
  const status = String(project?.projectStatusName || "").toLowerCase();
  switch (hubKey) {
    case "apartments":
    case "flats":
      return propType === "residential";
    case "newProjects":
      return status === "new launched";
    case "commercial":
      return propType === "commercial";
    default:
      return false;
  }
}

function ingestProjectListingSignals(project, citySlug, floors, compounds, hubs) {
  const configTypes = extractTypesFromProjectConfiguration(
    project?.projectConfiguration,
  );

  for (const configType of configTypes) {
    const floorSlug = addVerifiedFloorSlug(
      floors,
      configTypeToFloorSlug(configType),
    );
    if (!floorSlug || !isBhkFloorSlug(floorSlug)) continue;

    for (const { segment, hubKey } of BHK_COMPOUND_LISTING_CATEGORIES) {
      if (projectMatchesListingCategory(project, hubKey)) {
        compounds.add(`${floorSlug}-${segment}`);
      }
    }
  }

  if (projectMatchesListingCategory(project, "apartments")) hubs.apartments = true;
  if (projectMatchesListingCategory(project, "flats")) hubs.flats = true;
  if (projectMatchesListingCategory(project, "newProjects")) {
    hubs.newProjects = true;
  }
  if (projectMatchesListingCategory(project, "commercial")) {
    hubs.commercial = true;
  }
}

function buildCityListingData(projectsPayload, floorPlansPayload, cities) {
  const floorsByCity = new Map();
  const hubsByCity = new Map();
  const compoundFloorsByCity = new Map();
  const projectIdToCity = new Map();

  const citySlugs = [
    ...new Set(
      (cities || [])
        .map((city) => resolveCitySlug(listingCitySlug(city)))
        .filter(Boolean),
    ),
  ];

  for (const citySlug of citySlugs) {
    floorsByCity.set(citySlug, new Set());
    compoundFloorsByCity.set(citySlug, new Set());
    hubsByCity.set(citySlug, {
      apartments: false,
      flats: false,
      newProjects: false,
      commercial: false,
    });
  }

  if (Array.isArray(projectsPayload)) {
    for (const project of projectsPayload) {
      for (const citySlug of citySlugs) {
        if (!projectMatchesCitySlug(project, citySlug)) continue;

        const floors = floorsByCity.get(citySlug);
        const compounds = compoundFloorsByCity.get(citySlug);
        const hubs = hubsByCity.get(citySlug);
        if (!floors || !compounds || !hubs) break;

        ingestProjectListingSignals(project, citySlug, floors, compounds, hubs);

        const projectId = Number(project?.id);
        if (Number.isFinite(projectId)) projectIdToCity.set(projectId, citySlug);
        break;
      }
    }
  }

  if (Array.isArray(floorPlansPayload)) {
    for (const entry of floorPlansPayload) {
      const citySlug = projectIdToCity.get(Number(entry?.projectId));
      if (!citySlug) continue;
      const floors = floorsByCity.get(citySlug);
      const compounds = compoundFloorsByCity.get(citySlug);
      if (!floors || !compounds) continue;

      const project = Array.isArray(projectsPayload)
        ? projectsPayload.find((p) => Number(p?.id) === Number(entry?.projectId))
        : null;

      for (const plan of entry?.plans || []) {
        const planType = String(plan?.planType || "").trim();
        if (!planType) continue;

        const configTypes = extractTypesFromProjectConfiguration(planType);
        if (configTypes.length === 0) {
          const floorSlug = addVerifiedFloorSlug(
            floors,
            normalizeFloorSlugFromPlanType(planType),
          );
          if (floorSlug && isBhkFloorSlug(floorSlug) && project) {
            for (const { segment, hubKey } of BHK_COMPOUND_LISTING_CATEGORIES) {
              if (projectMatchesListingCategory(project, hubKey)) {
                compounds.add(`${floorSlug}-${segment}`);
              }
            }
          }
          continue;
        }

        for (const configType of configTypes) {
          const floorSlug = addVerifiedFloorSlug(
            floors,
            configTypeToFloorSlug(configType),
          );
          if (!floorSlug || !isBhkFloorSlug(floorSlug) || !project) continue;
          for (const { segment, hubKey } of BHK_COMPOUND_LISTING_CATEGORIES) {
            if (projectMatchesListingCategory(project, hubKey)) {
              compounds.add(`${floorSlug}-${segment}`);
            }
          }
        }
      }
    }
  }

  return { floorsByCity, hubsByCity, compoundFloorsByCity };
}

// ─── Static pages — only real publicly reachable pages ───────────────────────
// NOTE: /clients-speak and /properties are in the BLOCKED list below,
//       so they must NOT appear here too.

const STATIC_PUBLIC_PAGES = [
  { loc: "/",                        priority: 0.68, changefreq: "weekly"  },
  { loc: "/about-us",                priority: 0.68, changefreq: "weekly"  },
  { loc: "/contact-us",              priority: 0.68, changefreq: "weekly"  },
  { loc: "/join-our-team",           priority: 0.68, changefreq: "weekly"  },
  { loc: "/projects",                priority: 0.68, changefreq: "weekly"  },
  { loc: "/blog",                    priority: 0.68, changefreq: "weekly"  },
  { loc: "/web-stories",             priority: 0.68, changefreq: "weekly"  },
  { loc: "/emi-calculator",          priority: 0.68, changefreq: "monthly" },
  { loc: "/market-analysis",         priority: 0.68, changefreq: "weekly"  },
  { loc: "/property-rate-and-trend", priority: 0.68, changefreq: "weekly"  },
  { loc: "/locate-score",            priority: 0.68, changefreq: "weekly"  },
  { loc: "/privacy-policy",          priority: 0.68, changefreq: "weekly"  },
];

// ─── Block-list ───────────────────────────────────────────────────────────────

const SITEMAP_BLOCKED_EXACT = new Set([
  "/clients-speak",
  "/dashboard",
  "/portal",
  "/properties",
  "/admin",
  "/admin/forgot-password",
  "/admin/register",
  "/components/common",
  "/components/footer",
  "/components/home/dream-project",
  "/components/home/insight",
  "/components/home/social-feed",
  "/components/home/new-views",
  "/components/home/video-slider",
  "/components/home",
]);

const SITEMAP_BLOCKED_PREFIXES = [
  "/components/",
  "/portal/",
  "/admin/",
  "/landing-pages",
  "/promotional-pages",
  "/lavidabella",
  "/Eldeco",
  "/subh-anandam",
  "/detail/",
  "/api/",
  "/properties/",
];

function pathHasSegment(path, segment) {
  return path.split("/").filter(Boolean).includes(segment);
}

function shouldExcludePathFromSitemap(path) {
  if (!path || typeof path !== "string") return true;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withoutTrailingSlash =
    normalized.length > 1 ? normalized.replace(/\/+$/, "") : normalized;
  if (withoutTrailingSlash.startsWith("/api/v1/web-story/")) return false;
  if (SITEMAP_BLOCKED_EXACT.has(withoutTrailingSlash)) return true;
  if (
    pathHasSegment(withoutTrailingSlash, "portal") ||
    pathHasSegment(withoutTrailingSlash, "dashboard")
  ) {
    return true;
  }
  if (withoutTrailingSlash === "/admin" || withoutTrailingSlash.startsWith("/admin/")) {
    return true;
  }
  return SITEMAP_BLOCKED_PREFIXES.some((prefix) =>
    withoutTrailingSlash.startsWith(prefix),
  );
}

/** next-sitemap built-in exclude (runs before transform). */
const SITEMAP_EXCLUDE_PATTERNS = [
  "/admin",
  "/admin/*",
  "/components",
  "/components/*",
  "/properties",
  "/properties/*",
  "/portal",
  "/portal/*",
  "/dashboard",
  "/dashboard/*",
  "/landing-pages",
  "/landing-pages/*",
  "/promotional-pages",
  "/promotional-pages/*",
  "/lavidabella",
  "/lavidabella/*",
  "/Eldeco*",
  "/subh-anandam",
  "/subh-anandam/*",
  "/detail",
  "/detail/*",
  "/api",
  "/api/*",
  "/clients-speak",
];

const APARTMENTS_LISTING_HUB_PREFIX = "apartments-in-";

const LEGACY_CITY_HUB_PREFIXES = [
  { prefix: "flats-in-",               key: "flats"       },
  { prefix: "new-projects-in-",        key: "newProjects" },
  { prefix: "commercial-property-in-", key: "commercial"  },
];

// ─── Sitemap config ───────────────────────────────────────────────────────────

module.exports = {
  siteUrl: SITE_URL,
  // Keep robots.txt under source control (do not overwrite on build).
  generateRobotsTxt: false,
  exclude: SITEMAP_EXCLUDE_PATTERNS,
  robotsTxtOptions: {
    additionalSitemaps: [`${SITE_URL}/sitemap-custom.xml`],
    policies: [
      {
        userAgent: "*",
        disallow: ["/admin/", "/components/", "/properties", "/portal/"],
      },
      { userAgent: "ChatGPT-User",    allow: "/"            },
      { userAgent: "OAI-SearchBot",   allow: "/"            },
      { userAgent: "Google-Extended", allow: "/"            },
      { userAgent: "GPTBot",          allow: "/"            },
    ],
  },
  sitemapSize: 5000,
  changefreq: "weekly",
  priority: 0.68,
  trailingSlash: false,

  transform: async (config, path) => {
    const dynamicPatterns = [
      "/projects/[projecttype]",
      "/[property]",
      "/apartments/*",
      "/flats/*",
      "/new-projects/*",
      "/builder/[buildername]",
      "/blog/[blogpage]",
      "/city/[cityname]",
      "/stories/[web-story]",
      "/web-story/[slug]",
      "/properties/[slug]",
      "/property-rate-and-trend/[city]",
    ];
    if (dynamicPatterns.some((pattern) => path.includes(pattern))) return null;
    if (shouldExcludePathFromSitemap(path)) return null;
    return sitemapEntry(path, { changefreq: config.changefreq, priority: config.priority });
  },

  additionalPaths: async () => {
    const BASE = resolveSitemapApiBase();

    const stamp    = new Date().toISOString();
    const seen     = new Set();
    const allPaths = [];

    const pushLoc = (loc, { priority = 0.68, changefreq = "weekly" } = {}) => {
      if (!loc) return;
      const normalized =
        loc === "/" ? "/" : loc.startsWith("/") ? loc : `/${toPathSlug(loc)}`;
      if (!normalized || seen.has(normalized) || shouldExcludePathFromSitemap(normalized))
        return;
      seen.add(normalized);
      allPaths.push(sitemapEntry(normalized, { priority, changefreq, lastmod: stamp }));
    };

    // 1. Static pages
    for (const page of STATIC_PUBLIC_PAGES) {
      pushLoc(page.loc, { priority: page.priority, changefreq: page.changefreq });
    }

    let cities            = [];
    let projectsData      = [];
    let floorPlansPayload = null;

    // 2. Projects → /<project-slug>
    try {
      const res = await fetch(`${BASE}projects`);
      if (res.ok) {
        projectsData = coerceArray(await res.json());
        for (const p of projectsData) {
          const slug = toPathSlug(p?.slugURL || p?.slugUrl);
          if (slug) pushLoc(`/${slug}`);
        }
      }
    } catch { /* API unavailable — skip */ }

    // 3. Blogs → /blog/<slug>
    try {
      const res = await fetch(`${BASE}blog/get-all`);
      if (res.ok) {
        for (const b of coerceArray(await res.json())) {
          const slug = blogSlug(b);
          if (slug) pushLoc(`/blog/${slug}`);
        }
      }
    } catch { /* skip */ }

    // 4. Web story categories — /api/v1/web-story/{slug} (public AMP story URLs)
    try {
      const res = await fetch(`${BASE}web-story-category/get-all`);
      if (res.ok) {
        for (const item of coerceArray(await res.json())) {
          const slug = webStoryCategorySlug(item);
          if (!slug || !Array.isArray(item?.webStories) || item.webStories.length === 0) {
            continue;
          }
          pushLoc(`/api/v1/web-story/${slug}`);
        }
      }
    } catch { /* skip */ }

    // 5. Builders → /builder/<slug>
    try {
      const res = await fetch(`${BASE}builder/get-all`);
      if (res.ok) {
        const payload = await res.json();
        // builders API returns { builders: [...] }
        for (const b of payload?.builders || coerceArray(payload)) {
          const slug = toPathSlug(b?.slugUrl || b?.slugURL);
          if (slug) pushLoc(`/builder/${slug}`);
        }
      }
    } catch { /* skip */ }

    // 6. Cities → /city/<slug>
    try {
      const res = await fetch(`${BASE}city/all`);
      if (res.ok) {
        cities = coerceArray(await res.json());
        for (const c of cities) {
          const slug = toPathSlug(c?.slugURL || c?.slugUrl);
          if (slug) pushLoc(`/city/${slug}`);
        }
      }
    } catch { cities = []; }

    // 7. Project types → /projects/<slug>
    try {
      const res = await fetch(`${BASE}project-types/get-all`);
      if (res.ok) {
        for (const pt of coerceArray(await res.json())) {
          const slug = toPathSlug(pt?.slugUrl || pt?.slugURL);
          if (slug) pushLoc(`/projects/${slug}`);
        }
      }
    } catch { /* skip */ }

    // 8. Floor plans (city listing hub logic ke liye)
    try {
      const res = await fetch(`${BASE}floor-plans/get-all`);
      if (res.ok) {
        const raw = await res.json();
        // Sirf set karo agar non-empty array ho
        if (Array.isArray(raw) && raw.length > 0) floorPlansPayload = raw;
      }
    } catch { floorPlansPayload = null; }

    // 9. City listing hubs + floor/BHK pages — sirf jahan API projects mein data ho
    const { floorsByCity, hubsByCity, compoundFloorsByCity } =
      buildCityListingData(projectsData, floorPlansPayload, cities);

    let hasFloorListingDataInCity = null;
    let hasCompoundListingDataInCity = null;
    try {
      const listingValidation = await import(
        pathToFileURL(
          path.join(__dirname, "src/lib/listingFloorValidation.js"),
        ).href
      );
      hasFloorListingDataInCity = listingValidation.hasFloorListingDataInCity;
      hasCompoundListingDataInCity =
        listingValidation.hasCompoundListingDataInCity;
    } catch (err) {
      console.warn("[sitemap] listing validation import failed:", err?.message);
    }

    for (const city of cities) {
      const citySlug = resolveCitySlug(listingCitySlug(city));
      if (!citySlug) continue;

      const hubs = hubsByCity.get(citySlug) || {};
      const floors = floorsByCity.get(citySlug) || new Set();
      const compounds = compoundFloorsByCity.get(citySlug) || new Set();
      const hasCityProjects = Array.isArray(projectsData)
        ? projectsData.some((p) => projectMatchesCitySlug(p, citySlug))
        : false;

      if (!hasCityProjects) continue;

      if (hubs.apartments) {
        pushLoc(`/${APARTMENTS_LISTING_HUB_PREFIX}${citySlug}`);
      }

      for (const { prefix, key } of LEGACY_CITY_HUB_PREFIXES) {
        if (hubs[key]) pushLoc(`/${prefix}${citySlug}`);
      }

      for (const floor of floors) {
        const includeFloor =
          typeof hasFloorListingDataInCity === "function"
            ? hasFloorListingDataInCity(projectsData, citySlug, floor)
            : false;
        if (includeFloor) pushLoc(`/${floor}-in-${citySlug}`);
      }

      for (const compoundKey of compounds) {
        const includeCompound =
          typeof hasCompoundListingDataInCity === "function"
            ? hasCompoundListingDataInCity(
                projectsData,
                citySlug,
                compoundKey,
              )
            : false;
        if (includeCompound) pushLoc(`/${compoundKey}-in-${citySlug}`);
      }
    }

    return allPaths;
  },
};
