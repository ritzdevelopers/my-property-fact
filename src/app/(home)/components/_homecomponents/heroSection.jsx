"use client";

import Link from "next/link";
import { getImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import SearchFilter from "./searchFIlter";
import "../home/home.css";
import "./newmpfmetadata.css";
import "./hero-independence.css";
import {
  BANNER_ALT,
  BANNER_DESKTOP,
  BANNER_MOBILE,
  BANNER_TABLET,
  HERO_IMAGE_QUALITY,
  HERO_IMAGE_SIZES,
} from "./heroBannerAssets";

const NEW_LAUNCHES_RAIL_ICON = "/icon/house (1).png";

function HeroBannerPicture() {
  const common = {
    alt: BANNER_ALT,
    sizes: HERO_IMAGE_SIZES,
    quality: HERO_IMAGE_QUALITY,
  };

  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({
    ...common,
    quality: 88,
    src: BANNER_MOBILE.src,
    width: BANNER_MOBILE.width,
    height: BANNER_MOBILE.height,
  });

  const {
    props: { srcSet: tabletSrcSet },
  } = getImageProps({
    ...common,
    quality: 88,
    src: BANNER_TABLET.src,
    width: BANNER_TABLET.width,
    height: BANNER_TABLET.height,
  });

  const {
    props: { src: desktopSrc, srcSet: desktopSrcSet, sizes, ...desktopRest },
  } = getImageProps({
    ...common,
    src: BANNER_DESKTOP.src,
    width: BANNER_DESKTOP.width,
    height: BANNER_DESKTOP.height,
  });

  return (
    <div className="position-relative home-banner hero-banner-responsive-images hero-art-direction">
      <picture>
        <source media="(max-width: 767.98px)" srcSet={mobileSrcSet} sizes={sizes} />
        <source
          media="(min-width: 768px) and (max-width: 991.98px)"
          srcSet={tabletSrcSet}
          sizes={sizes}
        />
        <img
          {...desktopRest}
          src={desktopSrc}
          srcSet={desktopSrcSet}
          sizes={sizes}
          alt={BANNER_ALT}
          title={BANNER_ALT}
          className="hero-banner-image hero-banner-image--full"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
    </div>
  );
}

export default function HeroSection({
  projectTypeList,
  cityList,
}) {
  const normalizeTypeName = (value = "") => value.trim().toLowerCase();
  const headingTypes = new Set([
    "commercial",
    "new launches",
    "new launch",
    "residential",
  ]);
  const heroBannerRef = useRef(null);
  const railHoverLeaveTimerRef = useRef(null);
  const [showRightRail, setShowRightRail] = useState(false);
  const [openRightRailIndex, setOpenRightRailIndex] = useState(null);
  const rightRailOrder = ["commercial", "residential", "new launches"];
  const rightRailTypes = rightRailOrder
    .map((name) =>
      projectTypeList?.find((item) => {
        const typeName = normalizeTypeName(item?.projectTypeName || "");
        if (name === "new launches") {
          return typeName === "new launches" || typeName === "new launch";
        }
        return typeName === name;
      }),
    )
    .filter(Boolean);

  const getTypeKey = (typeName) => {
    const normalized = normalizeTypeName(typeName || "");
    if (normalized === "new launch" || normalized === "new launches") {
      return "new-launches";
    }
    if (normalized === "residential") return "residential";
    return "commercial";
  };

  /** Labels for right-rail icons (SEO / alt+title tooling; link text stays primary for SR users). */
  const railIconMetaForKey = (key) => {
    switch (key) {
      case "commercial":
        return {
          alt: "Commercial real estate icon — browse offices and retail projects on My Property Fact",
          title: "Commercial projects — offices and retail listings",
        };
      case "residential":
        return {
          alt: "Residential property icon — browse homes and apartments on My Property Fact",
          title: "Residential projects — homes and apartments",
        };
      default:
        return {
          alt: "New launch property icon — browse newly launched projects on My Property Fact",
          title: "New launch projects — latest listings",
        };
    }
  };

  const onRightRailMouseEnter = (index) => {
    if (railHoverLeaveTimerRef.current) {
      clearTimeout(railHoverLeaveTimerRef.current);
      railHoverLeaveTimerRef.current = null;
    }
    setOpenRightRailIndex(index);
  };

  const onRightRailMouseLeave = (index) => {
    railHoverLeaveTimerRef.current = window.setTimeout(() => {
      setOpenRightRailIndex((prev) => (prev === index ? null : prev));
      railHoverLeaveTimerRef.current = null;
    }, 140);
  };

  useEffect(() => {
    return () => {
      if (railHoverLeaveTimerRef.current) {
        clearTimeout(railHoverLeaveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!heroBannerRef.current) return;
      const rect = heroBannerRef.current.getBoundingClientRect();
      const bannerBottomAbs = rect.bottom + window.scrollY;
      const shouldShow = window.scrollY > bannerBottomAbs - 80;
      setShowRightRail((prev) => (prev === shouldShow ? prev : shouldShow));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <section
        id="mpf-home-hero"
        ref={heroBannerRef}
        className="position-relative hero-section-wrapper mpf-hero--i80"
        aria-label="Hero Banner"
      >
        <div className="mpf-hero-banner position-relative">

          <HeroBannerPicture />

          <div className="home-banner-overlay" aria-hidden="true" />

          <div className="mpf-hero-shell container">
            <div className="mpf-hero-main">
              <div className="mpf-hero-content">
                <div className="mpf-hero-copy">
                  <p className="i80-heading">
                    <span className="i80-heading__eyebrow">Celebrating</span>
                    <span className="i80-heading__saffron">80 Years</span>
                    <span className="i80-heading__green">of Independence</span>
                  </p>
                  <h1 className="headsub">
                    Browse flats, apartments, and commercial properties in India with verified listings, price trends, and expert insights.
                  </h1>
                  <span className="i80-copy-rule" aria-hidden>
                    <span className="i80-copy-rule__saffron" />
                    <span className="i80-copy-rule__chakra" />
                    <span className="i80-copy-rule__green" />
                  </span>
                </div>
              </div>
              <SearchFilter
                projectTypeList={projectTypeList}
                cityList={cityList}
                layout="home-hero"
              />
            </div>
          </div>
          <div className="mpf-value-strip" aria-label="Why choose us">
            <div className="container mpf-value-strip__inner">
              <div className="mpf-value-strip__item">
                <span className="mpf-value-strip__icon" aria-hidden>
                  <svg viewBox="0 0 24 24" width={20} height={20} fill="none">
                    <path d="M12 3l7 3v5c0 4.5-2.8 8.4-7 10-4.2-1.6-7-5.5-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.5 12.2l1.8 1.8 3.5-3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="mpf-value-strip__copy">
                  <strong>100% Verified</strong>
                  <span>Projects &amp; Builders</span>
                </span>
              </div>
              <div className="mpf-value-strip__item">
                <span className="mpf-value-strip__icon" aria-hidden>
                  <svg viewBox="0 0 24 24" width={20} height={20} fill="none">
                    <path d="M7 4h10M7 8.5h10M7 4c4.5 0 6.5 1.8 6.5 4.5S11.5 13 7 13h1.5L16 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="mpf-value-strip__copy">
                  <strong>Best Price</strong>
                  <span>Guaranteed</span>
                </span>
              </div>
              <div className="mpf-value-strip__item">
                <span className="mpf-value-strip__icon" aria-hidden>
                  <svg viewBox="0 0 24 24" width={20} height={20} fill="none">
                    <path d="M4 14a4 4 0 014-4h8a4 4 0 014 4v2H4v-2zM8 6a4 4 0 018 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="mpf-value-strip__copy">
                  <strong>Expert Support</strong>
                  <span>7 Days a Week</span>
                </span>
              </div>
              <div className="mpf-value-strip__item">
                <span className="mpf-value-strip__icon" aria-hidden>
                  <svg viewBox="0 0 24 24" width={20} height={20} fill="none">
                    <path d="M4 7h16v11H4zM8 7V5h8v2M9 12h6M9 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="mpf-value-strip__copy">
                  <strong>Easy Booking</strong>
                  <span>Hassle Free</span>
                </span>
              </div>
              {/* <div className="mpf-value-strip__item">
                <span className="mpf-value-strip__icon" aria-hidden>
                  <svg viewBox="0 0 24 24" width={20} height={20} fill="none">
                    <path d="M12 3l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="mpf-value-strip__copy">
                  <strong>RERA Approved</strong>
                  <span>All Projects</span>
                </span>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {rightRailTypes.length > 0 ? (
        <aside
          className={`home-right-type-rail ${showRightRail ? "is-visible" : ""}`}
          aria-label="Browse project types"
        >
          {rightRailTypes.map((item, index) => {
            const typeKey = getTypeKey(item?.projectTypeName);
            const { alt: railIconAlt, title: railIconTitle } = railIconMetaForKey(typeKey);
            return (
              <Link
                key={`right-rail-type-${index}`}
                href={`/projects/${item.slugUrl}`}
                className={`home-right-type-rail__link${openRightRailIndex === index ? " home-right-type-rail__link--open" : ""}`}
                title={`${item.projectTypeName} projects`}
                style={{ "--stagger": index }}
                onMouseEnter={() => onRightRailMouseEnter(index)}
                onMouseLeave={() => onRightRailMouseLeave(index)}
                onFocus={() => onRightRailMouseEnter(index)}
                onBlur={() => {
                  if (railHoverLeaveTimerRef.current) {
                    clearTimeout(railHoverLeaveTimerRef.current);
                    railHoverLeaveTimerRef.current = null;
                  }
                  setOpenRightRailIndex((prev) => (prev === index ? null : prev));
                }}
              >
                <span
                  className={`home-right-type-rail__icon home-right-type-rail__icon--${typeKey}`}
                  aria-hidden
                >
                  {typeKey === "commercial" ? (
                    <img
                      src="/icon/skyscrapers.png"
                      alt={railIconAlt}
                      title={railIconTitle}
                      width={36}
                      height={36}
                    />
                  ) : typeKey === "residential" ? (
                    <img
                      src="/icon/residential.png"
                      alt={railIconAlt}
                      title={railIconTitle}
                      width={36}
                      height={36}
                    />
                  ) : (
                    <img
                      src={NEW_LAUNCHES_RAIL_ICON}
                      alt={railIconAlt}
                      title={railIconTitle}
                      width={36}
                      height={36}
                    />
                  )}
                </span>
                <span className="home-right-type-rail__text">
                  {headingTypes.has(normalizeTypeName(item?.projectTypeName || "")) ? (
                    <div className="property-type-heading m-0">{item.projectTypeName}</div>
                  ) : (
                    <span>{item.projectTypeName}</span>
                  )}
                </span>
              </Link>
            );
          })}
        </aside>
      ) : null}
    </>
  );
}
