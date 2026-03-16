"use client";

import { useEffect, useCallback, useState } from "react";
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
  const [deviceType, setDeviceType] = useState("mobile");

  const resolveDesktopSrc = (slide) =>
    slide?.desktop || slide?.tablet || slide?.mobile || "/mpf-banner.jpg";

  const resolveDeviceSrc = (slide, type) => {
    if (type === "desktop") return slide?.desktop || slide?.tablet || slide?.mobile || "/mpf-banner.jpg";
    if (type === "tablet") return slide?.tablet || slide?.desktop || slide?.mobile || "/mpf-banner.jpg";
    return slide?.mobile || slide?.tablet || slide?.desktop || "/mpf-banner.jpg";
  };

  const getImageDimensions = (type) => {
    if (type === "desktop") return { width: 1920, height: 600 };
    if (type === "tablet") return { width: 1024, height: 576 };
    return { width: 768, height: 430 };
  };

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

  useEffect(() => {
    const updateDeviceType = () => {
      if (window.innerWidth >= 992) {
        setDeviceType("desktop");
      } else if (window.innerWidth >= 768) {
        setDeviceType("tablet");
      } else {
        setDeviceType("mobile");
      }
    };

    updateDeviceType();
    window.addEventListener("resize", updateDeviceType);
    return () => window.removeEventListener("resize", updateDeviceType);
  }, []);

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
    lazyLoad: "ondemand",
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
          const selectedSrc = resolveDeviceSrc({ desktop, tablet, mobile }, deviceType);
          const { width, height: responsiveHeight } = getImageDimensions(deviceType);
          const navigationLink = link || href;

          // Render only one banner image per slide based on viewport.
          const imageContent = (
            <div className="position-relative home-banner hero-banner-responsive-images">
              <Image
                src={selectedSrc}
                alt={alt}
                width={width}
                height={height || responsiveHeight}
                className="img-fluid w-100"
                priority={priority}
                fetchPriority={priority ? "high" : "auto"}
                quality={75}
                sizes="100vw"
                loading={priority ? "eager" : "lazy"}
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
