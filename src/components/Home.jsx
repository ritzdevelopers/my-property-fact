"use client";

import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useEffect, useLayoutEffect, useState } from "react";
import styles from "./page.module.css";

// Desktop View Images
const slides = [
  "/eld-imgs/imgs/eld-img-2.jpg",
  "/eld-imgs/imgs/slider2.jpg",
  "/eld-imgs/imgs/slider1.jpg",
];

// Mobile / tablet (< lg): third slide uses mobile-specific art
const slides_mobile = [
  "/eld-imgs/imgs/eld-img-2.jpg",
  "/eld-imgs/imgs/slider2.jpg",
  "/eld-imgs/imgs/mobile-bg-img.jpg",
];

function useHeroSlides() {
  const [isLg, setIsLg] = useState(true);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsLg(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isLg ? slides : slides_mobile;
}

function Home() {
  const heroSlides = useHeroSlides();
  const [activeSlide, setActiveSlide] = useState(0);
  const [swiper, setSwiper] = useState(null);

  useEffect(() => {
    setActiveSlide(0);
  }, [heroSlides]);

  const previousSlide = () => {
    swiper?.slidePrev();
  };

  const nextSlide = () => {
    swiper?.slideNext();
  };

  return (
    <section id="home" className="relative isolate min-h-screen overflow-hidden   text-white">
      <div className="absolute inset-0 -z-10">
        <Swiper
          key={heroSlides === slides ? "desktop" : "mobile"}
          modules={[Autoplay]}
          onSwiper={setSwiper}
          onSlideChange={(slider) => setActiveSlide(slider.realIndex)}
          autoplay={{
            delay: 7000,
            disableOnInteraction: false,
          }}
          loop
          className="h-full w-full"
        >
          {heroSlides.map((src, index) => (
            <SwiperSlide key={`${src}-${index}`}>
              <img
                src={src}
                alt="Iconic luxury apartments in Gurgaon"
                className="h-full w-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/25 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" /> */}
      </div>

      <div className="absolute left-1/2 md:top-[9%] top-[12%] w-full max-w-[1250px] -translate-x-1/2  px-6 sm:px-12 xl:px-0">
        <div className={`${styles.paragraph} ml-auto w-fit text-right text-[9px] font-[400]  text-white`}>
          Project RERA No.: GGM/XXXX/XXX/2023/XX Dated: 11.02.2026
          <br />
          Agent RERA No.: RC/HARERA/GGM/XXXX/2023/22
          <br />
          https://haryanarera.gov.in/
        </div>
      </div>

      <div className="mx-auto flex min-h-screen max-w-[1250px] items-end px-6 pb-[60px] md:pb-0 sm:px-12 xl:px-0">
        <div className="mb-8 w-full max-w-[600px] text-center">
          <h1
            className={`${styles.heading} mb-3 font-bold leading-tight text-[22px] min-[640px]:text-[26px] min-[768px]:text-[30px]`}
          >
            Iconic Luxury Apartments In Gurgaon
          </h1>

          <div className="mb-4 grid max-w-[600px] grid-cols-1 text-[16px] font-bold text-white min-[640px]:grid-cols-[1fr_1.1fr] min-[768px]:text-[14px]">
            <div className="border border-white/65 bg-black/25 px-5 py-4">
              Ultra Luxurious Apartments
            </div>
            <div className="bg-white px-5 py-4 text-neutral-900">
              3 /3.5 BHK Premium Residences
            </div>
          </div>

          <div className="mb-3 flex w-full items-center justify-center gap-7">
            <div>
              <p
                className={`${styles.paragraph} mb-1 text-[13px] font-semibold uppercase tracking-wider text-white/80`}
              >
                Starting Price
              </p>
              <p
                className={`${styles.paragraph} text-[20px] font-bold min-[768px]:text-[24px]`}
              >
                ₹3.11 Cr*
              </p>
            </div>

            <div className="h-12 w-px bg-white/55" />

            <div>
              <p
                className={`${styles.paragraph} mb-1 text-[13px] font-semibold uppercase tracking-wider text-white/80`}
              >
                Nothing for 36 Months
              </p>
              <p
                className={`${styles.paragraph} text-[20px] font-bold min-[768px]:text-[24px]`}
              >
                Pay 30% Now
              </p>
            </div>
          </div>

          <div className="mb-4 inline-flex w-full flex-wrap items-center justify-center gap-2 bg-[#c9a032] px-4 py-2 text-[13px] font-semibold text-white min-[768px]:gap-0 min-[768px]:text-[12px]">
            <span>Luxurious Properties</span>
            <span className="mx-3 max-md:hidden h-4 w-px bg-white/70 md:block" />
            <span>Prime Locations</span>
            <span className="mx-3 max-md:hidden h-4 w-px bg-white/70 md:block" />
            <span>Wrapped Balconies</span>
            <span className="mx-3 max-md:hidden h-4 w-px bg-white/70 md:block" />
            <span>Virtual Visit</span>
          </div>

          <p
            className={`${styles.paragraph} flex items-center justify-center gap-2 text-center text-[16px] font-semibold  `}
          >
            <span>●</span>
            At Sector 80, Gurugram
          </p>
        </div>
      </div>

      <div className="absolute bottom-5 lg:bottom-14 md:-right-8 lg:right-0 lg:left-1/2 w-full left-1/2 -translate-x-1/2 max-w-[1250px] lg:-translate-x-1/2 px-6 sm:px-12 lg:px-0">
        <div className="ml-auto flex w-fit items-center gap-5">
          <div className="flex items-center gap-4 text-sm font-bold">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => swiper?.slideToLoop(index)}
                className={`border-b pb-1 transition ${styles.heading} ${
                  activeSlide === index
                    ? "border-white text-white"
                    : "border-transparent text-white/75"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
          <div className="h-px w-28 bg-white" />

         <div className="flex items-center gap-0">
         <button type="button" onClick={previousSlide} className="cursor-pointer">
           <img src="/lft.svg" alt="" className="w-[25px] h-[25px]"/>
          </button>
          <button type="button" onClick={nextSlide} className="cursor-pointer">
          <img src="/rght.svg" alt="" className="w-[25px] h-[25px]"/>
          </button>
         </div>
        </div>
      </div>
    </section>
  );
}

export default Home;