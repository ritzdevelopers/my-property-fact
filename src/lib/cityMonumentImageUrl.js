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

export function sanitizeCityDescriptionHtml(html, cityName = "") {
  if (!html) return html;

  let out = String(html);
  const city = String(cityName || "").trim();

  if (city) {
    const escapedCity = city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(
      new RegExp(`<h[1-3][^>]*>\\s*About\\s+${escapedCity}\\s*<\\/h[1-3]>`, "gi"),
      "",
    );
    // Drop CMS guide titles — the UI already shows a clean guide heading
    out = out.replace(
      new RegExp(
        `<h[1-3][^>]*>\\s*Property\\s+in\\s+${escapedCity}[^<]*<\\/h[1-3]>`,
        "gi",
      ),
      "",
    );
  }

  out = out.replace(/<h[1-3][^>]*>\s*About\s+[^<]+\s*<\/h[1-3]>/gi, "");
  out = out.replace(
    /<h[1-3][^>]*>\s*Property\s+in\s+[^<]+<\/h[1-3]>/gi,
    "",
  );

  return out.trim();
}
