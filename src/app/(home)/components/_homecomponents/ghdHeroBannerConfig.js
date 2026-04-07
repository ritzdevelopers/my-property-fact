/** Shared paths + base options for GHD hero (picture + LCP preloads). */
export const ghdHeroBannerAlt =
  "GHD Group Velvet Vista — hero home banner";

export const ghdHeroBannerSrc = {
  desktop: "/static/banners/ghd_desktop_final.jpg",
  tablet: "/static/banners/ghd_tablet_final.jpg",
  mobile: "/static/banners/ghd_mobile_final.jpg",
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
