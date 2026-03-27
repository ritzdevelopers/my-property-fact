"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

const DEFAULT_FALLBACK_SLIDE = {
  id: "hero-fallback",
  desktop: "/mpf-banner.jpg",
  tablet: "/mpf-banner.jpg",
  mobile: "/mpf-banner.jpg",
  alt: "Hero promotional banner — My Property Fact home",
};

const HeroBannerSlider = ({ slides = [] }) => {
  const effectiveSlides = Array.isArray(slides) && slides.length > 0 ? slides : [DEFAULT_FALLBACK_SLIDE];

  const resolveDesktopSrc = (slide) =>
    slide?.desktop || slide?.tablet || slide?.mobile || "/mpf-banner.jpg";

  const updateHeaderBackground = useCallback((slideIndex) => {
    if (typeof document === "undefined") return;
    const slide = effectiveSlides[slideIndex];
    if (!slide) return;
    const desktopSrc = resolveDesktopSrc(slide);
    document.documentElement.style.setProperty(
      "--hero-header-bg",
      `url("${desktopSrc}")`
    );
  }, [effectiveSlides]);

  useEffect(() => {
    if (effectiveSlides.length > 0) {
      updateHeaderBackground(0);
    }
  }, [effectiveSlides, updateHeaderBackground]);

  const isSingleSlide = effectiveSlides.length === 1;
  const shouldAutoplay = !isSingleSlide;

  return (
    <div className="hero-banner-slider hero-lcp-fallback">
      <Swiper
        className="hero-banner-swiper"
        modules={[Autoplay, EffectFade, A11y]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={800}
        loop={!isSingleSlide}
        allowTouchMove={!isSingleSlide}
        autoplay={
          shouldAutoplay
            ? {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: false,
              }
            : false
        }
        onSwiper={(swiper) => updateHeaderBackground(swiper.realIndex || 0)}
        onSlideChange={(swiper) => updateHeaderBackground(swiper.realIndex || 0)}
      >
        {effectiveSlides.map((slide, index) => {
          const {
            id,
            desktop,
            tablet,
            mobile,
            alt = "Hero promotional banner — My Property Fact home",
            priority: slidePriority,
            link,
            href,
          } = slide;

          // For single slide, always prioritize. Otherwise, prioritize first slide or use slide's priority prop
          const priority = isSingleSlide ? true : (slidePriority !== undefined ? slidePriority : index === 0);
          const mobilePriority = priority;
          const tabletPriority = false;
          const desktopPriority = false;

          const desktopSrc = desktop || "/mpf-banner.jpg";
          const tabletSrc = tablet || desktopSrc;
          const mobileSrc = mobile || tabletSrc;
          const navigationLink = link || href;

          // Use fixed aspect-ratio frames per breakpoint to reserve layout space and avoid CLS.
          const imageContent = (
            <div className="position-relative home-banner hero-banner-responsive-images">
              <div className="hero-banner-frame hero-banner-frame-mobile d-md-none">
                <Image
                  src={mobileSrc}
                  alt={alt}
                  title={alt}
                  fill
                  className="hero-banner-image"
                  priority={mobilePriority}
                  fetchPriority={mobilePriority ? "high" : "auto"}
                  quality={60}
                  sizes="100vw"
                />
              </div>
              <div className="hero-banner-frame hero-banner-frame-tablet d-none d-md-block d-lg-none">
                <Image
                  src={tabletSrc}
                  alt={alt}
                  title={alt}
                  fill
                  className="hero-banner-image"
                  priority={tabletPriority}
                  fetchPriority={tabletPriority ? "high" : "auto"}
                  quality={60}
                  sizes="100vw"
                />
              </div>
              <div className="hero-banner-frame hero-banner-frame-desktop d-none d-lg-block">
                <Image
                  src={desktopSrc}
                  alt={alt}
                  title={alt}
                  fill
                  className="hero-banner-image"
                  priority={desktopPriority}
                  fetchPriority={desktopPriority ? "high" : "auto"}
                  quality={60}
                  sizes="100vw"
                />
              </div>
            </div>
          );

          return (
            <SwiperSlide
              key={id || `hero-slide-${index}`}
              className={`hero-banner-slide ${slide.className || ""}`}
            >
              {navigationLink ? (
                <Link href={navigationLink} className="d-block">
                  {imageContent}
                </Link>
              ) : (
                imageContent
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default HeroBannerSlider;