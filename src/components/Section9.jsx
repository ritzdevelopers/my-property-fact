"use client";

import { OPEN_LEAD_POPUP_EVENT } from "./LeadPopup";
import styles from "./page.module.css";

function Section9() {
  const openLeadPopup = () => {
    window.dispatchEvent(new Event(OPEN_LEAD_POPUP_EVENT));
  };

  return (
    <section id="virtual-tour" className="relative isolate flex min-h-[491px] items-center justify-center overflow-hidden px-6 py-[35px] text-white sm:px-10 lg:px-[49px] lg:py-[70px]">
      <img
        src="/eld-imgs/s9/s9-bg2.jpg"
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
    

      <div className="mx-auto flex w-full max-w-[1250px] flex-col items-center justify-center gap-8 lg:flex-row lg:gap-10 xl:gap-[70px]">
        <div className="relative aspect-[622/344] w-full max-w-[622px] overflow-hidden rounded-[22px] shadow-[0_12px_32px_rgba(0,0,0,0.32)] lg:h-[344px] lg:flex-1 xl:w-full xl:flex-none">
          <img
            src="/eld-imgs/s9/s9-i3.jpg"
            alt="Virtual site tour preview"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              aria-label="Play virtual site tour"
              className="flex h-[44px] w-[61px] cursor-pointer items-center justify-center rounded-[8px] bg-[#ff0000] shadow-[0_8px_18px_rgba(0,0,0,0.28)]"
            >
              <span className="ml-[4px] h-0 w-0 border-y-[11px] border-l-[17px] border-y-transparent border-l-white" />
            </button>
          </div>
        </div>

        <div className="relative flex w-full max-w-[520px] flex-col items-center text-center lg:items-start lg:text-left">
          <h2 className={`${styles.heading} text-[32px] font-[600] text-[#E0BE62] sm:text-[36px] lg:text-[40px]`}>
            Virtual Site Tour
          </h2>
          <p className={`${styles.paragraph} mt-[13px] text-[20px] font-[400] text-[#ffffff] sm:text-[22px] lg:text-[24px]`}>
            Experience Luxury Living Virtually
          </p>
          <p className={`${styles.paragraph} mt-[20px] text-[16px] font-[400] text-[#ffffff]`}>
            Experience sophisticated residences, premium amenities, vibrant green
            environments, and well-crafted living spaces through this highly engaging
            experience, virtually! Come experience the style, luxury, and modern
            lifestyle that are redefining life in Sector 80, Gurugram.
          </p>

          <button
            type="button"
            onClick={openLeadPopup}
            className="mt-[34px] h-[60px] w-full max-w-[270px] rounded-[5px] bg-gradient-to-r from-[#c59c35] to-[#f0dd7b] text-[16px] font-[600] text-black transition-all duration-300 hover:-translate-y-[2px] hover:from-[#b88c2c] hover:to-[#dcc86c] hover:shadow-[0_10px_22px_rgba(197,156,53,0.35)] active:translate-y-0 sm:w-[270px]"
          >
            Request E-Brochure
          </button>
        </div>
      </div>
    </section>
  );
}

export default Section9;
