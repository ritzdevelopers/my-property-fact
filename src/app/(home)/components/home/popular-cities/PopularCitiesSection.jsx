"use client";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./PopularCitiesSection.css";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";

// Popular Cities — image alt text is generated from city name + section title in the slider
const cities = [
  {
    name: "Delhi",
    link: "/city/delhi",
    image: "/dream-cities/delhi_new.png",
  },

  {
    name: "Noida",
    link: "/city/noida",
    image: "/dream-cities/noida_new.png",
  },
  {
    name: "Ghaziabad",
    link: "/city/ghaziabad",
    image: "/dream-cities/ghaziabad_new.png",
  },
  {
    name: "Gurugram",
    link: "/city/gurugram",
    image: "/dream-cities/gurugram_new.png",
  },
  {
    name: "Agra",
    link: "/city/agra",
    image: "/dream-cities/agra_new.png",
  },
  {
    name: "Bangalore",
    link: "/city/bangalore",
    image: "/dream-cities/bangalore_new.png",
  },
  {
    name: "Jaipur",
    link: "/city/jaipur",
    image: "/dream-cities/jaipur_new.png",
  },
  {
    name: "Mumbai",
    link: "/city/mumbai",
    image: "/dream-cities/mumbai_new.png",
  },
];

// Returning the popular cities section
export default function PopularCitiesSection() {
  return (
    <section className="popular-cities-section">
      <div className="popular-cities-wrap">
        <div className="popular-cities-container">
          <div className="popular-cities-header">
            <h2 className="plus-jakarta-sans-semi-bold">Popular Cities</h2>
            <Link href="/projects" className="popular-cities-cta">
              Explore More
            </Link>
          </div>

          <div className="popular-cities-slider-wrap">
            <button
              className="popular-cities-nav popular-cities-prev"
              aria-label="Previous cities"
            >
              <RiArrowLeftSLine />
            </button>
            <Swiper
              modules={[Navigation]}
              loop
              navigation={{
                prevEl: ".popular-cities-prev",
                nextEl: ".popular-cities-next",
              }}
              spaceBetween={24}
              slidesPerView={6}
              breakpoints={{
                0: { slidesPerView: 1, spaceBetween: 12 },
                480: { slidesPerView: 2, spaceBetween: 16 },
                576: { slidesPerView: 3, spaceBetween: 18 },
                768: { slidesPerView: 4, spaceBetween: 20 },
                992: { slidesPerView: 5, spaceBetween: 22 },
                1200: { slidesPerView: 5, spaceBetween: 24 },
                1440: { slidesPerView: 6, spaceBetween: 24 },
              }}
            >
              {cities.map((city) => {
                const popularCityAlt = `${city.name} — Popular Cities on My Property Fact, explore properties`;
                return (
                <SwiperSlide key={city.name}>
                  <Link href={city.link} prefetch={false} className="popular-city-card">
                    <div className="popular-city-image">
                      <Image
                        src={city.image}
                        alt={popularCityAlt}
                        title={popularCityAlt}
                        width={210}
                        height={140}
                      />
                    </div>
                    <div className="popular-city-name">{city.name}</div>
                  </Link>
                </SwiperSlide>
                );
              })}
            </Swiper>
            <button
              className="popular-cities-nav popular-cities-next"
              aria-label="Next cities"
            >
              <RiArrowRightSLine />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
