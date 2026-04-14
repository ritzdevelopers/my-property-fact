"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "./newmpfmetadata.css";

function apiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL || "";
  if (!raw) return "";
  return raw.endsWith("/") ? raw : `${raw}/`;
}

function formatProjectPrice(value) {
  if (value == null || value === "") return "Price on request";
  const strValue = String(value).trim();
  if (!strValue) return "Price on request";
  if (/[a-zA-Z]/.test(strValue)) return strValue;
  const numericValue = Number.parseFloat(strValue.replace(/,/g, ""));
  if (!Number.isFinite(numericValue) || numericValue <= 0) return "Price on request";
  if (numericValue < 1) return `₹ ${Math.round(numericValue * 100)} Lakh`;
  return `₹ ${numericValue} Cr`;
}

function getProjectHref(project) {
  const slug = project?.slugURL || project?.slugUrl;
  return slug ? `/${slug}` : "/projects";
}

function getProjectImage(project) {
  const imageBase =
    (typeof process.env.NEXT_PUBLIC_IMAGE_URL === "string" &&
      process.env.NEXT_PUBLIC_IMAGE_URL) ||
    "";
  const slug = project?.slugURL || project?.slugUrl;
  const rawImage =
    project?.projectBannerImage || project?.projectThumbnailImage || project?.bannerImage || "";

  if (typeof rawImage === "string" && rawImage.startsWith("http")) return rawImage;
  if (imageBase && slug && rawImage) return `${imageBase}properties/${slug}/${rawImage}`;
  return "/static/no_image.png";
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

function getCardPayload(item, kind) {
  if (kind === "property") {
    return {
      key: item?.id || item?.slug || item?.title,
      href: item?.slug ? `/properties/${item.slug}` : "/properties",
      image: getPropertyImage(item),
      badge: item?.constructionStatus || item?.listingType || "Property",
      title: item?.title || "Property",
      meta:
        [item?.bedroom, item?.propertyTypeCategory || item?.subType]
          .filter(Boolean)
          .join(" ") || "Property details available on listing page",
      location: item?.location || "Location not specified",
      price: item?.price || "Price on request",
    };
  }

  return {
    key: item?.slugURL || item?.slugUrl || item?.projectName,
    href: getProjectHref(item),
    image: getProjectImage(item),
    badge:
      (typeof item?.projectStatusName === "string" && item.projectStatusName.trim()) || "Project",
    title: item?.projectName || "Project",
    meta:
      (typeof item?.projectConfiguration === "string" && item.projectConfiguration.trim()) ||
      "Explore configurations on project page",
    location: getProjectLocation(item),
    price: formatProjectPrice(item?.projectPrice),
  };
}

function getVisibleCount(viewportWidth) {
  if (viewportWidth <= 576) return 1;
  if (viewportWidth <= 768) return 2;
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
    () => (Array.isArray(items) ? items.slice(0, 6) : []),
    [items],
  );
  const [visibleCount, setVisibleCount] = useState(4);
  const [startIndex, setStartIndex] = useState(0);

  const maxStartIndex = Math.max(0, safeItems.length - visibleCount);
  const canSlide = safeItems.length > visibleCount;
  const trackStyle = {
    transform: `translateX(-${startIndex * (100 / visibleCount)}%)`,
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

  const handlePrev = () => {
    setStartIndex((prev) => (prev <= 0 ? maxStartIndex : prev - 1));
  };

  const handleNext = () => {
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
        <div className="home-projects-preview__actions">
          {viewAllHref ? (
            <Link href={viewAllHref} className="home-projects-preview__view-all">
              View all {kind === "property" ? "properties" : "projects"}
            </Link>
          ) : null}
          {canSlide ? (
            <div className="home-projects-preview__nav" aria-label={`${title} navigation`}>
              <button
                type="button"
                className="home-projects-preview__nav-btn"
                onClick={handlePrev}
                aria-label={`Show previous ${kind === "property" ? "properties" : "projects"}`}
              >
                <Image
                  src="/icon/arrow-left-s-line.svg"
                  alt=""
                  width={16}
                  height={16}
                  aria-hidden
                />
              </button>
              <button
                type="button"
                className="home-projects-preview__nav-btn"
                onClick={handleNext}
                aria-label={`Show next ${kind === "property" ? "properties" : "projects"}`}
              >
                <Image
                  src="/icon/arrow-right-s-line.svg"
                  alt=""
                  width={16}
                  height={16}
                  aria-hidden
                />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="home-projects-preview__viewport">
        <div className="home-projects-preview__track" style={trackStyle}>
          {safeItems.map((item) => {
            const card = getCardPayload(item, kind);
            return (
              <div key={card.key} className="home-projects-preview__slide">
                <Link href={card.href} className="home-project-card">
                  <div className="home-project-card__media">
                    <Image
                      src={card.image}
                      alt={`${card.title} card image`}
                      fill
                      sizes="(max-width: 576px) 88vw, (max-width: 991px) 42vw, 22vw"
                      className="home-project-card__image"
                    />
                    <span className="home-project-card__badge">{card.badge}</span>
                  </div>

                  <div className="home-project-card__body">
                    <h3 className="home-project-card__title">{card.title}</h3>
                    <p className="home-project-card__meta">{card.meta}</p>
                    <p className="home-project-card__location">{card.location}</p>
                    <p className="home-project-card__price">{card.price}</p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
