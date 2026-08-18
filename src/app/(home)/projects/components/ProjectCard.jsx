"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  buildGalleryImageUrl,
  buildProjectImageUrl,
  DEFAULT_PROJECT_CARD_IMAGE,
} from "@/lib/projectImageUrl";
import { formatDistanceKm } from "@/lib/utils";
import {
  loadNearbyBenefitCatalog,
  resolveNearbyBenefitMeta,
} from "@/lib/projectCardHelpers";
import ProjectStatusRibbon from "@/app/(home)/components/common/ProjectStatusRibbon";
import PropertyTypeTag from "@/app/(home)/components/common/PropertyTypeTag";
import LuxuryPricePlaque from "@/app/(home)/components/common/LuxuryPricePlaque";
import UnderConstructionHoverOverlay from "@/app/(home)/components/common/UnderConstructionHoverOverlay";
import "@/app/(home)/components/common/luxuryPropertyCard.css";
import "@/app/(home)/components/common/projectStatusRibbon.css";
import "@/app/(home)/components/common/premiumBadges.css";
import { saveListingReturnState } from "@/lib/listingScrollRestore";
import { buildProjectDisplayName } from "@/lib/projectDisplayName";

const API_BASE = String(process.env.NEXT_PUBLIC_API_URL || "").trim();

function mergeSlideUrls(primaryUrl, galleryUrls = []) {
  const merged = [];
  const add = (url) => {
    const value = String(url || "").trim();
    if (!value || value === DEFAULT_PROJECT_CARD_IMAGE) return;
    if (!merged.includes(value)) merged.push(value);
  };

  add(primaryUrl);
  galleryUrls.forEach(add);

  return merged.length ? merged : [DEFAULT_PROJECT_CARD_IMAGE];
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

function ProjectCardSlider({
  slides,
  activeSlide,
  imageErrors,
  imagePriority,
  projectName,
  hasMultipleSlides,
  onPrev,
  onNext,
  onImageError,
  imageClassName = "mpf-listing-slider__img",
}) {
  return (
    <div className="mpf-listing-slider" aria-label={`${projectName} photos`}>
      {slides.map((src, index) => (
        <img
          key={`${src}-${index}`}
          src={imageErrors[index] ? DEFAULT_PROJECT_CARD_IMAGE : src}
          alt={`${projectName} — photo ${index + 1}`}
          className={`${imageClassName}${
            index === activeSlide ? " is-active" : ""
          }`}
          loading={imagePriority && index === 0 ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={imagePriority && index === 0 ? "high" : "low"}
          onError={() => onImageError(index)}
        />
      ))}

      {hasMultipleSlides ? (
        <>
          <button
            type="button"
            className="mpf-listing-slider__nav mpf-listing-slider__nav--prev"
            onClick={onPrev}
            aria-label="Previous photo"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button
            type="button"
            className="mpf-listing-slider__nav mpf-listing-slider__nav--next"
            onClick={onNext}
            aria-label="Next photo"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </>
      ) : null}
    </div>
  );
}

function ProjectCardDetails({
  projectTitle,
  propertyTypeName,
  metaLabel,
  locationLabel,
  tone = "light",
  typeTagClassName = "mpf-type-tag--lux",
}) {
  const isDark = tone === "dark";

  if (isDark) {
    return (
      <>
        <div className="home-project-card__title-row">
          <h2 className="home-project-card__title">{projectTitle}</h2>
          <PropertyTypeTag type={propertyTypeName} className={typeTagClassName} />
        </div>
        {metaLabel ? <p className="home-project-card__meta">{metaLabel}</p> : null}
        <p className="home-project-card__location">
          <svg className="home-project-card__pin" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 22s7-7.2 7-12a7 7 0 10-14 0c0 4.8 7 12 7 12z" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <span>{locationLabel}</span>
        </p>
      </>
    );
  }

  return (
    <>
      <div className="mpf-lux-card__title-row">
        <h2 className="mpf-lux-card__title">{projectTitle}</h2>
        <PropertyTypeTag type={propertyTypeName} className={typeTagClassName} />
      </div>
      {metaLabel ? <p className="mpf-lux-card__config">{metaLabel}</p> : null}
      <p className="mpf-lux-card__location">
        <svg className="mpf-lux-card__pin" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 22s7-7.2 7-12a7 7 0 10-14 0c0 4.8 7 12 7 12z" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        {locationLabel}
      </p>
    </>
  );
}

function ProjectCardNearby({ items = [] }) {
  if (!items.length) return null;

  return (
    <div className="mpf-lux-card__extra">
      <div className="mpf-listing-nearby">
        <span className="mpf-listing-nearby__label">Nearby</span>
        <div className="mpf-listing-nearby__scroller">
          <div className="mpf-listing-nearby__track">
            {items.slice(0, 6).map((item) => (
              <span
                key={`${item.name}-${item.distance}`}
                className="mpf-listing-nearby__chip"
                title={item.title}
              >
                {item.icon ? (
                  <img
                    src={item.icon}
                    alt={item.alt}
                    className="mpf-listing-nearby__icon"
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                <span className="mpf-listing-nearby__text">
                  <span className="mpf-listing-nearby__name">{item.name}</span>
                  {item.distance ? (
                    <span className="mpf-listing-nearby__dist">{item.distance}</span>
                  ) : null}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectCardActionBar({
  variant = "poster",
  slug,
  onNavigate,
  onGetDetails,
}) {
  if (variant === "horizontal" && slug) {
    return (
      <div className="mpf-lux-card__bar">
        <div className="mpf-lux-card__cta">
          <button
            type="button"
            className="mpf-lux-card__btn mpf-lux-card__btn--primary"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onGetDetails?.();
            }}
          >
            Get Details
          </button>
          <Link
            href={`/${slug}`}
            className="mpf-lux-card__btn mpf-lux-card__btn--outline"
            onClick={onNavigate}
          >
            Click to Explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mpf-lux-card__bar">
      <span className="mpf-lux-card__action">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="15" height="15">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
        </svg>
        <span>View Details</span>
      </span>
      <span className="mpf-lux-card__go" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

export default function ProjectCard({
  project,
  imagePriority = false,
  variant = "horizontal",
  onGetDetails,
  showUnderConstructionOverlay = true,
}) {
  const [slides, setSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const [locationBenefits, setLocationBenefits] = useState([]);
  const [nearbyCatalog, setNearbyCatalog] = useState([]);

  const slug = project?.slugURL;
  const isPoster = variant === "poster";

  const persistListingReturn = useCallback(() => {
    if (typeof window === "undefined" || !slug) return;
    saveListingReturnState({
      pathname: window.location.pathname,
      search: window.location.search,
      slug,
      scrollY: window.scrollY,
    });
  }, [slug]);

  useEffect(() => {
    if (isPoster) return undefined;
    let cancelled = false;
    loadNearbyBenefitCatalog().then((rows) => {
      if (!cancelled) setNearbyCatalog(Array.isArray(rows) ? rows : []);
    });
    return () => {
      cancelled = true;
    };
  }, [isPoster]);

  useEffect(() => {
    if (!project) return;
    const primary = buildProjectImageUrl(project, { preferThumbnail: true });
    setSlides(mergeSlideUrls(primary));
    setActiveSlide(0);
    setImageErrors({});
  }, [
    project?.projectThumbnailImage,
    project?.projectBannerImage,
    project?.slugURL,
    project,
  ]);

  useEffect(() => {
    if (!slug || !API_BASE) return undefined;

    const controller = new AbortController();
    const url = `${API_BASE}projects/get/${encodeURIComponent(slug)}`;

    fetch(url, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const primary = buildProjectImageUrl(project, { preferThumbnail: true });
        const gallery = (Array.isArray(data.galleryImages) ? data.galleryImages : [])
          .map((img) =>
            buildGalleryImageUrl(slug, img?.imageName || img?.image || img?.galleyImage),
          )
          .filter(Boolean);

        setSlides(mergeSlideUrls(primary, gallery));
        setActiveSlide(0);

        if (!isPoster) {
          const benefits = Array.isArray(data.locationBenefits)
            ? data.locationBenefits
            : Array.isArray(data.projectLocationBenefitList)
              ? data.projectLocationBenefitList
              : [];
          setLocationBenefits(benefits.filter((item) => item?.benefitName));
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [slug, project, isPoster]);

  const goPrev = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (slides.length <= 1) return;
      setActiveSlide((index) => (index === 0 ? slides.length - 1 : index - 1));
    },
    [slides.length],
  );

  const goNext = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (slides.length <= 1) return;
      setActiveSlide((index) => (index === slides.length - 1 ? 0 : index + 1));
    },
    [slides.length],
  );

  const handleImageError = useCallback((index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  }, []);

  const nearbyItems = useMemo(() => {
    if (isPoster) return [];
    return locationBenefits
      .map((item) => {
        const name = String(item?.benefitName || "").trim();
        if (!name) return null;
        const meta = resolveNearbyBenefitMeta(name, nearbyCatalog);
        return {
          name,
          distance: formatDistanceKm(item?.distance),
          icon: meta.icon,
          alt: meta.alt,
          title: meta.title,
        };
      })
      .filter(Boolean);
  }, [locationBenefits, nearbyCatalog, isPoster]);

  if (!project) return null;

  const projectName = String(project.projectName || "Project").trim();
  const projectTitle = buildProjectDisplayName(project, "Project");
  const hasMultipleSlides = slides.length > 1;
  const addressSummary = formatProjectAddress(project.projectAddress);
  const locationLabel =
    addressSummary ||
    String(project.cityName || "").trim() ||
    "Location on project page";
  const metaLabel =
    String(project.projectConfiguration || "").trim() ||
    String(project.propertyTypeName || "").trim();

  const sliderProps = {
    slides,
    activeSlide,
    imageErrors,
    imagePriority,
    projectName,
    hasMultipleSlides,
    onPrev: goPrev,
    onNext: goNext,
    onImageError: handleImageError,
  };

  if (isPoster) {
    return (
      <Link
        href={`/${project.slugURL}`}
        className="home-project-card home-project-card--poster mpf-lux-card mpf-lux-card--poster mpf-listing-poster-card"
        onClick={persistListingReturn}
        aria-label={`View details about ${projectTitle}`}
        data-project-slug={slug || undefined}
      >
        <div className="home-project-card__media">
          <div className="home-project-card__image-wrap">
            <ProjectCardSlider
              {...sliderProps}
              imageClassName="home-project-card__image mpf-listing-slider__img"
            />
          </div>

          <LuxuryPricePlaque price={project.projectPrice} />

          <ProjectStatusRibbon
            status={project.projectStatusName}
            className="mpf-status-ribbon--compact mpf-status-ribbon--lux"
          />
        </div>

        <div className="home-project-card__overlay">
          <ProjectCardDetails
            projectTitle={projectTitle}
            propertyTypeName={project.propertyTypeName}
            metaLabel={metaLabel}
            locationLabel={locationLabel}
            tone="dark"
          />
          <ProjectCardActionBar />
        </div>

        {showUnderConstructionOverlay ? (
          <UnderConstructionHoverOverlay status={project.projectStatusName} />
        ) : null}
      </Link>
    );
  }

  return (
    <article className="mpf-listing-card mpf-lux-card" data-project-slug={slug || undefined}>
      <div className="mpf-lux-card__frame">
        <div className="mpf-listing-image">
          <ProjectCardSlider {...sliderProps} />

          <LuxuryPricePlaque price={project.projectPrice} />

          <ProjectStatusRibbon
            status={project.projectStatusName}
            className="mpf-status-ribbon--listing mpf-status-ribbon--lux"
          />
        </div>

        <div className="mpf-lux-card__body">
          <ProjectCardDetails
            projectTitle={projectTitle}
            propertyTypeName={project.propertyTypeName}
            metaLabel={metaLabel}
            locationLabel={locationLabel}
            tone="light"
            typeTagClassName="mpf-type-tag--listing"
          />
          <ProjectCardNearby items={nearbyItems} />
          <ProjectCardActionBar
            variant="horizontal"
            slug={slug}
            onNavigate={persistListingReturn}
            onGetDetails={() => onGetDetails?.(project)}
          />
        </div>
      </div>
    </article>
  );
}
