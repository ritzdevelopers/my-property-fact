"use client";
import "../home/featured/featured.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useState } from "react";
import ProjectStatusRibbon from "./ProjectStatusRibbon";
import {
  buildProjectImageUrl,
  DEFAULT_PROJECT_CARD_IMAGE,
} from "@/lib/projectImageUrl";
import { buildProjectDisplayName } from "@/lib/projectDisplayName";
import "./common.css";

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
  const propertyTypeTag = (() => {
    const normalized = String(data.propertyTypeName || "").toLowerCase().trim();
    if (!normalized) return null;
    const isCommercial = normalized.includes("commercial");
    return {
      label: isCommercial ? "Commercial" : "Residential",
      className: isCommercial ? "mpf-type-tag--commercial" : "mpf-type-tag--residential",
    };
  })();

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

  if (layoutVariant === "overlap") {
    return (
      <Link
        href={`/${data.slugURL}`}
        className="home-featured-project-card text-decoration-none"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View details about ${projectTitle}`}
      >
        <div className="home-featured-image-card">
          <img
            src={imageSrc}
            alt={projectCardImageAlt}
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
            {propertyTypeTag ? (
              <span className={`mpf-type-tag ${propertyTypeTag.className}`}>
                {propertyTypeTag.label}
              </span>
            ) : null}
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
        className="home-project-card home-project-card--poster home-featured-poster-card"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View details about ${projectTitle}`}
      >
        <div className="home-project-card__media">
          <img
            src={imageSrc}
            alt={projectCardImageAlt}
            className="home-project-card__image"
            width={400}
            height={360}
            loading={imagePriority ? "eager" : "lazy"}
            fetchPriority="auto"
            decoding="async"
            onError={() => setImageError(true)}
          />
          <ProjectStatusRibbon
            status={data.projectStatusName}
            className="mpf-status-ribbon--compact"
          />
        </div>

        <div className="home-project-card__overlay">
          <div className="home-project-card__overlay-top">
            <p className="home-project-card__price">{generatePrice(data.projectPrice)}</p>
            <span className="home-project-card__cta">
              Explore
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <div className="home-project-card__title-row">
            <h3 className="home-project-card__title">{projectTitle}</h3>
            {propertyTypeTag ? (
              <span className={`mpf-type-tag ${propertyTypeTag.className}`}>
                {propertyTypeTag.label}
              </span>
            ) : null}
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
      >
        <div className="w-100 project-image-container">
          <img
            src={imageSrc}
            alt={projectCardImageAlt}
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
            {propertyTypeTag ? (
              <span className={`mpf-type-tag ${propertyTypeTag.className}`}>
                {propertyTypeTag.label}
              </span>
            ) : null}
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
