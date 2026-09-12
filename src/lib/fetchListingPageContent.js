/**
 * Fetch admin-managed SEO content for a listing/footer page slug.
 * @param {string} slug - e.g. "commercial-property-in-delhi"
 */
export async function fetchListingPageContentBySlug(slug) {
  if (!slug || typeof slug !== "string") return null;

  try {
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");
    const response = await fetch(
      `${baseUrl}listing-page-contents/get-by-slug?slug=${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } },
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;
    if (!data.pageSlug) return null;
    return data;
  } catch {
    return null;
  }
}

export function listingContentHasBody(content) {
  if (!content) return false;
  const html = String(content.content || "").replace(/<[^>]*>/g, "").trim();
  const intro = String(content.intro || "").trim();
  const heading = String(content.heading || "").trim();
  return Boolean(html || intro || heading);
}
