"use client";

import {
  buildCityMonumentImageUrl,
  DEFAULT_CITY_MONUMENT_IMAGE,
  sanitizeCityDescriptionHtml,
} from "@/lib/cityMonumentImageUrl";

export default function CityMonumentShowcase({ cityData }) {
  const cityName = cityData?.cityName?.trim() || "City";
  const monumentName = cityData?.monumentName?.trim() || `${cityName} Landmark`;
  const description = sanitizeCityDescriptionHtml(
    cityData?.cityDescription || "",
    cityName,
  );
  const imageSrc = buildCityMonumentImageUrl(cityData?.monumentImage);
  const monumentImageTitle = `${monumentName} — iconic landmark in ${cityName}`;
  const locationLabel = cityData?.stateName
    ? `${cityName}, ${cityData.stateName}`
    : cityName;

  return (
    <aside className="city-showcase" aria-label={`${cityName} landmark and overview`}>
      <div className="city-showcase__panel">
        <article className="city-showcase__card">
          <div className="city-showcase__image-wrap">
            <img
              src={imageSrc}
              alt={monumentImageTitle}
              title={monumentImageTitle}
              className="city-showcase__image"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = DEFAULT_CITY_MONUMENT_IMAGE;
              }}
            />
          </div>
          <div className="city-showcase__card-body">
            <p className="city-showcase__card-eyebrow">Landmark</p>
            <p className="city-showcase__card-title">{monumentName}</p>
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
