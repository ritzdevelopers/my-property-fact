/**
 * Resolves a builder logo URL using the API image path
 * (`get/images/builders/{slug}/{file}`), matching the home developers marquee.
 */
export function buildBuilderLogoImageUrl(builder) {
  if (!builder || typeof builder !== "object") return null;

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const imageBase = process.env.NEXT_PUBLIC_IMAGE_URL || "";
  const slug = (builder.slugUrl || builder.slugURL || builder.slug || "").trim();
  const file =
    builder.builderLogo ||
    builder.builderImage ||
    builder.logo ||
    builder.image ||
    builder.imageUrl;

  if (!file) return null;
  if (String(file).startsWith("http") || String(file).startsWith("/")) {
    return String(file);
  }

  if (slug && apiBase) {
    const base = apiBase.endsWith("/") ? apiBase : `${apiBase}/`;
    return `${base}get/images/builders/${encodeURIComponent(slug)}/${encodeURIComponent(file)}`;
  }

  // Legacy fallback path for older environments.
  if (slug && imageBase) {
    return `${imageBase}builder/${encodeURIComponent(slug)}/${encodeURIComponent(file)}`;
  }
  if (imageBase) return `${imageBase}${file}`;
  return null;
}

export function sanitizeBuilderDescriptionHtml(html, builderName = "") {
  if (!html) return html;

  let out = String(html);
  const name = String(builderName || "").trim();

  if (name) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(
      new RegExp(`<h[12][^>]*>\\s*About\\s+${escapedName}\\s*<\\/h[12]>`, "gi"),
      "",
    );
  }

  out = out.replace(/<h[12][^>]*>\s*About\s+[^<]+\s*<\/h[12]>/gi, "");
  return out.trim();
}
