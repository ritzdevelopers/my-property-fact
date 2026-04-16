import SearchFilter from "./searchFIlter";
import { ghdHeroBannerAlt, ghdHeroBannerSrc } from "./ghdHeroBannerConfig";
import "../home/home.css";

export default function HeroSection({
  projectTypeList,
  cityList,
}) {
  const desktopSrc = encodeURI(ghdHeroBannerSrc.desktop);
  const tabletSrc = encodeURI(ghdHeroBannerSrc.tablet);
  const mobileSrc = encodeURI(ghdHeroBannerSrc.mobile);

  return (
    <>
      <div className="position-relative hero-section-wrapper">
        <div className="mpf-hero-banner position-relative">
          <div className="position-relative">
            <div className="hero-banner-slider hero-lcp-fallback">
              <div className="position-relative home-banner hero-banner-responsive-images d-block hero-art-direction">
                <picture>
                  <source media="(min-width: 992px)" srcSet={desktopSrc} />
                  <source media="(min-width: 768px) and (max-width: 991.98px)" srcSet={tabletSrc} />
                  <img
                    src={mobileSrc}
                    alt={ghdHeroBannerAlt}
                    title={ghdHeroBannerAlt}
                    className="hero-banner-image hero-banner-image--full"
                    loading="eager"
                    fetchPriority="high"
                    decoding="sync"
                  />
                </picture>
              </div>
            </div>
          </div>
          <div className="home-banner-overlay" aria-hidden />

          <SearchFilter projectTypeList={projectTypeList} cityList={cityList} />
        </div>
      </div>
    </>
  );
}
