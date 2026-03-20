"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, A11y } from "swiper/modules";
import "swiper/css";

const DEFAULT_FALLBACK_SLIDE = {
  id: "hero-fallback",
  desktop: "/mpf-banner.jpg",
  tablet: "/mpf-banner.jpg",
  mobile: "/mpf-banner.jpg",
  alt: "Hero banner",
};

function subscribeToViewport(callback) {
  if (typeof window === "undefined") return () => {};
  const mqDesktop = window.matchMedia("(min-width: 1024px)");
  const mqTablet = window.matchMedia("(min-width: 768px)");
  const onChange = () => callback();
  mqDesktop.addEventListener("change", onChange);
  mqTablet.addEventListener("change", onChange);
  return () => {
    mqDesktop.removeEventListener("change", onChange);
    mqTablet.removeEventListener("change", onChange);
  };
}

function getViewportSnapshot() {
  if (typeof window === "undefined") return "mobile";
  if (window.matchMedia("(min-width: 1024px)").matches) return "desktop";
  if (window.matchMedia("(min-width: 768px)").matches) return "tablet";
  return "mobile";
}

function useHeroViewport() {
  return useSyncExternalStore(subscribeToViewport, getViewportSnapshot, () => "mobile");
}

function resolveSrcForViewport(slide, viewport) {
  const desktop = slide?.desktop || slide?.tablet || slide?.mobile || "/mpf-banner.jpg";
  const tablet = slide?.tablet || slide?.desktop || slide?.mobile || desktop;
  const mobile = slide?.mobile || slide?.tablet || slide?.desktop || desktop;
  if (viewport === "desktop") return desktop;
  if (viewport === "tablet") return tablet;
  return mobile;
}

function resolveDesktopForHeader(slide) {
  return slide?.desktop || slide?.tablet || slide?.mobile || "/mpf-banner.jpg";
}

export default function HeroBannerSlider({ slides = [] }) {
  const effectiveSlides =
    Array.isArray(slides) && slides.length > 0 ? slides : [DEFAULT_FALLBACK_SLIDE];

  const viewport = useHeroViewport();
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperReady, setSwiperReady] = useState(false);

  const isSingleSlide = effectiveSlides.length === 1;
  const shouldAutoplay = !isSingleSlide;

  const nextIndex = useMemo(() => {
    const n = effectiveSlides.length;
    if (n <= 1) return 0;
    return activeIndex >= n - 1 ? 0 : activeIndex + 1;
  }, [activeIndex, effectiveSlides.length]);

  const prevIndex = useMemo(() => {
    const n = effectiveSlides.length;
    if (n <= 1) return 0;
    return activeIndex === 0 ? n - 1 : activeIndex - 1;
  }, [activeIndex, effectiveSlides.length]);

  const setHeaderBg = useCallback(
    (index) => {
      if (typeof document === "undefined") return;
      const slide = effectiveSlides[index];
      if (!slide) return;
      const desktopSrc = resolveDesktopForHeader(slide);
      document.documentElement.style.setProperty(
        "--hero-header-bg",
        `url("${desktopSrc}")`
      );
    },
    [effectiveSlides]
  );

  const handleSwiper = useCallback(
    (swiper) => {
      const idx = swiper.realIndex ?? swiper.activeIndex ?? 0;
      setActiveIndex(idx);
      setHeaderBg(idx);
      setSwiperReady(true);
    },
    [setHeaderBg]
  );

  const handleSlideChange = useCallback(
    (swiper) => {
      const idx = swiper.realIndex ?? swiper.activeIndex ?? 0;
      setActiveIndex(idx);
      setHeaderBg(idx);
    },
    [setHeaderBg]
  );

  return (
    <div
      className={`hero-banner-slider hero-lcp-fallback hero-swiper-layer ${
        swiperReady ? "hero-swiper-layer--ready" : ""
      }`}
    >
      <Swiper
        className="hero-banner-swiper hero-banner-swiper--fill"
        modules={[Autoplay, A11y]}
        speed={650}
        /* loop duplicates slides in DOM; keep for seamless infinite autoplay (Swiper 10 has no rewind) */
        loop={!isSingleSlide}
        allowTouchMove={!isSingleSlide}
        slidesPerView={1}
        spaceBetween={0}
        autoplay={
          shouldAutoplay
            ? {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: false,
              }
            : false
        }
        onSwiper={handleSwiper}
        onSlideChange={handleSlideChange}
      >
        {effectiveSlides.map((slide, index) => {
          const {
            id,
            alt = "Hero banner",
            link,
            href,
            className: slideClass = "",
          } = slide;

          const navigationLink = link || href;
          const src = resolveSrcForViewport(slide, viewport);
          const n = effectiveSlides.length;
          const shouldLoadImage =
            index === activeIndex ||
            index === nextIndex ||
            index === prevIndex ||
            /* loop clones often show first/last during wrap */
            (!isSingleSlide && n > 1 && (index === 0 || index === n - 1));

          const frame = (
            <div className={`hero-slide-frame ${slideClass}`}>
              {shouldLoadImage ? (
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="hero-banner-image"
                  priority={index === 0 && activeIndex === 0}
                  fetchPriority={
                    index === 0 && activeIndex === 0 ? "high" : "auto"
                  }
                  loading={
                    index === 0 && activeIndex === 0 ? "eager" : "lazy"
                  }
                  quality={60}
                  sizes="100vw"
                />
              ) : null}
            </div>
          );

          return (
            <SwiperSlide
              key={id || `hero-slide-${index}`}
              className={`hero-banner-slide ${slideClass}`}
            >
              {navigationLink ? (
                <Link href={navigationLink} className="d-block text-decoration-none">
                  {frame}
                </Link>
              ) : (
                frame
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
