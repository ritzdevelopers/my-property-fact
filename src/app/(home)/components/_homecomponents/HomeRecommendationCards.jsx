"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buildProjectImageUrl } from "@/lib/projectImageUrl";
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

function getCardPayload(item, kind) {
  const k = effectiveCardKind(item, kind);
  const source = stripItemKind(item, kind);

  if (k === "property") {
    const cardTitle = cleanMetaText(source?.title, "Property");
    return {
      key: source?.id || source?.slug || source?.title,
      href: source?.slug ? `/properties/${source.slug}` : "/properties",
      image: getPropertyImage(source),
      badge:
        cleanMetaText(source?.constructionStatus) ||
        cleanMetaText(source?.listingType) ||
        "Property",
      title: cardTitle,
      meta:
        [source?.bedroom, source?.propertyTypeCategory || source?.subType]
          .filter(Boolean)
          .join(" ") || "Property details available on listing page",
      location: source?.location || "Location not specified",
      price: source?.price || "Price on request",
    };
  }

  const cardTitle = cleanMetaText(source?.projectName, "Project");
  return {
    key: source?.slugURL || source?.slugUrl || source?.projectName,
    href: getProjectHref(source),
    image: getProjectImage(source),
    badge:
      (typeof source?.projectStatusName === "string" && source.projectStatusName.trim()) ||
      "Project",
    title: cardTitle,
    meta:
      (typeof source?.projectConfiguration === "string" && source.projectConfiguration.trim()) ||
      "Explore configurations on project page",
    location: getProjectLocation(source),
    price: formatProjectPrice(source?.projectPrice),
  };
}

function getVisibleCount(viewportWidth) {
  if (viewportWidth <= 576) return 2;
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
    () => (Array.isArray(items) ? items.slice(0, 8) : []),
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
      </div>

      <div className="home-projects-preview__viewport">
        <div className="home-projects-preview__track" style={trackStyle}>
          {safeItems.map((item, idx) => {
            const card = getCardPayload(item, kind);
            const rowKey =
              kind === "mixed"
                ? `${effectiveCardKind(item, kind)}-${card.key ?? idx}`
                : card.key ?? idx;
            return (
              <div key={rowKey} className="home-projects-preview__slide">
                <Link
                  href={card.href}
                  className="home-project-card"
                  title={card.title ? `View ${card.title}` : "View project details"}
                >
                  <div className="home-project-card__media">
                    {/** Keep title/alt explicit for SEO audits; avoid "/" placeholders. */}
                    <img
                      src={card.image}
                      alt={`${card.title} — real estate listing card image on My Property Fact`}
                      title={`${card.title} — real estate listing card image on My Property Fact`}
                      className="home-project-card__image"
                      loading="lazy"
                      decoding="async"
                     style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
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
