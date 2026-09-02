"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useMotionSettings } from "@/eldeco-echoes-of-eden/lib/motion";

type FormStatusPopupProps = {
  isLoading?: boolean;
  errorMessage?: string;
  onDismissError?: () => void;
};

export function FormStatusPopup({
  isLoading = false,
  errorMessage = "",
  onDismissError,
}: FormStatusPopupProps) {
  const { prefersReducedMotion, transition } = useMotionSettings();
  const [mounted, setMounted] = useState(false);
  const showError = Boolean(errorMessage) && !isLoading;
  const isVisible = isLoading || showError;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-live="assertive"
          aria-busy={isLoading}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition(0.2)}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/65"
            aria-label={showError ? "Dismiss error" : "Submitting enquiry"}
            onClick={showError ? onDismissError : undefined}
            disabled={isLoading}
          />

          <motion.div
            className="relative z-10 w-full max-w-sm rounded-2xl border border-[#1D3B2F]/10 bg-[#F5F7F5] px-6 py-8 text-center shadow-2xl sm:px-8 sm:py-10"
            initial={
              prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 16 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 16 }
            }
            transition={transition(0.3)}
          >
            {showError && (
              <button
                type="button"
                onClick={onDismissError}
                className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-[#1D3B2F] text-white transition-colors hover:bg-[#2A5244]"
                aria-label="Close"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}

            {isLoading ? (
              <>
                <div
                  className="mx-auto size-12 animate-spin rounded-full border-[3px] border-[#1D3B2F]/20 border-t-[#1D3B2F]"
                  aria-hidden="true"
                />
                <h2 className="mt-5 text-lg font-bold text-[#1D3B2F] sm:text-xl">
                  Submitting your enquiry
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#333333]">
                  Please wait while we save your details…
                </p>
              </>
            ) : (
              <>
                <div
                  className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#1D3B2F]/10 text-xl font-bold text-[#1D3B2F]"
                  aria-hidden="true"
                >
                  !
                </div>
                <h2 className="mt-5 text-lg font-bold text-[#1D3B2F] sm:text-xl">
                  Submission failed
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#333333]">
                  {errorMessage}
                </p>
                <button
                  type="button"
                  onClick={onDismissError}
                  className="mt-6 w-full rounded-lg bg-[#1D3B2F] px-5 py-3 text-sm font-bold tracking-wide text-white transition-colors hover:bg-[#2A5244]"
                >
                  Try again
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
