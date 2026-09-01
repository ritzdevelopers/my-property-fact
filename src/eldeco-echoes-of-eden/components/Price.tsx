"use client";

import { motion } from "framer-motion";
import { priceConfig } from "@/eldeco-echoes-of-eden/config/promo";
import { EnquiryPopupTrigger } from "@/eldeco-echoes-of-eden/components/ui/EnquiryPopupTrigger";
import { SectionHeading } from "@/eldeco-echoes-of-eden/components/ui/SectionHeading";
import {
  fadeUp,
  staggerContainer,
  useMotionSettings,
  viewportOnce,
} from "@/eldeco-echoes-of-eden/lib/motion";

export function Price() {
  const { transition } = useMotionSettings();

  const planCount = priceConfig.plans.length;

  return (
    <section
      id={priceConfig.id}
      className="relative z-10 scroll-mt-20 bg-[#DBE4DD] px-4 py-14 sm:px-6 sm:py-16 lg:py-18"
      aria-labelledby="price-heading"
    >
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow={priceConfig.eyebrow}
          title={priceConfig.title}
          titleId="price-heading"
          theme="dark"
        />

        <motion.div
          className={`
            mx-auto mt-8 grid w-full justify-items-center gap-6
            sm:mt-10 sm:gap-8

            ${
              planCount === 1
                ? "grid-cols-1"
                : planCount === 2
                  ? "grid-cols-1 md:grid-cols-2 md:max-w-4xl"
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }
          `}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.14, 0.1)}
        >
          {priceConfig.plans.map((plan) => (
            <motion.article
              key={plan.id}
              variants={fadeUp}
              transition={transition(0.65)}
              whileHover={{ y: -6 }}
              className="
                flex w-full max-w-[380px] flex-col
                rounded-2xl
                bg-[#F5F7F5]
                px-6 py-8
                transition-shadow duration-300
                sm:px-8 sm:py-10
              "
            >
              <h3 className="text-center text-xl font-bold text-[#1D3B2F] sm:text-2xl">
                {plan.type}
              </h3>

              <dl className="mt-8 space-y-0 text-[#1D3B2F]">
                <div className="flex items-center justify-between border-b border-[#1D3B2F]/55 py-4">
                  <dt className="text-sm font-medium sm:text-base">
                    Size
                  </dt>

                  <dd className="text-sm font-semibold sm:text-base">
                    {plan.size}
                  </dd>
                </div>

                <div className="flex items-center justify-between border-b border-[#1D3B2F]/55 py-4">
                  <dt className="text-sm font-medium sm:text-base">
                    Price
                  </dt>

                  <dd className="text-sm font-semibold sm:text-base">
                    {plan.price}
                  </dd>
                </div>
              </dl>

              <div className="mt-auto flex justify-center pt-8">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <EnquiryPopupTrigger
                    className="
                      inline-flex min-w-[180px]
                      items-center justify-center
                      rounded-md
                      bg-[#1D3B2F]
                      px-8 py-3
                      text-sm font-bold
                      text-white
                      transition-colors
                      hover:bg-[#2A5244]
                      focus-visible:outline
                      focus-visible:outline-2
                      focus-visible:outline-offset-2
                      focus-visible:outline-[#1D3B2F]
                    "
                  >
                    {plan.ctaLabel}
                  </EnquiryPopupTrigger>
                </motion.div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}