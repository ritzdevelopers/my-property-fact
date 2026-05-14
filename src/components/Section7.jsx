"use client";

import { OPEN_LEAD_POPUP_EVENT } from "./LeadPopup";
import styles from "./page.module.css";

const planSections = [
  {
    title: "Master Plan",
    image: "/eld-imgs/s7/s7-i1.jpg",
    imagePosition: "right",
  },
  {
    title: "Floor Plans",
    image: "/eld-imgs/s7/s7-i2.jpg",
    imagePosition: "left",
  },
];

function Section7() {
  const openLeadPopup = () => {
    window.dispatchEvent(new Event(OPEN_LEAD_POPUP_EVENT));
  };

  return (
    <section id="plans" className="bg-white px-6 pt-[30px] sm:px-10 lg:px-[46px]">
      <div className="mx-auto w-full max-w-[1250px] space-y-8 sm:space-y-[51px]">
        {planSections.map((section) => {
          const imageBlock = (
            <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[16/9] lg:aspect-auto lg:min-h-[441px]">
              <img
                src={section.image}
                alt={section.title}
                className="absolute inset-0 h-full w-full object-cover lg:object-fill"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={openLeadPopup}
                  className="h-[50px] w-full max-w-[180px] rounded-[5px] bg-gradient-to-r from-[#c59c35] to-[#e2d37a] px-[25px] text-[16px] font-[600] text-white shadow-sm transition-all duration-300 hover:-translate-y-[2px] hover:from-[#b88c2c] hover:to-[#d7c565] hover:shadow-[0_10px_22px_rgba(197,156,53,0.35)] active:translate-y-0 sm:w-[180px]"
                >
                  Request A Call
                </button>
              </div>
            </div>
          );

          const titleBlock = (
            <div className="flex min-h-[150px] items-center justify-center px-[24px] text-center sm:min-h-[210px] sm:px-[30px] lg:min-h-[328px] lg:justify-start lg:text-left">
              <h2 className={`${styles.heading} text-[32px] font-[600] text-[#000000] sm:text-[36px] lg:text-[40px]`}>
                {section.title}
              </h2>
            </div>
          );

          return (
            <div
              key={section.title}
              className="grid overflow-hidden rounded-[10px] border border-[#d7c783] lg:grid-cols-2"
            >
              {section.imagePosition === "left" ? imageBlock : titleBlock}
              {section.imagePosition === "left" ? titleBlock : imageBlock}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Section7;
