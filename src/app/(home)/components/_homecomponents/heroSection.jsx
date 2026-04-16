import { getImageProps } from "next/image";
import SearchFilter from "./searchFIlter";
import {
  ghdHeroBannerSrc,
  getGhdHeroImagePropsCommon,
} from "./ghdHeroBannerConfig";
import "../home/home.css";

export default function HeroSection({
  projectTypeList,
  cityList,
}) {
  const common = getGhdHeroImagePropsCommon();

  const {
    props: { srcSet: desktop },
  } = getImageProps({ ...common, src: ghdHeroBannerSrc.desktop });

  const {
    props: { srcSet: tablet },
  } = getImageProps({ ...common, src: ghdHeroBannerSrc.tablet });

  const {
    props: { srcSet: mobile, ...rest },
  } = getImageProps({ ...common, src: ghdHeroBannerSrc.mobile });

  return (
    <>
      <div className="position-relative hero-section-wrapper">
        <div className="mpf-hero-banner position-relative">
          <div className="position-relative">
            <div className="hero-banner-slider hero-lcp-fallback">
              <div className="position-relative home-banner hero-banner-responsive-images d-block hero-art-direction">
                <picture>
                  <source media="(min-width: 992px)" srcSet={desktop} />
                  <source media="(min-width: 768px)" srcSet={tablet} />
                  <img
                    {...rest}
                    className="hero-banner-image hero-banner-image--full"
                    loading="eager"
                    fetchPriority="high"
                    decoding="sync"
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
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
