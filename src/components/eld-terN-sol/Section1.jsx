"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin } from "./ui/Icons";

gsap.registerPlugin(useGSAP);

const HIGHLIGHT_TAGS = [
  "Luxurious Properties",
  "Prime Locations",
  "Wrapped Balconies",
  "Virtual Visit",
];

// 1:37 — the frame shows slide 01 of 03.
const SLIDES = [
  "Iconic Luxury Apartments In Gurgaon",
  "Iconic Luxury Apartments In Gurgaon",
  "Iconic Luxury Apartments In Gurgaon",
];

const SLIDE_IMAGES = [
  "/eldeco-terraNSole/home-slider/sl1.jpg",
  "/eldeco-terraNSole/home-slider/sl2.jpg",
  "/eldeco-terraNSole/home-slider/sl3.jpg",
];

export default function Section1() {
  const [slide, setSlide] = useState(0);
  const sectionRef = useRef(null);
  const imageLayers = useRef([]);
  const animating = useRef(false);
  const total = SLIDES.length;

  const { contextSafe } = useGSAP(
    () => {
      gsap.set(imageLayers.current, { autoAlpha: 0, xPercent: 0, scale: 1.03 });
      gsap.set(imageLayers.current[0], { autoAlpha: 1, scale: 1, zIndex: 1 });
    },
    { scope: sectionRef },
  );

  const go = contextSafe((direction) => {
    if (animating.current) return;

    const nextSlide = (slide + direction + total) % total;
    const outgoing = imageLayers.current[slide];
    const incoming = imageLayers.current[nextSlide];

    animating.current = true;
    gsap.killTweensOf([outgoing, incoming]);
    gsap.set(incoming, {
      autoAlpha: 0,
      xPercent: direction > 0 ? 8 : -8,
      scale: 1.03,
      zIndex: 2,
    });
    gsap.set(outgoing, { zIndex: 1 });

    gsap
      .timeline({
        onComplete: () => {
          setSlide(nextSlide);
          gsap.set(outgoing, { autoAlpha: 0, xPercent: 0, scale: 1.03, zIndex: 0 });
          gsap.set(incoming, { zIndex: 1 });
          animating.current = false;
        },
      })
      .to(outgoing, {
        autoAlpha: 0,
        xPercent: direction > 0 ? -8 : 8,
        duration: 0.75,
        ease: "power2.inOut",
      })
      .to(
        incoming,
        {
          autoAlpha: 1,
          xPercent: 0,
          scale: 1,
          duration: 0.85,
          ease: "power2.inOut",
        },
        "<",
      );
  });

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative isolate w-full overflow-hidden bg-black text-white"
    >
      {/* 1:4 — Rectangle 1 */}
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Show next hero image"
        className="absolute inset-0 z-0 overflow-hidden"
      >
        {SLIDE_IMAGES.map((asset, index) => (
          <span
            key={index}
            ref={(element) => {
              imageLayers.current[index] = element;
            }}
            className="absolute inset-0 block"
            style={{ visibility: "hidden" }}
          >
            <Image
              src={asset}
              alt=""
              fill
              preload={index === 0}
              sizes="100vw"
              data-hero-slide
              className="object-cover"
            />
          </span>
        ))}
      </button>
      {/* 1:5 — gradient scrim */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-[rgba(0,0,0,0.46)] to-[rgba(47,7,7,0.46)]"
      />

      <div className="pointer-events-none relative z-20 mx-auto flex w-full max-w-frame flex-col [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        <div aria-hidden="true" className="h-20 shrink-0 lg:h-[120px]" />

        {/* ── 1:32 hero-content-area ─────────────────────────────── */}
        <div className="flex flex-1 flex-col items-start px-4 pt-10 pb-[120px] sm:px-8 lg:px-[64px] lg:pt-[40px] lg:pb-[40px]">
          {/* 1:33 left-content-stack */}
          <div className="flex w-full flex-col items-start gap-[32px] lg:w-[760px]">
            {/* 1:34 title-wrapper */}
            <div className="flex w-full flex-col items-start gap-[12px]">
              {/* 1:35 eyebrow-pill */}
              <span className="flex items-start rounded-[100px] border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.15)] px-[14px] py-[6px]">
                <span className="text-[12px] leading-[normal] font-semibold whitespace-nowrap text-eld-gold uppercase">
                  Ultra Luxurious Residences
                </span>
              </span>
              {/* 1:37 headline */}
              <h1 className="font-playfair w-full text-[40px] leading-[1.1] font-medium text-white sm:text-[52px] lg:text-[64px]">
                {SLIDES[slide]}
              </h1>
            </div>

            {/* 1:38 pricing-detail-card */}
            <div className="flex w-full flex-col items-start gap-[24px] rounded-[16px] border border-[rgba(255,255,255,0.15)] bg-[rgba(240,19,19,0.65)] p-[24px] backdrop-blur-[12px] sm:flex-row sm:items-center sm:gap-[32px]">
              {/* 1:39 config-col */}
              <div className="flex min-w-0 flex-1 flex-col items-start gap-[6px] leading-[normal]">
                <p className="text-[11px] font-medium whitespace-nowrap text-eld-gold uppercase">
                  Apartment Configurations
                </p>
                <p className="w-full text-[24px] font-normal text-white lg:text-[28px]">
                  3 / 3.5 BHK Premium Residences
                </p>
                <p className="w-full text-[13px] font-normal text-eld-on-dark-2">
                  Spacious layouts with wide scenic balconies
                </p>
              </div>
              {/* 1:43 card-splitter */}
              <div
                aria-hidden="true"
                className="hidden h-[64px] w-px shrink-0 bg-white/30 sm:block"
              />
              {/* 1:44 pricing-col */}
              <div className="flex shrink-0 flex-col items-start gap-[6px] leading-[normal] sm:w-[260px]">
                <p className="text-[11px] font-medium whitespace-nowrap text-eld-gold uppercase">
                  Exclusive Starting Price
                </p>
                <p className="w-full text-[32px] font-bold text-white">₹3.11 Cr*</p>
                <p className="w-full text-[12px] font-normal text-eld-on-dark-2">
                  *Government taxes applicable
                </p>
              </div>
            </div>
          </div>

          {/* 1:48 right-content-stack */}
          <div className="flex w-full flex-col items-start gap-[24px] py-[27px] lg:w-[400px] lg:gap-[48px]">
            {/* 1:49 location-pill */}
            <span className="flex items-center gap-[8px] rounded-[100px] border border-[rgba(255,255,255,0.15)] bg-[rgba(15,11,10,0.65)] px-[18px] py-[10px]">
              <span className="text-[13px] leading-[normal] font-medium whitespace-nowrap text-white">
                At Sector 80, Gurugram
              </span>
              <MapPin className="size-[14px] shrink-0 text-[#D4AF32]" />
            </span>

            {/* 1:53 carousel-controls */}
            <div className="flex items-center gap-[16px]">
              <div className="flex items-center gap-[16px] leading-[normal] whitespace-nowrap">
                <p className="text-[16px] font-bold text-eld-gold">
                  {String(slide + 1).padStart(2, "0")}
                </p>
                <p className="text-[12px] font-normal text-eld-on-dark-3">
                  {String(total).padStart(2, "0")}
                </p>
                <p className="font-montserrat text-[12px] font-normal text-eld-on-dark-3">/</p>
              </div>
              {/* 1:58 arrow-buttons */}
              <div className="flex items-start gap-[8px]">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous slide"
                  className="flex size-[32px] flex-col items-center justify-center rounded-[16px] border border-white bg-[rgba(255,255,255,0.4)] transition-colors hover:bg-white/60"
                >
                  <ChevronLeft className="size-[14px] text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next slide"
                  className="flex size-[32px] flex-col items-center justify-center rounded-[16px] bg-white transition-opacity hover:opacity-90"
                >
                  <ChevronRight className="size-[14px] text-eld-ink" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 1:101 footer-strip ─────────────────────────────────── */}
        <div className="relative left-1/2 flex w-screen shrink-0 -translate-x-1/2 flex-col items-center gap-3 border-t border-[rgba(255,255,255,0.15)] bg-[rgba(11,8,7,0.95)] px-4 pt-[20px] pb-[24px] text-center sm:px-8 lg:flex-row lg:justify-between lg:gap-0 lg:px-[64px] lg:text-left">
          {/* 1:102 highlights-container */}
          <ul className="flex flex-wrap items-center justify-center gap-x-[24px] gap-y-2 lg:justify-start">
            {HIGHLIGHT_TAGS.map((tag) => (
              <li key={tag} className="flex items-center gap-[8px]">
                <span className="text-[13px] leading-[normal] font-medium whitespace-nowrap text-eld-on-dark">
                  {tag}
                </span>
                {/* 1:105 tag-dot */}
                <span aria-hidden="true" className="size-[5px] shrink-0 rounded-full bg-eld-gold" />
              </li>
            ))}
          </ul>

          {/* 1:115 regulatory-info */}
          <div className="flex flex-col items-center gap-[2px] text-[9px] leading-[normal] whitespace-nowrap lg:items-end lg:text-right">
            <p className="font-semibold text-eld-gold uppercase">HARERA REG. NO. 20 OF 2026</p>
            <p className="font-normal text-eld-on-dark-2">
              HARERA Website: www.haryanarera.gov.in
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
