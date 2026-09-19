export async function fetchListingPageOptions() {
  try {
    const response = await fetch("/api/admin/listing-page-options", {
      cache: "no-store",
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
