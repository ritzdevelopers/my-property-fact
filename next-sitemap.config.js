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

const SITE_URL = (process.env.NEXT_PUBLIC_UI_URL || process.env.NEXT_PUBLIC_ROOT_URL || "https://mypropertyfact.in").replace(/\/+$/, "");

function toPathSlug(value) {
  return String(value || "").trim().replace(/^\/+|\/+$/g, "");
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
 * Curated listing URLs only (see `master-bhk-project-list` slugType / hubs).
 * `{slug}-in-{city}` except apartments hub `apartments-in-{city}`.
 */
const LISTING_COMMERCIAL_FLOOR_SLUGS = [
  "food-court",
  "office",

  "shop",
  "shops",
  "sco-plots",
  "kiosk",
  "sco"
];

const APARTMENTS_LISTING_HUB_PREFIX = "apartments-in-";
const LISTING_BHK_CATEGORY_SLUGS = ["apartments", "flats", "new-projects"];

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
      
    ];

    // Exclude dynamic patterns
    if (dynamicPatterns.some((pattern) => path.includes(pattern))) {
      return null;
    }

    // Exclude portal and dashboard URLs
    if (path.includes("/portal") || path.includes("/dashboard")) {
      return null;
    }

    return {
      loc: path, // URL to include
      changefreq: config.changefreq, // how often it changes (daily/weekly)
      priority: config.priority, // importance (0–1)
      lastmod: new Date().toISOString(), // last modified date
    };
  },

  additionalPaths: async (config) => {
    let allPaths = [];
    let bhkFloorSlugs = new Set();

    // Projects
    const projects = await fetch(`${process.env.NEXT_PUBLIC_API_URL}projects`);
    if (!projects.ok) throw new Error("Failed to fetch projects");
    const data = await projects.json();
    allPaths = allPaths.concat(
      data
        .filter((p) => p?.slugURL)
        .map((p) => ({
        loc: `/${toPathSlug(p.slugURL)}`,
        changefreq: "weekly",
        priority: 0.8,
        lastmod: new Date().toISOString(),
      }))
    );

    // Blogs
    const blogsRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}blog/get-all`
    );
    const blogs = await blogsRes.json();

    allPaths = allPaths.concat(
      blogs
        .filter((b) => b?.slugUrl)
        .map((b) => ({
        loc: `/blog/${toPathSlug(b.slugUrl)}`,
        changefreq: "monthly",
        priority: 0.6,
        lastmod: new Date().toISOString(),
      }))
    );

    // Builders
    const buildersRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}builder/get-all`
    );
    const buildersObj = await buildersRes.json();

    allPaths = allPaths.concat(
      (buildersObj?.builders || [])
        .filter((prop) => prop?.slugUrl)
        .map((prop) => ({
        loc: `/builder/${toPathSlug(prop.slugUrl)}`,
        changefreq: "weekly",
        priority: 0.7,
        lastmod: new Date().toISOString(),
      }))
    );

    // Cities
    const citiesRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}city/all`
    );
    const cities = await citiesRes.json();

    allPaths = allPaths.concat(
      cities
        .filter((prop) => prop?.slugURL)
        .map((prop) => ({
        loc: `/city/${toPathSlug(prop.slugURL)}`,
        changefreq: "weekly",
        priority: 0.7,
        lastmod: new Date().toISOString(),
      }))
    );

    // Project types
    const projectTypesRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}project-types/get-all`
    );
    const projectTypes = await projectTypesRes.json();

    allPaths = allPaths.concat(
      projectTypes
        .filter((prop) => prop?.slugUrl)
        .map((prop) => ({
        loc: `/projects/${toPathSlug(prop.slugUrl)}`,
        changefreq: "weekly",
        priority: 0.7,
        lastmod: new Date().toISOString(),
      }))
    );

    // Floor plans -> discover BHK slugs (e.g. 2-bhk, 3-bhk) for listing URLs
    try {
      const floorPlansRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}floor-plans/get-all`
      );
      if (floorPlansRes.ok) {
        const floorPlans = await floorPlansRes.json();
        bhkFloorSlugs = extractBhkFloorSlugs(floorPlans);
      }
    } catch (error) {
      // Keep sitemap generation resilient; other URLs should still be emitted.
      bhkFloorSlugs = new Set();
    }

    // Apartments hub + selected commercial typology listings: `apartments-in-{city}`, `{type}-in-{city}`
    if (Array.isArray(cities) && cities.length > 0) {
      const seen = new Set(allPaths.map((p) => p.loc));
      const stamp = new Date().toISOString();
      const pushLoc = (loc, priority = 0.72) => {
        if (!loc || seen.has(loc)) return;
        seen.add(loc);
        allPaths.push({
          loc,
          changefreq: "weekly",
          priority,
          lastmod: stamp,
        });
      };

      for (const city of cities) {
        const citySlug = listingCitySlug(city);
        if (!citySlug) continue;

        pushLoc(`/${APARTMENTS_LISTING_HUB_PREFIX}${citySlug}`, 0.75);

        for (const bhk of bhkFloorSlugs) {
          for (const category of LISTING_BHK_CATEGORY_SLUGS) {
            pushLoc(`/${bhk}-${category}-in-${citySlug}`, 0.73);
          }
        }

        for (const floor of LISTING_COMMERCIAL_FLOOR_SLUGS) {
          pushLoc(`/${floor}-in-${citySlug}`);
        }
      }
    }

    return allPaths;
  },
};
