"use client";

import Image from "next/image";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { EllipseLink, PillButton } from "./ui/Buttons";
import { ASSETS } from "./ui/assets";
import styles from "./Section6.module.css";

/*
  Section 6 — Gallery  (Figma 1:289, y 3928-4686, 1352 wide, py-56, gap 50)
    1:291 header : "Your Gateway To Luxury Living" Playfair SemiBold 36px over
                   a 756px 18px sub, with the "View All Photos" pill right
    1:299 plates : 1097x494 + 226x494, gap 29
    1:302 Group 1: the 102x102 Figma circle vector, at left-14 / top-367
*/

const GALLERY_IMAGES = Array.from(
  { length: 5 },
  (_, index) => `/eldeco-terraNSole/slider/sl${index + 1}.jpg`,
);

export default function Section6() {
  return (
    <section id="gallery" className="w-full bg-white py-10 lg:py-[56px]">
      <div className="mx-auto flex w-full max-w-frame flex-col items-start px-4 sm:px-8 min-[1400px]:px-[44px]">
        <div className="flex w-full flex-col items-center gap-[40px] lg:gap-[50px]">
          {/* ── 1:291 header ──────────────────────────────────────── */}
          <div className="flex w-full flex-wrap items-center justify-between gap-6 md:flex-nowrap">
            <div className="flex min-w-0 flex-col items-start gap-[15px] leading-[normal] md:flex-1 min-[1400px]:w-[756px] min-[1400px]:flex-none">
              <h2 className="font-playfair text-[28px] font-semibold text-black lg:text-[36px] lg:whitespace-nowrap">
                Your Gateway To Luxury Living
              </h2>
              <p className="w-full text-[16px] font-normal text-black/60 lg:text-[18px]">
                {`Discover luxury apartments in Sector 80 Gurgaon with premium amenities, modern living, & seamless connectivity.`}
              </p>
            </div>
            <a
              href="#gallery"
              data-open-popup
              aria-label="View All Photos"
              className="group/morph relative block h-[44px] w-[187px] shrink-0"
            >
              <PillButton
                as="span"
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 w-full transition-[opacity,transform] duration-300 group-hover/morph:scale-95 group-hover/morph:opacity-0"
              >
                View All Photos
              </PillButton>
              <EllipseLink
                as="span"
                tone="bronze"
                aria-hidden="true"
                className="pointer-events-none absolute top-[1px] left-0 w-full scale-95 opacity-0 transition-[opacity,transform] duration-300 group-hover/morph:scale-100 group-hover/morph:opacity-100"
              >
                View All Photos
              </EllipseLink>
            </a>
          </div>

          {/* ── 1:299 plates ──────────────────────────────────────── */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] sm:aspect-[16/9] md:aspect-[1352/494] md:rounded-none min-[1400px]:h-[494px] min-[1400px]:aspect-auto">
            <Swiper
              modules={[Autoplay]}
              slidesPerView={1}
              spaceBetween={0}
              breakpoints={{
                768: { slidesPerView: 1.28, spaceBetween: 29 },
                1400: { slidesPerView: 1.2265, spaceBetween: 29 },
              }}
              loop
              speed={850}
              grabCursor
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              className={styles.slider}
            >
              {GALLERY_IMAGES.map((src, index) => (
                <SwiperSlide key={src} className={styles.slide}>
                  <Image
                    src={src}
                    alt={`Eldeco Terra & Sol gallery view ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 1097px"
                    className="pointer-events-none object-cover"
                  />

                  {/* 1:302 Group 1 — visible only on the active slide */}
                  <a
                    href="#gallery"
                    data-open-popup
                    aria-label="Open the full gallery"
                    className={`${styles.action} absolute bottom-[14px] left-[14px] z-10 block size-[64px] hover:scale-105 lg:size-[82px] min-[1400px]:top-[367px] min-[1400px]:bottom-auto min-[1400px]:size-[102px]`}
                  >
                    <Image
                      src={ASSETS.galleryCircle.src}
                      alt="Eldeco Ter N Sol Gallery Circle"
                      width={ASSETS.galleryCircle.width}
                      height={ASSETS.galleryCircle.height}
                      className="block size-full"
                      title="Eldeco Ter N Sol Gallery Circle"
                    />
                  </a>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
