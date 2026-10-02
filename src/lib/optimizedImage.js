import { getImageProps } from "next/image";

/** Quality tuned for banner/LCP images — balances size vs visual fidelity. */
export const BANNER_IMAGE_QUALITY = 55;
export const BANNER_IMAGE_SIZES = "100vw";

export const DEFAULT_PAGE_BANNER = {
  src: "/static/realestate-bg.jpg",
  width: 1437,
  height: 373,
};

export const CAREER_HERO_BANNER = {
  src: "/career.jpg",
  width: 679,
  height: 495,
};

/** Default dimensions for remote project/blog hero images when exact size is unknown. */
export const REMOTE_HERO_DEFAULT = {
  width: 1200,
  height: 800,
};

export function resolvePageBannerSrc(image) {
  if (image && typeof image === "string" && image.trim()) {
    const cleaned = image.trim().replace(/^\//, "");
    return `/static/${cleaned}`;
  }
  return DEFAULT_PAGE_BANNER.src;
}

export function getOptimizedImageProps({
  src,
  width,
  height,
  alt = "",
  sizes = BANNER_IMAGE_SIZES,
  quality = BANNER_IMAGE_QUALITY,
}) {
  const { props } = getImageProps({
    src,
    width,
    height,
    alt,
    sizes,
    quality,
  });
  return props;
}

/**
 * Primary hero image URL for project detail pages (server-side).
 */
export function getProjectHeroImageUrl(projectDetail) {
  if (!projectDetail || typeof projectDetail !== "object") return null;

  const slug = projectDetail.slugURL || projectDetail.slugUrl;
  const base = String(process.env.NEXT_PUBLIC_IMAGE_URL || "").trim();

  const desktopImages = Array.isArray(projectDetail.desktopImages)
    ? projectDetail.desktopImages
    : [];
  const galleryImages = Array.isArray(projectDetail.galleryImages)
    ? projectDetail.galleryImages
    : [];

  const filename =
    desktopImages[0]?.desktopImage ||
    galleryImages[0]?.imageName ||
    projectDetail.projectBannerImage ||
    projectDetail.projectThumbnailImage;

  if (!filename) return null;

  const raw = String(filename).trim();
  if (/^https?:\/\//i.test(raw) || raw.startsWith("/")) return raw;
  if (!base || !slug) return null;

  return `${base}properties/${slug}/${raw}`;
}

/** All hero gallery URLs for a project (desktop images first, then gallery). */
export function getProjectHeroSlides(projectDetail) {
  if (!projectDetail || typeof projectDetail !== "object") {
    return ["/static/no_image.png"];
  }

  const slug = projectDetail.slugURL || projectDetail.slugUrl;
  const base = String(process.env.NEXT_PUBLIC_IMAGE_URL || "").trim();

  const toUrl = (filename) => {
    const raw = String(filename || "").trim();
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw) || raw.startsWith("/")) return raw;
    if (!base || !slug) return null;
    return `${base}properties/${slug}/${raw}`;
  };

  const desktopImages = Array.isArray(projectDetail.desktopImages)
    ? projectDetail.desktopImages
    : [];
  const galleryImages = Array.isArray(projectDetail.galleryImages)
    ? projectDetail.galleryImages
    : [];

  const urls = [
    ...desktopImages.map((b) => toUrl(b?.desktopImage)),
    ...galleryImages.map((b) => toUrl(b?.imageName)),
  ].filter(Boolean);

  if (urls.length) return urls;

  const fallback = getProjectHeroImageUrl(projectDetail);
  return [fallback || "/static/no_image.png"];
}

/** Optimized img props for the project hero LCP image (server + client must share). */
export function buildProjectHeroLcpProps(src, projectName) {
  const alt = projectName
    ? `${projectName} — primary project photo on My Property Fact`
    : "Project primary photo on My Property Fact";

  return getOptimizedImageProps({
    src: src || "/static/no_image.png",
    width: REMOTE_HERO_DEFAULT.width,
    height: REMOTE_HERO_DEFAULT.height,
    alt,
    sizes: "(max-width: 767.98px) 100vw, 66vw",
    quality: BANNER_IMAGE_QUALITY,
  });
}

/** Homepage listing tiles (~248×168 CSS). */
export const HOME_TILE_CARD_SIZES = "(max-width: 768px) 42vw, 248px";
export const HOME_POSTER_CARD_SIZES = "(max-width: 768px) 85vw, 400px";
export const HOME_FEATURED_OVERLAP_SIZES = "(max-width: 768px) 92vw, 510px";
export const HOME_CARD_IMAGE_QUALITY = 45;
export const HOME_SECTION_BG_SIZES = "100vw";
export const HOME_CITY_PILL_SIZES = "22px";
export const HOME_CITY_HERO_SIZES = "(max-width: 768px) 88vw, 320px";
export const HOME_BLOG_CARD_SIZES = "(max-width: 768px) 100vw, 400px";

/**
 * Spread onto a native <img> for next/image-optimized delivery (URLs unchanged).
 */
export function buildHomeCardImageProps({
  src,
  width,
  height,
  alt = "",
  sizes = HOME_TILE_CARD_SIZES,
  quality = HOME_CARD_IMAGE_QUALITY,
  priority = false,
}) {
  const optimized = getOptimizedImageProps({
    src: src || "/static/no_image.png",
    width,
    height,
    alt,
    sizes,
    quality,
  });

  return {
    ...optimized,
    alt,
    title: alt,
    loading: priority ? "eager" : "lazy",
    fetchPriority: priority ? "high" : "low",
    decoding: "async",
  };
}
