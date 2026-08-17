"use client";
import Slider from "react-slick";
import "./featured.css";
import Link from "next/link";
import PropertyContainer from "../../common/PropertyContainer";
import { useMemo, useState, useEffect } from "react";
import { useDeferredStylesheet } from "@/lib/useDeferredStylesheet";

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
      <img
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
      <img
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
  useDeferredStylesheet(() =>
    Promise.all([
      import("slick-carousel/slick/slick.css"),
      import("slick-carousel/slick/slick-theme.css"),
    ]),
  );

  const [projectType, setProjectType] = useState("Residential");
  const [isLoading, setIsLoading] = useState(false);
  const isHomeFeaturedShowcase = type === "Featured" && !autoPlay;

  // When residentialProjects + commercialProjects are passed, use them per tab (no filter). Else filter allProjects by type.
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

  // Clear loading state when filtered projects are ready
  useEffect(() => {
    if (isLoading) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [filteredProjects, isLoading]);

  // Show arrows for Featured, Similar, and Residential/Commercial (autoPlay true)
  const showArrows = autoPlay || type === "Featured" || type === "Similar";
  const premierRailSettings = {
    slidesToShow: 4,
    infinite: filteredProjects.length > 4,
    responsive: [
      {
        breakpoint: 1025,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 769,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 481,
        settings: { slidesToShow: 1.35 },
      },
    ],
  };
  const showcaseSettings = {
    slidesToShow: 6,
    infinite: filteredProjects.length > 6,
    responsive: [
      { breakpoint: 1400, settings: { slidesToShow: 5 } },
      { breakpoint: 1200, settings: { slidesToShow: 4 } },
      { breakpoint: 992, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 1 } },
    ],
  };
  const layoutSettings = isHomeFeaturedShowcase ? showcaseSettings : premierRailSettings;
const settings = {
  dots: false,
  speed: 500,
  autoplay: autoPlay,
  autoplaySpeed: 5000,
  arrows: showArrows,
  nextArrow: showArrows && filteredProjects.length > 1 ? <NextArrow /> : null,
  prevArrow: showArrows && filteredProjects.length > 1 ? <PrevArrow /> : null,
  slidesToScroll: 1,
  ...layoutSettings,
};

  // Memoized section title
  const sectionTitle = useMemo(() => {
    if (!autoPlay) return title;
    if (projectType === "Commercial" && type !== "Similar") {
      return `Explore Top Commercial Spaces for Growth`;
    } else if (projectType === "Residential" && type !== "Similar") {
      return `Explore Our Premier Residential Projects`;
    } else if (type === "Similar") {
      return "";
    } else {
      return title;
    }
  }, [projectType, autoPlay, title]);

  // Fast tab switching handler with loading state
  const handleProjectType = (type) => {
    if (type !== projectType) {
      setIsLoading(true);
      setProjectType(type);
    }
  };

  return (
    <>
      {type !== "Similar" && (
        <div
          className={`container home-featured-section${
            type === "Featured" ? " home-featured-section--spotlight" : ""
          }`}
        >
          {autoPlay && type !== "Similar" && (
            <div
              className="d-flex featured-filter-buttons home-featured-filter-buttons gap-3"
            >
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
                  className="btn projects-view-all-btn btn-normal-color border-0"
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
            <div
              className={`featured-page-slider ${
                type === "Featured" && !autoPlay ? "featured-projects-mobile-arrows featured-page-slider--two-up" : ""
              }`}
            >
              <Slider {...settings}>
                {filteredProjects.map((item, index) => (
                  <div
                    key={item.id}
                    className={
                      isHomeFeaturedShowcase
                        ? "featured-showcase-slide"
                        : "featured-poster-slide"
                    }
                  >
                    <PropertyContainer
                      data={item}
                      badgeVariant={badgeVariant}
                      layoutVariant={type === "Featured" ? "overlap" : "default"}
                      imagePriority={index < 2}
                    />
                  </div>
                ))}
              </Slider>
            </div>
          ) : (
            <div className="featured-no-projects">
              <p>No projects available for this category.</p>
            </div>
          )}
        </div>
      )}
      {type === "Similar" && (
        <>
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
        </>
      )}
    </>
  );
}
