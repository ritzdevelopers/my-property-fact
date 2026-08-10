"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  buildCityMonumentImageUrl,
  DEFAULT_CITY_MONUMENT_IMAGE,
  sanitizeCityDescriptionHtml,
} from "@/lib/cityMonumentImageUrl";

export default function CityMonumentShowcase({ cityData, projectCount = 0 }) {
  const panelRef = useRef(null);
  const cityName = cityData?.cityName?.trim() || "City";
  const monumentName = cityData?.monumentName?.trim() || "";
  const stateName = cityData?.stateName?.trim() || "";

  const isSameAsCity = (value) =>
    Boolean(value) &&
    value.trim().toLowerCase() === cityName.trim().toLowerCase();

  const showMonumentName = monumentName && !isSameAsCity(monumentName);
  const showStateName = stateName && !isSameAsCity(stateName);
  const description = sanitizeCityDescriptionHtml(
    cityData?.cityDescription || "",
    cityName,
  );
  const imageSrc = buildCityMonumentImageUrl(cityData?.monumentImage);
  const imageTitle = monumentName
    ? `${monumentName}, ${cityName}`
    : `${cityName} — city landmark`;

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const frame = window.requestAnimationFrame(() => {
      panel.classList.add("is-visible");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <aside className="city-showcase" aria-label={`${cityName} overview`}>
      <div className="city-showcase__panel" ref={panelRef}>
        {/* Top card — image left, city name right */}
        <div className="city-showcase__hero-card">
          <div className="city-showcase__hero-image">
            <span className="city-showcase__accent" aria-hidden="true" />
            <img
              src={imageSrc}
              alt={imageTitle}
              title={imageTitle}
              className="city-showcase__image"
              loading="eager"
              fetchPriority="high"
              onError={(event) => {
                event.currentTarget.src = DEFAULT_CITY_MONUMENT_IMAGE;
              }}
            />
          </div>
          <div className="city-showcase__hero-info">
            <p className="city-showcase__city-name">{cityName}</p>
            {showMonumentName ? (
              <p className="city-showcase__landmark">{monumentName}</p>
            ) : null}
            {showStateName ? (
              <p className="city-showcase__state">{stateName}</p>
            ) : null}
            <div className="city-showcase__stats">
              {projectCount > 0 ? (
                <span className="city-showcase__stat">
                  <strong>{projectCount}</strong> Project
                  {projectCount === 1 ? "" : "s"}
                </span>
              ) : null}
              <span className="city-showcase__stat city-showcase__stat--rera">
                RERA Verified
              </span>
            </div>
          </div>
        </div>

        {/* City details — attached below the hero card */}
        <div className="city-showcase__details">
          <div className="city-showcase__details-header">
            <p className="city-showcase__eyebrow">City guide</p>
            <h2 className="city-showcase__guide-title">
              Property in {cityName}: Your Complete Guide
            </h2>
          </div>

          <div className="city-showcase__description-wrap">
            {description ? (
              <div
                className="city-showcase__description"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p className="city-showcase__description city-showcase__description--plain">
                Discover premium real estate opportunities across {cityName}.
                Explore residential and commercial projects curated for modern
                living.
              </p>
            )}
          </div>

          <div className="city-showcase__cta">
            <p className="city-showcase__cta-text">
              Need help choosing a project in {cityName}?
            </p>
            <Link href="/contact-us" className="city-showcase__cta-btn">
              Talk to an expert
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
