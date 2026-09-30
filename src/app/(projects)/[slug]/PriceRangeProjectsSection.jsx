"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { buildProjectImageUrl } from "@/lib/projectImageUrl";
import { buildProjectDisplayName } from "@/lib/projectDisplayName";

function formatStartingPrice(price) {
  if (price == null || price === "") return "Price on Request";
  if (/[a-zA-Z]/.test(String(price))) return String(price);
  const num = parseFloat(price);
  if (!Number.isFinite(num)) return "Price on Request";
  return num < 1
    ? `₹ ${Math.round(num * 100)} Lakh* Onwards`
    : `₹ ${num} Cr* Onwards`;
}

function projectLocation(project) {
  return (
    project.projectAddress ||
    [project.projectLocality, project.cityName].filter(Boolean).join(", ") ||
    ""
  );
}

export default function PriceRangeProjectsSection({
  projects = [],
  referencePrice,
}) {
  const trackRef = useRef(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const referenceLabel = formatStartingPrice(referencePrice);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setHasOverflow(maxScroll > 8);
    setCanScrollPrev(track.scrollLeft > 8);
    setCanScrollNext(track.scrollLeft < maxScroll - 8);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    updateScrollState();
    track.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      track.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [projects.length, updateScrollState]);

  const scrollTrack = useCallback((direction) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(".pd3-price-range__item");
    const gap = 16;
    const step =
      (card?.getBoundingClientRect().width || track.clientWidth * 0.85) + gap;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  }, []);

  if (!projects.length) return null;

  return (
    <section className="pd3-card pd3-price-range" aria-label="Projects in your price range">
      <div className="pd3-card__head pd3-price-range__head">
        <div>
          <h2 className="pd3-card__title">Projects in Your Price Range</h2>
          {/* {referencePrice != null && referencePrice !== "" ? (
            <p className="pd3-price-range__sub">
              Based on {referenceLabel} (±25%)
            </p>
          ) : null} */}
        </div>
        {hasOverflow ? (
          <div className="pd3-price-range__controls">
            <button
              type="button"
              className="pd3-price-range__btn"
              onClick={() => scrollTrack(-1)}
              disabled={!canScrollPrev}
              aria-label="Scroll to previous projects"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <button
              type="button"
              className="pd3-price-range__btn"
              onClick={() => scrollTrack(1)}
              disabled={!canScrollNext}
              aria-label="Scroll to next projects"
            >
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        ) : null}
      </div>
      <div
        ref={trackRef}
        className="pd3-price-range__track"
        tabIndex={0}
        role="region"
        aria-label="Scrollable project list"
      >
        {projects.map((p) => {
          const name = buildProjectDisplayName(p, "Project");
          const imgMeta = `${name} — project photo on My Property Fact`;
          const location = projectLocation(p);
          return (
            <Link
              key={p.id || p.slugURL}
              href={`/${p.slugURL}`}
              className="pd3-sim-card pd3-price-range__item"
              title={`View ${name} on My Property Fact`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="pd3-sim-card__img">
                <img
                  src={buildProjectImageUrl(p, { preferThumbnail: true })}
                  alt={imgMeta}
                  title={imgMeta}
                  loading="lazy"
                  decoding="async"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                {p.projectStatusName ? (
                  <span className="pd3-sim-card__badge">{p.projectStatusName}</span>
                ) : null}
              </div>
              <div className="pd3-sim-card__body">
                <div className="pd3-sim-card__name">{p.projectName}</div>
                {location ? (
                  <div className="pd3-sim-card__addr">{location}</div>
                ) : null}
                {p.projectPrice ? (
                  <div className="pd3-sim-card__price">
                    {formatStartingPrice(p.projectPrice)}
                  </div>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
