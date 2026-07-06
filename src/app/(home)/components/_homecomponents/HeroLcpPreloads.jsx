// Preload links must mirror the <picture> breakpoints in heroSection.jsx exactly.
const BANNER_DESKTOP = "/static/banners/mpf%20banner-02%20(3).jpg";
const BANNER_TABLET  = "/static/banners/mpf%20banner-02%20(3).jpg";
const BANNER_MOBILE  = "/static/banners/mpf%20banner-02%20(3).jpg";

export default function HeroLcpPreloads() {
  return (
    <>
      {/* mobile  < 768 px */}
      <link rel="preload" as="image" title="My Property Fact Home Banner" href={BANNER_MOBILE}  fetchPriority="high" media="(max-width: 767.98px)" />
      {/* tablet  768 – 991 px */}
      <link rel="preload" as="image" title="My Property Fact Home Banner" href={BANNER_TABLET}  fetchPriority="high" media="(min-width: 768px) and (max-width: 991.98px)" />
      {/* desktop ≥ 992 px */}
      <link rel="preload" as="image" title="My Property Fact Home Banner" href={BANNER_DESKTOP} fetchPriority="high" media="(min-width: 992px)" />
    </>
  );
}
