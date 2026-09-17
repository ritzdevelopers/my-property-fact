"use client";

import { useEffect, useState } from "react";
import { ELDECO_LANDING_BASE_PATH } from "@/components/eldecoPaths";

export default function ThankYouPage() {
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    if (secondsLeft === 0) {
      window.location.href = ELDECO_LANDING_BASE_PATH;
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((seconds) => seconds - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const returnToLandingPage = () => {
    window.location.href = ELDECO_LANDING_BASE_PATH;
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#161210] px-4 py-10 text-center">
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 size-[420px] rounded-full bg-[#ad7736]/25 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-32 -bottom-32 size-[420px] rounded-full bg-[#d4af37]/15 blur-[100px]"
      />

      <section className="relative w-full max-w-[610px] overflow-hidden rounded-[28px] border border-white/10 bg-[#fffdfb] px-6 py-10 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:px-12 sm:py-14">
        <div className="mx-auto flex size-[76px] items-center justify-center rounded-full bg-[#ad7736] text-[36px] text-white shadow-[0_10px_30px_rgba(173,119,54,0.3)]">
          ✓
        </div>

        <p className="mt-7 text-[12px] font-bold tracking-[0.2em] text-[#ad7736] uppercase">
          Enquiry submitted
        </p>
        <h1 className="font-playfair mt-3 text-[40px] leading-tight font-medium text-[#1c120b] sm:text-[52px]">
          Thank You!
        </h1>
        <p className="mx-auto mt-4 max-w-[460px] text-[15px] leading-[1.7] text-[#60554e]">
          Your enquiry for Eldeco Terra &amp; Sol has been received. Our property
          advisor will contact you shortly with pricing and availability details.
        </p>

        <div className="mx-auto mt-8 flex size-[92px] items-center justify-center rounded-full border-2 border-[#d4af37]/40 bg-[#f9f5ec] text-[34px] font-bold text-[#ad7736]">
          {secondsLeft}
        </div>
        <p className="mt-4 text-[13px] text-[#706963]" aria-live="polite">
          Redirecting to the landing page in {secondsLeft}{" "}
          {secondsLeft === 1 ? "second" : "seconds"}.
        </p>

        <button
          type="button"
          onClick={returnToLandingPage}
          className="mt-8 rounded-full bg-[#ad7736] px-8 py-[14px] text-[13px] font-bold text-white uppercase transition hover:bg-[#8e704c]"
        >
          Return to landing page
        </button>
      </section>
    </main>
  );
}