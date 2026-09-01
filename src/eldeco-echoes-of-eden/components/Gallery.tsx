"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ZoomIn } from "lucide-react";
import { galleryConfig } from "@/eldeco-echoes-of-eden/config/gallery";
import { Lightbox } from "@/eldeco-echoes-of-eden/components/ui/Lightbox";
import { SectionHeading } from "@/eldeco-echoes-of-eden/components/ui/SectionHeading";
import {
  fadeUp,
  staggerContainer,
  useMotionSettings,
  viewportOnce,
} from "@/eldeco-echoes-of-eden/lib/motion";

function GalleryCard({
  image,
  onSelect,
}: {
  image: (typeof galleryConfig.images)[number];
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative w-full min-w-0 overflow-hidden rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      aria-label={`View ${image.alt}`}
    >
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 1024px) 45vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ objectPosition: image.objectPosition }}
        />
      </div>

      <div className="absolute inset-0 bg-[#1D3B2F]/0 transition-colors duration-300 group-hover:bg-[#1D3B2F]/35" />

      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="flex size-10 items-center justify-center rounded-full bg-white/90 text-[#1D3B2F] shadow-lg">
          <ZoomIn className="size-4" aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}

export function Gallery() {
  const [activeImage, setActiveImage] =
    useState<(typeof galleryConfig.images)[number] | null>(null);
  const { transition } = useMotionSettings();

  return (
    <>
      <section
        id={galleryConfig.id}
        className="scroll-mt-20 overflow-x-hidden bg-[#1D3B2F] px-4 py-14 sm:px-6 sm:py-16 lg:overflow-hidden lg:py-18"
        aria-labelledby="gallery-heading"
      >
        <div className="mx-auto max-w-8xl">
          <SectionHeading
            eyebrow={galleryConfig.eyebrow}
            title={galleryConfig.title}
            theme="light"
          />

          {/* Mobile: static 2-column grid */}
          <motion.div
            className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:hidden"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer(0.1, 0.08)}
          >
            {galleryConfig.images.map((image) => (
              <motion.div
                key={image.id}
                variants={fadeUp}
                transition={transition(0.55)}
                className="min-w-0"
              >
                <GalleryCard
                  image={image}
                  onSelect={() => setActiveImage(image)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Desktop: auto-scrolling carousel */}
          <div className="relative mt-8 hidden overflow-hidden lg:mt-10 lg:block">
            <div className="gallery-track flex w-max gap-5 sm:gap-6">
              {[...galleryConfig.images, ...galleryConfig.images].map(
                (image, index) => (
                  <motion.button
                    key={`${image.id}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    whileHover={{ y: -6 }}
                    className="
                      group relative
                      w-[31vw] shrink-0
                      overflow-hidden rounded-2xl
                      shadow-[0_16px_40px_rgba(0,0,0,0.35)]
                      focus-visible:outline
                      focus-visible:outline-2
                      focus-visible:outline-offset-2
                      focus-visible:outline-white
                      xl:w-[23vw]
                    "
                    aria-label={`View ${image.alt}`}
                  >
                    <div className="relative aspect-[5/3] w-full">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 1280px) 31vw, 23vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        style={{
                          objectPosition: image.objectPosition,
                        }}
                      />
                    </div>

                    <div className="absolute inset-0 bg-[#1D3B2F]/0 transition-all duration-500 group-hover:bg-[#1D3B2F]/40" />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100">
                      <span className="flex size-12 items-center justify-center rounded-full bg-white/90 text-[#1D3B2F] shadow-xl transition-transform duration-300 group-hover:scale-110">
                        <ZoomIn className="size-5" />
                      </span>
                    </div>
                  </motion.button>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <Lightbox
        isOpen={activeImage !== null}
        onClose={() => setActiveImage(null)}
        src={activeImage?.src ?? ""}
        alt={activeImage?.alt ?? ""}
        label={activeImage?.alt}
      />
    </>
  );
}
