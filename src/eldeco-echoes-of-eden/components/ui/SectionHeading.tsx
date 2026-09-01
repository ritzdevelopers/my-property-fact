"use client";

import { motion } from "framer-motion";
import { fadeUp, useMotionSettings, viewportOnce } from "@/eldeco-echoes-of-eden/lib/motion";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  theme?: "light" | "dark";
  className?: string;
  titleId?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  theme = "dark",
  className = "",
  titleId,
}: SectionHeadingProps) {
  const { transition } = useMotionSettings();
  const isLight = theme === "light";

  return (
    <motion.div
      className={`text-center ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      <motion.p
        className={`text-xs font-bold tracking-[0.18em] sm:text-sm ${
          isLight ? "text-white" : "text-[#1D3B2F]"
        }`}
        variants={fadeUp}
        transition={transition(0.6)}
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        id={titleId}
        className={`mt-2 text-3xl font-normal tracking-wide sm:text-4xl lg:text-[2.5rem] ${
          isLight ? "text-white" : "text-[#1D3B2F]"
        }`}
        variants={fadeUp}
        transition={transition(0.7)}
      >
        {title}
      </motion.h2>
    </motion.div>
  );
}
