import {
  BANNER_IMAGE_QUALITY,
  BANNER_IMAGE_SIZES,
  CAREER_HERO_BANNER,
  getOptimizedImageProps,
} from "@/lib/optimizedImage";

export default function CareerHeroPreload() {
  const { srcSet, sizes } = getOptimizedImageProps({
    src: CAREER_HERO_BANNER.src,
    width: CAREER_HERO_BANNER.width,
    height: CAREER_HERO_BANNER.height,
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
