/** Shared paths + base options for GHD hero (picture + LCP preloads). */
export const ghdHeroBannerAlt =
  "GHD Group Velvet Vista — hero home banner";

export const ghdHeroBannerSrc = {
  desktop: "/static/banners/mpf banner-01 (3).jpg",
  tablet: "/static/banners/mpf banner-01 (3).jpg",
  mobile: "/static/banners/mpf banner-01 (3).jpg",
};

export function getGhdHeroImagePropsCommon() {
  return {
    alt: ghdHeroBannerAlt,
    title: ghdHeroBannerAlt,
    fill: true,
    priority: true,
    fetchPriority: "high",
    className: "hero-banner-image",
    sizes: "100vw",
  };
}
