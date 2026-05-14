"use client";

import { OPEN_LEAD_POPUP_EVENT } from "./LeadPopup";
import styles from "./page.module.css";

const priceCards = [
  {
    type: "3 BHK",
    price: "₹ 3.11 Cr*",
  },
  {
    type: "3.5 BHK",
    price: "₹ On Request",
  },
];

function Section5() {
  const openLeadPopup = () => {
    window.dispatchEvent(new Event(OPEN_LEAD_POPUP_EVENT));
  };

  return (
    <section id="price" className="relative isolate flex min-h-[646px] items-center justify-center overflow-hidden bg-black px-6 py-[35px] text-white sm:px-10 lg:px-0 lg:py-[70px] ">
      <img
        src="/eld-imgs/s5/s5-bg.png"
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover lg:object-fill "
      />
      <div className="absolute inset-0 -z-10 bg-black/20" />

      <div className="mx-auto  w-full max-w-[1024px]">
        <div className="text-center">
          <h2 className={`${styles.heading} md:text-[40px] text-[25px] font-[600] text-[#ffffff]`}>
            Our Price
          </h2>
          <p className={`${styles.paragraph} mt-[5px] md:text-[24px] text-[18px] font-[400]   text-[#ffffff]`}>
            Luxury Apartments At Prime Prices
          </p>
        </div>

        <div className="mx-auto mt-[30px] flex w-full max-w-[382px] flex-col gap-6 sm:mt-[38px] md:max-w-none md:flex-row md:justify-center lg:gap-[65px]">
          {priceCards.map((card) => (
            <article
              key={card.type}
              className="flex min-h-[340px] w-full flex-col items-center justify-center rounded-[4px]   bg-gradient-to-br from-[#C39B47]/50 to-[#EADC84]/90 px-[10px] pb-[26px] pt-[20px] text-center shadow-[0_6px_18px_rgba(0,0,0,0.25)] backdrop-blur-[1px] sm:min-h-[380px] md:max-w-[382px] md:flex-1 lg:w-[382px] lg:flex-none"
            >
              <h3 className={`${styles.heading} text-[30px] font-[700] leading-none text-white`}>
                Apartments
              </h3>

              <div className="mt-[20px] w-full rounded-[6px] bg-white px-4 py-[14px] text-[#171717]">
                <p className={`${styles.paragraph} text-[14px] font-[400] leading-none text-[#424242]`}>Type</p>
                <p className={`${styles.paragraph} mt-[10px] text-[17px] font-[700] leading-none text-[#222222]`}>
                  {card.type}
                </p>
              </div>

              <div className="mt-[28px]">
                <p className={`${styles.paragraph} text-[18px] font-[400] leading-none text-[#ffffff]`}>Price</p>
                <p className={`${styles.paragraph} mt-[11px] text-[23px] font-[700] leading-none text-[#ffffff]`}>
                  {card.price}
                </p>
              </div>

              <button
                type="button"
                onClick={openLeadPopup}
                className="mt-[27px] h-[60px] w-full max-w-[270px] rounded-[5px] border border-[#000000] text-[16px] font-[600] text-[#000000] transition-all duration-300 hover:-translate-y-[2px] hover:bg-black hover:text-white hover:shadow-[0_10px_22px_rgba(0,0,0,0.22)] active:translate-y-0 lg:w-[270px]"
              >
                Get Price Details
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Section5;
