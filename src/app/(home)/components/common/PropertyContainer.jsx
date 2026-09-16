"use client";
import "../home/featured/featured.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useState } from "react";
import ProjectStatusRibbon from "./ProjectStatusRibbon";
import PropertyTypeTag from "./PropertyTypeTag";
import LuxuryPricePlaque from "./LuxuryPricePlaque";
import "./luxuryPropertyCard.css";
import {
  buildProjectImageUrl,
  DEFAULT_PROJECT_CARD_IMAGE,
} from "@/lib/projectImageUrl";
import { buildProjectDisplayName } from "@/lib/projectDisplayName";
import ProjectShortlistButton from "./ProjectShortlistButton";
import "./common.css";
import "./propertyContainerTablet.css";

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
  if (unique.length > 2) return `${unique[0]} & ${unique[unique.length - 1]} BHK ${typeWord}`;
  if (raw) return raw.split(",")[0].trim();
  return type;
}

function getLifestyleChip(data) {
  const type = String(data?.propertyTypeName || "").toLowerCase();
  const name = String(data?.projectName || "").toLowerCase();
  const status = String(data?.projectStatusName || "").toLowerCase();
  const blob = `${type} ${name}`;
  if (/luxury|ultra/.test(blob)) return "Luxury Residences";
  if (/plot|land/.test(blob)) return "Premium Plots";
  if (/commercial|office|retail/.test(blob)) return "Modern Workspaces";
  if (/ready/.test(status)) return "Premium Residences";
  if (/under.?construction|new.?launch/.test(status)) return "Green Community";
  return "Premium Residences";
}

function getLocationChip(data) {
  const locality = cleanMetaText(data?.projectLocality);
  const city = cleanMetaText(data?.cityName);
  const parts = [locality, city].filter(Boolean);
  return parts.length ? parts.join(", ") : "Location on project page";
}

export default function PropertyContainer({
  data,
  badgeVariant = "default",
  layoutVariant = "default",
  imagePriority = false,
}) {
  const [imageError, setImageError] = useState(false);

  // Ensure data is defined before accessing its properties
  if (!data) {
    return <div>Loading...</div>; // or any fallback content
  }

  const hasProjectImage =
    Boolean(data.projectThumbnailImage || data.projectBannerImage) && !imageError;

  const imageSrc = hasProjectImage
    ? buildProjectImageUrl(data, { preferThumbnail: true })
    : DEFAULT_PROJECT_CARD_IMAGE;

  const formatProjectAddress = (address) => {
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
  };

  //Generating price in lakh & cr
  const generatePrice = (price) => {
    if (/[a-zA-Z]/.test(price)) {
      return price;
    }
    return price < 1
      ? "₹ " + Math.round(parseFloat(price) * 100) + " Lakh* Onwards"
      : "₹ " + parseFloat(price) + " Cr* Onwards";
  };

  const getFeaturedBadgeStyle = (status) => {
    const defaultStyle = {
      backgroundColor: "#EA580C",
      textColor: "#FFF7ED",
    };

    if (!status) {
      return defaultStyle;
    }

    const colorMap = {
      "new launched": { backgroundColor: "#EA580C", textColor: "#FFF7ED" },
      "new launch": { backgroundColor: "#EA580C", textColor: "#FFF7ED" },
      "ultra luxury": { backgroundColor: "#B45309", textColor: "#FFFBEB" },
      luxury: { backgroundColor: "#B45309", textColor: "#FFFBEB" },
      "ready to move": { backgroundColor: "#0891B2", textColor: "#ECFEFF" },
      completed: { backgroundColor: "#0891B2", textColor: "#ECFEFF" },
      "under construction": { backgroundColor: "#7C3AED", textColor: "#F5F3FF" },
      "possession soon": { backgroundColor: "#2563EB", textColor: "#EFF6FF" },
      affordable: { backgroundColor: "#0F766E", textColor: "#F0FDFA" },
    };

    const normalized = status.trim().toLowerCase();
    return colorMap[normalized] || defaultStyle;
  };

  const addressSummary = formatProjectAddress(data.projectAddress);
  const projectTitle = buildProjectDisplayName(data, "Project");
  const propertyTypeName = String(data.propertyTypeName || "").trim();
  const projectLinkTitle = `View ${projectTitle} on My Property Fact`;

  const buildFeaturedSubtitle = () => {
    const config = String(data.projectConfiguration || "").trim();
    if (config) return config;
    return addressSummary;
  };

  const projectCardImageAlt =
    data.projectName
      ? `${data.projectName} — ${data.propertyTypeName || "real estate project"} thumbnail${addressSummary ? `, ${addressSummary}` : ""}`
      : "Real estate project thumbnail — My Property Fact";

  const getFeaturedPillBadgeModifier = (status) => {
    const normalized = status?.trim().toLowerCase();
    if (normalized === "new launched" || normalized === "new launch") {
      return "home-featured-project-tag--new-launched";
    }
    if (normalized === "ultra luxury") {
      return "home-featured-project-tag--ultra-luxury";
    }
    return "";
  };

  const renderStatusBadge = () => {
    if (!data.projectStatusName) {
      return null;
    }

    if (badgeVariant === "home-featured") {
      const { backgroundColor, textColor } = getFeaturedBadgeStyle(data.projectStatusName);
      const pillBadgeModifier =
        layoutVariant === "overlap"
          ? getFeaturedPillBadgeModifier(data.projectStatusName)
          : "";
      const usePillStyles = layoutVariant === "overlap" && Boolean(pillBadgeModifier);

      return (
        <div
          className={
            layoutVariant === "overlap"
              ? `home-featured-project-tag plus-jakarta-sans-semi-bold${pillBadgeModifier ? ` ${pillBadgeModifier}` : ""
              }`
              : "home-featured-status-badge plus-jakarta-sans-semi-bold"
          }
          style={
            usePillStyles
              ? undefined
              : {
                "--badge-color": backgroundColor,
                "--badge-text-color": textColor,
              }
          }
        >
          {data.projectStatusName}
        </div>
      );
    }

    const { backgroundColor, textColor } = getFeaturedBadgeStyle(data.projectStatusName);

    return (
      <div className="position-absolute top-0 end-0 status-badge-container">
        <span
          className="status-badge-pill plus-jakarta-sans-semi-bold"
          style={{
            "--badge-color": backgroundColor,
            "--badge-text-color": textColor,
          }}
        >
          {data.projectStatusName}
        </span>
      </div>
    );
  };

  if (layoutVariant === "showcase") {
    const badge = getBadgeLabel(data.projectStatusName);
    const price = formatCompactPrice(data.projectPrice);
    const onwards = price !== "On request";
    const meta = formatConfigChip(data.projectConfiguration, propertyTypeName);
    const lifestyle = getLifestyleChip(data);
    const place = getLocationChip(data);
    const builder = cleanMetaText(data.builderName);
    return (
      <article className="home-project-card home-project-card--tile home-project-card--showcase">
        <Link
          href={`/${data.slugURL}`}
          className="home-project-card__hit"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View details about ${projectTitle}`}
          title={projectLinkTitle}
        />
        <div className="home-project-card__media">
          <img
            src={imageSrc}
            alt={projectCardImageAlt}
            title={projectCardImageAlt}
            className="home-project-card__image"
            width={400}
            height={168}
            loading={imagePriority ? "eager" : "lazy"}
            fetchPriority={imagePriority ? "high" : "low"}
            decoding="async"
            onError={() => setImageError(true)}
          />
          {badge ? (
            <span className={`home-project-card__chip home-project-card__chip--${getBadgeTone(badge)}`}>
              {badge}
            </span>
          ) : null}
        </div>
        <span className="home-project-card__loc">
          <span className="home-project-card__loc-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21.5s7.25-6.4 7.25-12.05A7.25 7.25 0 0 0 4.75 9.45C4.75 15.1 12 21.5 12 21.5Z"
                fill="currentColor"
              />
              <circle cx="12" cy="9.4" r="2.55" fill="#fff" />
            </svg>
          </span>
          <span className="home-project-card__loc-text">{place}</span>
        </span>
        <div className="home-project-card__body">
          <div className="home-project-card__title-row">
            <h3 className="home-project-card__title">{projectTitle}</h3>
            <p className="home-project-card__price">
              <strong>{price}</strong>
              {onwards ? <span>Onwards</span> : null}
            </p>
          </div>
          {builder ? <p className="home-project-card__by">By {builder}</p> : null}
          <div className="home-project-card__facts">
            {meta ? (
              <span className="home-project-card__fact">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 20V8l8-4 8 4v12" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                </svg>
                {meta}
              </span>
            ) : null}
            {lifestyle ? (
              <span className="home-project-card__fact">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 3l1.6 5.2L19 10l-5.4 1.8L12 17l-1.6-5.2L5 10l5.4-1.8L12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
                {lifestyle}
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
          project={{
            id: data.id,
            slugURL: data.slugURL,
            projectName: projectTitle,
          }}
          className="home-project-card__save"
        />
      </article>
    );
  }

  if (layoutVariant === "overlap") {
    return (
      <Link
        href={`/${data.slugURL}`}
        className="home-featured-project-card text-decoration-none"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View details about ${projectTitle}`}
        title={projectLinkTitle}
      >
        <div className="home-featured-image-card">
          <img
            src={imageSrc}
            alt={projectCardImageAlt}
            title={projectCardImageAlt}
            className="home-featured-image"
            width={510}
            height={300}
            loading={imagePriority ? "eager" : "lazy"}
            decoding="async"
            onError={() => setImageError(true)}
          />

          {renderStatusBadge()}
        </div>

        <div className="home-featured-card-content">
          <div className="home-project-card__title-row">
            <h3 className="home-featured-builder-name">
              {projectTitle}
            </h3>
            <PropertyTypeTag type={propertyTypeName} />
          </div>

          {/* <div className="home-featured-location">
            <img
              src="/icon/map-pin.svg"
              alt=""
              width={14}
              height={14}
            />

            <span>{data.locationName}</span>
          </div> */}

          <div className="home-featured-builder-price">
            {generatePrice(data.projectPrice)}
          </div>

          <div className="home-featured-builder-meta">
            {buildFeaturedSubtitle()}
          </div>
        </div>
      </Link>
    );
  }

  // Home featured rails: cinematic poster cards (match Popular Projects)
  if (badgeVariant === "home-featured") {
    return (
      <Link
        href={`/${data.slugURL}`}
        className="home-project-card home-project-card--poster home-featured-poster-card mpf-lux-card mpf-lux-card--poster"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View details about ${projectTitle}`}
        title={projectLinkTitle}
      >
        <div className="home-project-card__media">
          <div className="home-project-card__image-wrap">
            <img
              src={imageSrc}
              alt={projectCardImageAlt}
              title={projectCardImageAlt}
              className="home-project-card__image"
              width={400}
              height={360}
              loading={imagePriority ? "eager" : "lazy"}
              fetchPriority={imagePriority ? "high" : "low"}
              decoding="async"
              draggable={false}
              onError={() => setImageError(true)}
            />
          </div>
          <LuxuryPricePlaque price={data.projectPrice} />
          <ProjectStatusRibbon
            status={data.projectStatusName}
            className="mpf-status-ribbon--compact mpf-status-ribbon--lux"
          />
        </div>

        <div className="home-project-card__overlay">
          <div className="home-project-card__title-row">
            <h3 className="home-project-card__title">{projectTitle}</h3>
            <PropertyTypeTag type={propertyTypeName} className="mpf-type-tag--lux" />
          </div>
          <p className="home-project-card__meta">
            {data.propertyTypeName || buildFeaturedSubtitle()}
          </p>
          <p className="home-project-card__location">
            <svg className="home-project-card__pin" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 22s7-7.2 7-12a7 7 0 10-14 0c0 4.8 7 12 7 12z" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <span>{addressSummary || "Location on project page"}</span>
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
    );
  }

  return (
    <>
      <Link
        href={`/${data.slugURL}`}
        className="rounded-4 custom-shadow d-flex flex-column justify-content-between bg-white text-decoration-none text-dark project-container overflow-hidden position-relative"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View details about ${projectTitle}`}
        title={projectLinkTitle}
      >
        <div className="w-100 project-image-container">
          <img
            src={imageSrc}
            alt={projectCardImageAlt}
            title={projectCardImageAlt}
            className="img-fluid w-100 rounded-top-4 object-fit-cover"
            width={400}
            height={230}
            loading={imagePriority ? "eager" : "lazy"}
            fetchPriority="auto"
            decoding="async"
            onError={() => setImageError(true)}
          />
        </div>
        {renderStatusBadge()}
        <div className="mt-3 ms-3">
          <div className="home-project-card__title-row mb-2">
            <h3 className="mb-0 h5 plus-jakarta-sans-semi-bold">{projectTitle}</h3>
            <PropertyTypeTag type={propertyTypeName} />
          </div>
          <p className="mb-2 plus-jakarta-sans-semi-bold project-property-type-text">{data.propertyTypeName}</p>
          <p className="text-success d-flex gap-2 mb-0">
            <span className="plus-jakarta-sans-semi-bold"> {generatePrice(data.projectPrice)}</span>
          </p>
        </div>

        <div className="ms-3 pb-3 text-truncate small fw-medium mt-2 d-flex align-items-center gap-2">
          <span className="flex-shrink-0">
            <FontAwesomeIcon icon={faLocationDot} style={{ color: "#35A332" }} />
          </span>
          <p className="p-0 m-0 plus-jakarta-sans-semi-bold">{addressSummary}</p>
        </div>
      </Link>
    </>
  );
}
