"use client";

import { useState } from "react";
import { OPEN_LEAD_POPUP_EVENT } from "./LeadPopup";
import styles from "./page.module.css";

const amenities = [
  {
    title: "All Weather Infinity Pool",
    image: "/eld-imgs/amenities/infinity-pool.jpg",
    icon: "/eld-imgs/s4/s4-i1.svg",
  },
  {
    title: "Lawn Tennis Court",
    image: "/eld-imgs/amenities/lawn-tenis.jpg",
    icon: "/eld-imgs/s4/s4-i2.svg",
  },
  {
    title: "Yoga & Aerobics",
    image: "/eld-imgs/amenities/yoga.jpg",
    icon: "/eld-imgs/s4/s4-i3.svg",
  },
  {
    title: "Jogging and Fitness Tracks",
    image: "/eld-imgs/amenities/jogging.jpg",
    icon: "/eld-imgs/s4/s4-i4.svg",
  },
  {
    title: "Landscaped Podium Greens",
    image: "/eld-imgs/amenities/landscaped.jpg",
    icon: "/eld-imgs/s4/s4-i5.svg",
  },
  {
    title: "Badminton, Cricket, & Squash Court",
    image: "/eld-imgs/amenities/bed-minton.jpg",
    icon: "/eld-imgs/s4/s4-i6.svg",
  },
  {
    title: "3 High-Speed Lift Per Tower",
    image: "/eld-imgs/amenities/high-speed.jpg",
    icon: "/eld-imgs/s4/s4-i7.svg",
  },
  {
    title: "Exclusive GQ Club",
    image: "/eld-imgs/amenities/ExclusiveGQClub.jpg",
    icon: "/eld-imgs/s4/s4-i8.svg",
  },
];

function Section4() {
  const [activeAmenity, setActiveAmenity] = useState(0);

  const openLeadPopup = () => {
    window.dispatchEvent(new Event(OPEN_LEAD_POPUP_EVENT));
  };

  return (
    <section id="amenities" className="bg-white  px-6 py-[35px] text-[#202020] sm:px-10 lg:px-11 lg:py-[70px]">
      <div className=" w-full max-w-[1250px] m-auto">
        <div className="mb-[27px] text-center">
          <h2 className={`${styles.heading} md:text-[40px] text-[25px] font-[600] text-[#222222]`}>
            Modern Amenities
          </h2>
          <p className={`${styles.paragraph} mt-[5px] md:text-[24px] text-[18px] font-[400]   text-[#202020]`}>
            Best Amenities In Gurgaon Residences
          </p>
        </div>

        <div className="flex flex-col items-stretch justify-between gap-7 lg:flex-row lg:gap-[14px]">
          <div className="grid w-full grid-cols-2 gap-x-[14px] gap-y-[13px] lg:w-auto lg:shrink-0">
            {amenities.map((amenity, index) => {
              const isActive = activeAmenity === index;

              return (
                <button
                  key={amenity.title}
                  type="button"
                  onClick={() => setActiveAmenity(index)}
                  className={`flex h-[66px] w-full flex-col items-center justify-center rounded-[5px] border text-center transition md:h-[104px] lg:w-[170px] xl:w-[209px] ${
                    isActive
                      ? " bg-gradient-to-r from-[#c59c35] to-[#e2d37a] text-white "
                      : "border-[#dedede] bg-white text-[#1f1f1f]"
                  }`}
                >
                  <span className="mb-[5px] max-md:hidden md:flex h-[27px] items-center justify-center">
                    <img
                      src={amenity.icon}
                      alt={amenity.title}
                      className={`h-[27px] w-[40px] object-contain transition ${
                        isActive ? "brightness-0 invert" : "brightness-0"
                      }`}
                    />
                  </span>
                  <span className={`${styles.paragraph} max-w-[162px] px-2 text-[14px] font-[400] xl:px-0`}>
                    {amenity.title}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={openLeadPopup}
              className="col-span-2 mt-[5px] max-lg:hidden h-[60px] rounded-[5px] bg-gradient-to-r from-[#c39a34] to-[#e3d57c] text-[16px] font-[600] text-white transition-all duration-300 hover:-translate-y-[2px] hover:from-[#b98f2e] hover:to-[#d8c866] hover:shadow-[0_10px_22px_rgba(195,154,52,0.35)] active:translate-y-0 lg:block"
            >
              View All Amenities
            </button>
          </div>

          <div className="relative aspect-[790/533] w-full overflow-hidden rounded-[13px] lg:aspect-auto lg:min-h-[533px] lg:min-w-0 lg:flex-1 lg:max-w-none xl:min-h-0 xl:max-w-[790px]">
            <img
              key={activeAmenity}
              src={amenities[activeAmenity].image}
              alt={amenities[activeAmenity].title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <button
            type="button"
            onClick={openLeadPopup}
            className="mt-[5px] h-[60px] w-full shrink-0 rounded-[5px] bg-gradient-to-r from-[#c39a34] to-[#e3d57c] text-[16px] font-[600] text-white transition-all duration-300 hover:-translate-y-[2px] hover:from-[#b98f2e] hover:to-[#d8c866] hover:shadow-[0_10px_22px_rgba(195,154,52,0.35)] active:translate-y-0 lg:hidden"
          >
            View All Amenities
          </button>
        </div>
      </div>
    </section>
  );
}

export default Section4;