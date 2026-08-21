"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { buildProjectImageUrl } from "@/lib/projectImageUrl";
import ProjectStatusRibbon from "@/app/(home)/components/common/ProjectStatusRibbon";
import PropertyTypeTag from "@/app/(home)/components/common/PropertyTypeTag";
import LuxuryPricePlaque from "@/app/(home)/components/common/LuxuryPricePlaque";
import "@/app/(home)/components/common/luxuryPropertyCard.css";
import { buildProjectDisplayName } from "@/lib/projectDisplayName";
import "./newmpfmetadata.css";

function apiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL || "";
  if (!raw) return "";
  return raw.endsWith("/") ? raw : `${raw}/`;
}

function cleanMetaText(value, fallback = "") {
  const text = String(value ?? "").trim();
  if (!text || text === "/" || text.toLowerCase() === "null") return fallback;
  return text;
}

function formatProjectPrice(value) {
  if (value == null || value === "") return "Price on request";
  const strValue = String(value).trim();
  if (!strValue) return "Price on request";
  if (/[a-zA-Z]/.test(strValue)) {
    // Keep custom labels; append * onwards when it's a priced string without it
    if (/onwards/i.test(strValue) || /request/i.test(strValue)) return strValue;
    return /[*]/.test(strValue) ? `${strValue} Onwards` : `${strValue}* Onwards`;
  }
  const numericValue = Number.parseFloat(strValue.replace(/,/g, ""));
  if (!Number.isFinite(numericValue) || numericValue <= 0) return "Price on request";
  if (numericValue < 1) return `₹ ${Math.round(numericValue * 100)} Lakh* Onwards`;
  return `₹ ${numericValue} Cr* Onwards`;
}

function getProjectHref(project) {
  const slug = project?.slugURL || project?.slugUrl;
  return slug ? `/${slug}` : "/projects";
}

function getProjectImage(project) {
  return buildProjectImageUrl(project, { preferThumbnail: true });
}

function getProjectLocation(project) {
  return (
    project?.projectAddress ||
    [project?.cityName, project?.stateName].filter(Boolean).join(", ") ||
    "Location details available on project page"
  );
}

function getPropertyImage(property) {
  const rawImage = typeof property?.image === "string" ? property.image.trim() : "";
  if (!rawImage) return "/static/no_image.png";
  if (rawImage.startsWith("http://") || rawImage.startsWith("https://")) return rawImage;
  if (rawImage.startsWith("/")) return rawImage;

  const propertyListingMatch = rawImage.match(/^property-listings\/([^/]+)\/(.+)$/);
  if (propertyListingMatch) {
    const [, listingId, filename] = propertyListingMatch;
    const base = apiBaseUrl();
    if (base) {
      return `${base}get/images/property-listings/${listingId}/${filename}`;
    }
  }

  return `/${rawImage.replace(/^\/+/, "")}`;
}

function effectiveCardKind(item, kind) {
  if (kind === "mixed" && (item?.itemKind === "property" || item?.itemKind === "project")) {
    return item.itemKind;
  }
  return kind;
}

function stripItemKind(item, kind) {
  if (kind !== "mixed" || item == null || typeof item !== "object") return item;
  const { itemKind: _ignored, ...rest } = item;
  return rest;
}

// Only show when type clearly maps to commercial / residential buckets
function hasPropertyTypeTag(type) {
  const normalized = String(type || "").toLowerCase().trim();
  return normalized.includes("commercial") || normalized.includes("residential");
}

function getCardPayload(item, kind) {
  const k = effectiveCardKind(item, kind);
  const source = stripItemKind(item, kind);

  if (k === "property") {
    const cardTitle = cleanMetaText(source?.title, "Property");
    const category = cleanMetaText(
      source?.propertyTypeCategory || source?.listingType || source?.subType,
    );
    return {
      key: source?.id || source?.slug || source?.title,
      href: source?.slug ? `/properties/${source.slug}` : "/properties",
      image: getPropertyImage(source),
      badge:
        cleanMetaText(source?.constructionStatus) ||
        cleanMetaText(source?.listingType),
      title: cardTitle,
      propertyType: category,
      meta:
        [source?.bedroom, source?.propertyTypeCategory || source?.subType]
          .filter(Boolean)
          .join(" ") || "Property details available on listing page",
      location: source?.location || "Location not specified",
      price: formatProjectPrice(source?.price),
    };
  }

  const cardTitle = buildProjectDisplayName(
    { ...source, projectName: cleanMetaText(source?.projectName, "Project") },
    "Project",
  );
  return {
    key: source?.slugURL || source?.slugUrl || source?.projectName,
    href: getProjectHref(source),
    image: getProjectImage(source),
    badge:
      typeof source?.projectStatusName === "string" ? source.projectStatusName.trim() : "",
    title: cardTitle,
    propertyType: cleanMetaText(source?.propertyTypeName),
    meta:
      (typeof source?.projectConfiguration === "string" && source.projectConfiguration.trim()) ||
      "Explore configurations on project page",
    location: getProjectLocation(source),
    price: formatProjectPrice(source?.projectPrice),
  };
}

function getVisibleCount(viewportWidth) {
  if (viewportWidth <= 480) return 1;
  if (viewportWidth <= 768) return 2;
  if (viewportWidth <= 1024) return 3;
  return 4;
}

export default function HomeRecommendationCards({
  title,
  subtitle,
  items,
  kind,
  viewAllHref,
  className = "",
}) {
  const safeItems = useMemo(
    () => (Array.isArray(items) ? items.slice(0, 8) : []),
    [items],
  );
  const [visibleCount, setVisibleCount] = useState(4);
  const [startIndex, setStartIndex] = useState(0);
  const viewportRef = useRef(null);

  const maxStartIndex = Math.max(0, safeItems.length - visibleCount);
  const canSlide = safeItems.length > visibleCount;
  const trackStyle = {
    transform: `translateX(-${startIndex * (100 / visibleCount)}%)`,
    "--preview-visible": visibleCount,
  };

  useEffect(() => {
    setStartIndex(0);
  }, [items, kind, title]);

  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(getVisibleCount(window.innerWidth));
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  useEffect(() => {
    setStartIndex((prev) => Math.min(prev, maxStartIndex));
  }, [maxStartIndex]);

  /** Below the mobile breakpoint the rail is a native scroll-snap container,
   *  so the arrows scroll it instead of driving the track transform. */
  const scrollRailBy = useCallback((direction) => {
    const viewport = viewportRef.current;
    if (!viewport || viewport.scrollWidth <= viewport.clientWidth + 1) return false;

    const slide = viewport.querySelector(".home-projects-preview__slide");
    const step = slide?.getBoundingClientRect().width || viewport.clientWidth;
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const target = viewport.scrollLeft + direction * step;

    viewport.scrollTo({
      left: direction > 0
        ? (target > maxScroll - 1 ? 0 : target)
        : (target < 1 ? maxScroll : target),
      behavior: "smooth",
    });
    return true;
  }, []);

  const handlePrev = () => {
    if (scrollRailBy(-1)) return;
    setStartIndex((prev) => (prev <= 0 ? maxStartIndex : prev - 1));
  };

  const handleNext = () => {
    if (scrollRailBy(1)) return;
    setStartIndex((prev) => (prev >= maxStartIndex ? 0 : prev + 1));
  };

  if (!safeItems.length) return null;

  return (
    <section
      className={`container home-projects-preview ${className}`.trim()}
      aria-label={title}
    >
      <div className="home-projects-preview__head">
        <div>
          <h2 className="home-projects-preview__title plus-jakarta-sans-semi-bold">{title}</h2>
          {subtitle ? <p className="home-projects-preview__sub">{subtitle}</p> : null}
        </div>
      </div>

      <div className="home-projects-preview__viewport" ref={viewportRef}>
        <div className="home-projects-preview__track" style={trackStyle}>
          {safeItems.map((item, idx) => {
            const card = getCardPayload(item, kind);
            const cardImageMeta = `${card.title} — real estate listing card image on My Property Fact`;
            const cardLinkTitle = card.title
              ? `View ${card.title} on My Property Fact`
              : "View project on My Property Fact";
            const rowKey =
              kind === "mixed"
                ? `${effectiveCardKind(item, kind)}-${card.key ?? idx}`
                : card.key ?? idx;
            return (
              <div key={rowKey} className="home-projects-preview__slide">
                <Link
                  href={card.href}
                  className="home-project-card home-project-card--poster mpf-lux-card mpf-lux-card--poster"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={card.title ? `View details about ${card.title}` : "View project details"}
                  title={cardLinkTitle}
                >
<div className="home-project-card__media">
  <div className="home-project-card__image-wrap">
    <img
      src={card.image}
      alt={cardImageMeta}
      title={cardImageMeta}
      className="home-project-card__image"
      loading="lazy"
      decoding="async"
    />
  </div>

  <LuxuryPricePlaque price={card.price} />

  <ProjectStatusRibbon
    status={card.badge}
    className="mpf-status-ribbon--compact mpf-status-ribbon--lux"
  />
</div>

                  <div className="home-project-card__overlay">
                    <div className="home-project-card__title-row">
                      <h3 className="home-project-card__title">{card.title}</h3>
                      {hasPropertyTypeTag(card.propertyType) ? (
                        <PropertyTypeTag type={card.propertyType} className="mpf-type-tag--lux" />
                      ) : null}
                    </div>
                    <p className="home-project-card__meta">{card.meta}</p>
                    <p className="home-project-card__location">
                      <svg className="home-project-card__pin" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M12 22s7-7.2 7-12a7 7 0 10-14 0c0 4.8 7 12 7 12z" stroke="currentColor" strokeWidth="1.8" />
                        <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                      {card.location}
                    </p>
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
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {viewAllHref || canSlide ? (
        <div className="home-projects-preview__actions">
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="home-projects-preview__view-all"
              title={
                kind === "property"
                  ? "View all properties"
                  : "View all projects"
              }
            >
              View all{" "}
              {kind === "property"
                ? "properties"
                : kind === "mixed"
                  ? "projects"
                  : "projects"}
            </Link>
          ) : null}
          {canSlide ? (
            <div className="home-projects-preview__nav" aria-label={`${title} navigation`}>
              <button
                type="button"
                className="home-projects-preview__nav-btn"
                onClick={handlePrev}
                aria-label={`Show previous ${kind === "property" ? "properties" : "items"}`}
              >
                <img
                  src="/icon/arrow-left-s-line.svg"
                  alt="Previous"
                  title="Previous"
                  width={16}
                  height={16}
                  aria-hidden
                />
              </button>
              <button
                type="button"
                className="home-projects-preview__nav-btn"
                onClick={handleNext}
                aria-label={`Show next ${kind === "property" ? "properties" : "items"}`}
              >
                <img
                  src="/icon/arrow-right-s-line.svg"
                  alt="Next"
                  title="Next"
                  width={16}
                  height={16}
                  aria-hidden
                />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
