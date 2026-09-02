"use client";

import { ELDECO_LANDING_BASE_PATH } from "@/components/eldecoPaths";
import { useEffect, useState } from "react";

function ThankYouPage() {
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    if (secondsLeft === 0) {
      window.location.href = ELDECO_LANDING_BASE_PATH;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSecondsLeft((seconds) => seconds - 1);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [secondsLeft]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-6 py-12 text-center text-[#171717]">
      <div className="w-full max-w-[560px] rounded-[18px] bg-white px-8 py-12 shadow-[0_20px_55px_rgba(0,0,0,0.12)]">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#c59c35]">
          Enquiry Submitted
        </p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight text-black">
          Thank You!
        </h1>
        <p className="mt-4 text-base font-medium leading-relaxed text-neutral-600">
          Your enquiry has been submitted successfully. Our property expert will get
          in touch with you shortly.
        </p>

        <div className="mx-auto mt-8 flex h-[86px] w-[86px] items-center justify-center rounded-full border border-[#c59c35] text-3xl font-extrabold text-[#c59c35]">
          {secondsLeft}
        </div>

        <p className="mt-5 text-sm font-medium text-neutral-600">
          You will be automatically redirected to the landing page in {secondsLeft}{" "}
          {secondsLeft === 1 ? "second" : "seconds"}.
        </p>

        <button
          type="button"
          onClick={() => {
            window.location.href = ELDECO_LANDING_BASE_PATH;
          }}
          className="mt-8 h-12 rounded-[4px] bg-black px-8 text-sm font-extrabold text-white transition hover:bg-[#c59c35]"
        >
          Return to landing page
        </button>
      </div>
    </main>
  );
}

export default ThankYouPage;
