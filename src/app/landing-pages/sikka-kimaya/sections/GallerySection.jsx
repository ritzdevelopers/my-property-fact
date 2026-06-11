"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, Keyboard } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Images
import img1 from "../assets/Gallery/1.jpg";
import img2 from "../assets/Gallery/2.jpg";
import img3 from "../assets/Gallery/3.jpg";
import img4 from "../assets/Gallery/4.jpg";
import img5 from "../assets/Gallery/5.jpg";
import img6 from "../assets/Gallery/6.jpg";
import img7 from "../assets/Gallery/7.jpg";
import img8 from "../assets/Gallery/8.jpg";
import img9 from "../assets/Gallery/9.jpg";

const galleryItems = [
  { image: img1 },
  { image: img2 },
  { image: img3 },
  { image: img4 },
  { image: img5 },
  { image: img6 },
  { image: img7 },
  { image: img8 },
  { image: img9 },
];

export default function GallerySection() {
  return (
    <section className="py-5 bg-white position-relative" style={{ zIndex: 10 }}>
      <div className="container text-center px-3">
        <p className="fs-5 text-secondary mb-2">
          Gallery
          <span
            className="d-block mx-auto mt-1"
            style={{
              width: "80px",
              height: "4px",
              backgroundColor: "#A8BE04",
              borderRadius: "2px",
            }}
          />
        </p>
        <h2 className="text-dark display-5 fw-bold mb-4 mb-md-5">
          A Glimpse Into Life Here
        </h2>

        <Swiper
          modules={[Navigation, Pagination, Autoplay, Keyboard]}
          keyboard={{ enabled: true }}
          autoplay={{ delay: 2000 }}
          loop
          spaceBetween={30}
          slidesPerView={1}
          className="rounded shadow"
          style={{ overflow: "hidden" }}
        >
          {galleryItems.map((item, index) => (
            <SwiperSlide key={index}>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "500px",
                }}
                className="h-sm-600 h-md-700"
              >
                <img
                  src={item.image}
                  alt="gallery image"
                  style={{ objectFit: "cover", borderRadius: "0.75rem" }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx>{`
        /* Responsive heights similar to Tailwind's sm:h-[600px], md:h-[700px] */
        .h-sm-600 {
          height: 600px;
        }
        @media (min-width: 768px) {
          .h-sm-600 {
            height: 600px;
          }
          .h-md-700 {
            height: 700px !important;
          }
        }
        @media (max-width: 575.98px) {
          div[style*="height: 500px"] {
            height: 500px !important;
          }
        }
      `}</style>
    </section>
  );
}
