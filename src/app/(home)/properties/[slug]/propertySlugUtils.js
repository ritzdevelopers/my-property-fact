export function getPropertyIdFromSlug(slug) {
  if (!slug) return null;
  const slugStr = String(slug);
  const parts = slugStr.split("-");
  const lastPart = parts[parts.length - 1];
  if (!isNaN(lastPart) && lastPart !== "") return parseInt(lastPart, 10);
  return !isNaN(slugStr) ? parseInt(slugStr, 10) : null;
}

export function projectSlugFromPropertyName(projectName) {
  if (!projectName) return null;
  const s = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return s || null;
}
