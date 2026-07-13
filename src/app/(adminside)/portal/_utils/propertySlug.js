/**
 * Generate a public /properties/[slug] URL segment from title + id.
 */
export function generatePropertySlug(title, id) {
  if (!title) return String(id);
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    id;
  return slug;
}

export function getPublicPropertyUrl(title, id) {
  return `/properties/${generatePropertySlug(title, id)}`;
}
