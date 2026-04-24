/**
 * Resolves author display name from blog API objects (field names differ by endpoint).
 * @param {Record<string, unknown> | null | undefined} blog
 * @param {string} [whenEmpty] — shown when no author is present (default: "My Property Fact")
 */
export function getBlogAuthorDisplayName(blog, whenEmpty = "My Property Fact") {
  if (blog == null || typeof blog !== "object") return whenEmpty;

  const b = blog;
  const candidates = [
    typeof b.authorName === "string" ? b.authorName : "",
    typeof b.author_name === "string" ? b.author_name : "",
    typeof b.blogAuthor === "string" ? b.blogAuthor : "",
    typeof b.createdByName === "string" ? b.createdByName : "",
    typeof b.userName === "string" ? b.userName : "",
  ];

  const authorObj = b.author;
  if (authorObj && typeof authorObj === "object") {
    const a = authorObj;
    candidates.push(
      typeof a.name === "string" ? a.name : "",
      typeof a.authorName === "string" ? a.authorName : "",
      typeof a.fullName === "string" ? a.fullName : "",
    );
  }

  for (const c of candidates) {
    const s = String(c).trim();
    if (s) return s;
  }
  return whenEmpty;
}
