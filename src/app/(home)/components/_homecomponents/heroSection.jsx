"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SearchFilter from "./searchFIlter";
import "../home/home.css";
import "./newmpfmetadata.css";

// ─── Static banner assets ─────────────────────────────────────────────────────
const BANNER_ALT     = "My Property Fact";
const BANNER_DESKTOP = "/static/banners/mpf_new_banner_generic.jpg";     // ≥ 992 px
const BANNER_TABLET  = "/static/banners/mpf_generic_banner_tab.jpg"; // 768 – 991 px
const BANNER_MOBILE  = "/static/banners/MPF-BANNER-458X810.jpg";     // < 768 px
const NEW_LAUNCHES_RAIL_ICON = "/icon/house (1).png";
// ─────────────────────────────────────────────────────────────────────────────

export default function HeroSection({ projectTypeList, cityList }) {
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
        ref={heroBannerRef}
        className="position-relative hero-section-wrapper"
        aria-label="Hero Banner"
      >
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
                  <Image
                    src="/icon/skyscrapers.png"
                    alt={railIconAlt}
                    title={railIconTitle}
                    width={36}
                    height={36}
                  />
                ) : typeKey === "residential" ? (
                  <Image
                    src="/icon/residential.png"
                    alt={railIconAlt}
                    title={railIconTitle}
                    width={36}
                    height={36}
                  />
                ) : (
                  <Image
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
