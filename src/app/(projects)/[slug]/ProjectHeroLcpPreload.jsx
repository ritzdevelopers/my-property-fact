import {
  BANNER_IMAGE_QUALITY,
  getOptimizedImageProps,
  getProjectHeroImageUrl,
  REMOTE_HERO_DEFAULT,
} from "@/lib/optimizedImage";

/**
 * Preload the primary project hero image for LCP on project detail pages.
 */
export default function ProjectHeroLcpPreload({ projectDetail }) {
  const heroSrc = getProjectHeroImageUrl(projectDetail);
  if (!heroSrc) return null;

  const { srcSet, sizes } = getOptimizedImageProps({
    src: heroSrc,
    width: REMOTE_HERO_DEFAULT.width,
    height: REMOTE_HERO_DEFAULT.height,
    sizes: "(max-width: 767.98px) 100vw, 66vw",
    quality: BANNER_IMAGE_QUALITY,
  });

  return (
    <link
      rel="preload"
      as="image"
      imageSrcSet={srcSet}
      imageSizes={sizes}
      fetchPriority="high"
    />
  );
}
