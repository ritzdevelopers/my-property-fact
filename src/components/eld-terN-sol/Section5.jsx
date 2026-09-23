import Image from "next/image";
import { ASSETS } from "./ui/assets";

/*
  Section 5 — Our Price  (Figma 1:256 "apartment-pricing-section",
  y 3346-3928, h 582, px-80 py-56, gap 53)

    background     : photo + rgba(255,255,255,0.8) wash
    1:257 header   : "Our Price" Playfair Medium 48px + Schibsted Medium 18px
    1:260 cards-row: two 380x320 cards, gap 40
      card body    : pt-48 pb-24 px-32, rounded-12, gap 20
      1:262 card 1 : a Figma shader fill (animated mesh gradient, stops
                     #FFE99E -> #8178FF -> #FF009B) with white typology text
      1:276 card 2 : plain white, black typology text
      badge        : #111 pill, left-120 / top--16, "Apartments"
*/

const CARDS = [
  { id: "shader", price: "₹ 3.11 Cr*", type: "3 BHK", badge: "Apartments" },
  { id: "plain", price: "₹ 3.11 Cr*", type: "3 BHK", badge: "Apartments" },
];

export default function Section5() {
  return (
    <section
      id="price"
      data-figma-node="1:256"
      className="relative w-full overflow-hidden py-14 lg:h-[582px] lg:py-[56px]"
    >
      {/* section background */}
      <Image src={ASSETS.pricingBg.src} alt="Eldeco Ter N Sol Pricing Background" fill sizes="100vw" className="object-cover" title="Eldeco Ter N Sol Pricing Background" />
      <div aria-hidden="true" className="absolute inset-0 bg-[rgba(255,255,255,0.8)]" />

      <div className="relative mx-auto flex w-full max-w-frame flex-col items-center gap-[40px] px-4 sm:px-8 lg:gap-[53px] lg:px-[80px]">
        {/* ── 1:257 section-header ──────────────────────────────── */}
        <div className="flex w-full flex-col items-center gap-[16px] text-center leading-[normal] font-medium">
          <h2 className="font-playfair w-full text-[34px] text-black lg:text-[48px]">
            Our Price
          </h2>
          <p className="w-full text-[16px] text-black/80 lg:text-[18px]">
            Luxury Apartments At Prime Prices
          </p>
        </div>

        {/* ── 1:260 cards-row ───────────────────────────────────── */}
        <div className="flex w-full flex-wrap items-center justify-center gap-[40px]">
          {CARDS.map((card) => {
            return (
              <div
                key={card.id}
                className="relative flex h-[320px] w-full max-w-[380px] shrink-0 flex-col items-center justify-center lg:w-[380px]"
              >
                <div
                  className="relative flex min-h-px w-full flex-1 flex-col items-center justify-center gap-[20px] overflow-hidden rounded-[12px] bg-white px-[32px] pt-[48px] pb-[24px] drop-shadow-[0px_12px_12px_rgba(0,0,0,0.06)]"
                >
                  {/* 1:263 price-container */}
                  <div className="relative flex w-full flex-col items-center">
                    <p className="w-full text-center text-[32px] leading-[normal] font-bold text-[#111]">
                      {card.price}
                    </p>
                  </div>

                  {/* 1:265 Line */}
                  <div
                    aria-hidden="true"
                    className="relative h-px w-full bg-eld-line-2"
                  />

                  {/* 1:266 typology-container */}
                  <div className="relative flex w-full flex-col items-center gap-[6px] leading-[normal] whitespace-nowrap text-black">
                    <div className="flex items-center gap-[8px]">
                      <p className="text-[14px] font-medium">Type:</p>
                      <p className="text-[15px] font-bold">{card.type}</p>
                    </div>
                    <p className="text-[12px] font-normal">Super Built-up Area</p>
                  </div>

                  {/* 1:271 cta-button */}
                  <a
                    href="#callback"
                    data-open-popup
                    className="relative flex w-full items-center justify-center rounded-[6px] bg-eld-bronze px-[24px] py-[12px] transition-opacity hover:opacity-90"
                  >
                    <span className="text-[14px] leading-[normal] font-semibold whitespace-nowrap text-white uppercase">
                      Get Price Details
                    </span>
                  </a>
                </div>

                {/* 1:273 category-badge */}
                <div className="absolute top-[-16px] left-[120px] flex items-center justify-center rounded-[4px] bg-[#111] px-[24px] py-[8px] drop-shadow-[0px_4px_4px_rgba(0,0,0,0.12)]">
                  <p className="text-[13px] leading-[normal] font-bold whitespace-nowrap text-white uppercase">
                    {card.badge}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
