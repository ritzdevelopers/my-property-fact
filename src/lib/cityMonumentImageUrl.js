export const DEFAULT_CITY_MONUMENT_IMAGE = "/static/realestate-bg.jpg";

export function buildCityMonumentImageUrl(filename) {
  const name = String(filename || "").trim();
  if (!name) return DEFAULT_CITY_MONUMENT_IMAGE;

  if (/^https?:\/\//i.test(name) || name.startsWith("/")) {
    return name;
  }

  const base = String(process.env.NEXT_PUBLIC_IMAGE_URL || "").trim();
  if (!base) return DEFAULT_CITY_MONUMENT_IMAGE;

  return `${base}cities/${encodeURIComponent(name)}`;
}
