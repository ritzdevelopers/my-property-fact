"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import "./DreamPropertySection.css";

const AMPLITUDE = 18;
const WAVE_SPEED = 0.010;
const SPACING = 0.5;

function CityMarqueeItem({ city }) {
  return (
    <div className="city-item">
      <Link
        href={city.link}
        prefetch={false}
        title={`Explore ${city.name} properties on My Property Fact`}
        className="city-circle"
      >
        <span className="hover-arrow" aria-hidden="true">
          <FaArrowRight className="arrow-icon" />
        </span>
        <Image
          src={city.image}
          alt={`${city.name} — find properties on My Property Fact`}
          title={city.name}
          width={60}
          height={60}
          className="city-circle-image"
          loading="lazy"
          sizes="(max-width: 768px) 50vw, 105px"
        />
      </Link>
      <h4 className="city-name1">{city.name}</h4>
    </div>
  );
}

const DreamPropertySection = () => {
  const cities = [
    {
      name: "Agra",
      link: "/city/agra",
      image: "/dream-cities/agra.png",
      alt: "Agra — find properties and projects on My Property Fact",
    },
    {
      name: "Bangalore",
      link: "/city/bangalore",
      image: "/dream-cities/bangalore.png",
      alt: "Bangalore — find properties and projects on My Property Fact",
    },
    {
      name: "Noida",
      link: "/city/noida",
      image: "/dream-cities/noida.png",
      alt: "Noida — find properties and projects on My Property Fact",
    },
    {
      name: "Delhi",
      link: "/city/delhi",
      image: "/dream-cities/delhi.png",
      alt: "Delhi — find properties and projects on My Property Fact",
    },
    {
      name: "Ghaziabad",
      link: "/city/ghaziabad",
      image: "/dream-cities/ghaziabad.png",
      alt: "Ghaziabad — find properties and projects on My Property Fact",
    },
    {
      name: "Jaipur",
      link: "/city/jaipur",
      image: "/dream-cities/jaipur.png",
      alt: "Jaipur — find properties and projects on My Property Fact",
    },
    {
      name: "Mumbai",
      link: "/city/mumbai",
      image: "/dream-cities/mumbai.png",
      alt: "Mumbai — find properties and projects on My Property Fact",
    },
    {
      name: "Gurugram",
      link: "/city/gurugram",
      image: "/dream-cities/mumbai.png",
      alt: "Gurugram — find properties and projects on My Property Fact",
    },
  ];



  const rowRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const items = rowRef.current?.querySelectorAll(".city-item");
    if (!items?.length) return;
    let t = 0;

    const animate = () => {
      t += WAVE_SPEED;
      items.forEach((el, i) => {
        const zigzag = i % 2 === 0 ? -28 : 28;
        const wave = Math.sin(t - i * SPACING) * AMPLITUDE;
        const y = zigzag + wave;
        el.style.transform = `translateY(${y}px)`;
      });
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  // Returning the dream property section
  return (
    <section className="dream-property-section my-4 my-lg-5">
      <div className="dream-property-section-bg" aria-hidden>
        <Image
          src="/dream-cities/dreamcitybg.png"
          alt="Background artwork for Find Your Dream Property in your city"
          title="Background artwork for Find Your Dream Property in your city"
          sizes="(max-width: 768px) 100vw, 100vw"
          fill
          className="object-fit-cover"
          loading="lazy"
          style={{
            position: "absolute", top: "40%", left: "0", width: "100%", height: "100%",
            objectFit: "cover", opacity: 0.5
          }}
        />
      </div>
      <div className="dream-property-container">
        {/* Header Section */}
        <div className="container dream-property-header">
          <div className="header-left text-center mx-auto">
            <h2 className="dream-property-title plus-jakarta-sans-semi-bold">
              Find Your Dream Property In The City<br /> You Are Searching In
              {/* <Link href="/projects" title="Browse all real estate projects on My Property Fact">
                <button

                  className="nav-arrow-button"
                  aria-label="Navigate to cities"

                >
                  <FaArrowRight />
                </button>
              </Link> */}
            </h2>
          </div>

        </div>

        {/* City Cards Grid */}
        {/* <div className="city-cards-grid" ref={cityCardsRef}>
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
                <Link
                  href={city.link}
                  prefetch={false}
                  className="explore-details-button"
                  title={`Explore ${city.name} real estate, projects and local trends on My Property Fact`}
                >
                  Explore Details
                </Link>
              </div>
            </div>
          ))}
        </div> */}

        <div className="cities-marquee pt-5" aria-label="Featured cities">
          <div className="cities-marquee-track" ref={rowRef}>
            <div className="cities-marquee-segment">
              {cities.map((city) => (
                <CityMarqueeItem key={`a-${city.name}`} city={city} />
              ))}
            </div>
            <div className="cities-marquee-segment" aria-hidden="true">
              {cities.map((city) => (
                <CityMarqueeItem key={`b-${city.name}`} city={city} />
              ))}
            </div>
          </div>
        </div>

        <div >
          <Link
            href="/projects"
            className="see-all-button1 text-white btn-normal-color"
            title="View all property listings on My Property Fact"
            style={{ backgroundColor: "#0D5834" }}
          >
            See All Properties
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DreamPropertySection;
