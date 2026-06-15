"use client";

import Link from "next/link";
import "./DreamPropertySection.css";

const cities = [
  {
    name: "Agra",
    link: "/city/agra",
    image: "/dream-cities/Mask group (10).png",
    alt: "Agra — find properties and projects on My Property Fact",
    title: "Agra — find properties and projects on My Property Fact",
  },
  {
    name: "Bangalore",
    link: "/city/bangalore",
    image: "/dream-cities/Mask group (11).png",
    alt: "Bangalore — find properties and projects on My Property Fact",
    title: "Bangalore — find properties and projects on My Property Fact",
  },
  {
    name: "Noida",
    link: "/city/noida",
    image: "/dream-cities/Mask group (12).png",
    alt: "Noida — find properties and projects on My Property Fact",
    title: "Noida — find properties and projects on My Property Fact",
  },
  {
    name: "Delhi",
    link: "/city/delhi",
    image: "/dream-cities/Mask group (13).png",
    alt: "Delhi — find properties and projects on My Property Fact",
    title: "Delhi — find properties and projects on My Property Fact",
  },
  {
    name: "Ghaziabad",
    link: "/city/ghaziabad",
    image: "/dream-cities/Mask group (14).png",
    alt: "Ghaziabad — find properties and projects on My Property Fact",
    title: "Ghaziabad — find properties and projects on My Property Fact",
  },
  {
    name: "Jaipur",
    link: "/city/jaipur",
    image: "/dream-cities/Mask group (15).png",
    alt: "Jaipur — find properties and projects on My Property Fact",
    title: "Jaipur — find properties and projects on My Property Fact",
  },
  {
    name: "Mumbai",
    link: "/city/mumbai",
    image: "/dream-cities/Mask group (16).png",
    alt: "Mumbai — find properties and projects on My Property Fact",
    title: "Mumbai — find properties and projects on My Property Fact",
  },
];

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
          {cities.map((city, index) => (
            <Link
              key={city.name}
              href={city.link}
              prefetch={false}
              className={`dream-city-item dream-city-item--${index + 1}`}
              role="listitem"
              title={`Explore ${city.name} real estate, projects and local trends on My Property Fact`}
              aria-label={`Explore properties in ${city.name}`}
            >
              <div className="dream-city-icon-circle">
                <img
                  src={city.image}
                  alt={city.alt}
                  title={city.title}
                  width={72}
                  height={72}
                  loading="lazy"
                />
              </div>
              <span className="dream-city-label plus-jakarta-sans-semi-bold">
                {city.name}
              </span>
            </Link>
          ))}
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
