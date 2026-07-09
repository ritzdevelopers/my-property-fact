"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import {
  buildGalleryImageUrl,
  buildProjectImageUrl,
  DEFAULT_PROJECT_CARD_IMAGE,
} from "@/lib/projectImageUrl";
import { formatDistanceKm } from "@/lib/utils";
import {
  formatListingStatusLabel,
  loadNearbyBenefitCatalog,
  resolveBuilderFromList,
  resolveNearbyBenefitMeta,
} from "@/lib/projectCardHelpers";
import { useSiteData } from "@/app/_global_components/contexts/SiteDataContext";
import CommonPopUpform from "@/app/(home)/components/common/popupform";

const API_BASE = String(process.env.NEXT_PUBLIC_API_URL || "").trim();

function isMeaningfulReraNo(value) {
  const v = String(value || "").toLowerCase().trim();
  if (!v) return false;
  return !(
    v === "no" ||
    v === "na" ||
    v === "n/a" ||
    v === "not available" ||
    v === "not found" ||
    v === "none"
  );
}

const PropertyTypeRibbon = ({ type }) => {
  const normalized = (type || "").toLowerCase().trim();
  const isCommercial = normalized.includes("commercial");
  const label = isCommercial ? "Commercial" : "Residential";
  const ribbonClass = isCommercial ? "mpf-ribbon--commercial" : "mpf-ribbon--residential";

  return (
    <div className={`mpf-ribbon-wrapper ${ribbonClass}`}>
      <div className="mpf-ribbon">{label}</div>
    </div>
  );
};

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

export default function ProjectCard({
  project,
  imagePriority = false,
}) {
  const [slides, setSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const [reraNo, setReraNo] = useState("");
  const [locationBenefits, setLocationBenefits] = useState([]);
  const [builderName, setBuilderName] = useState("");
  const [nearbyCatalog, setNearbyCatalog] = useState([]);
  const [showLeadForm, setShowLeadForm] = useState(false);

  const { builderList } = useSiteData();
  const slug = project?.slugURL;

  const applyBuilderName = useCallback(
    (detail = {}) => {
      const listBuilder = resolveBuilderFromList(project, builderList);
      const builder =
        detail.builder && typeof detail.builder === "object" ? detail.builder : {};

      setBuilderName(
        String(
          builder.builderName ||
            detail.builderName ||
            listBuilder?.builderName ||
            project?.builderName ||
            "",
        ).trim(),
      );
    },
    [project, builderList],
  );

  useEffect(() => {
    let cancelled = false;
    loadNearbyBenefitCatalog().then((rows) => {
      if (!cancelled) setNearbyCatalog(Array.isArray(rows) ? rows : []);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!project) return;
    const primary = buildProjectImageUrl(project, { preferThumbnail: true });
    setSlides(mergeSlideUrls(primary));
    setActiveSlide(0);
    setImageErrors({});
    applyBuilderName();
  }, [
    project?.projectThumbnailImage,
    project?.projectBannerImage,
    project?.slugURL,
    project?.builderName,
    project?.builderId,
    project,
    applyBuilderName,
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

        const benefits = Array.isArray(data.locationBenefits)
          ? data.locationBenefits
          : Array.isArray(data.projectLocationBenefitList)
            ? data.projectLocationBenefitList
            : [];

        const builder = data.builder && typeof data.builder === "object" ? data.builder : {};

        setReraNo(data.reraNo || "");
        setSlides(mergeSlideUrls(primary, gallery));
        setActiveSlide(0);
        setLocationBenefits(benefits.filter((item) => item?.benefitName));
        applyBuilderName({ ...data, builder });
      })
      .catch(() => {});

    return () => controller.abort();
  }, [slug, project, applyBuilderName]);

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

  const nearbyItems = useMemo(() => {
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
  }, [locationBenefits, nearbyCatalog]);

  if (!project) return null;

  const isReraApproved = isMeaningfulReraNo(reraNo);
  const projectName = String(project.projectName || "Project").trim();
  const projectLinkTitle = projectName ? `View ${projectName}` : "View project details";
  const statusLabel = formatListingStatusLabel(project.projectStatusName);
  const hasMultipleSlides = slides.length > 1;

  const formatProjectPrice = (price) => {
    if (price == null || price === "") return "Price on Request";
    if (/[a-zA-Z]/.test(String(price))) return String(price);
    const num = parseFloat(price);
    if (!Number.isFinite(num)) return "Price on Request";
    return num < 1
      ? `₹ ${Math.round(num * 100)} Lakh* Onwards`
      : `₹ ${num} Cr* Onwards`;
  };

  const formatAddress = (address, city) => {
    if (!address && !city) return "Location not available";
    const parts = [];
    if (address) {
      const addressParts = String(address)
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
      if (addressParts.length > 0) parts.push(addressParts[0]);
    }
    if (city) parts.push(city);
    return parts.join(", ");
  };

  return (
    <article className="mpf-listing-card">
      <div className="mpf-listing-card-link">
        <div className="mpf-listing-image">
          <div className="mpf-listing-slider" aria-label={`${projectName} photos`}>
            {slides.map((src, index) => (
              <img
                key={`${src}-${index}`}
                src={imageErrors[index] ? DEFAULT_PROJECT_CARD_IMAGE : src}
                alt={`${projectName} — photo ${index + 1}`}
                title={projectName}
                className={`mpf-listing-slider__img${
                  index === activeSlide ? " is-active" : ""
                }`}
                loading={imagePriority && index === 0 ? "eager" : "lazy"}
                onError={() =>
                  setImageErrors((prev) => ({ ...prev, [index]: true }))
                }
              />
            ))}

            {hasMultipleSlides ? (
              <>
                <button
                  type="button"
                  className="mpf-listing-slider__nav mpf-listing-slider__nav--prev"
                  onClick={goPrev}
                  aria-label="Previous photo"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button
                  type="button"
                  className="mpf-listing-slider__nav mpf-listing-slider__nav--next"
                  onClick={goNext}
                  aria-label="Next photo"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </>
            ) : null}
          </div>

          {project.propertyTypeName ? (
            <PropertyTypeRibbon type={project.propertyTypeName} />
          ) : null}

          {isReraApproved ? (
            <span className="mpf-rera-badge" title={`RERA: ${reraNo}`}>
              <svg className="mpf-rera-shield" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
              </svg>
              RERA
            </span>
          ) : null}

          {statusLabel ? (
            <span className="mpf-listing-image-status">{statusLabel}</span>
          ) : null}
        </div>

        <Link
          href={`/${project.slugURL}`}
          className="mpf-listing-content"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View details about ${projectName}`}
          title={projectLinkTitle}
        >
          <div className="mpf-listing-header">
            <h2 className="mpf-listing-title">{project.projectName}</h2>
            <p className="mpf-listing-location">
              {formatAddress(project.projectAddress, project.cityName)}
            </p>
          </div>

          <div className="mpf-listing-details">
            {project.projectConfiguration ? (
              <span className="mpf-listing-config">{project.projectConfiguration}</span>
            ) : null}

            <div className="mpf-listing-price-row">
              <span className="mpf-listing-price">
                {formatProjectPrice(project.projectPrice)}
              </span>
            </div>

            {nearbyItems.length > 0 || builderName ? (
              <div className="mpf-listing-extra">
                {nearbyItems.length > 0 ? (
                  <div className="mpf-listing-nearby">
                    <span className="mpf-listing-nearby__label">Nearby:</span>
                    <div
                      className="mpf-listing-nearby__scroller"
                      tabIndex={0}
                      aria-label="Nearby places"
                    >
                      <div className="mpf-listing-nearby__track">
                        {nearbyItems.map((item) => (
                          <span key={item.name} className="mpf-listing-nearby__chip">
                            {item.icon ? (
                              <img
                                src={item.icon}
                                alt={item.alt}
                                title={item.title}
                                className="mpf-listing-nearby__icon"
                                loading="lazy"
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
                ) : null}

                {builderName ? (
                  <div className="mpf-listing-builder">
                    <span className="mpf-listing-builder__label">Builder</span>
                    <span className="mpf-listing-builder__name">{builderName}</span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </Link>

        <div className="mpf-listing-actions">
          <button
            type="button"
            className="mpf-btn-contact mpf-btn-contact--secondary"
            onClick={() => setShowLeadForm(true)}
          >
            <FontAwesomeIcon icon={faPhone} />
            Get Details
          </button>
          <Link
            href={`/${project.slugURL}`}
            className="mpf-btn-contact"
            target="_blank"
            rel="noopener noreferrer"
            title={projectLinkTitle}
          >
            Click to Explore
          </Link>
        </div>
      </div>

      <CommonPopUpform
        show={showLeadForm}
        handleClose={setShowLeadForm}
        from="Project Detail"
        data={project}
      />
    </article>
  );
}
