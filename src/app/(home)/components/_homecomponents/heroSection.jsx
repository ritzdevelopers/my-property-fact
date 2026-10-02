"use client";

import { useEffect } from "react";
import SearchFilter from "./searchFilterNew";
import "../home/home.css";
import "./newmpfmetadata.css";
import { MPF_GATEWAY_HIDDEN_EVENT } from "@/app/_global_components/mpfGatewayEvents";
import { BANNER_ALT } from "./heroBannerAssets";

const HERO_LCP_MOBILE = "/static/banners/hero-lcp-mobile.webp";
const HERO_LCP_TABLET = "/static/banners/hero-lcp-tablet.webp";
const HERO_LCP_DESKTOP = "/static/banners/hero-lcp-desktop.webp";

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
  return (
    <div className="position-relative home-banner hero-banner-responsive-images hero-art-direction">
      <div className="hero-parallax-media">
        <picture>
          <source media="(min-width: 992px)" srcSet={HERO_LCP_DESKTOP} />
          <source
            media="(min-width: 768px) and (max-width: 991.98px)"
            srcSet={HERO_LCP_TABLET}
          />
          <img
            src={HERO_LCP_MOBILE}
            alt={BANNER_ALT}
            title={BANNER_ALT}
            width={640}
            height={305}
            className="hero-banner-image hero-banner-image--full"
            loading="eager"
            fetchPriority="high"
            decoding="async"
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
