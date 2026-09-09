"use client";

import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

type GallerySliderProps = {
  images: string[];
};

export default function GallerySlider({ images }: GallerySliderProps) {
  return (
    <Swiper
      modules={[Autoplay]}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      loop
      grabCursor
      speed={700}
      spaceBetween={19}
      slidesPerView="auto"
      className="w-full cursor-grab active:cursor-grabbing"
    >
      {images.map((src, index) => (
        <SwiperSlide
          key={`${src}-${index}`}
          className="!w-[min(100%,831px)]"
        >
          <div className="relative h-[260px] w-full max-w-[831px] overflow-hidden rounded-[30px] min-[760px]:h-[459px]">
            <img
              src={src}
              alt={`Eldeco 7 Peaks gallery ${index + 1}`}
              className="block h-full w-full object-cover select-none"
              draggable={false}
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
