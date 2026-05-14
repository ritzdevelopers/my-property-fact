"use client";

import { OPEN_LEAD_POPUP_EVENT } from "./LeadPopup";
import styles from "./page.module.css";

const leftHighlights = [
  {
    text: "Amenities: World-class lifestyle & wellness amenities",
    icon: "/eld-imgs/s3/s3-s1.svg",
  },
  {
    text: "Spacious balconies with abundant natural light & airflow",
    icon: "/eld-imgs/s3/s3-s2.svg",
  },
  {
    text: "Multi-tier security system with 24x7 CCTV surveillance",
    icon: "/eld-imgs/s3/s3-s3.svg",
  },
];

const rightHighlights = [
  {
    text: "Strategically located near NH-48, Dwarka Expressway & KMP Expressway",
    icon: "/eld-imgs/s3/s3-s4.svg",
  },
  {
    text: "Seamless connectivity to Cyber City, IMT Manesar & IGI Airport",
    icon: "/eld-imgs/s3/s3-s5.svg",
  },
  {
    text: "Nearby reputed schools, hospitals, malls, & business hubs",
    icon: "/eld-imgs/s3/s3-s6.svg",
  },
];

const allHighlights = [...leftHighlights, ...rightHighlights];

function Section3() {
  const openLeadPopup = () => {
    window.dispatchEvent(new Event(OPEN_LEAD_POPUP_EVENT));
  };

  return (
    <section
      id="highlights"
      className="flex min-h-0 items-center justify-center overflow-hidden bg-black px-6 py-[35px] text-white sm:px-10 lg:min-h-[715px] lg:px-[58px] lg:py-[70px]"
    >
      <div className="mx-auto w-full max-w-none text-center xl:max-w-[860px]">
        {/* Mobile & tablet: heading → grid → image → CTA (centered) */}
        <div className="mt-[18px] flex flex-col items-center justify-center gap-8 sm:gap-10 lg:hidden">
          <div className="relative z-20 flex w-full items-center justify-center">
            <h2
              className={`${styles.heading} text-[32px] font-[600] leading-none tracking-[-0.02em] sm:text-[36px]`}
            >
              Key Highlights
            </h2>
          </div>

          <div className="grid w-full max-w-[520px] grid-cols-2 justify-items-center gap-x-4 gap-y-6 sm:max-w-[600px] sm:gap-x-6 sm:gap-y-7 md:max-w-[720px] md:grid-cols-3 md:gap-x-6 md:gap-y-8">
            {allHighlights.map((highlight, idx) => (
              <HighlightCard
                key={highlight.text}
                {...highlight}
                idx={idx}
                position="grid"
              />
            ))}
          </div>

          <div className="relative my-[10px] flex h-[196px] w-full max-w-[min(100%,288px)] items-center justify-center min-[375px]:h-[230px] min-[375px]:max-w-[360px] sm:h-[300px] sm:max-w-[460px]">
            <div className="absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-[68%] -translate-y-1/2 rounded-full border border-white/45 bg-black min-[375px]:h-[250px] min-[375px]:w-[250px] min-[375px]:-translate-x-[73%] sm:h-[330px] sm:w-[330px] sm:-translate-x-[75%]" />
            <div className="absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-[32%] -translate-y-1/2 rounded-full border border-white/45 bg-black min-[375px]:h-[250px] min-[375px]:w-[250px] min-[375px]:-translate-x-[27%] sm:h-[330px] sm:w-[330px] sm:-translate-x-[25%]" />

            <div className="relative z-10 h-[188px] w-[188px] min-[375px]:h-[260px] min-[375px]:w-[260px] sm:h-[340px] sm:w-[340px]">
              <img
                src="/eld-imgs/imgs/n-circle2.png"
                alt="Eldeco luxury towers"
                className="absolute inset-0 h-full w-full object-contain"
              />
            </div>
          </div>

          <div className="relative z-20 flex w-full items-center justify-center">
            <button
              type="button"
              onClick={openLeadPopup}
              className="h-[60px] w-full max-w-[269px] cursor-pointer rounded-[4px] bg-[#d3b65b] px-[27px] text-[16px] font-[600] text-white transition-all duration-300 hover:-translate-y-[2px] hover:bg-[#c2a64d] hover:shadow-[0_10px_22px_rgba(211,182,91,0.35)] active:translate-y-0"
            >
              Explore More Highlights
            </button>
          </div>
        </div>

        {/* Desktop (lg+): side columns + Venn center */}
        <div className="mt-[25px] max-lg:hidden flex flex-col items-center justify-center gap-8 lg:flex-row lg:gap-8 xl:gap-[88px]">
          <div className="flex w-full max-w-[460px] flex-col justify-between gap-5 sm:gap-6 lg:h-full lg:w-auto lg:min-w-[170px] lg:max-w-[190px] lg:gap-[52px] xl:min-w-[200px] xl:max-w-none xl:gap-[77px]">
            {leftHighlights.map((highlight, idx) => (
              <HighlightCard
                key={highlight.text}
                {...highlight}
                position="left"
                idx={idx}
              />
            ))}
          </div>

          <div className="relative mx-auto flex w-full max-w-[360px] flex-col items-center justify-center gap-8 sm:max-w-[460px] sm:gap-10 lg:max-w-[410px] lg:gap-[42px] xl:max-w-[500px] xl:gap-[50px]">
            <div className="relative z-20 flex w-full items-center justify-center">
              <h2
                className={`${styles.heading} text-[32px] font-[600] leading-none tracking-[-0.02em] sm:text-[36px] lg:text-[38px] xl:text-[40px]`}
              >
                Key Highlights
              </h2>
            </div>

            <div className="relative my-[18px] flex h-[230px] w-full items-center justify-center sm:h-[300px] lg:h-[300px] xl:h-[340px]">
              <div className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-[73%] -translate-y-1/2 rounded-full border border-white/45 bg-black sm:h-[330px] sm:w-[330px] sm:-translate-x-[75%] lg:h-[340px] lg:w-[340px] lg:-translate-x-[76%] xl:h-[403px] xl:w-[403px] xl:-translate-x-[78%]" />
              <div className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-[27%] -translate-y-1/2 rounded-full border border-white/45 bg-black sm:h-[330px] sm:w-[330px] sm:-translate-x-[25%] lg:h-[340px] lg:w-[340px] lg:-translate-x-[24%] xl:h-[403px] xl:w-[403px] xl:-translate-x-[22%]" />

              <div className="relative z-10 h-[260px] w-[260px] sm:h-[340px] sm:w-[340px] lg:h-[350px] lg:w-[350px] xl:h-[419px] xl:w-[419px]">
                <img
                  src="/eld-imgs/imgs/n-circle2.png"
                  alt="Eldeco luxury towers"
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>

            <div className="relative z-20 flex w-full items-center justify-center">
              <button
                type="button"
                onClick={openLeadPopup}
                className="h-[60px] w-full max-w-[269px] cursor-pointer rounded-[4px] bg-[#d3b65b] px-[27px] text-[16px] font-[600] text-white transition-all duration-300 hover:-translate-y-[2px] hover:bg-[#c2a64d] hover:shadow-[0_10px_22px_rgba(211,182,91,0.35)] active:translate-y-0 xl:w-[269px]"
              >
                Explore More Highlights
              </button>
            </div>
          </div>

          <div className="flex w-full max-w-[460px] flex-col justify-between gap-5 sm:gap-6 lg:h-full lg:w-auto lg:min-w-[170px] lg:max-w-[190px] lg:gap-[52px] xl:min-w-[200px] xl:max-w-none xl:gap-[77px]">
            {rightHighlights.map((highlight, idx) => (
              <HighlightCard
                key={highlight.text}
                {...highlight}
                idx={idx}
                position="right"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HighlightCard({
  icon,
  text,
  idx,
  position,
}) {
  const offsetClass =
    position === "left" && idx === 1
      ? "lg:-ml-[36px] xl:-ml-[50px]"
      : position === "right" && idx === 1
        ? "lg:translate-x-[36px] xl:translate-x-[50px]"
        : "";

  const iconWrapClass =
    position === "grid"
      ? "mb-2 flex h-[32px] w-full max-w-[40px] items-center justify-center text-[#d3b65b] sm:mb-[10px] sm:h-[36px] sm:max-w-[44px] md:h-[38px] md:max-w-[46px]"
      : "mb-[11px] flex h-[35px] items-center justify-center text-[#d3b65b]";

  const textClass =
    position === "grid"
      ? `${styles.paragraph} w-full max-w-[170px] text-[13px] font-[400] leading-[1.45] text-white sm:max-w-[200px] sm:text-[14px] md:max-w-[220px] md:text-[15px]`
      : `${styles.paragraph} w-full text-[15px] font-[400] leading-[1.45] text-white`;

  return (
    <div
      className={`flex w-full flex-col items-center text-center ${offsetClass}`}
    >
      <div className={iconWrapClass}>
        <img src={icon} alt="" className="h-full w-full object-contain" />
      </div>
      <p className={textClass}>{text}</p>
    </div>
  );
}

export default Section3;
