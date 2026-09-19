export async function fetchListingPageCatalog({
  kind,
  page = 0,
  pageSize = 10,
  category = "all",
  q = "",
} = {}) {
  const params = new URLSearchParams({
    kind,
    page: String(page),
    size: String(pageSize),
    category: category || "all",
  });
  if (q) params.set("q", q);

  const response = await fetch(`/api/admin/listing-page-catalog?${params}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Could not load listing pages");
  }
  const data = await response.json();
  return {
    content: Array.isArray(data.content) ? data.content : [],
    totalElements: Number(data.totalElements) || 0,
  };
}
