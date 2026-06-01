const DEFAULT_SITE_URL =
  process.env.NEXT_PUBLIC_UI_URL ?? "https://mypropertyfact.in";

function stripHtml(value) {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeFaqItems(rawFaqs) {
  if (!Array.isArray(rawFaqs)) return [];
  return rawFaqs
    .map((item) => ({
      q: item?.question ?? item?.q ?? item?.faqQuestion ?? "",
      a: stripHtml(item?.answer ?? item?.a ?? item?.faqAnswer ?? ""),
    }))
    .filter((item) => String(item.q).trim() && String(item.a).trim());
}

/** Project detail APIs may expose FAQs under different keys. */
export function resolveProjectFaqRawList(project) {
  if (!project || typeof project !== "object") return [];
  const raw =
    project.faqs ??
    project.projectFaqList ??
    project.faqList ??
    project.projectFaqs ??
    [];
  return Array.isArray(raw) ? raw : [];
}

export function buildFaqJsonLd(faqItems) {
  const items = normalizeFaqItems(faqItems);
  if (!items.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: String(q).trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: String(a).trim(),
      },
    })),
  };
}

function parseProjectPriceInInr(rawPrice) {
  if (rawPrice == null || rawPrice === "") return null;
  if (/[a-zA-Z]/.test(String(rawPrice))) return null;

  const text = String(rawPrice).replace(/,/g, "").trim().toLowerCase();
  const match = text.match(/-?(?:\d+\.?\d*|\.\d+)/);
  if (!match) return null;

  const value = Number(match[0]);
  if (!Number.isFinite(value)) return null;

  if (text.includes("lakh") || text.includes("lac")) {
    return Math.round(value * 100000);
  }
  if (text.includes("crore") || /\bcr\b/.test(text)) {
    return Math.round(value * 10000000);
  }
  if (value >= 100000) return Math.round(value);
  if (value > 20) return Math.round(value * 100000);
  return Math.round(value * 10000000);
}

function buildPostalAddress(project) {
  if (!project || typeof project !== "object") return null;

  const streetAddress =
    project.projectAddress || project.projectLocality || "";
  const addressLocality = project.projectLocality || project.city || "";
  const addressRegion = project.state || "";
  const addressCountry = project.country || "India";

  if (!streetAddress && !addressLocality && !addressRegion) return null;

  return {
    "@type": "PostalAddress",
    ...(streetAddress ? { streetAddress } : {}),
    ...(addressLocality ? { addressLocality } : {}),
    ...(addressRegion ? { addressRegion } : {}),
    ...(addressCountry ? { addressCountry } : {}),
  };
}

function buildGeoCoordinates(project) {
  if (!project || typeof project !== "object") return null;

  const lat =
    project.latitude ??
    project.projectLatitude ??
    project.lat ??
    project.geoLat;
  const lng =
    project.longitude ??
    project.projectLongitude ??
    project.lng ??
    project.geoLng;

  const latitude = lat != null && lat !== "" ? Number(lat) : NaN;
  const longitude = lng != null && lng !== "" ? Number(lng) : NaN;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return {
    "@type": "GeoCoordinates",
    latitude,
    longitude,
  };
}

function resolveProjectImage(project, siteUrl) {
  const slug = project?.slugURL;
  if (!slug) return null;

  const imageFile =
    project.desktopImages?.[0]?.desktopImage ||
    project.projectBannerImage ||
    project.projectThumbnailImage ||
    project.projectThumbnail;

  const imageBase = process.env.NEXT_PUBLIC_IMAGE_URL || "";
  if (imageFile && imageBase) {
    return `${imageBase}properties/${slug}/${imageFile}`;
  }

  return `${siteUrl.replace(/\/$/, "")}/logo.webp`;
}

export function buildProductJsonLd(project, siteUrl = DEFAULT_SITE_URL) {
  if (!project?.slugURL) return null;

  const slug = project.slugURL;
  const canonicalUrl = `${siteUrl.replace(/\/$/, "")}/${slug}`;
  const priceInInr = parseProjectPriceInInr(
    project.projectStartingPrice ?? project.projectPrice,
  );
  const address = buildPostalAddress(project);
  const geo = buildGeoCoordinates(project);
  const image = resolveProjectImage(project, siteUrl);
  const description =
    project.metaDescription ||
    stripHtml(project.projectWalkthroughDescription) ||
    stripHtml(project.locationDesc) ||
    undefined;

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: project.projectName || project.metaTitle || slug,
    ...(image ? { image } : {}),
    ...(description ? { description } : {}),
    sku: String(project.id || slug),
    brand: {
      "@type": "Brand",
      name: project.builder?.builderName || "My Property Fact",
    },
    ...(address ? { address } : {}),
    ...(geo ? { geo } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      ...(priceInInr ? { price: String(priceInInr) } : {}),
      url: canonicalUrl,
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil: `${new Date().getFullYear()}-12-31`,
      availability: "https://schema.org/InStock",
    },
  };
}

/** @deprecated Use `buildProductJsonLd` + separate `buildFaqJsonLd` script tags on project pages. */
export function buildProjectPageJsonLd(project, siteUrl = DEFAULT_SITE_URL) {
  return buildProductJsonLd(project, siteUrl);
}
