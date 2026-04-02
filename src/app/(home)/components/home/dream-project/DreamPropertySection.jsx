"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { FaArrowRight } from "react-icons/fa";
import "./DreamPropertySection.css";

const DreamPropertySection = () => {
  const cityCardsRef = useRef(null);
  // Scroll to cities function
  const scrollToCities = () => {
    if (cityCardsRef.current) {
      cityCardsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
  // Cities data matching the image with name, link, image and alt text
  const cities = [
    {
      name: "Agra",
      link: "/city/agra",
      image: "/dream-cities/agra_new.png",
      alt: "Agra — find properties and projects on My Property Fact",
    },
    {
      name: "Bangalore",
      link: "/city/bangalore",
      image: "/dream-cities/bangalore_new.png",
      alt: "Bangalore — find properties and projects on My Property Fact",
    },
    {
      name: "Noida",
      link: "/city/noida",
      image: "/dream-cities/noida_new.png",
      alt: "Noida — find properties and projects on My Property Fact",
    },
    {
      name: "Delhi",
      link: "/city/delhi",
      image: "/dream-cities/delhi_new.png",
      alt: "Delhi — find properties and projects on My Property Fact",
    },
    {
      name: "Ghaziabad",
      link: "/city/ghaziabad",
      image: "/dream-cities/ghaziabad_new.png",
      alt: "Ghaziabad — find properties and projects on My Property Fact",
    },
    {
      name: "Jaipur",
      link: "/city/jaipur",
      image: "/dream-cities/jaipur_new.png",
      alt: "Jaipur — find properties and projects on My Property Fact",
    },
    {
      name: "Mumbai",
      link: "/city/mumbai",
      image: "/dream-cities/mumbai_new.png",
      alt: "Mumbai — find properties and projects on My Property Fact",
    },
    {
      name: "Gurugram",
      link: "/city/gurugram",
      image: "/dream-cities/gurugram_new.png",
      alt: "Gurugram — find properties and projects on My Property Fact",
    },
  ];

  // Returning the dream property section
  return (
    <section className="dream-property-section my-4 my-lg-5">
      <div className="dream-property-section-bg" aria-hidden>
        <Image
          src="/dream-cities/dream_City_bg.png"
          alt="Background artwork for Find Your Dream Property in your city"
          title="Background artwork for Find Your Dream Property in your city"
          fill
          sizes="100vw"
          quality={75}
          className="object-fit-cover"
          loading="lazy"
        />
      </div>
      <div className="dream-property-container">
        {/* Header Section */}
        <div className="container dream-property-header">
          <div className="header-left">
            <h2 className="dream-property-title plus-jakarta-sans-semi-bold">
              Find Your Dream Property In The City<br/> You Are Searching In
              <Link href='/projects' >
              <button
                
                className="nav-arrow-button"
                aria-label="Navigate to cities"
                
              >
                <FaArrowRight />
              </button>
              </Link>
            </h2>
          </div>
          <Link href="/projects" className="see-all-button text-white btn-normal-color">
            See All Properties
          </Link>
        </div>

        {/* City Cards Grid */}
        <div className="city-cards-grid" ref={cityCardsRef}>
          {cities.map((city, index) => (
            <div key={index} className="city-card">
              <div className="city-image-wrapper">
                <Image
                  src={city.image}
                  alt={city.alt}
                  title={city.alt}
                  height={90}
                  width={105}
                  loading="lazy"
                  sizes="(max-width: 768px) 50vw, 105px"
                />
              </div>
              <div className="city-content">
                <h3 className="city-name">{city.name}</h3>
                <Link href={city.link} prefetch={false} className="explore-details-button">
                  Explore Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DreamPropertySection;
