/** Shared paths + base options for GHD hero (picture + LCP preloads). */
export const ghdHeroBannerAlt =
  "GHD Group Velvet Vista — hero home banner";

export const ghdHeroBannerSrc = {
  desktop: "/static/banners/mpf_banner_final.jpg",
  tablet: "/static/banners/MPF BANNER 768X768.jpg",
  mobile: "/static/banners/MPF BANNER 548X810.jpg",
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
