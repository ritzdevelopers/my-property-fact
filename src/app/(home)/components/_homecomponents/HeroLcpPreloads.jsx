import { ghdHeroBannerSrc } from "./ghdHeroBannerConfig";

/**
 * Preload hero assets by viewport — direct /static URLs (no /_next/image).
 */
export default function HeroLcpPreloads() {
  const mobile = encodeURI(ghdHeroBannerSrc.mobile);
  const tablet = encodeURI(ghdHeroBannerSrc.tablet);
  const desktop = encodeURI(ghdHeroBannerSrc.desktop);

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={mobile}
        fetchPriority="high"
        media="(max-width: 767px)"
      />
      <link
        rel="preload"
        as="image"
        href={tablet}
        fetchPriority="high"
        media="(min-width: 768px) and (max-width: 991.98px)"
      />
      <link
        rel="preload"
        as="image"
        href={desktop}
        fetchPriority="high"
        media="(min-width: 992px)"
      />
    </>
  );
}
