"use client";
import "../home/featured/featured.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useState } from "react";
import {
  buildProjectImageUrl,
  DEFAULT_PROJECT_CARD_IMAGE,
  getProjectImageBaseUrl,
} from "@/lib/projectImageUrl";
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
      backgroundColor: "#FF5800",
      textColor: "#ffffff",
    };

    if (!status) {
      return defaultStyle;
    }


    const colorMap = {
      "new launched": { backgroundColor: "#35A332", textColor: "#fff" },
      "new launch": { backgroundColor: "#EC191C", textColor: "#1f2937" },
      "ultra luxury": { backgroundColor: "#CC9848", textColor: "#ffffff" },
      luxury: { backgroundColor: "#d32f2f", textColor: "#ffffff" },
      "ready to move": { backgroundColor: "#c1e3e9", textColor: "#0c3d48" },
      completed: { backgroundColor: "#c1e3e9", textColor: "#0c3d48" },
      "under construction": { backgroundColor: "#e9e2ef", textColor: "#3d2f52" },
      "possession soon": { backgroundColor: "#2563eb", textColor: "#ffffff" },
      affordable: { backgroundColor: "#22c55e", textColor: "#ffffff" },
    };

    const normalized = status.trim().toLowerCase();
    return colorMap[normalized] || defaultStyle;
  };

  const addressSummary = formatProjectAddress(data.projectAddress);

  const buildProjectLogoUrl = () => {
    const imageBase = getProjectImageBaseUrl();
    const slug = data.slugURL;
    const logo = data.projectLogo;

    if (!logo) return "/logo.webp";
    if (/^https?:\/\//i.test(logo) || logo.startsWith("/")) return logo;
    if (!imageBase || !slug) return "/logo.webp";
    return `${imageBase}properties/${slug}/${logo}`;
  };

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
              ? `home-featured-project-tag plus-jakarta-sans-semi-bold${
                  pillBadgeModifier ? ` ${pillBadgeModifier}` : ""
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
    const logoAlt = data.builderName
      ? `${data.builderName} — builder logo`
      : `${data.projectName} — project logo`;

    return (
      <Link
        href={`/${data.slugURL}`}
        className="home-featured-project-card text-decoration-none text-dark"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View details about ${data.projectName}`}
        title={data.projectName ? `View ${data.projectName}` : "View project details"}
      >
        <div className="home-featured-image-card">
          <img
            src={imageSrc}
            alt={projectCardImageAlt}
            title={projectCardImageAlt}
            className="home-featured-image"
            width={510}
            height={232}
            loading={imagePriority ? "eager" : "lazy"}
            fetchPriority="auto"
            decoding="async"
            onError={() => setImageError(true)}
          />
        </div>

        <div className="home-featured-builder-card">
          {renderStatusBadge()}
          <div
            className={`home-featured-builder-logo${
              data.slugURL === "eldeco-whispers-of-wonder"
                ? " home-featured-builder-logo--whispers"
                : ""
            }`}
          >
            <img
              src={buildProjectLogoUrl()}
              alt={logoAlt}
              title={logoAlt}
              width={
                data.slugURL === "eldeco-whispers-of-wonder" ? 84 : 72
              }
              height={
                data.slugURL === "eldeco-whispers-of-wonder" ? 72 : 72
              }
              loading="lazy"
            />
          </div>
          <div className="home-featured-builder-info">
            <h3 className="home-featured-builder-name plus-jakarta-sans-semi-bold">
              {data.projectName}
            </h3>
            <p className="home-featured-builder-meta plus-jakarta-sans-semi-bold">
              {buildFeaturedSubtitle()}
            </p>
            <p className="home-featured-builder-price plus-jakarta-sans-semi-bold">
              {generatePrice(data.projectPrice)}
            </p>
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
        aria-label={`View details about ${data.projectName}`}
        title={data.projectName ? `View ${data.projectName}` : "View project details"}
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
          <h3 className="mb-2 h5 plus-jakarta-sans-semi-bold">{data.projectName}</h3>
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
