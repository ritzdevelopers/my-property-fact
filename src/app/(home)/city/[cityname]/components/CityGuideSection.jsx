"use client";

import Link from "next/link";
import { sanitizeCityDescriptionHtml } from "@/lib/cityMonumentImageUrl";

export default function CityGuideSection({ cityData }) {
  const cityName = cityData?.cityName?.trim() || "City";
  const description = sanitizeCityDescriptionHtml(
    cityData?.cityDescription || "",
    cityName,
  );

  return (
    <section className="city-guide" aria-labelledby="city-guide-heading">
      <div className="city-guide__box">
        <div className="city-guide__head">
          {/* <p className="city-guide__eyebrow">City guide</p> */}
          <h2 id="city-guide-heading" className="city-guide__title">
            Property in {cityName}: Your Complete Guide
          </h2>
        </div>

        <div className="city-guide__scroll" tabIndex={0}>
          {description ? (
            <div
              className="city-guide__description"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <p className="city-guide__description">
              Discover premium real estate opportunities across {cityName}.
              Explore residential and commercial projects curated for modern
              living.
            </p>
          )}
        </div>

        <div className="city-guide__cta">
          <p className="city-guide__cta-text">
            Need help choosing a project in {cityName}?
          </p>
          <Link
            href="/contact-us"
            className="city-guide__cta-btn"
            title={`Contact My Property Fact about property in ${cityName}`}
          >
            Talk to an expert
          </Link>
        </div>
      </div>
    </section>
  );
}
