"use client";
import Slider from "react-slick";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "swiper/css";
import "swiper/css/navigation";
import "./featured.css";
import Image from "next/image";
import Link from "next/link";
import PropertyContainer from "../../common/page";
import { useMemo, useState, useEffect } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

const DEMO_PROJECT_IMAGE = "/static/no_image.png";
const DEMO_BUILDER_LOGO = "/logo.webp";

function cleanImageFile(value) {
  const text = String(value ?? "").trim();
  if (
    !text ||
    text === "/" ||
    text.toLowerCase() === "null" ||
    text.toLowerCase() === "undefined"
  ) {
    return "";
  }
  return text;
}

function formatProjectAddress(address) {
  const parts = String(address || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return "";

  const normalized = (value) => value.toLowerCase().replace(/\s+/g, " ").trim();
  const deduped = [];
  for (const part of parts) {
    const prev = deduped[deduped.length - 1];
    if (prev && normalized(prev) === normalized(part)) continue;
    deduped.push(part);
  }
  return deduped.join(", ");
}

function generatePrice(price) {
  if (price == null || price === "") return "Price on request";
  const strValue = String(price).trim();
  if (!strValue) return "Price on request";
  if (/[a-zA-Z]/.test(strValue)) return strValue;
  const numericValue = Number.parseFloat(strValue.replace(/,/g, ""));
  if (!Number.isFinite(numericValue) || numericValue <= 0) return "Price on request";
  return numericValue < 1
    ? `₹ ${Math.round(numericValue * 100)} Lakh* Onwards`
    : `₹ ${numericValue} Cr* Onwards`;
}

function FeaturedCardImage({ src, demoSrc, alt, className }) {
  const [currentSrc, setCurrentSrc] = useState(src || demoSrc);

  useEffect(() => {
    setCurrentSrc(src || demoSrc);
  }, [src, demoSrc]);

  const handleError = () => {
    setCurrentSrc((prev) => (prev !== demoSrc ? demoSrc : prev));
  };

  const isDemo = !src || currentSrc === demoSrc;

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`${className}${isDemo ? " property-image--demo" : ""}`}
      onError={handleError}
      loading="lazy"
      decoding="async"
    />
  );
}

function FeaturedBuilderLogo({ src, demoSrc, alt, isDemoClass }) {
  const [currentSrc, setCurrentSrc] = useState(src || demoSrc);

  useEffect(() => {
    setCurrentSrc(src || demoSrc);
  }, [src, demoSrc]);

  const handleError = () => {
    setCurrentSrc((prev) => (prev !== demoSrc ? demoSrc : prev));
  };

  const isDemo = !src || currentSrc === demoSrc;

  return (
    <div className={`logo-box${isDemo || isDemoClass ? " logo-box--demo" : ""}`}>
      <img
        src={currentSrc}
        alt={alt}
        className="img-fluid"
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

function NextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <button
      type="button"
      className={`${className} custom-featured-arrow custom-featured-arrow-next`}
      style={style}
      onClick={onClick}
      aria-label="Next slide"
    >
      <Image
        src="/icon/arrow-right-s-line.svg"
        alt="Next slide"
        title="Next slide"
        width={32}
        height={32}
        aria-hidden
      />
    </button>
  );
}

function PrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <button
      type="button"
      className={`${className} custom-featured-arrow custom-featured-arrow-prev`}
      style={style}
      onClick={onClick}
      aria-label="Previous slide"
    >
      <Image
        src="/icon/arrow-left-s-line.svg"
        alt="Previous slide"
        title="Previous slide"
        width={32}
        height={32}
        aria-hidden
      />
    </button>
  );
}

function FeaturedProjectsSwiper({ projects, renderCard }) {
  if (!projects?.length) return null;

  return (
    <div className="slider-wrapper featured-projects-swiper-wrap">
      <button
        type="button"
        className="custom-prev featured-swiper-prev"
        aria-label="Previous Slide"
      >
        
        <FaArrowLeft size={16} />
      </button>
      <button
        type="button"
        className="custom-next featured-swiper-next"
        aria-label="Next Slide"
      >
        <FaArrowRight size={16} />
      
      </button>
      <Swiper
        modules={[Navigation]}
        navigation={{
          prevEl: ".featured-swiper-prev",
          nextEl: ".featured-swiper-next",
        }}
        spaceBetween={24}
        breakpoints={{
          0: { slidesPerView: 1 },
          576: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1200: { slidesPerView: 2 },
        }}
      >
        {projects.map((item) => (
          <SwiperSlide key={item.id}>
            {renderCard(item)}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default function Featured({
  url = "",
  autoPlay,
  allProjects,
  type,
  badgeVariant = "default",
  title,
  residentialProjects,
  commercialProjects,
}) {
  const [projectType, setProjectType] = useState("Residential");
  const [isLoading, setIsLoading] = useState(false);

  const filteredProjects = useMemo(() => {
    if (residentialProjects && commercialProjects) {
      return projectType === "Residential" ? residentialProjects : commercialProjects;
    }
    if (!allProjects || allProjects.length === 0) return [];
    if (type === "Similar" || type === "Featured") {
      return allProjects;
    }
    return allProjects
      .filter((project) => project.propertyTypeName === projectType)
      .slice(0, 9);
  }, [allProjects, projectType, type, residentialProjects, commercialProjects]);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [filteredProjects, isLoading]);

  const isFeaturedProjectsSection = !autoPlay && type !== "Similar";
  const projectCount = filteredProjects.length;
  const showArrows = autoPlay || type === "Similar";

  const settings = useMemo(
    () => ({
      dots: false,
      infinite: projectCount > 2,
      speed: 500,
      autoplay: autoPlay,
      autoplaySpeed: 5000,
      arrows: showArrows,
      nextArrow: showArrows && projectCount > 1 ? <NextArrow /> : null,
      prevArrow: showArrows && projectCount > 1 ? <PrevArrow /> : null,
      slidesToShow: 3,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1200,
          settings: { slidesToShow: 3, slidesToScroll: 1 },
        },
        {
          breakpoint: 992,
          settings: { slidesToShow: 2, slidesToScroll: 1 },
        },
        {
          breakpoint: 768,
          settings: { slidesToShow: 2, slidesToScroll: 1 },
        },
        {
          breakpoint: 576,
          settings: { slidesToShow: 1, slidesToScroll: 1 },
        },
        {
          breakpoint: 375,
          settings: { slidesToShow: 1, slidesToScroll: 1 },
        },
      ],
    }),
    [projectCount, autoPlay, showArrows],
  );

  const sectionTitle = useMemo(() => {
    if (!autoPlay) return title;
    if (projectType === "Commercial" && type !== "Similar") {
      return `Explore Top Commercial Spaces for Growth`;
    }
    if (projectType === "Residential" && type !== "Similar") {
      return `Explore Our Premier Residential Projects`;
    }
    if (type === "Similar") {
      return "";
    }
    return title;
  }, [projectType, autoPlay, title, type]);

  const getFeaturedBadge = (item) => {
    const statusRaw = item?.projectStatusName || item?.status || "";
    const status = String(statusRaw).toLowerCase();
    if (status.includes("ready")) {
      return { label: "Ready to Move", className: "property-badge--ready-to-move" };
    }
    if (status.includes("new")) {
      return { label: "New Launched", className: "bg-success" };
    }
    if (status.includes("luxury")) {
      return { label: statusRaw || "Ultra Luxury", className: "property-badge--ultra-luxury" };
    }
    if (status.includes("construction")) {
      return {
        label: statusRaw || "Under Construction",
        className: "property-badge--under-construction",
      };
    }
    return null;
  };

  const buildProjectImageSrc = (item) => {
    const imageBase = String(process.env.NEXT_PUBLIC_IMAGE_URL || "");
    const slug = String(item?.slugURL || item?.slugUrl || "").trim();
    const file = cleanImageFile(
      item?.projectBannerImage ||
        item?.projectThumbnailImage ||
        item?.bannerImage ||
        item?.imageURL ||
        item?.image,
    );

    if (!file) return DEMO_PROJECT_IMAGE;
    if (String(file).startsWith("http") || String(file).startsWith("/")) {
      return String(file);
    }
    if (imageBase && slug) return `${imageBase}properties/${slug}/${file}`;
    if (imageBase) return `${imageBase}${file}`;
    return DEMO_PROJECT_IMAGE;
  };

  const buildBuilderLogoSrc = (item) => {
    const apiBase = String(process.env.NEXT_PUBLIC_API_URL || "");
    const imageBase = String(process.env.NEXT_PUBLIC_IMAGE_URL || "");
    const slug = String(
      item?.builder?.slugUrl ||
        item?.builder?.slugURL ||
        item?.builderSlug ||
        item?.builderSlugUrl ||
        item?.slugURL ||
        "",
    ).trim();
    const file = cleanImageFile(
      item?.projectLogo ||
        item?.builder?.builderImage ||
        item?.builder?.builderLogo ||
        item?.builderImage ||
        item?.builderLogo ||
        item?.logo,
    );

    if (!file) return DEMO_BUILDER_LOGO;
    if (String(file).startsWith("http") || String(file).startsWith("/")) {
      return String(file);
    }
    if (item?.projectLogo && imageBase && slug) {
      return `${imageBase}properties/${slug}/${file}`;
    }
    if (slug && apiBase) {
      const base = apiBase.endsWith("/") ? apiBase : `${apiBase}/`;
      return `${base}get/images/builders/${slug}/${file}`;
    }
    if (slug && imageBase) return `${imageBase}builder/${slug}/${file}`;
    if (imageBase) return `${imageBase}${file}`;
    return DEMO_BUILDER_LOGO;
  };

  const renderFeaturedPropertyCard = (item) => {
    const featuredBadge = getFeaturedBadge(item);
    const projectImageSrc = buildProjectImageSrc(item);
    const builderLogoSrc = buildBuilderLogoSrc(item);
    const primaryProjectSrc =
      projectImageSrc === DEMO_PROJECT_IMAGE ? "" : projectImageSrc;
    const primaryBuilderSrc =
      builderLogoSrc === DEMO_BUILDER_LOGO ? "" : builderLogoSrc;
    const addressSummary =
      formatProjectAddress(item?.projectAddress) ||
      [item?.cityName, item?.stateName].filter(Boolean).join(", ") ||
      "";
    const priceDisplay = generatePrice(
      item?.projectPrice ?? item?.projectStartingPrice,
    );

    return (
      <div className="property-card">
        {featuredBadge && (
          <span className={`badge property-badge ${featuredBadge.className}`}>
            {featuredBadge.label}
          </span>
        )}
        <FeaturedCardImage
          src={primaryProjectSrc}
          demoSrc={DEMO_PROJECT_IMAGE}
          title={item?.projectName || item?.name || "Featured project"}
          alt={item?.projectName || item?.name || "Featured project"}
          className="property-image"
        />
        <div className="property-info-card">
          <FeaturedBuilderLogo
            src={primaryBuilderSrc}
            demoSrc={DEMO_BUILDER_LOGO}
            alt={item?.builder?.builderName || item?.builderName || "Builder logo"}
            isDemoClass={!primaryBuilderSrc}
          />
          <div>
            <h4>{item?.projectName || item?.name || "Project"}</h4>
            {addressSummary ? <p>{addressSummary}</p> : null}
            <h5>{priceDisplay}</h5>
          </div>
        </div>
      </div>
    );
  };

  const handleProjectType = (nextType) => {
    if (nextType !== projectType) {
      setIsLoading(true);
      setProjectType(nextType);
    }
  };

  return (
    <>
      {type !== "Similar" && (
        <div className="container home-featured-section">
          {autoPlay && type !== "Similar" && (
            <div className="d-flex featured-filter-buttons home-featured-filter-buttons gap-3">
              <button
                className={`mpf-btn-primary ${projectType === "Residential" ? "active" : ""}`}
                onClick={() => handleProjectType("Residential")}
              >
                Residential
              </button>
              <button
                className={`mpf-btn-primary ${projectType === "Commercial" ? "active" : ""}`}
                onClick={() => handleProjectType("Commercial")}
              >
                Commercial
              </button>
            </div>
          )}
          <div className="justify-content-between align-items-center">
            <h2 className="text-center plus-jakarta-sans-semi-bold home-featured-section-title">
              {sectionTitle}
            </h2>
            {autoPlay && type !== "Similar" && (
              <div className="text-center pt-3">
                <Link
                  title="View all projects"
                  className="btn text-white projects-view-all-btn btn-normal-color border-0"
                  href={`/projects/${url}`}
                >
                  View all
                </Link>
              </div>
            )}
          </div>
          {isLoading ? (
            <div className="featured-loading-container">
              <div className="featured-loading-spinner"></div>
              <p className="featured-loading-text">Loading projects...</p>
            </div>
          ) : filteredProjects?.length > 0 ? (
            isFeaturedProjectsSection ? (
              <FeaturedProjectsSwiper
                projects={filteredProjects}
                renderCard={renderFeaturedPropertyCard}
              />
            ) : (
              <div className="featured-page-slider">
                <Slider {...settings}>
                  {filteredProjects.map((item) => (
                    <div key={item.id} className="px-2 pb-3">
                      <PropertyContainer
                        data={item}
                        badgeVariant={badgeVariant}
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            )
          ) : (
            <div className="featured-no-projects">
              <p>No projects available for this category.</p>
            </div>
          )}
        </div>
      )}
      {type === "Similar" && (
        <div className="container">
          <div className="featured-page-slider">
            <Slider {...settings}>
              {filteredProjects.map((item) => (
                <div key={item.id} className="px-2 pb-3">
                  <PropertyContainer data={item} />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      )}
    </>
  );
}
