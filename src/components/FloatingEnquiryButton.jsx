"use client";

import { OPEN_LEAD_POPUP_EVENT } from "./LeadPopup";
import styles from "./page.module.css";

function FloatingEnquiryButton() {
  const openLeadPopup = () => { 
    window.dispatchEvent(new Event(OPEN_LEAD_POPUP_EVENT));
  };

  return (
    <button
      type="button"
      aria-label="Open enquiry form"
      onClick={openLeadPopup}
      className={`${styles.floatingEnquiryButton} fixed bottom-5 right-5 z-[90] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#c9a846] text-white shadow-[0_10px_26px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-[#b8963f] hover:shadow-[0_14px_30px_rgba(201,168,70,0.35)] active:scale-95 lg:bottom-auto lg:right-0 lg:top-1/2 lg:h-[150px] lg:w-[46px] lg:-translate-y-1/2 lg:rounded-l-[4px] lg:rounded-r-none`}
    >
      <span className="max-lg:hidden [writing-mode:vertical-rl] rotate-180 text-[16px] font-[600] leading-none lg:block">
        Enquire Now
      </span>

      <svg
        className="h-6 w-6 lg:hidden"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 5.5A2.5 2.5 0 0 1 7.5 3h9A2.5 2.5 0 0 1 19 5.5v7A2.5 2.5 0 0 1 16.5 15H12l-4.7 4.2A.75.75 0 0 1 6 18.64V15.1A2.5 2.5 0 0 1 5 13.12V5.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 8h7M8.5 11h4.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

export default FloatingEnquiryButton;
