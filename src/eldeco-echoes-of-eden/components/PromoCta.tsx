"use client";

import { motion } from "framer-motion";
import { promoCtaConfig } from "@/eldeco-echoes-of-eden/config/promo";
import { PromoEnquiryForm } from "@/eldeco-echoes-of-eden/components/PromoEnquiryForm";
import { slideInLeft, useMotionSettings, viewportOnce } from "@/eldeco-echoes-of-eden/lib/motion";

export function PromoCta() {
  const { transition } = useMotionSettings();

  return (
    <section
      id={promoCtaConfig.id}
      className="promo-fixed-bg relative scroll-mt-20"
      aria-label="Promotional enquiry"
      style={{
        backgroundImage: `url(${promoCtaConfig.backgroundImage})`,
        backgroundPosition: promoCtaConfig.backgroundPosition,
      }}
    >
      <div className="absolute inset-0 bg-[#1D3B2F]/50" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-[32rem] max-w-7xl flex-col items-center justify-center gap-10 px-4 py-6 sm:min-h-[36rem] sm:px-6 sm:py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-8 lg:py-10">
        <motion.div
          className="max-w-xl text-center lg:max-w-lg lg:text-left xl:max-w-xl"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={slideInLeft}
          transition={transition(0.75)}
        >
          <h2 className="text-2xl font-bold leading-tight tracking-wide text-white sm:text-3xl lg:text-4xl xl:leading-[1.15]">
            {promoCtaConfig.heading}
          </h2>
        </motion.div>

        <PromoEnquiryForm />
      </div>
    </section>
  );
}
