"use client";

import { siteConfig } from "@/eldeco-echoes-of-eden/config/site";
import { useEnquiryPopup } from "@/eldeco-echoes-of-eden/context/EnquiryPopupContext";

export function MobileEnquireBar() {
  const { isOpen, openEnquiryPopup } = useEnquiryPopup();

  if (isOpen) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 lg:hidden">
      <button
        type="button"
        onClick={openEnquiryPopup}
        className="pointer-events-auto w-full rounded-xl bg-gradient-to-r from-[#1D3B2F] to-[#2E7D32] px-6 py-3.5 text-center text-sm font-bold tracking-wide text-white shadow-[0_8px_28px_rgba(29,59,47,0.35)] transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E7D32]"
      >
        {siteConfig.mobileCta.label}
      </button>
    </div>
  );
}
