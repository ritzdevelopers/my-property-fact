/** @type {import('next-sitemap').IConfig} */
// Must match app/layout.js metadataBase (NEXT_PUBLIC_UI_URL) so sitemap loc = page canonical host.
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
  // Avoid shipping localhost URLs when a local build is deployed by mistake.
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url)) {
    return "https://mypropertyfact.in";
  }
  return url;
}

const SITE_URL = resolveSiteUrl();

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

function blogSlug(item) {
  return toPathSlug(item?.slugUrl || item?.slugURL || "");
}

function sitemapEntry(loc, { changefreq = "weekly", priority = 0.7, lastmod } = {}) {
  return {
    loc,
    changefreq,
    priority,
    lastmod: lastmod || new Date().toISOString(),
  };
}

/** Matches `isCityTypeUrl` / BHK listing pages: hyphenated city from `cityName`. */
function listingCitySlug(city) {
  if (!city || typeof city !== "object") return "";
  const fromName = String(city.cityName || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  if (fromName) return fromName;
  return toPathSlug(city.slugURL || city.slugUrl || "");
}

/**
 * Only real public pages (header/footer/tools) — no "Coming soon" or internal routes.
 * Anything not listed here must not be added via STATIC_PUBLIC_PAGES.
 */
const STATIC_PUBLIC_PAGES = [
  { loc: "/", priority: 0.68, changefreq: "weekly" },
  { loc: "/about-us", priority: 0.68, changefreq: "weekly" },
  { loc: "/contact-us", priority: 0.68, changefreq: "weekly" },
  { loc: "/join-our-team", priority: 0.68, changefreq: "weekly" },
  { loc: "/projects", priority: 0.68, changefreq: "weekly" },
  { loc: "/blog", priority: 0.68, changefreq: "weekly" },
  { loc: "/web-stories", priority: 0.68, changefreq: "weekly" },
  { loc: "/properties", priority: 0.68, changefreq: "weekly" },
  { loc: "/emi-calculator", priority: 0.68, changefreq: "weekly" },
  { loc: "/market-analysis", priority: 0.68, changefreq: "weekly" },
  { loc: "/clients-speak", priority: 0.68, changefreq: "weekly" },
  { loc: "/property-rate-and-trend", priority: 0.68, changefreq: "weekly" },
  { loc: "/locate-score", priority: 0.68, changefreq: "weekly" },
  { loc: "/privacy-policy", priority: 0.68, changefreq: "weekly" },
];

/** Routes that exist as files but must never appear in sitemap (placeholders / internal). */
const SITEMAP_BLOCKED_EXACT = new Set([
  "/clients-speak",
  "/dashboard",
  "/properties",
]);

const SITEMAP_BLOCKED_PREFIXES = [
  "/components/",
  "/portal",
  "/admin",
  "/landing-pages",
  "/promotional-pages",
  "/lavidabella",
  "/Eldeco",
  "/subh-anandam",
  "/detail/",
];

function shouldExcludePathFromSitemap(path) {
  if (!path || typeof path !== "string") return true;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (SITEMAP_BLOCKED_EXACT.has(normalized)) return true;
  if (normalized.includes("/portal") || normalized.includes("/dashboard")) return true;
  return SITEMAP_BLOCKED_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

const APARTMENTS_LISTING_HUB_PREFIX = "apartments-in-";

/** Legacy city hub URLs still served by `(projects)/[slug]`. */
const LEGACY_CITY_HUB_PREFIXES = [
  { prefix: "flats-in-", key: "flats" },
  { prefix: "new-projects-in-", key: "newProjects" },
  { prefix: "commercial-property-in-", key: "commercial" },
];

/** URL slug aliases → canonical slug (matches cityAliasUtils). */
const CITY_SLUG_ALIASES = {
  gurgaon: "gurugram",
  dwarka: "delhi",
};

const CITY_NAME_EQUIVALENTS = {
  gurugram: ["gurugram", "gurgaon"],
  gurgaon: ["gurugram", "gurgaon"],
  delhi: ["delhi", "dwarka"],
  dwarka: ["delhi", "dwarka"],
};

function resolveCitySlug(slug) {
  const s = String(slug || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
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

  const matchNames = CITY_NAME_EQUIVALENTS[canonical] || [canonical];
  const matchNameSet = new Set(matchNames.map(normalizeCityKey).filter(Boolean));

  const projectSlug = resolveCitySlug(project?.citySlug || project?.cityURL || "");
  if (projectSlug && projectSlug === canonical) return true;

  const cityNorm = normalizeCityKey(project?.cityName);
  const addrNorm = normalizeCityKey(project?.projectAddress);
  const localityNorm = normalizeCityKey(project?.projectLocality);

  for (const name of matchNameSet) {
    if (
      cityNorm === name ||
      cityNorm.includes(name) ||
      addrNorm.includes(name) ||
      localityNorm.includes(name)
    ) {
      return true;
    }
  }
  return false;
}

function splitProjectConfiguration(config) {
  // Split on ", " only — keeps "5 BHK-10,105 sq.ft" intact (Indian number commas).
  return String(config || "")
    .split(/,\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function collectFloorSlugsFromText(text, target) {
  for (const part of splitProjectConfiguration(text)) {
    const bhkParts = extractIndividualBhkTypes(part);
    if (bhkParts.length > 0) {
      for (const bhk of bhkParts) addFloorSlug(target, bhk);
    } else {
      addFloorSlug(target, part);
    }
  }
}

/**
 * Per-city listing data from projects + floor-plans API.
 * Only emits `{floor}-in-{city}` when that floor type exists for that city.
 */
function buildCityListingData(projectsPayload, floorPlansPayload, cities) {
  const floorsByCity = new Map();
  const hubsByCity = new Map();
  const projectIdToCity = new Map();

  const citySlugs = [
    ...new Set(
      (cities || [])
        .map((city) => resolveCitySlug(listingCitySlug(city)))
        .filter(Boolean)
    ),
  ];

  for (const citySlug of citySlugs) {
    floorsByCity.set(citySlug, new Set());
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
        const hubs = hubsByCity.get(citySlug);
        if (!floors || !hubs) break;

        collectFloorSlugsFromText(project.projectConfiguration, floors);

        const propType = String(project.propertyTypeName || "").toLowerCase();
        const status = String(project.projectStatusName || "").toLowerCase();

        if (propType === "residential") {
          hubs.apartments = true;
          hubs.flats = true;
        }
        if (status === "new launched") {
          hubs.newProjects = true;
        }
        if (propType === "commercial") {
          hubs.commercial = true;
        }

        const projectId = Number(project?.id);
        if (Number.isFinite(projectId)) {
          projectIdToCity.set(projectId, citySlug);
        }
        break;
      }
    }
  }

  if (Array.isArray(floorPlansPayload)) {
    for (const entry of floorPlansPayload) {
      const citySlug = projectIdToCity.get(Number(entry?.projectId));
      if (!citySlug) continue;

      const floors = floorsByCity.get(citySlug);
      if (!floors) continue;

      for (const plan of entry?.plans || []) {
        const planType = String(plan?.planType || "").trim();
        if (!planType) continue;

        const bhkParts = extractIndividualBhkTypes(planType);
        if (bhkParts.length > 0) {
          for (const bhk of bhkParts) addFloorSlug(floors, bhk);
        } else {
          addFloorSlug(floors, planType);
        }
      }
    }
  }

  return { floorsByCity, hubsByCity };
}

/** Mirrors `master-bhk-project-list` / `isFloorTypeUrl` slug normalization. */
const EXCLUDED_FLOOR_SLUGS = new Set([
  "1-br",
  "2-br",
  "1br",
  "2br",
  "bhk",
  "office-and-shop",
]);

const FLOOR_TYPE_ALIASES = {
  shop: "shops",
  shops: "shops",
  "food courts": "food-court",
  plot: "plot",
  plots: "plot",
  office: "office",
  offices: "office",
  "1 rk studio apartment": "1-rk-studio",
  "1 rk studio": "1-rk-studio",
  restaurant: "restaurant",
  restaurants: "restaurant",
  showroom: "showroom",
  showrooms: "showroom",
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

/** Size-only fragments (e.g. `105-sq.ft`) — not valid listing floor types. */
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

/**
 * BHK + category compound URLs (`{bhk}-{category}-in-{city}`).
 * Must match `LISTING_URL_CATEGORY_SEGMENTS` in masterFunction.jsx.
 * "flats" is intentionally excluded — flats hub pages link to `{bhk}-in-{city}` only.
 */
const BHK_COMPOUND_LISTING_CATEGORIES = [
  { segment: "apartments", hubKey: "apartments" },
  { segment: "new-projects", hubKey: "newProjects" },
  { segment: "commercial", hubKey: "commercial" },
];

function extractIndividualBhkTypes(value) {
  const out = [];
  const source = String(value || "");
  const bhkRegex = /(\d+)\s*bhk/gi;
  let match;
  while ((match = bhkRegex.exec(source)) !== null) {
    out.push(`${match[1]} BHK`);
  }
  return out;
}

function normalizeFloorSlugFromPlanType(value = "") {
  if (value == null || typeof value !== "string") return "";
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
  ) {
    return;
  }
  target.add(normalized);
}

module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", disallow: ["/admin/"] },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
    ],
  },
  sitemapSize: 5000,
  changefreq: "daily",
  priority: 0.7,
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

    if (dynamicPatterns.some((pattern) => path.includes(pattern))) {
      return null;
    }

    if (shouldExcludePathFromSitemap(path)) {
      return null;
    }

    if (
      path.startsWith("/admin") ||
      path.startsWith("/landing-pages") ||
      path.startsWith("/promotional-pages") ||
      path.startsWith("/lavidabella") ||
      path.startsWith("/Eldeco") ||
      path.startsWith("/subh-anandam")
    ) {
      return null;
    }

    return sitemapEntry(path, {
      changefreq: config.changefreq,
      priority: config.priority,
    });
  },

  additionalPaths: async () => {
    const stamp = new Date().toISOString();
    const seen = new Set();
    const allPaths = [];

    const pushLoc = (loc, { priority = 0.68, changefreq = "weekly" } = {}) => {
      const normalized = loc === "/" ? "/" : loc.startsWith("/") ? loc : `/${toPathSlug(loc)}`;
      if (!normalized || seen.has(normalized) || shouldExcludePathFromSitemap(normalized)) return;
      seen.add(normalized);
      allPaths.push(sitemapEntry(normalized, { priority, changefreq, lastmod: stamp }));
    };

    for (const page of STATIC_PUBLIC_PAGES) {
      pushLoc(page.loc, {
        priority: page.priority,
        changefreq: page.changefreq,
      });
    }

    let cities = [];
    let projectsData = [];
    let floorPlansPayload = null;

    try {
      const projectsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}projects`);
      if (projectsRes.ok) {
        projectsData = coerceArray(await projectsRes.json());
        for (const p of projectsData) {
          const slug = toPathSlug(p?.slugURL || p?.slugUrl);
          if (slug) pushLoc(`/${slug}`, { priority: 0.68, changefreq: "weekly" });
        }
      }
    } catch {
      // Keep sitemap generation resilient when API is unavailable at build time.
    }

    try {
      const blogsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}blog/get-all`);
      if (blogsRes.ok) {
        const blogs = coerceArray(await blogsRes.json());
        for (const b of blogs) {
          const slug = blogSlug(b);
          if (slug) pushLoc(`/blog/${slug}`, { priority: 0.68, changefreq: "weekly" });
        }
      }
    } catch {
      // Blogs are optional at build time.
    }

    try {
      const webStoryRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}web-story-category/get-all`
      );
      if (webStoryRes.ok) {
        const webStoryCategories = coerceArray(await webStoryRes.json());
        for (const item of webStoryCategories) {
          const slug = toPathSlug(item?.categoryName);
          if (
            slug &&
            Array.isArray(item?.webStories) &&
            item.webStories.length > 0
          ) {
            pushLoc(`/api/v1/web-story/${slug}`, {
              priority: 0.68,
              changefreq: "weekly",
            });
          }
        }
      }
    } catch {
      // Web stories are optional at build time.
    }

    try {
      const buildersRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}builder/get-all`
      );
      if (buildersRes.ok) {
        const buildersObj = await buildersRes.json();
        for (const prop of buildersObj?.builders || []) {
          const slug = toPathSlug(prop?.slugUrl || prop?.slugURL);
          if (slug) pushLoc(`/builder/${slug}`, { priority: 0.68, changefreq: "weekly" });
        }
      }
    } catch {
      // Builders are optional at build time.
    }

    try {
      const citiesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}city/all`);
      if (citiesRes.ok) {
        cities = coerceArray(await citiesRes.json());
        for (const prop of cities) {
          const slug = toPathSlug(prop?.slugURL || prop?.slugUrl);
          if (slug) pushLoc(`/city/${slug}`, { priority: 0.68, changefreq: "weekly" });
        }
      }
    } catch {
      cities = [];
    }

    try {
      const projectTypesRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}project-types/get-all`
      );
      if (projectTypesRes.ok) {
        const projectTypes = coerceArray(await projectTypesRes.json());
        for (const prop of projectTypes) {
          const slug = toPathSlug(prop?.slugUrl || prop?.slugURL);
          if (slug) pushLoc(`/projects/${slug}`, { priority: 0.68, changefreq: "weekly" });
        }
      }
    } catch {
      // Project types are optional at build time.
    }

    try {
      const floorPlansRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}floor-plans/get-all`
      );
      if (floorPlansRes.ok) {
        floorPlansPayload = await floorPlansRes.json();
      }
    } catch {
      floorPlansPayload = null;
    }

    const { floorsByCity, hubsByCity } = buildCityListingData(
      projectsData,
      floorPlansPayload,
      cities
    );

    if (Array.isArray(cities) && cities.length > 0) {
      for (const city of cities) {
        const citySlug = resolveCitySlug(listingCitySlug(city));
        if (!citySlug) continue;

        const hubs = hubsByCity.get(citySlug) || {};
        const floors = floorsByCity.get(citySlug) || new Set();

        if (hubs.apartments) {
          pushLoc(`/${APARTMENTS_LISTING_HUB_PREFIX}${citySlug}`, {
            priority: 0.68,
            changefreq: "weekly",
          });
        }

        for (const { prefix, key } of LEGACY_CITY_HUB_PREFIXES) {
          if (hubs[key]) {
            pushLoc(`/${prefix}${citySlug}`, {
              priority: 0.68,
              changefreq: "weekly",
            });
          }
        }

        for (const floor of floors) {
          pushLoc(`/${floor}-in-${citySlug}`, {
            priority: 0.68,
            changefreq: "weekly",
          });

          if (isBhkFloorSlug(floor)) {
            for (const { segment, hubKey } of BHK_COMPOUND_LISTING_CATEGORIES) {
              if (hubs[hubKey]) {
                pushLoc(`/${floor}-${segment}-in-${citySlug}`, {
                  priority: 0.68,
                  changefreq: "weekly",
                });
              }
            }
          }
        }
      }
    }

    return allPaths;
  },
};
