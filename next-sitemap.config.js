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

/** Core public pages that App Router auto-discovery often omits from next-sitemap output. */
const STATIC_PUBLIC_PAGES = [
  { loc: "/", priority: 1.0, changefreq: "daily" },
  { loc: "/about-us", priority: 0.8, changefreq: "monthly" },
  { loc: "/contact-us", priority: 0.8, changefreq: "monthly" },
  { loc: "/join-our-team", priority: 0.75, changefreq: "monthly" },
  { loc: "/projects", priority: 0.85, changefreq: "weekly" },
  { loc: "/blog", priority: 0.8, changefreq: "weekly" },
  { loc: "/web-stories", priority: 0.72, changefreq: "weekly" },
  { loc: "/properties", priority: 0.78, changefreq: "weekly" },
  { loc: "/emi-calculator", priority: 0.7, changefreq: "monthly" },
  { loc: "/market-analysis", priority: 0.7, changefreq: "monthly" },
  { loc: "/clients-speak", priority: 0.68, changefreq: "monthly" },
  { loc: "/property-rate-and-trend", priority: 0.72, changefreq: "weekly" },
  { loc: "/locate-score", priority: 0.7, changefreq: "monthly" },
  { loc: "/privacy-policy", priority: 0.5, changefreq: "yearly" },
];

const LISTING_COMMERCIAL_FLOOR_SLUGS = [
  "food-court",
  "office",
  "shop",
  "shops",
  "sco-plots",
  "kiosk",
  "sco",
];

const APARTMENTS_LISTING_HUB_PREFIX = "apartments-in-";
const LISTING_BHK_CATEGORY_SLUGS = ["apartments", "flats", "new-projects"];

/** Legacy city hub URLs still served by `(projects)/[slug]`. */
const LEGACY_CITY_HUB_PREFIXES = [
  "flats-in-",
  "new-projects-in-",
  "commercial-property-in-",
];

function extractBhkFloorSlugs(floorPlansPayload) {
  const out = new Set();
  if (!Array.isArray(floorPlansPayload)) return out;

  const bhkRegex = /(\d+)\s*(?:\/|&|and|-)?\s*(\d+)?\s*bhk/gi;
  for (const project of floorPlansPayload) {
    if (!Array.isArray(project?.plans)) continue;
    for (const plan of project.plans) {
      const source = String(plan?.planType || "").toLowerCase();
      if (!source) continue;
      let match;
      while ((match = bhkRegex.exec(source)) !== null) {
        if (match[1]) out.add(`${match[1]}-bhk`);
        if (match[2]) out.add(`${match[2]}-bhk`);
      }
    }
  }
  return out;
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

    if (
      path.includes("/portal") ||
      path.includes("/dashboard") ||
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

    const pushLoc = (loc, { priority = 0.72, changefreq = "weekly" } = {}) => {
      const normalized = loc === "/" ? "/" : loc.startsWith("/") ? loc : `/${toPathSlug(loc)}`;
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      allPaths.push(sitemapEntry(normalized, { priority, changefreq, lastmod: stamp }));
    };

    for (const page of STATIC_PUBLIC_PAGES) {
      pushLoc(page.loc, {
        priority: page.priority,
        changefreq: page.changefreq,
      });
    }

    let bhkFloorSlugs = new Set();
    let cities = [];

    try {
      const projectsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}projects`);
      if (projectsRes.ok) {
        const data = coerceArray(await projectsRes.json());
        for (const p of data) {
          const slug = toPathSlug(p?.slugURL || p?.slugUrl);
          if (slug) pushLoc(`/${slug}`, { priority: 0.8, changefreq: "weekly" });
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
          if (slug) pushLoc(`/blog/${slug}`, { priority: 0.6, changefreq: "monthly" });
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
            pushLoc(`/stories/${slug}`, { priority: 0.68, changefreq: "weekly" });
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
          if (slug) pushLoc(`/builder/${slug}`, { priority: 0.7, changefreq: "weekly" });
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
          if (slug) pushLoc(`/city/${slug}`, { priority: 0.7, changefreq: "weekly" });
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
          if (slug) pushLoc(`/projects/${slug}`, { priority: 0.7, changefreq: "weekly" });
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
        const floorPlans = await floorPlansRes.json();
        bhkFloorSlugs = extractBhkFloorSlugs(floorPlans);
      }
    } catch {
      bhkFloorSlugs = new Set();
    }

    if (Array.isArray(cities) && cities.length > 0) {
      for (const city of cities) {
        const citySlug = listingCitySlug(city);
        if (!citySlug) continue;

        pushLoc(`/${APARTMENTS_LISTING_HUB_PREFIX}${citySlug}`, {
          priority: 0.75,
          changefreq: "weekly",
        });

        for (const prefix of LEGACY_CITY_HUB_PREFIXES) {
          pushLoc(`/${prefix}${citySlug}`, {
            priority: 0.74,
            changefreq: "weekly",
          });
        }

        for (const bhk of bhkFloorSlugs) {
          for (const category of LISTING_BHK_CATEGORY_SLUGS) {
            pushLoc(`/${bhk}-${category}-in-${citySlug}`, {
              priority: 0.73,
              changefreq: "weekly",
            });
          }
        }

        for (const floor of LISTING_COMMERCIAL_FLOOR_SLUGS) {
          pushLoc(`/${floor}-in-${citySlug}`, {
            priority: 0.72,
            changefreq: "weekly",
          });
        }
      }
    }

    return allPaths;
  },
};
