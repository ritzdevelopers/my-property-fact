"use client";
import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

import "../../style.css";

// import required modules
import { Pagination } from "swiper/modules";

export default function App() {
  return (
    <>
      <Swiper
        slidesPerView={3}
        breakpoints={{
          0: {
            slidesPerView: 1, // mobile
            spaceBetween: 10,
          },
          768: {
            slidesPerView: 2, // tablet
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3, // desktop
            spaceBetween: 30,
          },
        }}
        spaceBetween={30}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        className="mySwiper"
      >
        <SwiperSlide>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
                padding: "30px",
                gap:"20px",
              height: "100%",
              width: "100%",
            }}
          >
            <img
              style={{
                width: "100px",
                height: "100px",
              }}
              src="/dolera/s4/dol-s4-i1.png"
              alt="infrastructure & connectivity" title="infrastructure & connectivity"
            />
            <p
              style={{
                fontWeight: 400,
                fontSize: "16px",
                color: "white",
              }}
            >
              World-class infrastructure & connectivity: within & outside
            </p>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          {" "}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
                padding: "30px",
                gap:"20px",
            }}
          >
            <img
              style={{
                width: "100px",
                height: "100px",
              }}
              src="/dolera/s4/dol-s4-i2.png"
              alt="International & Domestic Markets" title="International & Domestic Markets"
            />
            <p
              style={{
                fontWeight: 400,
                fontSize: "16px",
                color: "white",
              }}
            >
              Capable to cater to both the International & Domestic Markets
            </p>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          {" "}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
                padding: "30px",
                gap:"20px",
            }}
          >
            <img
              style={{
                width: "100px",
                height: "100px",
              }}
              src="/dolera/s4/dol-s4-i3.png"
              alt="Benefit of the sea coast" title="Benefit of the sea coast"
            />
            <p
              style={{
                fontWeight: 400,
                fontSize: "16px",
                color: "white",
              }}
            >
            Benefit of the sea coast, nature park, and golf course.
            </p>
          </div>
        </SwiperSlide>

       
      </Swiper>
    </>
  );
}
