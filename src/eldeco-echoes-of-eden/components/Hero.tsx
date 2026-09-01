"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { sectionsConfig } from "@/eldeco-echoes-of-eden/config/sections";
import { QuickEnquiryForm } from "@/eldeco-echoes-of-eden/components/QuickEnquiryForm";
import { ArrowRightIcon } from "@/eldeco-echoes-of-eden/components/ui/ArrowRightIcon";
import { LocationIcon } from "@/eldeco-echoes-of-eden/components/ui/LocationIcon";
import {
  fadeUp,
  slideInLeft,
  staggerContainer,
  useMotionSettings,
} from "@/eldeco-echoes-of-eden/lib/motion";

export function Hero() {
  const hero = sectionsConfig.hero;
  const { prefersReducedMotion, transition } = useMotionSettings();

  return (
    <section
      id={hero.id}
      className="scroll-mt-20 overflow-x-hidden"
      aria-label="Project hero"
    >
      {/* Mobile: stacked image → content → form */}
      <div className="lg:hidden">
        <div className="relative aspect-[16/10] w-full max-w-full sm:aspect-[16/9]">
          <Image
            src={hero.backgroundImage}
            alt={hero.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        <motion.div
          className="bg-[#DBE4DD] px-4 py-6 text-center sm:px-6 sm:py-8"
          variants={staggerContainer(0.1, 0.08)}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="mx-auto flex max-w-md items-center justify-center gap-2 text-sm font-medium text-[#1A1A1A] sm:text-base"
            variants={fadeUp}
            transition={transition(0.55)}
          >
            <LocationIcon className="size-4 shrink-0 text-[#1D3B2F]" />
            <span>{hero.location}</span>
          </motion.div>

          <motion.h1
            className="mx-auto mt-4 max-w-md text-2xl font-bold leading-tight tracking-wide text-[#1A1A1A] sm:text-3xl"
            variants={fadeUp}
            transition={transition(0.6)}
          >
            {hero.title}
          </motion.h1>

          <motion.p
            className="mt-2 text-lg font-semibold text-[#1A1A1A] sm:text-xl"
            variants={fadeUp}
            transition={transition(0.6)}
          >
            {hero.subtitle}
          </motion.p>

          <motion.ul
            className="mx-auto mt-5 flex max-w-md flex-col items-center gap-2.5 sm:mt-6 sm:gap-3"
            variants={staggerContainer(0.08, 0.12)}
          >
            {hero.highlights.map((item) => (
              <motion.li
                key={item.label}
                variants={fadeUp}
                transition={transition(0.5)}
              >
                <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#4A4A4A] px-4 py-2.5 text-left text-xs font-medium text-white sm:text-sm">
                  <ArrowRightIcon className="size-3.5 shrink-0 sm:size-4" />
                  <span className="min-w-0">
                    {item.label} : {item.value}
                  </span>
                </span>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div
            className="mt-5 sm:mt-6"
            variants={fadeUp}
            transition={transition(0.65)}
          >
            <a
              href="#price"
              className="inline-flex w-full max-w-md items-center justify-center rounded-full bg-[#1D3B2F] px-6 py-3.5 text-sm font-bold tracking-wide text-white shadow-md transition-colors hover:bg-[#2A5244] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D3B2F] sm:text-base"
            >
              {hero.startingPrice.label} : {hero.startingPrice.value}
            </a>
          </motion.div>
        </motion.div>

        <div className="border-t border-[#1D3B2F]/10 bg-[#F5F7F5] px-4 py-8 sm:px-6 sm:py-10">
          <QuickEnquiryForm variant="section" />
        </div>
      </div>

      {/* Desktop: overlay hero with side-by-side form */}
      <div className="relative hidden min-h-[calc(100svh-4.5rem)] overflow-hidden lg:block">
        <div className="absolute inset-0">
          <motion.div
            className="relative h-full w-full"
            initial={{ scale: prefersReducedMotion ? 1 : 1.08 }}
            animate={{ scale: 1 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 14, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <Image
              src={hero.backgroundImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>

          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-8xl flex-col justify-center px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:px-18 lg:py-20 xl:gap-16">
          <motion.div
            className="max-w-2xl text-white"
            variants={staggerContainer(0.14, 0.15)}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="mb-4 flex items-center gap-2 text-sm font-medium sm:text-base"
              variants={slideInLeft}
              transition={transition(0.65)}
            >
              <LocationIcon className="size-4 shrink-0 sm:size-5" />
              <span>{hero.location}</span>
            </motion.div>

            <motion.h1
              className="text-3xl font-bold leading-tight tracking-wide sm:text-4xl lg:leading-[1.0]"
              variants={fadeUp}
              transition={transition(0.7)}
            >
              {hero.title}
            </motion.h1>

            <motion.p
              className="mt-3 text-xl font-semibold sm:text-2xl"
              variants={fadeUp}
              transition={transition(0.7)}
            >
              {hero.subtitle}
            </motion.p>

            <motion.ul
              className="mt-6 space-y-2 sm:mt-8"
              variants={staggerContainer(0.1, 0.2)}
            >
              {hero.highlights.map((item) => (
                <motion.li
                  key={item.label}
                  className="flex items-start gap-3 text-sm sm:text-base"
                  variants={fadeUp}
                  transition={transition(0.55)}
                >
                  <ArrowRightIcon className="mt-0.5 size-4 shrink-0 sm:size-5" />
                  <span>
                    {item.label} : {item.value}
                  </span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              className="mt-6 sm:mt-8"
              variants={fadeUp}
              transition={transition(0.75)}
            >
              <motion.a
                href="#price"
                className="inline-flex rounded-sm bg-[#1D3B2F] px-6 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg transition-colors hover:bg-[#2A5244] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-8 sm:text-base"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {hero.startingPrice.label} : {hero.startingPrice.value}
              </motion.a>
            </motion.div>
          </motion.div>

          <div className="mt-10 flex justify-center lg:mt-0 lg:justify-end">
            <QuickEnquiryForm variant="overlay" />
          </div>
        </div>
      </div>
    </section>
  );
}
