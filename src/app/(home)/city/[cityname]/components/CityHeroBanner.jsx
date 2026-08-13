"use client";

import { useState } from "react";
import Link from "next/link";
import {
  buildCityMonumentImageUrl,
  DEFAULT_CITY_MONUMENT_IMAGE,
} from "@/lib/cityMonumentImageUrl";

export default function CityHeroBanner({ cityData, projectCount = 0 }) {
  const [imageSrc, setImageSrc] = useState(() =>
    buildCityMonumentImageUrl(cityData?.monumentImage),
  );

  const cityName = cityData?.cityName?.trim() || "City";
  const monumentName = cityData?.monumentName?.trim() || "";
  const stateName = cityData?.stateName?.trim() || "";

  const isSameAsCity = (value) =>
    Boolean(value) &&
    value.trim().toLowerCase() === cityName.trim().toLowerCase();

  const showMonumentName = monumentName && !isSameAsCity(monumentName);
  const showStateName = stateName && !isSameAsCity(stateName);
  const imageTitle = monumentName
    ? `${monumentName}, ${cityName}`
    : `${cityName} — city landmark`;

  return (
    <section className="city-hero" aria-label={`${cityName} overview`}>
      <img
        src={imageSrc}
        alt={imageTitle}
        title={imageTitle}
        className="city-hero__image"
        loading="eager"
        fetchPriority="high"
        onError={() => setImageSrc(DEFAULT_CITY_MONUMENT_IMAGE)}
      />
      <span className="city-hero__scrim" aria-hidden="true" />

      <div className="city-hero__content">
        <nav className="city-hero__breadcrumb" aria-label="Breadcrumb">
          <Link href="/" title="Home">
            Home
          </Link>
          <span aria-hidden="true">&gt;</span>
          <Link href="/projects" title="Projects">
            Projects
          </Link>
          <span aria-hidden="true">&gt;</span>
          <span>{cityName}</span>
        </nav>

        <h1 id="mpf-page-heading" className="city-hero__title">
          Property in {cityName}
        </h1>

        {showMonumentName || showStateName ? (
          <p className="city-hero__subtitle">
            {[showMonumentName ? monumentName : "", showStateName ? stateName : ""]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : null}

        <div className="city-hero__stats">
          {projectCount > 0 ? (
            <span className="city-hero__stat">
              <strong>{projectCount}</strong> Project
              {projectCount === 1 ? "" : "s"}
            </span>
          ) : null}
          <span className="city-hero__stat city-hero__stat--rera">
            RERA Verified
          </span>
        </div>
      </div>
    </section>
  );
}
