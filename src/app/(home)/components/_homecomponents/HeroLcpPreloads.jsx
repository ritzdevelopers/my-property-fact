import { getImageProps } from "next/image";
import {
  ghdHeroBannerSrc,
  getGhdHeroImagePropsCommon,
} from "./ghdHeroBannerConfig";

/**
 * Responsive preloads so the LCP image URL is discoverable from the document
 * head (matches Next Image /_next/image URLs used by the hero <picture>).
 */
export default function HeroLcpPreloads() {
  const common = getGhdHeroImagePropsCommon();

  const mobile = getImageProps({
    ...common,
    src: ghdHeroBannerSrc.mobile,
  }).props;
  const tablet = getImageProps({
    ...common,
    src: ghdHeroBannerSrc.tablet,
  }).props;
  const desktop = getImageProps({
    ...common,
    src: ghdHeroBannerSrc.desktop,
  }).props;

  return (
    <>
      <link
        rel="preload"
        as="image"
        imageSrcSet={mobile.srcSet}
        imageSizes={mobile.sizes}
        fetchPriority="high"
        media="(max-width: 767px)"
      />
      <link
        rel="preload"
        as="image"
        imageSrcSet={tablet.srcSet}
        imageSizes={tablet.sizes}
        fetchPriority="high"
        media="(min-width: 768px) and (max-width: 991px)"
      />
      <link
        rel="preload"
        as="image"
        imageSrcSet={desktop.srcSet}
        imageSizes={desktop.sizes}
        fetchPriority="high"
        media="(min-width: 992px)"
      />
    </>
  );
}
