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

// CMS editors often repeat the guide title as a styled first paragraph
// instead of a heading, which duplicates the heading the UI already renders.
function stripLeadingTitleParagraph(html) {
  const match = html.match(/^<p\b[^>]*>([\s\S]*?)<\/p>/i);
  if (!match) return html;

  const text = match[1]
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!/^(property|real estate)\s+in\s+.+guide\s*$/i.test(text)) return html;

  return html.slice(match[0].length);
}

function decodeBasicEntities(value) {
  return String(value)
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'");
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function titleFromHref(href) {
  const path = String(href || "")
    .split(/[?#]/)[0]
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/\/+$/, "");

  const lastSegment = path.split("/").filter(Boolean).pop();
  if (!lastSegment) return "Home";

  return lastSegment
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function stripInlineColorFromAttrs(attrs) {
  return String(attrs)
    .replace(/\sstyle\s*=\s*(["'])([\s\S]*?)\1/gi, (_, quote, style) => {
      const cleaned = String(style)
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .filter(
          (part) =>
            !/^color\s*:/i.test(part) &&
            !/^text-decoration-color\s*:/i.test(part),
        )
        .join("; ");

      return cleaned ? ` style=${quote}${cleaned}${quote}` : "";
    })
    .replace(/\scolor\s*=\s*(["']).*?\1/gi, "");
}

/** Jodit/CMS HTML often paints each <a> a different inline color. */
function normalizeDescriptionLinkColors(html) {
  return html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_, attrs, inner) => {
    const nextInner = inner.replace(
      /<(span|font|strong|b|em|i|u|mark)\b([^>]*)>/gi,
      (tagMatch, tag, tagAttrs) => `<${tag}${stripInlineColorFromAttrs(tagAttrs)}>`,
    );

    return `<a${stripInlineColorFromAttrs(attrs)}>${nextInner}</a>`;
  });
}

/** CMS links ship without a title attribute, so one is derived from the text. */
function addLinkTitles(html) {
  return html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (match, attrs, inner) => {
    if (/\stitle\s*=/i.test(attrs)) return match;

    const href = attrs.match(/href\s*=\s*["']([^"']*)["']/i)?.[1] || "";
    const label =
      decodeBasicEntities(inner.replace(/<[^>]+>/g, " "))
        .replace(/\s+/g, " ")
        .trim() || titleFromHref(href);

    if (!label) return match;

    return `<a${attrs} title="${escapeAttribute(label.slice(0, 90))}">${inner}</a>`;
  });
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
  out = stripLeadingTitleParagraph(out.trim());
  out = normalizeDescriptionLinkColors(out);
  out = addLinkTitles(out);

  return out.trim();
}
