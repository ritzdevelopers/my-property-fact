"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { floorPlansConfig } from "@/eldeco-echoes-of-eden/config/floorPlans";
import { Lightbox } from "@/eldeco-echoes-of-eden/components/ui/Lightbox";
import { SectionHeading } from "@/eldeco-echoes-of-eden/components/ui/SectionHeading";
import { fadeUp, scaleIn, useMotionSettings, viewportOnce } from "@/eldeco-echoes-of-eden/lib/motion";

export function FloorPlans() {
  const [activePlan, setActivePlan] = useState<(typeof floorPlansConfig.plans)[number] | null>(
    null,
  );
  const { transition } = useMotionSettings();
  const plan = floorPlansConfig.plans[0];

  if (!plan) return null;

  return (
    <>
      <section
        id={floorPlansConfig.id}
        className="scroll-mt-20 bg-[#DBE4DD] px-4 py-14 sm:px-6 sm:py-16 lg:py-18"
        aria-labelledby="floor-plans-heading"
      >
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow={floorPlansConfig.eyebrow}
            title={floorPlansConfig.title}
            theme="dark"
          />

          <motion.div
            className="mt-8 lg:mt-10"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={scaleIn}
            transition={transition(0.75)}
          >
            <button
              type="button"
              onClick={() => setActivePlan(plan)}
              className="
    group relative mx-auto block
    w-[280px] max-w-full
    overflow-hidden rounded-xl
    focus-visible:outline
    focus-visible:outline-2
    focus-visible:outline-offset-4
    focus-visible:outline-[#1D3B2F]
    sm:w-[320px]
    lg:w-[350px]
  "
              aria-label={`${floorPlansConfig.ctaLabel} for ${plan.label}`}
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={plan.previewSrc}
                  alt=""
                  fill
                  sizes="350px"
                  className="
        object-cover object-center
        blur-md
        scale-105
        transition-all duration-500
        group-hover:blur-sm
        group-hover:scale-110
      "
                  aria-hidden="true"
                />

                <div className="absolute inset-0 bg-white/10" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    className="
          rounded-md
          bg-[#1D3B2F]
          px-7 py-3
          text-sm font-bold
          tracking-wide text-white
          shadow-lg
          sm:px-8 sm:py-3.5 sm:text-base
        "
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={transition(0.25)}
                  >
                    {floorPlansConfig.ctaLabel}
                  </motion.span>
                </div>
              </div>
            </button>

            <motion.p
              className="mt-5 text-center text-base font-semibold text-[#1D3B2F] sm:text-lg"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={fadeUp}
              transition={transition(0.6)}
            >
              {plan.label}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <Lightbox
        isOpen={activePlan !== null}
        onClose={() => setActivePlan(null)}
        src={activePlan?.fullSrc ?? ""}
        alt={activePlan?.alt ?? ""}
        label={activePlan?.label}
      />
    </>
  );
}
