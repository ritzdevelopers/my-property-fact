"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faPhone,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import {
  buildProjectImageUrl,
  DEFAULT_PROJECT_CARD_IMAGE,
} from "@/lib/projectImageUrl";

const API_BASE = String(process.env.NEXT_PUBLIC_API_URL || "").trim();

function isMeaningfulReraNo(value) {
  const v = String(value || "").toLowerCase().trim();
  if (!v) return false;
  return !(
    v === "no" || v === "na" || v === "n/a" || 
    v === "not available" || v === "not found" || v === "none"
  );
}

const StatusBadge = ({ status }) => {
  const normalized = (status || "").toLowerCase().trim();
  
  if (normalized.includes("under construction")) {
    return (
      <span className="mpf-status-badge mpf-status-badge--construction">
        <span className="mpf-status-icon">🏗️</span>
        <span>Under Construction</span>
        <span className="mpf-status-dots"><span></span><span></span><span></span></span>
      </span>
    );
  }
  if (normalized.includes("new launch") || normalized.includes("new launched")) {
    return (
      <span className="mpf-status-badge mpf-status-badge--newlaunch">
        <span className="mpf-status-icon">🚀</span>
        <span>New Launch</span>
        <span className="mpf-status-sparkle">✨</span>
      </span>
    );
  }
  if (normalized.includes("ready")) {
    return (
      <span className="mpf-status-badge mpf-status-badge--ready">
        <span className="mpf-status-icon">🔑</span>
        <span>Ready To Move</span>
        <span className="mpf-status-check">✓</span>
      </span>
    );
  }
  
  return (
    <span className="mpf-status-badge mpf-status-badge--default">
      {status}
    </span>
  );
};

const PropertyTypeRibbon = ({ type }) => {
  const normalized = (type || "").toLowerCase().trim();
  const isCommercial = normalized.includes("commercial");
  const label = isCommercial ? "Commercial" : "Residential";
  const ribbonClass = isCommercial ? "mpf-ribbon--commercial" : "mpf-ribbon--residential";
  
  return (
    <div className={`mpf-ribbon-wrapper ${ribbonClass}`}>
      <div className="mpf-ribbon">
        {label}
      </div>
    </div>
  );
};

export default function ProjectCard({ project, imagePriority = false }) {
  const [imageError, setImageError] = useState(false);
  const [projectMeta, setProjectMeta] = useState({ reraNo: "", photoCount: 0 });

  useEffect(() => {
    const slug = project?.slugURL;
    if (!slug || !API_BASE) {
      return;
    }
    
    const controller = new AbortController();
    const url = `${API_BASE}projects/get/${encodeURIComponent(slug)}`;
    
    fetch(url, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data) {
          const reraNo = data.reraNo || "";
          const photoCount = Array.isArray(data.galleryImages) ? data.galleryImages.length : 0;
          setProjectMeta({ reraNo, photoCount });
        }
      })
      .catch(() => {
        // Silently fail - we'll show defaults
      });
    
    return () => controller.abort();
  }, [project?.slugURL]);

  if (!project) return null;

  const hasProjectImage = Boolean(project.projectThumbnailImage || project.projectBannerImage) && !imageError;
  const imageSrc = hasProjectImage ? buildProjectImageUrl(project, { preferThumbnail: true }) : DEFAULT_PROJECT_CARD_IMAGE;

  const formatPriceRange = (price) => {
    if (!price) return "Price on Request";
    if (/[a-zA-Z]/.test(price)) return price;
    const numPrice = parseFloat(price);
    if (numPrice < 1) {
      const lakh = Math.round(numPrice * 100);
      return `₹ ${lakh} Lakh - ${lakh + 50} Lakh`;
    }
    return `₹ ${numPrice} - ${(numPrice + 2).toFixed(2)} Cr`;
  };

  const formatAddress = (address, city) => {
    if (!address && !city) return "Location not available";
    const parts = [];
    if (address) {
      const addressParts = String(address).split(",").map(p => p.trim()).filter(Boolean);
      if (addressParts.length > 0) parts.push(addressParts[0]);
    }
    if (city) parts.push(city);
    return parts.join(", ");
  };

  const isReraApproved = isMeaningfulReraNo(projectMeta.reraNo);
  const photoCount = projectMeta.photoCount > 0 ? `${projectMeta.photoCount} Photos` : "10+ Photos";

  return (
    <article className="mpf-listing-card">
      <Link
        href={`/${project.slugURL}`}
        className="mpf-listing-card-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {/* Image Section */}
        <div className="mpf-listing-image">
          <img
            src={imageSrc}
            alt={project.projectName}
            loading={imagePriority ? "eager" : "lazy"}
            onError={() => setImageError(true)}
          />

          <div className="mpf-image-hover-overlay" aria-hidden="true">
            <div className="mpf-image-hover-overlay__text">Click to Explore</div>
          </div>
          
          {/* Property Type Ribbon */}
          {project.propertyTypeName && (
            <PropertyTypeRibbon type={project.propertyTypeName} />
          )}
          
          {/* RERA Badge */}
          {isReraApproved && (
            <span className="mpf-rera-badge" title={`RERA: ${projectMeta.reraNo}`}>
              <svg className="mpf-rera-shield" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
              RERA
            </span>
          )}
          
          {/* Photo Count */}
          <span className="mpf-photo-badge">
            <FontAwesomeIcon icon={faCamera} />
            <span>{photoCount}</span>
          </span>
        </div>

        {/* Content Section */}
        <div className="mpf-listing-content">
          <div className="mpf-listing-header">
            <h3 className="mpf-listing-title">{project.projectName}</h3>
            <p className="mpf-listing-location">
              {formatAddress(project.projectAddress, project.cityName)}
            </p>
          </div>

          <div className="mpf-listing-details">
            {project.projectConfiguration && (
              <span className="mpf-listing-config">
                {project.projectConfiguration}
              </span>
            )}
            
            <div className="mpf-listing-price-row">
              <span className="mpf-listing-price">
                {formatPriceRange(project.projectPrice)}
              </span>
            </div>

            <div className="mpf-listing-meta">
              {project.projectStatusName && (
                <StatusBadge status={project.projectStatusName} />
              )}
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="mpf-listing-actions">
          <button className="mpf-listing-wishlist" aria-label="Add to wishlist">
            <FontAwesomeIcon icon={faHeart} />
          </button>
          
          <button className="mpf-btn-contact">
            <FontAwesomeIcon icon={faPhone} />
            View Number
          </button>
        </div>
      </Link>
    </article>
  );
}
