import Image from "next/image";
import Link from "next/link";
import SearchFilter from "./searchFIlter";
import "../home/home.css";
import "./newmpfmetadata.css";

// ─── Static banner assets ─────────────────────────────────────────────────────
const BANNER_ALT     = "My Property Fact";
const BANNER_DESKTOP = "/static/banners/mpf_generic_banner.jpg";     // ≥ 992 px
const BANNER_TABLET  = "/static/banners/mpf_generic_banner_tab.jpg"; // 768 – 991 px
const BANNER_MOBILE  = "/static/banners/mpf-mobile-banner.jpg";     // < 768 px
// ─────────────────────────────────────────────────────────────────────────────

export default function HeroSection({ projectTypeList, cityList }) {
  const normalizeTypeName = (value = "") => value.trim().toLowerCase();
  const headingTypes = new Set(["commercial", "new launches", "new launch", "residential"]);

  return (
    <>
      <section className="position-relative hero-section-wrapper" aria-label="Hero Banner">
        <div className="mpf-hero-banner position-relative">

          {/* ── Hero Banner Images ── */}
          <div className="position-relative home-banner hero-banner-responsive-images">

            {/* Mobile  < 768 px */}
            <img
              src={BANNER_MOBILE}
              alt={BANNER_ALT}
              title={BANNER_ALT}
              className="hero-banner-image hero-banner-image--full d-block d-md-none"
              loading="eager"
              fetchPriority="high"
              decoding="sync"
            />

            {/* Tablet  768 – 991 px */}
            <img
              src={BANNER_TABLET}
              alt={BANNER_ALT}
              title={BANNER_ALT}
              className="hero-banner-image hero-banner-image--full d-none d-md-block d-lg-none"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />

            {/* Desktop  ≥ 992 px */}
            <img
              src={BANNER_DESKTOP}
              alt={BANNER_ALT}
              title={BANNER_ALT}
              className="hero-banner-image hero-banner-image--full d-none d-lg-block"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />

          </div>

          <div className="home-banner-overlay" aria-hidden="true" />
          <SearchFilter projectTypeList={projectTypeList} cityList={cityList} />
        </div>
      </section>

      {/* ── Find The Best Property ── */}
      <div className="container mb-3">
        <div className="property-search-card">

          {/* Left illustration */}
          <div className="illustration-left">
            <div className="left-iilution-container">
              <Image
                src="/static/footer/leftillution.png"
                alt="Illustration for Find The Best Property — homes and city search on My Property Fact"
                title="Illustration for Find The Best Property — homes and city search on My Property Fact"
                width={336}
                height={90}
              />
            </div>
          </div>

          {/* Centre content */}
          <div className="property-search-card-content">
            <h1 className="property-search-title plus-jakarta-sans-semi-bold mt-3 mt-md-0">
              Smart Real Estate Decisions Start Here
            </h1>
            <div className="property-buttons-overlay d-flex flex-wrap justify-content-center gap-4 gap-lg-3 mt-2">
              {projectTypeList?.map((item, index) => (
                <Link
                  key={`prop-type-${index}`}
                  href={`/projects/${item.slugUrl}`}
                  className="btn-normal-color rounded-5 py-2 px-3 text-white text-decoration-none"
                  title={`${item.projectTypeName} projects`}
                >
                  {headingTypes.has(normalizeTypeName(item?.projectTypeName || "")) ? (
                    <h2 className="property-type-heading m-0">{item.projectTypeName}</h2>
                  ) : (
                    <span>{item.projectTypeName}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Right illustration */}
          <div className="illustration-right">
            <div className="right-illustration-container">
              <Image
                src="/static/footer/rightillution.png"
                alt="Illustration for Find The Best Property — family and suburban homes on My Property Fact"
                title="Illustration for Find The Best Property — family and suburban homes on My Property Fact"
                width={450}
                height={130}
              />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
