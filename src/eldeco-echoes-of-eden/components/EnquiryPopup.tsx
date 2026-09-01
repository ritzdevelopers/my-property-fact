"use client";

import { FormEvent, useCallback, useEffect, useId, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { enquiryPopupConfig } from "@/eldeco-echoes-of-eden/config/enquiryPopup";
import { useMotionSettings } from "@/eldeco-echoes-of-eden/lib/motion";

type EnquiryPopupProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function EnquiryPopup({ isOpen, onClose }: EnquiryPopupProps) {
  const titleId = useId();
  const descriptionId = useId();
  const { prefersReducedMotion, transition } = useMotionSettings();
  const [consent, setConsent] = useState(false);

  const handleClose = useCallback(() => {
    setConsent(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleClose();
  };

  const renderField = (field: (typeof enquiryPopupConfig.fields)[number]) => {
    const fieldId = `enquiry-popup-${field.name}`;

    if (field.type === "tel") {
      return (
        <div className="flex items-center gap-2 border-b border-[#1D3B2F]/25 pb-1.5 sm:pb-2">
          <span
            className="shrink-0 text-xs font-medium text-[#1D3B2F]/75 sm:text-sm"
            aria-hidden="true"
          >
            🇮🇳 +91
          </span>
          <input
            id={fieldId}
            name={field.name}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={field.placeholder}
            required={field.required}
            className="min-w-0 flex-1 border-0 bg-transparent text-xs text-[#1D3B2F] placeholder:text-[#1D3B2F]/45 focus:outline-none sm:text-sm"
          />
        </div>
      );
    }

    return (
      <input
        id={fieldId}
        name={field.name}
        type={field.type}
        placeholder={field.placeholder}
        required={field.required}
        autoComplete={
          field.type === "email"
            ? "email"
            : field.name === "name"
              ? "name"
              : "off"
        }
        className="w-full border-0 border-b border-[#1D3B2F]/25 bg-transparent pb-1.5 text-xs text-[#1D3B2F] placeholder:text-[#1D3B2F]/45 focus:border-[#1D3B2F] focus:outline-none sm:pb-2 sm:text-sm"
      />
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition(0.25)}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close enquiry popup"
            onClick={handleClose}
          />

          <motion.div
            className="relative z-10 flex max-h-[min(92dvh,820px)] w-full max-w-[min(100%,42rem)] flex-col overflow-hidden rounded-lg bg-[#F5F7F5] shadow-2xl sm:rounded-xl"
            initial={
              prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 20 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }
            }
            transition={transition(0.35)}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-2.5 top-2.5 z-20 flex size-8 items-center justify-center rounded-full bg-[#1D3B2F] text-white transition-colors hover:bg-[#2A5244] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-3 sm:top-3 sm:size-9 md:size-10"
              aria-label="Close"
            >
              <X className="size-4 sm:size-5" aria-hidden="true" />
            </button>

            <div className="relative h-[7.5rem] shrink-0 sm:h-[9rem] md:h-[10.5rem] lg:h-44">
              <Image
                src={enquiryPopupConfig.image.src}
                alt={enquiryPopupConfig.image.alt}
                fill
                sizes="(max-width: 768px) 95vw, 672px"
                className="object-cover object-center"
                priority
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
              <div className="text-center">
                <h2
                  id={titleId}
                  className="text-lg font-bold leading-snug text-[#1D3B2F] sm:text-xl md:text-2xl"
                >
                  {enquiryPopupConfig.title}
                </h2>
                <p
                  id={descriptionId}
                  className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-[#333333] sm:mt-2 sm:text-sm sm:leading-6 md:text-[0.95rem]"
                >
                  {enquiryPopupConfig.subtitle}
                </p>
              </div>

              <form
                className="mt-4 space-y-3.5 sm:mt-5 sm:space-y-4 md:mt-6"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-4 md:gap-x-6">
                  {enquiryPopupConfig.fields.map((field) => (
                    <div key={field.name}>
                      <label htmlFor={`enquiry-popup-${field.name}`} className="sr-only">
                        {field.label}
                      </label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>

                <label className="flex items-start gap-2 text-[0.625rem] leading-4 text-[#333333] sm:gap-2.5 sm:text-[0.68rem] sm:leading-5 md:text-xs md:leading-6">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-0.5 size-3.5 shrink-0 accent-[#1D3B2F]"
                    required
                  />
                  <span>{enquiryPopupConfig.consentText}</span>
                </label>

                <div className="flex justify-center pt-0.5 sm:pt-1">
                  <motion.button
                    type="submit"
                    className="w-full max-w-[15rem] rounded-md bg-[#1D3B2F] px-8 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#2A5244] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D3B2F] sm:max-w-[16.25rem] sm:py-3 md:min-w-[220px] md:max-w-none md:px-10"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {enquiryPopupConfig.submitLabel}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
