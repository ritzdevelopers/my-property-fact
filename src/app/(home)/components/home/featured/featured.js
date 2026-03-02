"use client";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./featured.css";
import Image from "next/image";
import Link from "next/link";
import PropertyContainer from "../../common/page";
import { useMemo, useState, useEffect } from "react";

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
        alt="Next"
        width={32}
        height={32}
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
        alt="Previous"
        width={32}
        height={32}
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
  const [projectType, setProjectType] = useState("Residential");
  const [isLoading, setIsLoading] = useState(false);

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

  // Show arrows on mobile for Featured section (autoPlay false); always for Residential/Commercial (autoPlay true)
  const showArrows = autoPlay || type === "Featured";
  const settings = useMemo(
    () => ({
      dots: false,
      infinite: filteredProjects.length > 2,
      speed: 500,
      autoplay: autoPlay,
      autoplaySpeed: 5000,
      arrows: showArrows,
      nextArrow: showArrows && filteredProjects.length > 1 ? <NextArrow /> : null,
      prevArrow: showArrows && filteredProjects.length > 1 ? <PrevArrow /> : null,
      slidesToShow: 3,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    }),
    [filteredProjects.length, autoPlay, type, showArrows],
  );

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
        <div className="container">
          {autoPlay && type !== "Similar" && (
            <div
              className="d-flex featured-filter-buttons mt-4 mt-lg-2 gap-3"
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
            <h2 className="text-left my-4 my-lg-5 plus-jakarta-sans-semi-bold">
              {sectionTitle}
            </h2>
            {autoPlay && type !== "Similar" && (
              <div className="text-center pt-3">
                <Link
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
            <div className={`featured-page-slider ${type === "Featured" && !autoPlay ? "featured-projects-mobile-arrows" : ""}`}>
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
