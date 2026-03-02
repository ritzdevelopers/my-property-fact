"use client";

import { useEffect, useCallback } from "react";
import Slider from "react-slick";
import Image from "next/image";
import Link from "next/link";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const DEFAULT_FALLBACK_SLIDE = {
  id: "hero-fallback",
  desktop: "/mpf-banner.jpg",
  tablet: "/mpf-banner.jpg",
  mobile: "/mpf-banner.jpg",
  alt: "Hero banner",
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

  const settings = {
    dots: !isSingleSlide, // Hide dots for single slide
    arrows: false,
    infinite: !isSingleSlide, // Disable infinite for single slide
    speed: 800,
    autoplay: !isSingleSlide, // Disable autoplay for single slide
    autoplaySpeed: 5000,
    pauseOnHover: false,
    pauseOnFocus: false,
    fade: true,
    adaptiveHeight: false,
    afterChange: (current) => updateHeaderBackground(current),
  };

  return (
    <div className="hero-banner-slider">
      <Slider {...settings}>
        {effectiveSlides.map((slide, index) => {
          const {
            id,
            desktop,
            tablet,
            mobile,
            alt = "Hero banner",
            priority: slidePriority,
            height = 600,
            link,
            href,
          } = slide;

          // For single slide, always prioritize. Otherwise, prioritize first slide or use slide's priority prop
          const priority = isSingleSlide ? true : (slidePriority !== undefined ? slidePriority : index === 0);

          const desktopSrc = desktop || "/mpf-banner.jpg";
          const tabletSrc = tablet || desktopSrc;
          const mobileSrc = mobile || tabletSrc;
          const navigationLink = link || href;

          // Use Next/Image per breakpoint so Next.js can optimize (WebP, correct sizes)
          const imageContent = (
            <div className="position-relative home-banner hero-banner-responsive-images">
              <Image
                src={mobileSrc}
                alt={alt}
                width={768}
                height={height}
                className="img-fluid w-100 d-md-none"
                priority={priority}
                fetchPriority={priority ? "high" : "auto"}
                quality={75}
                sizes="100vw"
              />
              <Image
                src={tabletSrc}
                alt={alt}
                width={1024}
                height={height}
                className="img-fluid w-100 d-none d-md-block d-lg-none"
                priority={priority}
                fetchPriority={priority ? "high" : "auto"}
                quality={75}
                sizes="100vw"
              />
              <Image
                src={desktopSrc}
                alt={alt}
                width={1920}
                height={height}
                className="img-fluid w-100 d-none d-lg-block"
                priority={priority}
                fetchPriority={priority ? "high" : "auto"}
                quality={75}
                sizes="100vw"
              />
            </div>
          );

          return (
            <div
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
            </div>
          );
        })}
      </Slider>
    </div>
  );
};

export default HeroBannerSlider;
