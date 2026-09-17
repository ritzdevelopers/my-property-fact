"use client";

import { useEffect } from "react";
import { getImageProps } from "next/image";
import SearchFilter from "./searchFilterNew";
import "../home/home.css";
import "./newmpfmetadata.css";
import { isSpecificHeaderCity, readChosenHeaderCity } from "@/lib/headerChosenCity";
import { MPF_GATEWAY_HIDDEN_EVENT } from "@/app/_global_components/mpfGatewayEvents";
import {
  BANNER_ALT,
  BANNER_DESKTOP,
  BANNER_MOBILE,
  BANNER_TABLET,
  HERO_IMAGE_QUALITY,
  HERO_IMAGE_SIZES,
} from "./heroBannerAssets";

const NEW_LAUNCHES_RAIL_ICON = "/icon/house (1).png";
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

const HERO_TYPED_CITIES = [
  "Delhi NCR",
  "Bangalore",
  "Mumbai",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Noida",
  "Gurugram",
  "Ahmedabad",
  "Kolkata",
];

function cityNameFromEvent(detail) {
  if (!detail) return "";
  if (typeof detail === "string") return detail.trim();
  return String(detail.cityName || "").trim();
}

function HeroCityTypewriter() {
  const [locatedCity, setLocatedCity] = useState("");
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(HERO_TYPED_CITIES[0]);
  const [phase, setPhase] = useState("hold");

  useEffect(() => {
    const savedCity = readChosenHeaderCity();
    if (isSpecificHeaderCity(savedCity)) {
      setLocatedCity(savedCity);
    }
    const handleCityChanged = (e) => {
      const cityName = cityNameFromEvent(e.detail);
      if (cityName) setLocatedCity(cityName);
    };
    window.addEventListener("cityChanged", handleCityChanged);
    return () => window.removeEventListener("cityChanged", handleCityChanged);
  }, []);

  useEffect(() => {
    if (locatedCity) return undefined;
    const current = HERO_TYPED_CITIES[index];
    let delay = 90;

    if (phase === "hold") {
      delay = 1800;
    } else if (phase === "delete") {
      delay = 50;
    }

    const timer = window.setTimeout(() => {
      if (phase === "hold") {
        setPhase("delete");
        return;
      }
      if (phase === "delete") {
        if (text.length <= 0) {
          setIndex((i) => (i + 1) % HERO_TYPED_CITIES.length);
          setPhase("type");
          return;
        }
        setText(current.slice(0, text.length - 1));
        return;
      }
      const nextCity = HERO_TYPED_CITIES[index];
      if (text === nextCity) {
        setPhase("hold");
        return;
      }
      setText(nextCity.slice(0, text.length + 1));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [index, locatedCity, phase, text]);

  return (
    <>
      {" "}
      {locatedCity || text}
      <span className="mpf-hero-cursor" aria-hidden>
        |
      </span>
    </>
  );
}

function HeroBannerPicture({ mediaRef }) {
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
