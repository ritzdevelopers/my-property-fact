"use client";

import { useEffect, useId } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useMotionSettings } from "@/eldeco-echoes-of-eden/lib/motion";

type LightboxProps = {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  label?: string;
};

export function Lightbox({ isOpen, onClose, src, alt, label }: LightboxProps) {
  const titleId = useId();
  const { prefersReducedMotion, transition } = useMotionSettings();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition(0.25)}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/80"
            aria-label="Close lightbox"
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 w-full max-w-5xl"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 16 }}
            transition={transition(0.35)}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute -top-12 right-0 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:-right-2 sm:top-2 sm:bg-[#1D3B2F] sm:hover:bg-[#2A5244]"
              aria-label="Close"
            >
              <X className="size-5" aria-hidden="true" />
            </button>

            {label && (
              <p
                id={titleId}
                className="mb-3 text-center text-sm font-semibold tracking-wide text-white sm:text-base"
              >
                {label}
              </p>
            )}

            <div className="relative max-h-[85vh] overflow-hidden rounded-lg bg-[#F5F7F5] shadow-2xl">
              <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="(max-width: 768px) 95vw, 80vw"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
