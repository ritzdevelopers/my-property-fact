"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

const LANDING_PATH = "/lp/eldeco-7-peaks";

declare global {
  interface Window { dataLayer?: Record<string, unknown>[]; fbq?: (...args: unknown[]) => void; }
}

export default function ThankYouPage() {
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "lead", page: "eldeco_7_peaks_thank_you" });
    window.fbq?.("track", "Lead");
  }, []);

  useEffect(() => {
    if (secondsLeft === 0) {
      window.location.href = LANDING_PATH;
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((seconds) => seconds - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const returnToLandingPage = () => {
    window.location.href = LANDING_PATH;
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f0e8] px-4 py-16 text-[#15382f]">
      <section className="w-full max-w-2xl rounded-[2rem] border border-[#15382f]/10 bg-white p-7 text-center shadow-[0_30px_90px_rgba(21,56,47,.14)] sm:p-12">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#dce7df]"><CheckCircle2 className="size-8" aria-hidden="true" /></span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-[#a85f3f]">Enquiry received</p>
        <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Thank you for your interest in Eldeco 7 Peaks</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#4c625b]">Your details have been submitted. A property representative will contact you for the requested price, floor plan, payment-plan or site-visit information.</p>

        <div className="mx-auto mt-8 grid size-[92px] place-items-center rounded-full border-2 border-[#b76a47]/40 bg-[#f7f4ed] font-serif text-[34px] font-bold text-[#b76a47]" aria-hidden="true">
          {secondsLeft}
        </div>
        <p className="mt-4 text-sm text-[#6b7c76]" aria-live="polite">
          Redirecting to the landing page in {secondsLeft}{" "}
          {secondsLeft === 1 ? "second" : "seconds"}.
        </p>

        <button
          type="button"
          onClick={returnToLandingPage}
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#b76a47] px-8 font-bold text-white hover:bg-[#9f583a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15382f]"
        >
          Return to landing page
        </button>
      </section>
    </main>
  );
}
