"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { buildProjectImageUrl } from "@/lib/projectImageUrl";
import { buildProjectDisplayName } from "@/lib/projectDisplayName";
import ProjectShortlistButton from "@/app/(home)/components/common/ProjectShortlistButton";
import "@/app/(home)/components/common/luxuryPropertyCard.css";
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

function formatCompactPrice(value) {
  if (value == null || value === "") return "On request";
  const strValue = String(value).trim();
  if (!strValue) return "On request";
  if (/request/i.test(strValue)) return "On request";
  const cleaned = strValue.replace(/\s*onwards\.?\s*/gi, "").replace(/\*/g, "").trim();
  if (/cr|lakh|lac|\bl\b/i.test(cleaned) && /[a-zA-Z]/.test(cleaned)) {
    return cleaned.startsWith("₹") ? cleaned : `₹ ${cleaned}`;
  }
  const numericValue = Number.parseFloat(cleaned.replace(/,/g, ""));
  if (!Number.isFinite(numericValue) || numericValue <= 0) return "On request";
  if (numericValue < 1) return `₹ ${Math.round(numericValue * 100)} L`;
  const pretty = Number.isInteger(numericValue)
    ? String(numericValue)
    : numericValue.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return `₹ ${pretty} Cr`;
}

function formatPriceParts(value) {
  const amount = formatCompactPrice(value);
  return {
    amount,
    onwards: amount !== "On request",
  };
}

function getBadgeLabel(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (/new\s*launch/i.test(value)) return "New Launch";
  if (/ready/i.test(value)) return "Ready To Move";
  if (/under\s*construction/i.test(value)) return "Under Construction";
  return value;
}

function getBadgeTone(badge) {
  if (/ready/i.test(badge)) return "ready";
  if (/under\s*construction/i.test(badge)) return "construction";
  if (/new\s*launch/i.test(badge)) return "launch";
  return "default";
}

function getProjectHref(project) {
  const slug = project?.slugURL || project?.slugUrl;
  return slug ? `/${slug}` : "/projects";
}

function getProjectImage(project) {
  return buildProjectImageUrl(project, { preferThumbnail: true });
}

function getLocationChip(source, kind) {
  if (kind === "property") {
    return cleanMetaText(
      source?.location || source?.locality || source?.cityName,
      "Location on listing",
    );
  }
  const locality = cleanMetaText(source?.projectLocality);
  const city = cleanMetaText(source?.cityName);
  const parts = [locality, city].filter(Boolean);
  return parts.length ? parts.join(", ") : "Location on project page";
}

function formatConfigChip(config, propertyType) {
  const raw = String(config || "").trim();
  const type = String(propertyType || "").trim();
  const blob = `${raw} ${type}`;
  const typeWord = /plot|land/i.test(blob)
    ? "Plots"
    : /villa/i.test(blob)
      ? "Villas"
      : /commercial|office|shop|retail|sco/i.test(blob)
        ? "Units"
        : "Apartments";
  const bhks = [...raw.matchAll(/(\d+)\s*BHK/gi)].map((match) => match[1]);
  const unique = [...new Set(bhks)];
  if (unique.length === 1) return `${unique[0]} BHK ${typeWord}`;
  if (unique.length === 2) return `${unique[0]} & ${unique[1]} BHK ${typeWord}`;
  if (unique.length > 2) {
    return `${unique[0]} & ${unique[unique.length - 1]} BHK ${typeWord}`;
  }
  if (raw) return raw.split(",")[0].trim();
  return type;
}

function getLifestyleChip(source, kind) {
  const type = String(
    source?.propertyTypeName || source?.propertyTypeCategory || "",
  ).toLowerCase();
  const name = String(source?.projectName || source?.title || "").toLowerCase();
  const status = String(source?.projectStatusName || "").toLowerCase();
  const blob = `${type} ${name}`;
  if (/luxury|ultra/.test(blob)) return "Luxury Residences";
  if (/plot|land/.test(blob)) return "Premium Plots";
  if (/commercial|office|retail/.test(blob)) return "Modern Workspaces";
  if (/ready/.test(status)) return "Premium Residences";
  if (/under.?construction|new.?launch/.test(status)) return "Green Community";
  if (kind === "property") return "Verified Listing";
  return "Premium Residences";
}

function getProjectLocation(project) {
  return (
    project?.projectAddress ||
    [project?.cityName, project?.stateName].filter(Boolean).join(", ") ||
    "Location details available on project page"
  );
}

function getPropertyImage(property) {
  const rawImage =
    typeof property?.image === "string" ? property.image.trim() : "";
  if (!rawImage) return "/static/no_image.png";
  if (rawImage.startsWith("http://") || rawImage.startsWith("https://"))
    return rawImage;
  if (rawImage.startsWith("/")) return rawImage;

  const propertyListingMatch = rawImage.match(
    /^property-listings\/([^/]+)\/(.+)$/,
  );
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
  if (
    kind === "mixed" &&
    (item?.itemKind === "property" || item?.itemKind === "project")
  ) {
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
    const category = cleanMetaText(
      source?.propertyTypeCategory || source?.listingType || source?.subType,
    );
    const badge = getBadgeLabel(
      cleanMetaText(source?.constructionStatus) ||
        cleanMetaText(source?.listingType),
    );
    const price = formatPriceParts(source?.price);
    return {
      key: source?.id || source?.slug || source?.title,
      href: source?.slug ? `/properties/${source.slug}` : "/properties",
      image: getPropertyImage(source),
      badge,
      badgeTone: getBadgeTone(badge),
      title: cardTitle,
      propertyType: category,
      meta: formatConfigChip(
        [source?.bedroom, source?.propertyTypeCategory || source?.subType]
          .filter(Boolean)
          .join(" "),
        category,
      ),
      lifestyle: getLifestyleChip(source, "property"),
      location: source?.location || "Location not specified",
      place: getLocationChip(source, "property"),
      price: price.amount,
      onwards: price.onwards,
      builder: cleanMetaText(source?.builderName),
      shortlist: {
        id: source?.id,
        slugURL: source?.slug,
        projectName: cardTitle,
      },
    };
  }

  const cardTitle = buildProjectDisplayName(
    { ...source, projectName: cleanMetaText(source?.projectName, "Project") },
    "Project",
  );
  const badge = getBadgeLabel(
    typeof source?.projectStatusName === "string"
      ? source.projectStatusName.trim()
      : "",
  );
  const propertyType = cleanMetaText(source?.propertyTypeName);
  const price = formatPriceParts(source?.projectPrice);
  return {
    key: source?.slugURL || source?.slugUrl || source?.projectName,
    href: getProjectHref(source),
    image: getProjectImage(source),
    badge,
    badgeTone: getBadgeTone(badge),
    title: cardTitle,
    propertyType,
    meta: formatConfigChip(
      typeof source?.projectConfiguration === "string"
        ? source.projectConfiguration.trim()
        : "",
      propertyType,
    ),
    lifestyle: getLifestyleChip(source, "project"),
    location: getProjectLocation(source),
    place: getLocationChip(source, "project"),
    price: price.amount,
    onwards: price.onwards,
    builder: cleanMetaText(source?.builderName),
    shortlist: {
      id: source?.id,
      slugURL: source?.slugURL || source?.slugUrl,
      projectName: cardTitle,
    },
  };
}

const TILE_WIDTH = 248;
const TILE_GAP = 18;
const TILE_IMAGE_HEIGHT = 168;

function tilesThatFit(width) {
  if (!width || width < TILE_WIDTH) return 1;
  return Math.max(1, Math.floor((width + TILE_GAP) / (TILE_WIDTH + TILE_GAP)));
}

const FEW_ITEMS_THRESHOLD = 4;

function getViewAllLabel(cityName, kind) {
  const noun = kind === "property" ? "Properties" : "Projects";
  return cityName ? `View All ${noun} in ${cityName}` : `View All ${noun}`;
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21.5s7.25-6.4 7.25-12.05A7.25 7.25 0 0 0 4.75 9.45C4.75 15.1 12 21.5 12 21.5Z"
        fill="currentColor"
      />
      <circle cx="12" cy="9.4" r="2.55" fill="#fff" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20V8l8-4 8 4v12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9 20v-6h6v6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.6 5.2L19 10l-5.4 1.8L12 17l-1.6-5.2L5 10l5.4-1.8L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SectionLoader({ cityName, overlay = false }) {
  return (
    <div
      className={`home-projects-preview__loading${overlay ? " home-projects-preview__loading--overlay" : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="home-projects-preview__spinner" aria-hidden="true" />
      <span className="home-projects-preview__loading-text">
        {cityName
          ? `Loading properties in ${cityName}…`
          : "Loading properties…"}
      </span>
    </div>
  );
}

export default function HomeRecommendationCards({
  title,
  subtitle,
  items,
  kind,
  viewAllHref,
  className = "",
  emptyMessage = "",
  loading = false,
  cityName = "",
  cityHref = "",
  eagerImageCount = 0,
}) {
  const safeItems = useMemo(
    () => (Array.isArray(items) ? items.slice(0, 10) : []),
    [items],
  );
  const [visibleCount, setVisibleCount] = useState(4);
  const [startIndex, setStartIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const viewportRef = useRef(null);
  const dragStartRef = useRef({ x: 0, pointerId: null });
  const hasDraggedRef = useRef(false);
  const scrollPxRef = useRef(0);
  const wheelSnapTimerRef = useRef(null);

  const tileStep = TILE_WIDTH + TILE_GAP;
  const maxStartIndex = Math.max(0, safeItems.length - visibleCount);
  const canSlide = safeItems.length > visibleCount;
  const trackStyle = {
    transform: `translateX(-${startIndex * tileStep - dragOffset}px)`,
    transition: isDragging ? "none" : undefined,
    "--preview-visible": visibleCount,
    "--tile-width": `${TILE_WIDTH}px`,
    "--tile-gap": `${TILE_GAP}px`,
  };

  useEffect(() => {
    setStartIndex(0);
    setDragOffset(0);
    setIsDragging(false);
  }, [items, kind, title]);

  useEffect(() => {
    const el = viewportRef.current;
    const update = () => {
      const width = el?.clientWidth || window.innerWidth - 360;
      setVisibleCount(tilesThatFit(width));
    };
    update();
    const ro =
      el && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(update)
        : null;
    if (el && ro) ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      ro?.disconnect();
    };
  }, [safeItems.length]);

  useEffect(() => {
    setStartIndex((prev) => Math.min(prev, maxStartIndex));
  }, [maxStartIndex]);

  useEffect(() => {
    if (!isDragging) {
      scrollPxRef.current = startIndex * tileStep;
    }
  }, [isDragging, startIndex, tileStep]);

  const scrollRailBy = useCallback((direction) => {
    const viewport = viewportRef.current;
    if (!viewport || viewport.scrollWidth <= viewport.clientWidth + 1)
      return false;

    const slide = viewport.querySelector(".home-projects-preview__slide");
    const step = slide?.getBoundingClientRect().width || viewport.clientWidth;
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const target = viewport.scrollLeft + direction * step;

    viewport.scrollTo({
      left:
        direction > 0
          ? target > maxScroll - 1
            ? 0
            : target
          : target < 1
            ? maxScroll
            : target,
      behavior: "smooth",
    });
    return true;
  }, []);

  const handlePrev = () => {
    if (canSlide) {
      setStartIndex((prev) => (prev <= 0 ? maxStartIndex : prev - 1));
      return;
    }
    scrollRailBy(-1);
  };

  const handleNext = () => {
    if (canSlide) {
      setStartIndex((prev) => (prev >= maxStartIndex ? 0 : prev + 1));
      return;
    }
    scrollRailBy(1);
  };

  const finishDrag = useCallback(
    (clientX) => {
      const delta = clientX - dragStartRef.current.x;
      const nextPx = Math.max(
        0,
        Math.min(maxStartIndex * tileStep, startIndex * tileStep - delta),
      );
      const nextIndex = Math.round(nextPx / tileStep);
      scrollPxRef.current = nextIndex * tileStep;
      setStartIndex(nextIndex);
      setDragOffset(0);
      setIsDragging(false);
      dragStartRef.current.pointerId = null;
    },
    [maxStartIndex, startIndex, tileStep],
  );

  const handleViewportPointerDown = (event) => {
    if (!canSlide || loading) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    hasDraggedRef.current = false;
    dragStartRef.current = { x: event.clientX, pointerId: event.pointerId };
    setIsDragging(true);
    setDragOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleViewportPointerMove = (event) => {
    if (!isDragging || dragStartRef.current.pointerId !== event.pointerId) return;

    const delta = event.clientX - dragStartRef.current.x;
    if (Math.abs(delta) > 6) {
      hasDraggedRef.current = true;
    }
    setDragOffset(delta);
  };

  const handleViewportPointerUp = (event) => {
    if (!isDragging || dragStartRef.current.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishDrag(event.clientX);
  };

  const handleViewportPointerCancel = (event) => {
    if (!isDragging || dragStartRef.current.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragOffset(0);
    setIsDragging(false);
    dragStartRef.current.pointerId = null;
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const preventMisclick = (event) => {
      if (!hasDraggedRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      hasDraggedRef.current = false;
    };

    viewport.addEventListener("click", preventMisclick, true);
    return () => viewport.removeEventListener("click", preventMisclick, true);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !canSlide || loading) return undefined;

    const getWheelDelta = (event) => {
      const { deltaX, deltaY, shiftKey } = event;
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 0.5) {
        return deltaX;
      }
      if (shiftKey && Math.abs(deltaY) > 0.5) {
        return deltaY;
      }
      return 0;
    };

    const applyScrollPx = (px, snap) => {
      const maxPx = maxStartIndex * tileStep;
      const clamped = Math.max(0, Math.min(maxPx, px));
      scrollPxRef.current = clamped;

      if (snap) {
        const nextIndex = Math.round(clamped / tileStep);
        const snappedPx = nextIndex * tileStep;
        scrollPxRef.current = snappedPx;
        setStartIndex(nextIndex);
        setDragOffset(0);
        return;
      }

      const baseIndex = Math.min(maxStartIndex, Math.floor(clamped / tileStep));
      setStartIndex(baseIndex);
      setDragOffset(baseIndex * tileStep - clamped);
    };

    const scheduleSnap = () => {
      clearTimeout(wheelSnapTimerRef.current);
      wheelSnapTimerRef.current = setTimeout(() => {
        applyScrollPx(scrollPxRef.current, true);
      }, 120);
    };

    const onWheel = (event) => {
      const delta = getWheelDelta(event);
      if (!delta) return;

      event.preventDefault();
      applyScrollPx(scrollPxRef.current + delta, false);
      scheduleSnap();
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      viewport.removeEventListener("wheel", onWheel);
      clearTimeout(wheelSnapTimerRef.current);
    };
  }, [canSlide, loading, maxStartIndex, tileStep]);

  const showViewMore = Boolean(
    cityHref && !loading && safeItems.length < FEW_ITEMS_THRESHOLD,
  );
  const viewMoreHref = cityHref || viewAllHref;
  const viewMoreLabel = getViewAllLabel(cityName, kind);
  const sectionClass =
    `container home-projects-preview home-projects-preview--tiles home-projects-preview--showcase ${className}`.trim();

  const renderNav = () =>
    canSlide ? (
      <div
        className="home-projects-preview__nav"
        aria-label={`${title} navigation`}
      >
        <button
          type="button"
          className="home-projects-preview__nav-btn"
          onClick={handlePrev}
          aria-label={`Show previous ${kind === "property" ? "properties" : "items"}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className="home-projects-preview__nav-btn"
          onClick={handleNext}
          aria-label={`Show next ${kind === "property" ? "properties" : "items"}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    ) : null;

  const renderHead = () => (
    <div className="home-projects-preview__head">
      <div className="home-projects-preview__intro">
        <p className="home-projects-preview__kicker">Featured</p>
        <h2 className="home-projects-preview__title">{title}</h2>
        {subtitle ? (
          <p className="home-projects-preview__sub">{subtitle}</p>
        ) : null}
      </div>
      <div className="home-projects-preview__toolbar">
        {renderNav()}
      </div>
    </div>
  );

  const renderViewMoreLink = (className = "") =>
    viewMoreHref ? (
      <Link
        href={viewMoreHref}
        className={`home-projects-preview__view-all home-projects-preview__view-more ${className}`.trim()}
        title={viewMoreLabel}
      >
        {viewMoreLabel}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    ) : null;

  const renderViewMoreCard = () =>
    showViewMore && viewMoreHref ? (
      <div className="home-projects-preview__slide home-projects-preview__slide--more">
        <Link
          href={viewMoreHref}
          className="home-projects-preview__more-card"
          title={viewMoreLabel}
        >
          <span
            className="home-projects-preview__more-card-icon"
            aria-hidden="true"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="home-projects-preview__more-card-label">
            {viewMoreLabel}
          </span>
        </Link>
      </div>
    ) : null;

  const renderCard = (item, idx) => {
    const card = getCardPayload(item, kind);
    const cardImageMeta = `${card.title} — real estate listing card image on My Property Fact`;
    const cardLinkTitle = card.title
      ? `View ${card.title} on My Property Fact`
      : "View project on My Property Fact";
    const rowKey =
      kind === "mixed"
        ? `${effectiveCardKind(item, kind)}-${card.key ?? idx}`
        : (card.key ?? idx);
    return (
      <div key={rowKey} className="home-projects-preview__slide">
        <article className="home-project-card home-project-card--tile home-project-card--showcase">
          <Link
            href={card.href}
            className="home-project-card__hit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              card.title
                ? `View details about ${card.title}`
                : "View project details"
            }
            title={cardLinkTitle}
          />
          <div className="home-project-card__media">
            <img
              src={card.image}
              alt={cardImageMeta}
              title={cardImageMeta}
              className="home-project-card__image"
              width={TILE_WIDTH}
              height={TILE_IMAGE_HEIGHT}
              loading={idx < eagerImageCount ? "eager" : "lazy"}
              fetchPriority={idx === 0 && eagerImageCount > 0 ? "high" : "low"}
              decoding="async"
            />
            {card.badge ? (
              <span
                className={`home-project-card__chip home-project-card__chip--${card.badgeTone}`}
              >
                {card.badge}
              </span>
            ) : null}
          </div>
          <span className="home-project-card__loc">
            <span className="home-project-card__loc-icon" aria-hidden="true">
              <PinIcon />
            </span>
            <span className="home-project-card__loc-text">{card.place}</span>
          </span>
          <div className="home-project-card__body">
            <div className="home-project-card__title-row">
              <h3 className="home-project-card__title">{card.title}</h3>
              <p className="home-project-card__price">
                <strong>{card.price}</strong>
                {card.onwards ? <span>Onwards</span> : null}
              </p>
            </div>
            {card.builder ? (
              <p className="home-project-card__by">By {card.builder}</p>
            ) : null}
            <div className="home-project-card__facts">
              {card.meta ? (
                <span className="home-project-card__fact">
                  <BuildingIcon />
                  {card.meta}
                </span>
              ) : null}
              {card.lifestyle ? (
                <span className="home-project-card__fact">
                  <SparkIcon />
                  {card.lifestyle}
                </span>
              ) : null}
            </div>
            <div className="home-project-card__foot">
              <span className="home-project-card__view">View Details</span>
              <span className="home-project-card__go" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
          <ProjectShortlistButton
            project={card.shortlist}
            className="home-project-card__save"
          />
        </article>
      </div>
    );
  };

  if (!safeItems.length) {
    if (loading) {
      return (
        <section
          className={sectionClass}
          aria-label={title}
          aria-busy="true"
        >
          {renderHead()}
          <SectionLoader cityName={cityName} />
        </section>
      );
    }
    if (!emptyMessage && !showViewMore) return null;
    return (
      <section className={sectionClass} aria-label={title}>
        {renderHead()}
        {emptyMessage ? (
          <p className="home-projects-preview__sub">{emptyMessage}</p>
        ) : null}
        {showViewMore ? (
          <div className="home-projects-preview__actions home-projects-preview__actions--end">
            {renderViewMoreLink()}
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section
      className={sectionClass}
      aria-label={title}
      aria-busy={loading || undefined}
    >
      {renderHead()}

      <div className="home-projects-preview__stage">
        {loading ? <SectionLoader cityName={cityName} overlay /> : null}
        <div
          className={`home-projects-preview__viewport${loading ? " is-loading" : ""}${canSlide ? " is-draggable" : ""}${isDragging ? " is-dragging" : ""}`}
          ref={viewportRef}
          onPointerDown={handleViewportPointerDown}
          onPointerMove={handleViewportPointerMove}
          onPointerUp={handleViewportPointerUp}
          onPointerCancel={handleViewportPointerCancel}
        >
          <div
            className={`home-projects-preview__track${showViewMore ? " is-compact" : ""}`}
            style={trackStyle}
          >
            {safeItems.map(renderCard)}
            {renderViewMoreCard()}
          </div>
        </div>
      </div>

      {!loading && viewMoreHref ? (
        <div className="home-projects-preview__actions home-projects-preview__actions--center">
          {renderViewMoreLink()}
        </div>
      ) : null}
    </section>
  );
}
