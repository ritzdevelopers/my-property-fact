import Image from "next/image";
import { ASSETS } from "./ui/assets";

/*
  Section 10 — Footer  (Figma 1:393 .. 1:441, y 6535-7035, h 500)
    1:393 Rectangle 17 : full-bleed photo + rgba(0,0,0,0.7) overlay
    1:443 logo box     : 253 wide, 1px #f2e5c0, rounded-9, p-10, at y6610.
                         The image inside is aspect-[355/90].
    1:442 heading      : "Request a Call Back" Playfair Medium 36px white
    1:438 disclaimer   : 1159 wide, 15px/1.7 white, centred
    1:439 "*T&C Apply" : 15px/1.7 white
    1:440 copyright bar: full-width #8e704c, py-18, Schibsted Italic 14px
                         #eae3da
*/

const DISCLAIMER =
  "This website is for informational purposes only and does not constitute an offer to sell or a solicitation to buy any property. All images, plans, specifications, amenities, and pricing are indicative and subject to change without notice. The content may include artistic impressions and conceptual representations. Interested buyers are advised to verify all details, including area, pricing, and availability, with the sales team before making any decision. The developer reserves the right to make changes in accordance with applicable laws and approvals.";

export default function Section10() {
  return (
    <footer className="w-full">
      {/* ── 1:393 photographic band ────────────────────────────── */}
      <div className="relative w-full overflow-hidden">
        <Image
          src={ASSETS.footerBg.src}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[rgba(0,0,0,0.7)]" />

        <div className="relative mx-auto flex w-full max-w-frame flex-col items-center px-4 pt-[60px] pb-[40px] sm:px-8 lg:px-[141px] lg:pt-[75px]">
          {/* 1:443 logo box */}
          <div className="w-[200px] rounded-[9px] border border-eld-cream p-[10px] lg:w-[253px]">
            <div className="relative aspect-[355/90] w-full">
              <Image
                src={ASSETS.footerLogo.src}
                alt="Eldeco Terra & Sol"
                fill
                sizes="253px"
                className="object-cover"
              />
            </div>
          </div>

          {/* 1:442 heading */}
          <h2 className="font-playfair mt-[36px] text-[28px] leading-[normal] font-medium whitespace-nowrap text-white lg:text-[36px]">
            <a href="#callback" className="transition-opacity hover:opacity-80">
              Request a Call Back
            </a>
          </h2>

          {/* 1:438 disclaimer */}
          <p className="mt-[20px] w-full max-w-[1159px] text-center text-[14px] leading-[1.7] font-normal text-white lg:text-[15px]">
            {DISCLAIMER}
          </p>

          {/* 1:439 */}
          <p className="mt-[16px] text-center text-[14px] leading-[1.7] font-normal whitespace-nowrap text-white lg:text-[15px]">
            {`*T&C Apply`}
          </p>
        </div>
      </div>

      {/* ── 1:440 copyright bar ────────────────────────────────── */}
      <div className="flex w-full items-center justify-center bg-eld-bronze px-[10px] py-[18px]">
        <p className="text-center text-[13px] leading-[1.7] font-normal text-eld-line-2 italic lg:text-[14px]">
          © 2026 Eldeco Group. All Rights Reserved. | RERA Registered
        </p>
      </div>
    </footer>
  );
}
