"use client";

import Link from "next/link";
import "./DreamPropertySection.css";

const CITY_ORDER = [
  "Bareilly",
  "Chandigarh",
  "Chennai",
  "Dehradun",
  "Faridabad",
  "Goa",
  "Greater Noida",
  "Gurugram",
  "Hyderabad",
  "Indore",
  "Karnal",
  "Kochi",
  "Lucknow",
  "Ludhiana",
  "Meerut",
  "Mohali",
  "Noida Extension",
  "Panipat",
  "Pune",
  "Sonipat",
  "Thiruvananthapuram",
  "Vrindavan",
];

const toCitySlug = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getIconPaths = (index) => {
  const n = String(index + 1).padStart(2, "0");
  return {
    // Preferred filenames (with "(1)") — encode the space for safe URLs
    primary: `/static/icon/icons-${n}%20(1).png`,
    fallback: `/static/icon/icons-${n}.png`,
  };
};

const FLOAT_BASE_PATTERN = [-22, 18, -14, 26, -18, 14];

const cities = CITY_ORDER.map((name, index) => {
  const icons = getIconPaths(index);
  return {
    name,
    link: `/city/${toCitySlug(name)}`,
    image: icons.primary,
    imageFallback: icons.fallback,
    floatBase: FLOAT_BASE_PATTERN[index % FLOAT_BASE_PATTERN.length],
    floatDelay: `${(index * 0.18).toFixed(2)}s`,
  };
});

const DreamPropertySection = () => {
  return (
    <section className="dream-property-section my-4 my-lg-5">
      <div className="dream-property-section-bg" aria-hidden="true">
        <img
          src="/dream-cities/image 1009.png"
          alt="Decorative cityscape background for Find Your Dream Property section"
          title="Decorative cityscape background for Find Your Dream Property section"
          className="dream-property-bg-image"
          loading="lazy"
        />
      </div>

      <div className="dream-property-container">
        <h2 className="dream-property-title">
          Find Your Dream Property In The City You Are Searching In
        </h2>

        <div className="dream-city-wave" role="list">
          <div className="dream-city-track" aria-hidden="false">
            {[...cities, ...cities].map((city, index) => (
              <Link
                key={`${city.name}-${index}`}
                href={city.link}
                prefetch={false}
                className="dream-city-item"
                role="listitem"
                title={`Explore ${city.name} real estate, projects and local trends on My Property Fact`}
                aria-label={`Explore properties in ${city.name}`}
                style={{
                  "--float-base": `${city.floatBase}px`,
                  "--float-delay": city.floatDelay,
                }}
              >
                <div className="dream-city-icon-circle">
                  <img
                    src={city.image}
                    data-fallback={city.imageFallback}
                    alt={city.name}
                    title={city.name}
                    width={72}
                    height={72}
                    loading="lazy"
                    onError={(e) => {
                      const fallback = e.currentTarget.dataset.fallback;
                      if (!fallback) return;
                      e.currentTarget.src = fallback;
                      delete e.currentTarget.dataset.fallback;
                    }}
                  />
                </div>
                <span className="dream-city-label plus-jakarta-sans-semi-bold">
                  {city.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <Link
          href="/projects"
          className="dream-see-all-button"
          title="View all property listings on My Property Fact"
        >
          See all properties
        </Link>
      </div>
    </section>
  );
};

export default DreamPropertySection;
