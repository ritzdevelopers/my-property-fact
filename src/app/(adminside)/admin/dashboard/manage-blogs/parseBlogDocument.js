import {
  extractFirstHeadingText,
  extractFirstParagraphText,
  isAcceptedDocument,
  parseImportedDocument,
} from "../_lib/parseDocumentCore";

const BLOG_METADATA_PATTERNS = [
  { key: "blogTitle", re: /^(?:meta\s*title|blog\s*title|title)\s*[:：]\s*(.+)$/i },
  { key: "blogKeywords", re: /^(?:blog\s*keywords?|keywords?)\s*[:：]\s*(.+)$/i },
  {
    key: "blogMetaDescription",
    re: /^(?:blog\s*meta\s*description|meta\s*description)\s*[:：]\s*(.+)$/i,
  },
  { key: "slugUrl", re: /^(?:slug\s*url|slug)\s*[:：]\s*(.+)$/i },
  { key: "blogCategory", re: /^(?:blog\s*category|category)\s*[:：]\s*(.+)$/i },
  { key: "city", re: /^(?:blog\s*city|city)\s*[:：]\s*(.+)$/i },
  { key: "authorName", re: /^(?:author\s*name|author)\s*[:：]\s*(.+)$/i },
];

function slugifyTitle(title) {
  return String(title || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function resolveCategoryId(categoryText, categoryList) {
  const raw = String(categoryText || "").trim();
  if (!raw || !Array.isArray(categoryList)) return "";

  const normalized = raw.toLowerCase();
  const byId = categoryList.find((item) => String(item.id) === raw);
  if (byId) return String(byId.id);

  const byName = categoryList.find(
    (item) => String(item.categoryName || "").trim().toLowerCase() === normalized,
  );
  return byName ? String(byName.id) : "";
}

function resolveCityId(cityText, cityList) {
  const raw = String(cityText || "").trim();
  if (!raw || !Array.isArray(cityList)) return 0;

  const normalized = raw.toLowerCase();
  const byId = cityList.find((item) => String(item.id) === raw);
  if (byId) return Number(byId.id) || 0;

  const byName = cityList.find(
    (item) => String(item.cityName || "").trim().toLowerCase() === normalized,
  );
  return byName ? Number(byName.id) || 0 : 0;
}

function resolveAuthorName(authorText, authors = []) {
  const raw = String(authorText || "").trim();
  if (!raw) return "";

  const normalized = raw.toLowerCase();
  const match = authors.find((name) => String(name).trim().toLowerCase() === normalized);
  return match || raw;
}

function finalizeImportedBlog(fields, { categoryList, cityList, authors }) {
  const blogDescription = String(fields.blogDescription || "").trim();
  if (!blogDescription) {
    throw new Error("The document has no blog content to import.");
  }

  const blogTitle =
    String(fields.blogTitle || "").trim() ||
    extractFirstHeadingText(blogDescription) ||
    "Untitled blog";

  const blogMetaDescription =
    String(fields.blogMetaDescription || "").trim() ||
    extractFirstParagraphText(blogDescription).slice(0, 320);

  const slugUrl = String(fields.slugUrl || "").trim() || slugifyTitle(blogTitle);

  return {
    blogTitle,
    blogKeywords: String(fields.blogKeywords || "").trim(),
    blogMetaDescription,
    slugUrl,
    blogCategory: resolveCategoryId(fields.blogCategory, categoryList),
    cityId: resolveCityId(fields.city, cityList),
    authorName: resolveAuthorName(fields.authorName, authors),
    blogDescription,
  };
}

export function isAcceptedBlogDocument(file) {
  return isAcceptedDocument(file);
}

/**
 * Parse a blog document and return fields for the existing Create Blog form.
 */
export async function parseBlogDocument(
  file,
  { categoryList = [], cityList = [], authors = [] } = {},
) {
  return parseImportedDocument(file, {
    metadataPatterns: BLOG_METADATA_PATTERNS,
    contentFieldKey: "blogDescription",
    recoverableErrorPattern: /empty|unsupported|too large|no blog content/i,
    finalize: (parsed) =>
      finalizeImportedBlog(parsed, { categoryList, cityList, authors }),
  });
}
