"use client";
import "../home/featured/featured.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import "./common.css";

export default function PropertyContainer({ data, badgeVariant = "default", imagePriority = false }) {
  const [imageError, setImageError] = useState(false);

  // Ensure data is defined before accessing its properties
  if (!data) {
    return <div>Loading...</div>; // or any fallback content
  }

  // Default image path - use generic floorplan or realestate background as fallback
  const DEFAULT_IMAGE = "/static/no_image.png";

  // Get image URL - use project banner image, fallback to thumbnail; default if missing or failed
  const bannerImage = data.projectBannerImage || data.projectThumbnailImage;
  const getImageSrc = () => {
    if (imageError || !bannerImage) {
      return DEFAULT_IMAGE;
    }
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}properties/${data.slugURL}/${bannerImage}`;
  };

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
      "ready to move": { backgroundColor: "#0f766e", textColor: "#ffffff" },
      "under construction": { backgroundColor: "#566BCA", textColor: "#fffffe" },
      "possession soon": { backgroundColor: "#2563eb", textColor: "#ffffff" },
      affordable: { backgroundColor: "#22c55e", textColor: "#ffffff" },
    };

    const normalized = status.trim().toLowerCase();
    return colorMap[normalized] || defaultStyle;
  };

  const renderStatusBadge = () => {
    if (!data.projectStatusName) {
      return null;
    }

    if (badgeVariant === "home-featured") {
      const { backgroundColor, textColor } = getFeaturedBadgeStyle(data.projectStatusName);

      return (
        <div
          className="home-featured-status-badge plus-jakarta-sans-semi-bold"
          style={{
            "--badge-color": backgroundColor,
            "--badge-text-color": textColor,
          }}
        >
          {data.projectStatusName}
        </div>
      );
    }

    const { backgroundColor, textColor } = getFeaturedBadgeStyle(data.projectStatusName);

    return (
      <div className="position-absolute top-0 end-0 m-2 status-badge-container">
        <span
          className="status-badge-pill plus-jakarta-sans-semi-bold"
          style={{
            backgroundColor,
            color: textColor,
          }}
        >
          {data.projectStatusName}
        </span>
      </div>
    );
  };
  return (
    <>
      <Link
        href={`/${data.slugURL}`}
        className="rounded-4 custom-shadow d-flex flex-column justify-content-between bg-white text-decoration-none text-dark project-container overflow-hidden position-relative"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View details about ${data.projectName}`}
      >
        <div className="w-100 project-image-container">
          <Image
            src={getImageSrc()}
            alt={data.projectName || "Project image"}
            className="img-fluid w-100 rounded-top-4 object-fit-cover"
            priority={imagePriority}
            width={400}
            height={400}
            onError={() => setImageError(true)}
            unoptimized={imageError || !bannerImage}
          />
        </div>
        {renderStatusBadge()}
        <div className="mt-3 ms-3">
          <h5 className="mb-2 plus-jakarta-sans-semi-bold">{data.projectName}</h5>
          <p className="mb-2 plus-jakarta-sans-semi-bold project-property-type-text">{data.propertyTypeName}</p>
          <h5 className="text-success d-flex gap-2 mb-0">
            <span className="plus-jakarta-sans-semi-bold"> {generatePrice(data.projectPrice)}</span>
          </h5>
        </div>

        <div className="ms-3 pb-3 text-truncate small fw-medium mt-2 d-flex align-items-center gap-2">
          <span className="flex-shrink-0">
            <FontAwesomeIcon icon={faLocationDot} style={{ color: "#35A332" }} />
          </span>
          <p className="p-0 m-0 plus-jakarta-sans-semi-bold">{formatProjectAddress(data.projectAddress)}</p>
        </div>
      </Link>
    </>
  );
}
