"use client";

import { useEffect } from "react";
import { getImageProps } from "next/image";
import SearchFilter from "./searchFilterNew";
import "../home/home.css";
import "./newmpfmetadata.css";
import { MPF_GATEWAY_HIDDEN_EVENT } from "@/app/_global_components/mpfGatewayEvents";
import {
  BANNER_ALT,
  BANNER_DESKTOP,
  BANNER_MOBILE,
  BANNER_TABLET,
  HERO_IMAGE_QUALITY,
  HERO_IMAGE_SIZES,
} from "./heroBannerAssets";

const HOME_HERO_HASH = "#mpf-home-hero";

function scrollHomeHeroIntoView() {
  const el = document.getElementById("mpf-home-hero");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function useHomeHeroHashScroll() {
  useEffect(() => {
    const shouldScroll = () => window.location.hash === HOME_HERO_HASH;
    const run = () => {
      if (shouldScroll()) scrollHomeHeroIntoView();
    };

    run();
    window.addEventListener(MPF_GATEWAY_HIDDEN_EVENT, run);
    window.addEventListener("hashchange", run);
    const t1 = window.setTimeout(run, 80);
    const t2 = window.setTimeout(run, 450);

    return () => {
      window.removeEventListener(MPF_GATEWAY_HIDDEN_EVENT, run);
      window.removeEventListener("hashchange", run);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);
}

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
      <div className="hero-parallax-media">
        <picture>
          <source
            media="(max-width: 767.98px)"
            srcSet={mobileSrcSet}
            sizes={sizes}
          />
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
            decoding="sync"
            draggable={false}
          />
        </picture>
      </div>
    </div>
  );
}

export default function HeroSection({
  projectTypeList,
  cityList,
  title = "Find Flats & Property Across India | Buy & Invest",
  subtitle = "Browse flats, apartments, and commercial properties in India with verified listings, price trends, and expert insights.",
}) {
  useHomeHeroHashScroll();
  return (
    <section
      id="mpf-home-hero"
      className="position-relative hero-section-wrapper"
      aria-label="Hero Banner"
    >
      <div className="mpf-hero-banner position-relative">
        <HeroBannerPicture />
        <div className="home-banner-overlay" aria-hidden="true" />
        <h1 id="mpf-page-heading" className="visually-hidden">
          {title}. {subtitle}
        </h1>
      </div>

      <div className="mpf-hero-search-dock">
        <SearchFilter
          projectTypeList={projectTypeList}
          cityList={cityList}
          layout="home-hero"
        />
      </div>
    </section>
  );
}
