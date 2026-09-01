"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { locationConfig } from "@/eldeco-echoes-of-eden/config/location";
import { SectionHeading } from "@/eldeco-echoes-of-eden/components/ui/SectionHeading";
import {
  fadeUp,
  slideInRight,
  staggerContainer,
  useMotionSettings,
  viewportOnce,
} from "@/eldeco-echoes-of-eden/lib/motion";

export function LocationAdvantages() {
  const { transition } = useMotionSettings();

  return (
    <section
      id={locationConfig.id}
      className="scroll-mt-20 bg-[#DBE4DD] px-4 py-14 sm:px-6 sm:py-16 lg:py-18"
      aria-labelledby="location-heading"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={locationConfig.eyebrow}
          title={locationConfig.title}
          theme="dark"
        />

        <div className="mt-8 grid items-center gap-10 lg:mt-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={slideInRight}
            transition={transition(0.75)}
            className="relative mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none"
          >
            <motion.div
              className="overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(29,59,47,0.15)]"
              transition={transition(0.3)}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/11]">
                <iframe
                  title="Eldeco Echoes of Eden Location"
                  src="https://www.google.com/maps?q=Eldeco%20Echoes%20of%20Eden%2C%20Sector%2022D%2C%20Yamuna%20Expressway%2C%20Greater%20Noida&output=embed"
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>

          <motion.ul
            className="space-y-5 sm:space-y-6 pl-2 md:pl-25"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer(0.1, 0.08)}
            aria-label="Nearby locations and travel times"
          >
            {locationConfig.advantages.map((item) => (
              <motion.li
                key={item.id}
                variants={fadeUp}
                transition={transition(0.55)}
                className="flex items-start gap-3 sm:gap-4"
              >
                <MapPin
                  className="mt-0.5 size-5 shrink-0 fill-red-500 text-red-500 sm:size-6"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium text-[#1D3B2F] sm:text-base">
                  {item.destination} : {item.travelTime}
                </p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
