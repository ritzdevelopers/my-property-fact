const fs = require("fs");
const path = require("path");

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

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function pathFromLoc(loc) {
  if (!loc) return null;
  try {
    const pathname = new URL(loc).pathname;
    if (pathname === "/") return "/";
    return pathname.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

function isBlogDetailPath(entryPath) {
  return entryPath.startsWith("/blog/") && entryPath !== "/blog";
}

function formatUrlEntry({ loc, lastmod, changefreq, priority }) {
  let entry = `<url><loc>${escapeXml(loc)}</loc>`;
  if (lastmod) entry += `<lastmod>${escapeXml(lastmod)}</lastmod>`;
  entry += `<changefreq>${escapeXml(changefreq || "weekly")}</changefreq>`;
  entry += `<priority>${escapeXml(priority || "0.68")}</priority>`;
  entry += "</url>\n";
  return entry;
}

function parseSitemapUrlEntries(xml) {
  const entries = [];
  const urlRegex = /<url>([\s\S]*?)<\/url>/g;
  let match;

  while ((match = urlRegex.exec(xml)) !== null) {
    const block = match[0];
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const entryPath = pathFromLoc(loc);
    if (!entryPath) continue;
    entries.push({ block, path: entryPath });
  }

  return entries;
}

function readExistingBlogPaths(xml) {
  const paths = new Set();
  for (const entry of parseSitemapUrlEntries(xml)) {
    if (isBlogDetailPath(entry.path)) {
      paths.add(entry.path);
    }
  }
  return paths;
}

async function fetchActiveBlogRecords() {
  const base = resolveSitemapApiBase();
  const res = await fetch(`${base}blog/get-all`);
  if (!res.ok) {
    throw new Error(`Failed to fetch blogs (${res.status})`);
  }

  return coerceArray(await res.json()).filter((blog) => {
    if (blog?.status === undefined || blog?.status === null) return true;
    return Number(blog.status) === 1;
  });
}

function buildBlogItems(records, siteUrl) {
  const lastmod = new Date().toISOString();
  const seen = new Set();
  const items = [];

  for (const blog of records) {
    const slug = blogSlug(blog);
    if (!slug) continue;

    const blogPath = `/blog/${slug}`;
    if (seen.has(blogPath)) continue;
    seen.add(blogPath);

    items.push({
      path: blogPath,
      loc: `${siteUrl}${blogPath}`,
      lastmod,
      changefreq: "weekly",
      priority: "0.68",
    });
  }

  return items;
}

function syncSitemap0(blogItems, previousBlogPaths) {
  const publicDir = path.join(process.cwd(), "public");
  const filePath = path.join(publicDir, "sitemap-0.xml");

  if (!fs.existsSync(filePath)) {
    return {
      ok: false,
      error:
        "public/sitemap-0.xml is missing. Run `npm run build` once to generate the base sitemap.",
    };
  }

  const blogPathsToReplace = new Set([
    ...previousBlogPaths,
    ...blogItems.map((item) => item.path),
  ]);

  const xml = fs.readFileSync(filePath, "utf8");
  const existingEntries = parseSitemapUrlEntries(xml);
  const keptEntries = existingEntries.filter(
    (entry) => !blogPathsToReplace.has(entry.path),
  );
  const blogBlocks = blogItems.map((item) => formatUrlEntry(item));
  const header =
    xml.match(/^[\s\S]*?<urlset[^>]*>\n?/)?.[0] ||
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const body =
    keptEntries.map((entry) => `${entry.block}\n`).join("") +
    blogBlocks.join("");

  fs.writeFileSync(filePath, `${header}${body}</urlset>\n`);
  return { ok: true };
}

function updateSitemapIndexLastmod(siteUrl) {
  const indexPath = path.join(process.cwd(), "public", "sitemap.xml");
  if (!fs.existsSync(indexPath)) return;

  const lastmod = new Date().toISOString();
  const xml = fs.readFileSync(indexPath, "utf8");
  const updated = xml.replace(
    /<loc>https?:\/\/[^<]+\/sitemap-0\.xml<\/loc>(?:\s*<lastmod>[^<]*<\/lastmod>)?/,
    `<loc>${siteUrl}/sitemap-0.xml</loc>\n<lastmod>${lastmod}</lastmod>`,
  );

  if (updated !== xml) {
    fs.writeFileSync(indexPath, updated);
  }
}

/**
 * Refresh /blog/{slug} URLs inside public/sitemap-0.xml after admin blog changes.
 * @returns {Promise<{ ok: boolean, blogCount: number, error?: string }>}
 */
async function regenerateBlogSitemaps() {
  try {
    const siteUrl = resolveSiteUrl();
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const sitemapPath = path.join(publicDir, "sitemap-0.xml");
    const previousBlogPaths = fs.existsSync(sitemapPath)
      ? readExistingBlogPaths(fs.readFileSync(sitemapPath, "utf8"))
      : new Set();

    const records = await fetchActiveBlogRecords();
    const blogItems = buildBlogItems(records, siteUrl);

    if (blogItems.length === 0 && previousBlogPaths.size > 0) {
      return {
        ok: false,
        blogCount: 0,
        error:
          "Refusing to update sitemap with zero active blogs while blog URLs already exist (API may be unreachable).",
      };
    }

    const syncResult = syncSitemap0(blogItems, previousBlogPaths);
    if (!syncResult.ok) {
      return { ok: false, blogCount: 0, error: syncResult.error };
    }

    updateSitemapIndexLastmod(siteUrl);

    console.log(
      `[regenerate-blog-sitemaps] Updated sitemap-0.xml with ${blogItems.length} blog URL(s)`,
    );

    return { ok: true, blogCount: blogItems.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[regenerate-blog-sitemaps] Failed", error);
    return { ok: false, blogCount: 0, error: message };
  }
}

module.exports = {
  regenerateBlogSitemaps,
};
