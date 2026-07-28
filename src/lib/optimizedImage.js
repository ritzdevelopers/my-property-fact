import { getImageProps } from "next/image";

/** Quality tuned for banner/LCP images — balances size vs visual fidelity. */
export const BANNER_IMAGE_QUALITY = 65;
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
