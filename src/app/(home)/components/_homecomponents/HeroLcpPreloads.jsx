const BANNER_ALT =
  "Luxury residential skyline at sunset — verified properties on My Property Fact";

/**
 * Preload the static LCP file for this viewport. The <img> fallback is the
 * mobile file, so phones never discover the desktop banner first.
 */
export default function HeroLcpPreloads() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/static/banners/hero-lcp-mobile.webp"
        title={BANNER_ALT}
        media="(max-width: 767.98px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/static/banners/hero-lcp-tablet.webp"
        title={BANNER_ALT}
        media="(min-width: 768px) and (max-width: 991.98px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/static/banners/hero-lcp-desktop.webp"
        title={BANNER_ALT}
        media="(min-width: 992px)"
        fetchPriority="high"
      />
    </>
  );
}
