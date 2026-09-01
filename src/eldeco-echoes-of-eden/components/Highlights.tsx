"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { sectionsConfig } from "@/eldeco-echoes-of-eden/config/sections";
import { ArrowRightIcon } from "@/eldeco-echoes-of-eden/components/ui/ArrowRightIcon";
import { EnquiryPopupTrigger } from "@/eldeco-echoes-of-eden/components/ui/EnquiryPopupTrigger";
import {
  fadeUp,
  lineReveal,
  scaleIn,
  staggerContainer,
  useMotionSettings,
  viewportOnce,
} from "@/eldeco-echoes-of-eden/lib/motion";

export function Highlights() {
  const highlights = sectionsConfig.highlights;
  const { prefersReducedMotion, transition } = useMotionSettings();

  return (
    <section
      id={highlights.id}
      className="scroll-mt-20 bg-[#1D3B2F] px-4 py-14 sm:px-6 sm:py-16 lg:py-18"
      aria-labelledby="highlights-heading"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="text-center text-white"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.12, 0.05)}
        >
          <motion.p
            className="text-[0.65rem] font-semibold tracking-[0.18em] sm:text-xs"
            variants={fadeUp}
            transition={transition(0.6)}
          >
            {highlights.eyebrow}
          </motion.p>

          <motion.h2
            id="highlights-heading"
            className="mt-3 font-serif text-3xl italic sm:text-4xl lg:text-[2.75rem]"
            variants={fadeUp}
            transition={transition(0.7)}
          >
            {highlights.title}
          </motion.h2>
        </motion.div>

        <div className="mt-12 grid items-center gap-10 lg:mt-14 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <motion.ul
            className="text-white"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer(0.14, 0.12)}
          >
            {highlights.items.map((item, index) => (
              <motion.li key={item} variants={fadeUp} transition={transition(0.6)}>
                <div className="flex items-start gap-3 py-2 sm:gap-4 sm:py-3">
                  <ArrowRightIcon className="mt-1 size-4 shrink-0 sm:size-5" />
                  <p className="text-sm leading-7 sm:text-[0.95rem] sm:leading-8">
                    {item}
                  </p>
                </div>

                {index < highlights.items.length - 1 && (
                  <motion.div
                    className="h-px origin-left bg-white/35"
                    variants={lineReveal}
                    transition={transition(0.75)}
                  />
                )}
              </motion.li>
            ))}
          </motion.ul>
          
          <motion.div
            className="relative mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={scaleIn}
            transition={transition(0.85)}
          >
            <motion.div
              className="overflow-hidden rounded-[2rem] shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.015 }}
              transition={transition(0.35)}
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={highlights.image.src}
                  alt={highlights.image.alt}
                  fill
                  sizes="(max-width: 1024px) 90vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="mt-12 flex justify-center lg:mt-14"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={transition(0.7)}
        >
          <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
            <EnquiryPopupTrigger className="inline-flex min-w-[220px] items-center justify-center rounded-sm bg-[#DBE4DD] px-8 py-3.5 text-sm font-bold tracking-wide text-[#1D3B2F] shadow-md transition-colors hover:bg-[#F5F7F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-w-[260px] sm:px-10 sm:text-base">
              {highlights.cta.label}
            </EnquiryPopupTrigger>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
