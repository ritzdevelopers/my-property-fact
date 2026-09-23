"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
// import { useEffect } from "react";

import img1 from "../assets/Gallery_1.jpg";
import img2 from "../assets/Gallery_2.jpg";
import img3 from "../assets/Gallery_3.jpg";
import img4 from "../assets/Gallery_4.jpg";
import img5 from "../assets/Gallery_5.jpg";
import img6 from "../assets/Gallery_6.jpg";
import img7 from "../assets/Gallery_1.jpg";
import img8 from "../assets/Gallery_2.jpg";
import img9 from "../assets/Gallery_3.jpg";
import img10 from "../assets/Gallery_4.jpg";
import img11 from "../assets/Gallery_5.jpg";
import img12 from "../assets/Gallery_6.jpg";

const galleryImages = [
  img1.src,
  img2.src,
  img3.src,
  img4.src,
  img5.src,
  img6.src,
  img7.src,
  img8.src,
  img9.src,
  img10.src,
  img11.src,
  img12.src,
];

export default function Gallery() {
  // useEffect(() => {
  //   const gallerySwiper = new Swiper(".swiper-gallery", {
  //     slidesPerView: 1,
  //     spaceBetween: 10,
  //     breakpoints: {
  //       640: {
  //         slidesPerView: 1,
  //         spaceBetween: 15,
  //       },
  //       768: {
  //         slidesPerView: 2,
  //         spaceBetween: 20,
  //       },
  //       1024: {
  //         slidesPerView: 3,
  //         spaceBetween: 25,
  //       },
  //       1280: {
  //         slidesPerView: 4,
  //         spaceBetween: 30,
  //       },
  //     },
  //     pagination: false,
  //     navigation: false,
  //     autoplay: true,
  //   });

  //   // Cleanup on unmount
  //   return () => {
  //     gallerySwiper.destroy();
  //   };
  // }, []);

  return (
    <section
      id="gallery"
      className="py-5 px-3"
      style={{ backgroundColor: "#213E33" }}
    >
      <div className="container">
        <h2
          className="text-white text-center fw-bold mb-4"
          style={{ fontSize: "2.25rem" }}
        >
          Gallery
        </h2>

        <Swiper
          spaceBetween={20}
          slidesPerView={1}
          loop={true}
          pagination={{ clickable: true }}
          navigation
          autoplay={{ delay: 3000 }}
          breakpoints={{
            576: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            992: { slidesPerView: 4 },
          }}
          modules={[Autoplay, Pagination, Navigation]}
          className="swiper-gallery"
        >
          {galleryImages.map((src, index) => (
            <SwiperSlide key={index} className="rounded overflow-hidden">
              <img
                src={src}
                alt={`Gallery Image ${index + 1}`} title={`Gallery Image ${index + 1}`}
                className="img-fluid w-100"
                style={{
                  height: "300px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
                data-aos="fade-up"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
