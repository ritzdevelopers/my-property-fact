import { BANNER_ALT, BANNER_DESKTOP } from "./heroBannerAssets";

/**
 * Preload the native 1280×512 home banner so LCP matches the rendered <img>.
 */
export default function HeroLcpPreloads() {
  return (
    <link
      rel="preload"
      as="image"
      href={BANNER_DESKTOP.src}
      title={BANNER_ALT}
      fetchPriority="high"
    />
  );
}
