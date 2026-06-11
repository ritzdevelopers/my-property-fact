const fs = require("fs");
const path = require("path");

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

const dataPath = path.join(__dirname, "../data/sitemap-custom.json");
const dest = path.join(__dirname, "../public/sitemap-custom.xml");

if (!fs.existsSync(dataPath)) {
  console.error("[sitemap] data/sitemap-custom.json not found");
  process.exit(1);
}

const { changefreq = "weekly", priority = 0.8, paths = [] } = JSON.parse(
  fs.readFileSync(dataPath, "utf8"),
);

if (!Array.isArray(paths) || paths.length === 0) {
  console.error("[sitemap] data/sitemap-custom.json has no paths");
  process.exit(1);
}

const siteUrl = resolveSiteUrl();
const lastmod = new Date().toISOString();

const urlEntries = paths
  .map((entry) => {
    const normalized =
      entry === "/" ? "/" : entry.startsWith("/") ? entry : `/${entry}`;
    const loc =
      normalized === "/"
        ? siteUrl
        : `${siteUrl}${normalized.replace(/\/+$/, "")}`;
    return [
      "  <url>",
      `    <loc>${loc}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      "  </url>",
    ].join("\n");
  })
  .join("\n");

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  urlEntries,
  "</urlset>",
  "",
].join("\n");

fs.writeFileSync(dest, xml);
console.log(
  `[sitemap] generated public/sitemap-custom.xml (${paths.length} URLs)`,
);
