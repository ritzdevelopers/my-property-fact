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

const DEMO_PROJECT_IMAGE = "/static/no_image.png";
const DEMO_BUILDER_LOGO = "/logo.webp";

function setDemoImageOnError(event, demoSrc) {
  const img = event.currentTarget;
  if (img.dataset.demoFallback === "1") return;
  img.dataset.demoFallback = "1";
  img.onerror = null;
  img.src = demoSrc;
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
        ❮
      </button>
      <button
        type="button"
        className="custom-next featured-swiper-next"
        aria-label="Next Slide"
      >
        ❯
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
      return { label: "Ready to Move", className: "bg-warning" };
    }
    if (status.includes("new")) {
      return { label: "New Launched", className: "bg-success" };
    }
    if (status.includes("luxury")) {
      return { label: statusRaw || "Ultra Luxury", className: "bg-warning" };
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
    const file =
      item?.projectBannerImage ||
      item?.projectThumbnailImage ||
      item?.bannerImage ||
      item?.imageURL ||
      item?.image;

    if (!file || !String(file).trim()) return DEMO_PROJECT_IMAGE;
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
    const file =
      item?.projectLogo ||
      item?.builder?.builderImage ||
      item?.builder?.builderLogo ||
      item?.builderImage ||
      item?.builderLogo ||
      item?.logo;

    if (!file || !String(file).trim()) return DEMO_BUILDER_LOGO;
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
    const isProjectDemo = projectImageSrc === DEMO_PROJECT_IMAGE;
    const isBuilderDemo = builderLogoSrc === DEMO_BUILDER_LOGO;

    return (
      <div className="property-card">
        {featuredBadge && (
          <span className={`badge property-badge ${featuredBadge.className}`}>
            {featuredBadge.label}
          </span>
        )}
        <img
          src={projectImageSrc}
          alt={item?.projectName || item?.name || "Featured project"}
          className={`property-image${isProjectDemo ? " property-image--demo" : ""}`}
          onError={(e) => setDemoImageOnError(e, DEMO_PROJECT_IMAGE)}
        />
        <div className="property-info-card">
          <div className={`logo-box${isBuilderDemo ? " logo-box--demo" : ""}`}>
            <img
              src={builderLogoSrc}
              alt={item?.builder?.builderName || item?.builderName || "Builder logo"}
              className="img-fluid"
              onError={(e) => setDemoImageOnError(e, DEMO_BUILDER_LOGO)}
            />
          </div>
          <div>
            <h4>{item?.projectName || item?.name || "Project"}</h4>
            <p>{item?.locationName || item?.cityName || "India"}</p>
            <h5>
              {item?.startingPrice || item?.priceRange || "Price on request"}
            </h5>
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
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="text-left plus-jakarta-sans-semi-bold home-featured-section-title">
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
