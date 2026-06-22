"use client";

import {
  buildCityMonumentImageUrl,
  DEFAULT_CITY_MONUMENT_IMAGE,
} from "@/lib/cityMonumentImageUrl";

export default function CityMonumentShowcase({ cityData }) {
  const cityName = cityData?.cityName?.trim() || "City";
  const monumentName = cityData?.monumentName?.trim() || `${cityName} Landmark`;
  const description = cityData?.cityDescription || "";
  const imageSrc = buildCityMonumentImageUrl(cityData?.monumentImage);
  const locationLabel = cityData?.stateName
    ? `${cityName}, ${cityData.stateName}`
    : cityName;

  return (
    <aside className="city-showcase" aria-labelledby="city-about-heading">
      <div className="city-showcase__header">
        <h2 id="city-about-heading" className="city-showcase__heading">
          About {cityName}
        </h2>
      </div>

      <div className="city-showcase__panel">
        <article className="city-showcase__card">
          <div className="city-showcase__image-wrap">
            <img
              src={imageSrc}
              alt={`${monumentName} — iconic landmark in ${cityName}`}
              className="city-showcase__image"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = DEFAULT_CITY_MONUMENT_IMAGE;
              }}
            />
          </div>
          <div className="city-showcase__card-body">
            <p className="city-showcase__card-eyebrow">Landmark</p>
            <h3 className="city-showcase__card-title">{monumentName}</h3>
            <p className="city-showcase__card-location">{locationLabel}</p>
          </div>
        </article>

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
      </div>
    </aside>
  );
}
