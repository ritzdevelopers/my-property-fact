"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const REDIRECT_SECONDS = 5;
const LANDING_PATH = "/eldeco-7-peaks";

export default function ThankYouPage() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) {
      router.replace(LANDING_PATH);
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [router, secondsLeft]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#e1f1ea] px-4 py-10 font-[family-name:var(--font-7peaks-poppins)] text-[#0a0a0a] sm:px-6 sm:py-14">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(20,123,88,0.18),_transparent_55%),linear-gradient(180deg,#e1f1ea_0%,#f7faf8_45%,#e1f1ea_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-24 top-16 size-64 rounded-full bg-[#147b58]/15 blur-3xl sm:size-80"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-10 size-56 rounded-full bg-[#092119]/12 blur-3xl sm:size-72"
        aria-hidden="true"
      />

      <section className="relative z-10 w-full max-w-lg rounded-2xl border border-[#147b58]/15 bg-white/95 px-5 py-8 text-center shadow-[0_24px_60px_rgba(9,33,25,0.14)] backdrop-blur-sm sm:px-8 sm:py-10 md:max-w-xl md:px-10 md:py-12">
        <Image
          src="/eldeco-7-peak/e-logo.png"
          alt="Eldeco 7 Peaks Residences"
          width={200}
          height={42}
          unoptimized
          className="mx-auto h-10 w-auto object-contain"
        />

        <p className="mt-5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#147b58] sm:text-xs">
          Eldeco 7 Peaks Residences
        </p>

        <div
          className="mx-auto mt-5 flex size-16 items-center justify-center rounded-full bg-[#147b58] text-2xl font-bold text-white shadow-[0_10px_24px_rgba(20,123,88,0.35)] sm:size-[4.5rem] sm:text-3xl"
          aria-hidden="true"
        >
          ✓
        </div>

        <h1 className="mt-5 font-[family-name:var(--font-7peaks-cormorant)] text-3xl font-normal text-[#092119] sm:text-4xl md:text-[2.75rem]">
          Thank You!
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#526257] sm:mt-4 sm:text-base sm:leading-7">
          Your enquiry has been submitted successfully. Our team will get in
          touch with you shortly.
        </p>

        <div className="mx-auto mt-7 flex size-[4.75rem] items-center justify-center rounded-full border-2 border-[#147b58] text-3xl font-extrabold text-[#147b58] sm:mt-8 sm:size-20 sm:text-4xl">
          <span aria-live="polite">{secondsLeft}</span>
        </div>

        <p className="mt-4 text-sm text-[#526257] sm:text-[0.95rem]">
          You will be automatically redirected to the home page in{" "}
          <span className="font-semibold text-[#092119]">
            {secondsLeft} {secondsLeft === 1 ? "second" : "seconds"}
          </span>
          .
        </p>

        <div className="mt-7 flex flex-col items-center gap-3 sm:mt-8">
          <Link
            href={LANDING_PATH}
            className="inline-flex w-full max-w-xs items-center justify-center rounded-[4px] bg-[#147b58] px-6 py-3.5 text-sm font-bold tracking-[0.08em] text-white shadow-[0_1px_5px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:opacity-[0.92] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147b58] sm:max-w-none sm:w-auto sm:min-w-[14rem]"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
