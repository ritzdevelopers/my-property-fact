import { getImageProps } from "next/image";
import Link from "next/link";
import SearchFilter from "./searchFIlter";
import HeroCountNumber from "./HeroCountNumber";
import HeroTypingText from "./HeroTypingText";
import {
  ghdHeroBannerSrc,
  getGhdHeroImagePropsCommon,
} from "./ghdHeroBannerConfig";
import "../home/home.css";

const PREFERRED_TYPES = ["Commercial", "New Launches", "Residential"];

function pickBannerTypes(projectTypeList = []) {
  const normalized = projectTypeList.map((item) => ({
    ...item,
    label: String(item?.projectTypeName || "").trim(),
  }));

  const picked = PREFERRED_TYPES.map((name) =>
    normalized.find((item) => item.label.toLowerCase() === name.toLowerCase()),
  ).filter(Boolean);

  if (picked.length > 0) return picked;
  return normalized.slice(0, 3);
}

export default function HeroSection({
  projectTypeList,
  cityList,
  cityCount = 0,
  builderCount = 0,
  projectCount = 0,
  unitCount = 10030,
}) {
  const common = getGhdHeroImagePropsCommon();
  const bannerTypes = pickBannerTypes(projectTypeList);

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
              <Link href="/ghd-velvet-vista" className="position-relative home-banner hero-banner-responsive-images d-block hero-art-direction">
                <picture>
                  <source media="(min-width: 992px)" srcSet={desktop} />
                  <source media="(min-width: 768px)" srcSet={tablet} />
                  <img
                    {...rest}
                    loading="eager"
                    fetchPriority="high"
                    decoding="sync"
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </picture>
              </Link>
            </div>
          </div>
          <div className="home-banner-overlay" aria-hidden />

          <div className="hero-banner-stats-panel" aria-label="Featured property categories and counts">
            <h2 className="hero-banner-stats-title">
              <HeroTypingText text="Find the Best Property" speedMs={95} startDelayMs={300} />
            </h2>
            <div className="hero-banner-type-pills">
              {bannerTypes.map((type) => (
                <Link
                  key={type.id || type.slugUrl || type.projectTypeName}
                  href={`/projects/${type.slugUrl || ""}`}
                  className="hero-banner-type-pill"
                >
                  {type.projectTypeName}
                </Link>
              ))}
            </div>
            <div className="hero-banner-counts-row">
              <div className="hero-banner-count-item">
                <span className="hero-banner-count-number">
                  <HeroCountNumber value={cityCount} />
                </span>
                <span className="hero-banner-count-label">Cities</span>
              </div>
              <div className="hero-banner-count-item">
                <span className="hero-banner-count-number">
                  <HeroCountNumber value={builderCount} />
                </span>
                <span className="hero-banner-count-label">Builders</span>
              </div>
              <div className="hero-banner-count-item">
                <span className="hero-banner-count-number">
                  <HeroCountNumber value={projectCount} />
                </span>
                <span className="hero-banner-count-label">Projects</span>
              </div>
              <div className="hero-banner-count-item">
                <span className="hero-banner-count-number">
                  <HeroCountNumber value={unitCount} />
                </span>
                <span className="hero-banner-count-label">Units</span>
              </div>
            </div>
          </div>

          <SearchFilter projectTypeList={projectTypeList} cityList={cityList} />
        </div>
      </div>
    </>
  );
}
