import {
  BANNER_IMAGE_QUALITY,
  BANNER_IMAGE_SIZES,
  DEFAULT_PAGE_BANNER,
  getOptimizedImageProps,
  resolvePageBannerSrc,
} from "@/lib/optimizedImage";

/**
 * Preload the page banner LCP candidate. Must use the same optimized URL as CommonHeaderBanner.
 */
export default function PageBannerLcpPreload({ image }) {
  const src = resolvePageBannerSrc(image);
  const { srcSet, sizes } = getOptimizedImageProps({
    src,
    width: DEFAULT_PAGE_BANNER.width,
    height: DEFAULT_PAGE_BANNER.height,
    sizes: BANNER_IMAGE_SIZES,
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
