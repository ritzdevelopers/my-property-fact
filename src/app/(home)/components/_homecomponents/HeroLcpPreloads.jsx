import { getImageProps } from "next/image";
import {
  BANNER_DESKTOP,
  BANNER_MOBILE,
  BANNER_TABLET,
  HERO_IMAGE_QUALITY,
  HERO_IMAGE_SIZES,
} from "./heroBannerAssets";

/**
 * Preload only the art-directed LCP candidate for the current viewport.
 * URLs must match the optimized `/_next/image` sources used by heroSection.
 */
export default function HeroLcpPreloads() {
  const common = {
    alt: "",
    sizes: HERO_IMAGE_SIZES,
    quality: HERO_IMAGE_QUALITY,
  };

  const {
    props: { srcSet: mobileSrcSet, sizes: mobileSizes },
  } = getImageProps({
    ...common,
    src: BANNER_MOBILE.src,
    width: BANNER_MOBILE.width,
    height: BANNER_MOBILE.height,
  });

  const {
    props: { srcSet: tabletSrcSet, sizes: tabletSizes },
  } = getImageProps({
    ...common,
    src: BANNER_TABLET.src,
    width: BANNER_TABLET.width,
    height: BANNER_TABLET.height,
  });

  const {
    props: { srcSet: desktopSrcSet, sizes: desktopSizes },
  } = getImageProps({
    ...common,
    src: BANNER_DESKTOP.src,
    width: BANNER_DESKTOP.width,
    height: BANNER_DESKTOP.height,
  });

  return (
    <>
      <link
        rel="preload"
        as="image"
        title="My Property Fact Home Banner"
        imageSrcSet={mobileSrcSet}
        imageSizes={mobileSizes}
        media="(max-width: 767.98px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        title="My Property Fact Home Banner"
        imageSrcSet={tabletSrcSet}
        imageSizes={tabletSizes}
        media="(min-width: 768px) and (max-width: 991.98px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        title="My Property Fact Home Banner"
        imageSrcSet={desktopSrcSet}
        imageSizes={desktopSizes}
        media="(min-width: 992px)"
        fetchPriority="high"
      />
    </>
  );
}
