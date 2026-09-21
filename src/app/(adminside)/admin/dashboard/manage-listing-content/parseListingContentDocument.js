import {
  extractFirstHeadingText,
  extractFirstParagraphText,
  isAcceptedDocument,
  parseImportedDocument,
} from "../_lib/parseDocumentCore";

const LISTING_METADATA_PATTERNS = [
  {
    key: "pageTitle",
    re: /^(?:select\s*page|page(?:\s*title)?)\s*[:：]\s*(.+)$/i,
  },
  { key: "pageSlug", re: /^(?:page\s*slug|slug(?:\s*url)?)\s*[:：]\s*(.+)$/i },
  {
    key: "heading",
    re: /^(?:page\s*heading(?:\s*\(h1\))?|heading(?:\s*\(h1\))?|h1)\s*[:：]\s*(.+)$/i,
  },
  { key: "intro", re: /^(?:short\s*intro|intro)\s*[:：]\s*(.+)$/i },
  { key: "metaTitle", re: /^(?:meta\s*title)\s*[:：]\s*(.+)$/i },
  { key: "metaDescription", re: /^(?:meta\s*description)\s*[:：]\s*(.+)$/i },
  { key: "metaKeywords", re: /^(?:meta\s*keywords?|keywords?)\s*[:：]\s*(.+)$/i },
];

function normalizePageSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^\/+/, "");
}

function resolvePageSelection(fields, slugOptions = []) {
  const slug = normalizePageSlug(fields.pageSlug);
  const title = String(fields.pageTitle || "").trim();

  if (slug) {
    const bySlug = slugOptions.find((item) => item.pageSlug === slug);
    if (bySlug) {
      return { pageSlug: bySlug.pageSlug, pageTitle: bySlug.pageTitle };
    }
    return { pageSlug: slug, pageTitle: title || slug };
  }

  if (title) {
    const normalizedTitle = title.toLowerCase();
    const byTitle = slugOptions.find(
      (item) => String(item.pageTitle || "").trim().toLowerCase() === normalizedTitle,
    );
    if (byTitle) {
      return { pageSlug: byTitle.pageSlug, pageTitle: byTitle.pageTitle };
    }
  }

  return { pageSlug: "", pageTitle: title };
}

function finalizeImportedListingContent(
  fields,
  { slugOptions = [], skipPageFields = false } = {},
) {
  const content = String(fields.content || "").trim();
  if (!content) {
    throw new Error("The document has no page content to import.");
  }

  const heading =
    String(fields.heading || "").trim() || extractFirstHeadingText(content);

  const metaTitle =
    String(fields.metaTitle || "").trim() ||
    heading ||
    extractFirstHeadingText(content);

  const metaDescription =
    String(fields.metaDescription || "").trim() ||
    String(fields.intro || "").trim() ||
    extractFirstParagraphText(content).slice(0, 320);

  const contentFields = {
    heading,
    intro: String(fields.intro || "").trim(),
    content,
    metaTitle,
    metaDescription,
    metaKeywords: String(fields.metaKeywords || "").trim(),
  };

  if (skipPageFields) {
    return contentFields;
  }

  const { pageSlug, pageTitle } = resolvePageSelection(fields, slugOptions);
  return {
    pageSlug,
    pageTitle,
    ...contentFields,
  };
}

export function isAcceptedListingContentDocument(file) {
  return isAcceptedDocument(file);
}

export async function parseListingContentDocument(
  file,
  { slugOptions = [], skipPageFields = false } = {},
) {
  return parseImportedDocument(file, {
    metadataPatterns: LISTING_METADATA_PATTERNS,
    contentFieldKey: "content",
    recoverableErrorPattern: /empty|unsupported|too large|no page content/i,
    finalize: (parsed) =>
      finalizeImportedListingContent(parsed, { slugOptions, skipPageFields }),
  });
}
