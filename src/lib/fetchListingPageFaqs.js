import { normalizeFaqItems } from "@/app/_global_components/jsonLd/buildJsonLd";

/**
 * Fetch admin-managed FAQs for a listing/footer page slug.
 * @param {string} slug - e.g. "food-court-in-noida", "new-projects-in-noida"
 */
export async function fetchListingPageFaqsBySlug(slug) {
  if (!slug || typeof slug !== "string") return [];

  try {
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");
    const response = await fetch(
      `${baseUrl}listing-page-faqs/get/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } },
    );

    if (!response.ok) return [];

    const data = await response.json();
    return normalizeFaqItems(Array.isArray(data) ? data : []);
  } catch {
    return [];
  }
}
