/** @type {import('next-sitemap').IConfig} */
const SITE_URL = (process.env.NEXT_PUBLIC_UI_URL || process.env.NEXT_PUBLIC_ROOT_URL || "https://www.mypropertyfact.in").replace(/\/+$/, "");

function toPathSlug(value) {
  return String(value || "").trim().replace(/^\/+|\/+$/g, "");
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

    return allPaths;
  },
};
