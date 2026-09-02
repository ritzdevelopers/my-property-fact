"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { googleSheetConfig } from "@/eldeco-echoes-of-eden/config/googleSheet";
import { useMotionSettings } from "@/eldeco-echoes-of-eden/lib/motion";

const REDIRECT_SECONDS = 5;

export default function ThankYouPage() {
  const router = useRouter();
  const { prefersReducedMotion, transition } = useMotionSettings();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) {
      router.replace(googleSheetConfig.landingPath);
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [router, secondsLeft]);

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(46,125,50,0.18),_transparent_55%),linear-gradient(180deg,#DBE4DD_0%,#F5F7F5_45%,#DBE4DD_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-24 top-16 size-64 rounded-full bg-[#1D3B2F]/10 blur-3xl sm:size-80"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-10 size-56 rounded-full bg-[#2E7D32]/15 blur-3xl sm:size-72"
        aria-hidden="true"
      />

      <motion.section
        className="relative z-10 w-full max-w-lg rounded-2xl border border-[#1D3B2F]/12 bg-[#F5F7F5]/95 px-5 py-8 text-center shadow-[0_24px_60px_rgba(29,59,47,0.16)] backdrop-blur-sm sm:px-8 sm:py-10 md:max-w-xl md:px-10 md:py-12"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition(0.45)}
      >
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#2E7D32] sm:text-xs">
          Eldeco Echoes of Eden
        </p>

        <div
          className="mx-auto mt-5 flex size-16 items-center justify-center rounded-full bg-[#1D3B2F] text-2xl font-bold text-white shadow-lg sm:size-[4.5rem] sm:text-3xl"
          aria-hidden="true"
        >
          ✓
        </div>

        <h1 className="mt-5 font-serif text-3xl font-bold text-[#1D3B2F] sm:text-4xl md:text-[2.75rem]">
          Thank You!
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#333333] sm:mt-4 sm:text-base sm:leading-7">
          Your enquiry has been submitted successfully. Our team will get in
          touch with you shortly.
        </p>

        <div className="mx-auto mt-7 flex size-[4.75rem] items-center justify-center rounded-full border-2 border-[#1D3B2F] text-3xl font-extrabold text-[#1D3B2F] sm:mt-8 sm:size-20 sm:text-4xl">
          <span aria-live="polite">{secondsLeft}</span>
        </div>

        <p className="mt-4 text-sm text-[#333333] sm:text-[0.95rem]">
          You will be automatically redirected to the home page in{" "}
          <span className="font-semibold text-[#1D3B2F]">
            {secondsLeft} {secondsLeft === 1 ? "second" : "seconds"}
          </span>
          .
        </p>

        <div className="mt-7 flex flex-col items-center gap-3 sm:mt-8">
          <Link
            href={googleSheetConfig.landingPath}
            className="inline-flex w-full max-w-xs items-center justify-center rounded-lg bg-[#1D3B2F] px-6 py-3.5 text-sm font-bold tracking-[0.08em] text-white transition-colors hover:bg-[#2A5244] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D3B2F] sm:max-w-none sm:w-auto sm:min-w-[14rem]"
          >
            Back to Home
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
