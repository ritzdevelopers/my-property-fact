import Image from "next/image";
import { Check } from "./ui/Icons";
import { EllipseLink, PillButton } from "./ui/Buttons";
import { ASSETS } from "./ui/assets";

/*
  Section 3 — Key Highlights  (Figma 1:123 .. 1:173, y 1728-2472, h 744)
    1:123 Rectangle 9   full-bleed photo + rgba(0,0,0,.46) overlay
    1:124 card          1275x426 at y1995 — a 1269x425 rgba(173,119,54,.78)
                        panel, with the highlight photo masked into its right
                        edge by the Figma "Vector 2" alpha mask
    1:129 Rectangle 11  283x35 open-bracket rule behind the headline
    1:130 headline      Playfair SemiBold 36px white, at x119 / y1903
    1:131 checklist     6 rows, gap 25; 28x28 #ecd8c1 chip + 13px check
    1:168 EllipseLink   "Explore More Highlights", x1153 / y1918
*/

const HIGHLIGHTS = [
  { text: "Amenities: World-class lifestyle & wellness amenities", size: "text-[20px] md:text-[24px]" },
  { text: "Spacious balconies with abundant natural light & airflow", size: "text-[17px] md:text-[20px]" },
  { text: "Multi-tier security system with 24x7 CCTV surveillance", size: "text-[17px] md:text-[20px]" },
  { text: "Strategically located near NH-48, Dwarka Expressway & KMP Expressway", size: "text-[17px] md:text-[20px]" },
  { text: "Seamless connectivity to Cyber City, IMT Manesar & IGI Airport", size: "text-[17px] md:text-[20px]" },
  { text: "Nearby reputed schools, hospitals, malls, & business hubs", size: "text-[17px] md:text-[20px]" },
];

export default function Section3() {
  return (
    <section id="highlights" className="relative w-full overflow-hidden">
      {/* 1:123 — background plate */}
      <Image src={ASSETS.highlightsBg.src} alt="Eldeco Ter N Sol Highlights Background" title="Eldeco Ter N Sol Highlights Background" fill sizes="100vw" className="object-cover" />
      <div aria-hidden="true" className="absolute inset-0 bg-[rgba(0,0,0,0.46)]" />

      <div className="relative mx-auto w-full max-w-frame px-4 py-16 sm:px-8 lg:px-[83px] lg:pt-[175px] lg:pb-[51px]">
        {/* 1:129 + 1:130 — headline with the bracket rule behind it */}
        <div className="relative lg:ml-[5px]">
          <span
            aria-hidden="true"
            className="absolute top-[22px] left-0 hidden h-[35px] w-[283px] lg:block"
          >
            <Image
              src={ASSETS.headlineBrush.src}
              alt="Eldeco Ter N Sol Headline Brush"
              width={ASSETS.headlineBrush.width}
              height={ASSETS.headlineBrush.height}
              className="block size-full"
              title="Eldeco Ter N Sol Headline Brush"
            />
          </span>
          <h2 className="font-playfair relative text-[28px] leading-[normal] font-semibold whitespace-nowrap text-white lg:pl-[31px] lg:text-[36px]">
            Key Highlights
          </h2>
        </div>

        {/* 1:168 — Explore More Highlights */}
        <div className="mt-8 lg:mt-[-43px] lg:ml-auto lg:w-fit">
          <a
            href="#amenities"
            data-open-popup
            aria-label="Explore More Highlights"
            className="group/morph relative block h-[44px] w-[205px] max-w-full"
          >
            <PillButton
              as="span"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 w-full border-white bg-white transition-[opacity,transform] duration-300 group-hover/morph:scale-95 group-hover/morph:opacity-0 [&>span]:text-eld-ink"
            >
              Explore More Highlights
            </PillButton>
            <EllipseLink
              as="span"
              tone="light"
              aria-hidden="true"
              className="pointer-events-none absolute top-[1px] left-0 w-full scale-95 opacity-0 transition-[opacity,transform] duration-300 group-hover/morph:scale-100 group-hover/morph:opacity-100"
            >
              Explore More Highlights
            </EllipseLink>
          </a>
        </div>

        {/* 1:124 — the 1269x425 panel with the masked photo */}
        <div className="mt-10 lg:mt-[49px]">
          <div className="relative w-full overflow-hidden bg-[rgba(173,119,54,0.78)] xl:h-[425px]">
            {/* 1:131 — checklist */}
            <ul className="relative z-10 flex w-full flex-col gap-[18px] p-6 sm:p-8 lg:gap-[25px] lg:px-[36px] lg:py-[52px] xl:w-[68.5%]">
              {HIGHLIGHTS.map((item) => (
                <li key={item.text} className="flex items-center gap-[19px]">
                  <span className="flex size-[28px] shrink-0 flex-col items-center justify-center rounded-[14px] bg-eld-check">
                    <Check className="size-[13px] text-eld-bronze" />
                  </span>
                  <span
                    className={`leading-[normal] font-medium text-white ${item.size}`}
                  >
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* 1:126 Mask group — photo masked by the Figma "Vector 2" alpha mask */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 right-0 hidden w-[32.5%] xl:block"
              style={{
                maskImage: `url("${ASSETS.highlightMask.src}")`,
                WebkitMaskImage: `url("${ASSETS.highlightMask.src}")`,
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskSize: "103% 100%",
                WebkitMaskSize: "103% 100%",
                maskPosition: "center",
                WebkitMaskPosition: "center",
              }}
            >
              <Image
                src={ASSETS.highlightImage.src}
                alt="Eldeco Ter N Sol Highlight Image"
                fill
                sizes="(max-width: 1024px) 100vw, 400px"
                className="object-cover"
                title="Eldeco Ter N Sol Highlight Image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
