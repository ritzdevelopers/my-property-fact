"use client";

import { motion } from "framer-motion";
import { sectionsConfig } from "@/eldeco-echoes-of-eden/config/sections";
import { fadeUp, useMotionSettings, viewportOnce } from "@/eldeco-echoes-of-eden/lib/motion";

export function Overview() {
  const overview = sectionsConfig.overview;
  const { transition } = useMotionSettings();

  return (
    <section
      id={overview.id}
      className="scroll-mt-20 bg-[#DBE4DD] px-4 py-14 sm:px-6 sm:py-16 lg:py-18"
      aria-labelledby="overview-heading"
    >
      <div className="mx-auto max-w-6xl text-center">
        <motion.h2
          id="overview-heading"
          className="text-3xl font-bold tracking-wide text-[#1D3B2F] sm:text-4xl lg:text-[2.75rem]"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={transition(0.7)}
        >
          {overview.title}
        </motion.h2>

        <motion.p
          className="mt-3 text-sm font-bold text-black sm:text-base"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={transition(0.7, [0.22, 1, 0.36, 1])}
        >
          {overview.location}
        </motion.p>

        <motion.p
          className="mx-auto mt-6 max-w-6xl text-sm leading-7 text-[#1a1a1a] sm:mt-8 sm:text-[0.95rem] sm:leading-6"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={transition(0.8, [0.22, 1, 0.36, 1])}
        >
          {overview.description}
        </motion.p>
      </div>
    </section>
  );
}
