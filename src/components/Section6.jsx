"use client";

import { useState } from "react"; 
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { LiaLongArrowAltRightSolid } from "react-icons/lia";
import { LiaLongArrowAltLeftSolid } from "react-icons/lia"; 
import { OPEN_LEAD_POPUP_EVENT } from "./LeadPopup";
import styles from "./page.module.css";
{/* <LiaLongArrowAltRightSolid />  */}
const galleryImages = [
  {
    src: "/eld-imgs/imgs/n-s1.jpg",
    alt: "Luxury residential towers in Gurgaon",
  },
 
  {
    src: "/eld-imgs/imgs/n-s2.jpg",
    alt: "Modern luxury apartment community",
  },
  {
    src: "/eld-imgs/imgs/n-s3.jpg",
    alt: "Modern luxury apartment community",
  },
  {
    src: "/eld-imgs/imgs/n-s4.jpg",
    alt: "Modern luxury apartment community",
  },
  {
    src: "/eld-imgs/imgs/n-s5.jpg",
    alt: "Modern luxury apartment community",
  },
];

function Section6() {
  const [swiper, setSwiper] = useState(null);

  const openLeadPopup = () => {
    window.dispatchEvent(new Event(OPEN_LEAD_POPUP_EVENT));
  };

  return (
    <section id="gallery" className="overflow-hidden bg-white px-6 py-[35px] text-[#111] sm:px-10 lg:py-[70px]  ">
      <div className="mx-auto w-full max-w-[1250px]">
        <div className="mb-[27px] flex flex-col items-center justify-between gap-5 text-center md:flex-row md:items-start md:gap-8 md:text-left">
          <div className="min-w-0">
            <h2 className={`${styles.heading} md:text-[32px] text-[25px] font-[700] text-[#000000] sm:text-[36px] lg:text-[40px]`}>
              Your Gateway To Luxury Living
            </h2>
            <p className={`${styles.paragraph} mx-auto mt-[8px] max-w-[850px] md:text-[24px] text-[18px] font-[400] text-[#000000] sm:text-[21px] md:mx-0 lg:text-[24px]`}>
              Discover luxury apartments in Sector 80 Gurgaon with premium amenities,
              modern living, & seamless connectivity.
            </p>
          </div>

          <div className="mt-[43px] max-md:hidden flex shrink-0 items-center gap-[17px] text-[27px] leading-none text-black">
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => swiper?.slidePrev()}
              className="transition hover:text-[#c9a846]"
            >
              
             <img src="/eld-imgs/s6/lft-icn.svg" alt="" className=""/>
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => swiper?.slideNext()}
              className="transition hover:text-[#c9a846]"
            >
             <img src="/eld-imgs/s6/rght-icn.svg" alt="" />
            </button>
          </div>
        </div>

        <Swiper
          onSwiper={setSwiper}
          spaceBetween={16}
          slidesPerView={1}
          className="w-full"
          loop
          breakpoints={{
            768: {
              slidesPerView: 2,
              spaceBetween: 16,
            },
          }}
        >
          {galleryImages.map((image, index) => (
            <SwiperSlide key={`${image.src}-${index}`}>
              <div className="relative h-[260px] overflow-hidden rounded-[3px] sm:h-[340px] md:h-[380px] lg:h-[430px]">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="mt-[22px] flex justify-center md:hidden">
          <div className="flex items-center gap-6 text-[27px] leading-none text-black">
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => swiper?.slidePrev()}
              className="transition hover:text-[#c9a846]"
            >
             <img src="/eld-imgs/s6/lft-icn.svg" alt="" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => swiper?.slideNext()}
              className="transition hover:text-[#c9a846]"
            >
             <img src="/eld-imgs/s6/rght-icn.svg" alt="" />
            </button>
          </div>
        </div>

        <div className="mt-[22px] flex justify-center">
          <button
            type="button"
            onClick={openLeadPopup}
            className="h-[50px] w-full max-w-[220px] rounded-[5px] bg-[#c9a846] px-[27px] text-[16px] font-[600] text-white transition-all duration-300 hover:-translate-y-[2px] hover:bg-[#b8963f] hover:shadow-[0_10px_22px_rgba(201,168,70,0.35)] active:translate-y-0 sm:w-auto sm:max-w-none"
          >
            See All Photos
          </button>
        </div>
      </div>
    </section>
  );
}

export default Section6;
