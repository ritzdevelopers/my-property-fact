import Image from "next/image";
import { ASSETS } from "./ui/assets";

/*
  Section 8 — Virtual Site Tour
    1:174 location-connectivity-section : y5090, bg #fffdfb, h773,
                                          pt-186 pb-96 px-80, header gap 12
    1:176 eyebrow : #f9f5ec pill, 1px #d4af37 border, px-16 py-6
    1:178 title   : Playfair SemiBold 44px/1.2 #161210
    1:179 sub     : 16px/1.5 #6b6661, 882 wide, centred
    1:390 video   : 672x319 poster at y5484 with the 94x65 play badge centred
*/

export default function Section8() {
  return (
    <section className="w-full bg-eld-page pt-16 pb-16 lg:pt-[59px] lg:pb-[60px]">
      <div className="mx-auto w-full max-w-frame px-4 sm:px-8 lg:px-[80px]">
        {/* ── 1:175 section-header ──────────────────────────────── */}
        <div className="flex w-full flex-col items-center gap-[12px]">
          <span className="flex items-start rounded-[100px] border border-eld-gold bg-eld-surface px-[16px] py-[6px]">
            <span className="text-[12px] leading-[normal] font-bold whitespace-nowrap text-eld-gold uppercase">
              Experience Luxury Living Virtually
            </span>
          </span>
          <h2 className="font-playfair w-full text-center text-[32px] leading-[1.2] font-semibold text-eld-ink lg:text-[44px]">
            Virtual Site Tour
          </h2>
          <p className="w-full max-w-[882px] text-center text-[15px] leading-[1.5] font-normal text-eld-muted lg:text-[16px]">
            Experience sophisticated residences, premium amenities, vibrant green
            environments, and well-crafted living spaces through this highly engaging
            experience, virtually! Come experience the style, luxury, and modern lifestyle
            that are redefining life in Sector 80, Gurugram.
          </p>
        </div>

        {/* ── 1:390 video plate ─────────────────────────────────── */}
        <div className="mx-auto mt-10 w-full max-w-[672px] lg:mt-[32px]">
          <button
            type="button"
            data-open-popup
            aria-label="Play the virtual site tour"
            className="group relative block aspect-[672/319] w-full overflow-hidden"
          >
            <Image
              src={ASSETS.videoPoster.src}
              alt="Eldeco Ter N Sol Video Poster"
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              title="Eldeco Ter N Sol Video Poster"
            />
            {/* 1:392 image 15 — play badge */}
            <span className="absolute top-1/2 left-1/2 block h-[46px] w-[66px] -translate-x-1/2 -translate-y-1/2 lg:h-[65px] lg:w-[94px]">
              <Image
                src={ASSETS.playBadge.src}
                alt="Eldeco Ter N Sol Play Badge"
                fill
                sizes="94px"
                className="object-cover"
                title="Eldeco Ter N Sol Play Badge"
              />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
