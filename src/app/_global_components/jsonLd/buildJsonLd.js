import { getBlogAuthorDisplayName } from "@/app/(home)/components/common/blogAuthor";

const DEFAULT_SITE_URL =
  process.env.NEXT_PUBLIC_UI_URL ?? "https://mypropertyfact.in";

function stripHtml(value) {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function cleanFaqText(text) {
  return stripHtml(text)
    .replace(/^(?:Q\d+[\.\:\s\-]*|(?:\d+[\.\)]\s*))/i, "")
    .replace(/^Ans[\-\s:]+\s*/i, "")
    .trim();
}

function isFaqSectionHeading(html) {
  const text = stripHtml(html).toLowerCase();
  return /\bfaqs?\b/.test(text) || /frequently asked/.test(text);
}

/**
 * Parse Q&A pairs from CMS blog HTML (after an h2/h3 "FAQs" heading).
 * Supports h3+p blocks and inline p "Q1…" / "Ans-" pairs.
 */
export function extractFaqsFromBlogHtml(html) {
  if (!html || typeof html !== "string") return [];

  const headingRe = /<h[23][^>]*>[\s\S]*?<\/h[23]>/gi;
  let faqStart = -1;
  let match;
  while ((match = headingRe.exec(html)) !== null) {
    if (isFaqSectionHeading(match[0])) {
      faqStart = match.index + match[0].length;
      break;
    }
  }
  if (faqStart < 0) return [];

  const section = html.slice(faqStart);
  const items = [];

  const h3BlockRe = /<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3|<h2|$)/gi;
  let h3Match;
  while ((h3Match = h3BlockRe.exec(section)) !== null) {
    const question = cleanFaqText(h3Match[1]);
    if (!question || isFaqSectionHeading(h3Match[1])) continue;

    let answer = "";
    const pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let pMatch;
    while ((pMatch = pRe.exec(h3Match[2])) !== null) {
      const candidate = cleanFaqText(pMatch[1]);
      if (candidate && !/^Q\d/i.test(candidate)) {
        answer = candidate;
        break;
      }
    }
    if (question && answer) {
      items.push({ question, answer });
    }
  }
  if (items.length) return items;

  const blockRe = /<(p|h3)[^>]*>([\s\S]*?)<\/\1>/gi;
  let pendingQuestion = null;
  let blockMatch;
  while ((blockMatch = blockRe.exec(section)) !== null) {
    const raw = blockMatch[2];
    const text = stripHtml(raw);
    const looksLikeQuestion =
      /^(?:Q\d+[\.\:\s\-]|(?:\d+[\.\)]\s))/i.test(text) ||
      /<strong[^>]*>\s*Q\d/i.test(raw);
    const looksLikeAnswer = /^Ans[\-\s:]/i.test(text);

    if (looksLikeQuestion && !looksLikeAnswer) {
      pendingQuestion = cleanFaqText(raw);
    } else if (looksLikeAnswer && pendingQuestion) {
      items.push({ question: pendingQuestion, answer: cleanFaqText(raw) });
      pendingQuestion = null;
    }
  }

  return items;
}

/** Blog detail APIs may expose FAQs under different keys. */
export function resolveBlogFaqRawList(blog) {
  if (!blog || typeof blog !== "object") return [];
  const raw =
    blog.blogFaqList ??
    blog.faqs ??
    blog.faqList ??
    blog.data?.blogFaqList ??
    blog.data?.faqs ??
    blog.blogFaqList?.list ??
    [];
  return Array.isArray(raw) ? raw : [];
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

/** Normalized FAQ items for JSON-LD — API fields first, then CMS HTML fallback. */
export function resolveBlogFaqItemsForSchema(blog) {
  const fromApi = normalizeFaqItems(resolveBlogFaqRawList(blog));
  if (fromApi.length) return fromApi;

  const html =
    blog?.blogDescription ??
    blog?.data?.blogDescription ??
    "";
  return normalizeFaqItems(extractFaqsFromBlogHtml(html));
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

  return `${siteUrl.replace(/\/$/, "")}/logo_flag_color.png`;
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

/** Spring {@code LocalDateTime} strings (no offset) are stored in IST — append +05:30. */
function formatBlogSchemaDate(value) {
  if (value == null || value === "") return undefined;
  const raw = String(value).trim();
  if (!raw) return undefined;

  if (/[+-]\d{2}:\d{2}$/.test(raw) || raw.endsWith("Z")) {
    return raw;
  }

  const match = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/,
  );
  if (match) {
    const [, year, month, day, hour, minute, second] = match;
    return `${year}-${month}-${day}T${hour}:${minute}:${second}+05:30`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function resolveBlogImageUrl(blog) {
  const file = blog?.blogImage;
  if (!file || typeof file !== "string") return undefined;
  const trimmed = file.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const imageBase = process.env.NEXT_PUBLIC_IMAGE_URL || "";
  if (imageBase) {
    const base = imageBase.endsWith("/") ? imageBase : `${imageBase}/`;
    return `${base}blog/${trimmed}`;
  }

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/?$/, "/");
  if (apiBase) {
    return `${apiBase}get/images/blog/${trimmed}`;
  }

  return undefined;
}

/** Article JSON-LD for individual blog posts (`/blog/{slug}`). */
export function buildBlogArticleJsonLd(blog, siteUrl = DEFAULT_SITE_URL) {
  if (!blog || typeof blog !== "object") return null;

  const slug = blog.slugUrl || blog.slugURL;
  const headline = blog.blogTitle || blog.metaTitle;
  if (!slug || !headline) return null;

  const base = siteUrl.replace(/\/$/, "");
  const canonicalUrl = `${base}/blog/${slug}`;
  const description =
    blog.blogMetaDescription || stripHtml(blog.blogDescription) || undefined;
  const image = resolveBlogImageUrl(blog);
  const datePublished = formatBlogSchemaDate(blog.createdAt);
  const dateModified =
    formatBlogSchemaDate(blog.updatedAt) || datePublished || undefined;
  const authorName = getBlogAuthorDisplayName(blog, "My Property Fact");
  const keywords = String(blog.blogKeywords || "")
    .trim()
    .replace(/,\s*$/, "");
  const articleSection =
    String(blog.blogCategory || "").trim() || "Real Estate";

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: String(headline).trim(),
    ...(description ? { description: String(description).trim() } : {}),
    ...(image ? { image } : {}),
    author: {
      "@type": "Person",
      name: authorName,
      url: `${base}/`,
    },
    publisher: {
      "@type": "Organization",
      name: "My Property Fact",
      url: `${base}/`,
      logo: {
        "@type": "ImageObject",
        url: `${base}/logo_flag_color.png`,
        width: 200,
        height: 60,
      },
    },
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    url: canonicalUrl,
    ...(keywords ? { keywords } : {}),
    articleSection,
    inLanguage: "en-IN",
  };
}
