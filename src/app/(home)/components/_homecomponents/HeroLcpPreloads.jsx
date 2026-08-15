import { BANNER_DESKTOP } from "./heroBannerAssets";

/**
 * Preload the campaign hero file directly so it is not downsized by /_next/image.
 */
export default function HeroLcpPreloads() {
  return (
    <link
      rel="preload"
      as="image"
      href={BANNER_DESKTOP.src}
      type="image/jpeg"
      title="My Property Fact Home Banner"
      fetchPriority="high"
    />
  );
}
