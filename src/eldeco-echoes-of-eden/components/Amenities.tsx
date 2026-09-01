"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { amenitiesConfig, type AmenityIcon } from "@/eldeco-echoes-of-eden/config/amenities";
import { SectionHeading } from "@/eldeco-echoes-of-eden/components/ui/SectionHeading";
import {
  fadeUp,
  staggerContainer,
  useMotionSettings,
  viewportOnce,
} from "@/eldeco-echoes-of-eden/lib/motion";

const amenityIconMap: Record<AmenityIcon, string> = {
  gamepad: "/eldeco-echoes-of-eden/amenities/indoor-games.png",
  yoga: "/eldeco-echoes-of-eden/amenities/yoga-room.png",
  squash: "/eldeco-echoes-of-eden/amenities/squash-courts.png",
  pool: "/eldeco-echoes-of-eden/amenities/swimming-pool.png",
  gym: "/eldeco-echoes-of-eden/amenities/gym.png",
  cycling: "/eldeco-echoes-of-eden/amenities/cycling-path.png",
  playground: "/eldeco-echoes-of-eden/amenities/kids-play.png",
  plaza: "/eldeco-echoes-of-eden/amenities/plaza.png",
  open_gym: "/eldeco-echoes-of-eden/amenities/open-gym.jpg",
  power_backup: "/eldeco-echoes-of-eden/amenities/power-backup.jpg",
};

export function Amenities() {
  const { transition } = useMotionSettings();

  return (
    <section
      id={amenitiesConfig.id}
      className="scroll-mt-20 overflow-x-hidden bg-[#1D3B2F] px-4 py-14 sm:px-6 sm:py-16 lg:py-18"
      aria-labelledby="amenities-heading"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={amenitiesConfig.eyebrow}
          title={amenitiesConfig.title}
          theme="light"
        />

        <motion.ul
          className="
            mt-8 grid grid-cols-2 gap-x-3 gap-y-5
            lg:mt-10 lg:grid-cols-5 lg:gap-x-10 lg:gap-y-8
          "
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.08, 0.1)}
          aria-label="Project amenities"
        >
          {amenitiesConfig.items.map((item) => (
            <motion.li
              key={item.id}
              variants={fadeUp}
              transition={transition(0.55)}
              className="flex min-w-0 items-center gap-2 text-white lg:gap-4"
            >
              <motion.span
                className="
                  flex size-9 shrink-0
                  items-center justify-center
                  lg:size-14
                "
                whileHover={{ scale: 1.12, y: -2 }}
                transition={transition(0.25)}
              >
                <Image
                  src={amenityIconMap[item.icon]}
                  alt=""
                  width={48}
                  height={48}
                  className="
                    size-7 object-contain
                    brightness-0 invert
                    lg:size-11
                  "
                  aria-hidden="true"
                />
              </motion.span>

              <span className="min-w-0 text-xs font-bold leading-4 lg:text-base lg:leading-6">
                {item.label}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}