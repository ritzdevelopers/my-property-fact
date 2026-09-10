"use client";

import { usePathname } from "next/navigation";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import { openSevenPeaksPopup } from "@/app/eldeco-7-peaks/Popup";

export default function FloatingEnquiryButton() {
  const pathname = usePathname();

  if (pathname?.includes("/thank-you")) return null;


  
  return (
    <button
      type="button"
      onClick={openSevenPeaksPopup}
      aria-label="Enquire now"
      className="btn-7peaks-slide fixed bottom-6 right-6 z-[150] inline-flex cursor-pointer items-center gap-2.5 rounded-full border-none px-5 py-3.5 text-sm font-semibold shadow-[0_10px_28px_rgba(9,33,25,0.35)] transition-[box-shadow] duration-300 hover:shadow-[0_14px_32px_rgba(9,33,25,0.45)] max-[520px]:bottom-4 max-[520px]:right-4 max-[520px]:px-4 max-[520px]:py-3 max-[520px]:text-[13px]"
    >
      <span className="relative z-[1] inline-flex items-center gap-2.5">
        <HiOutlineChatAlt2
          size={20}
          className="shrink-0"
          aria-hidden="true"
        />
        <span>Enquire Now</span>
      </span>
    </button>
  );
}
