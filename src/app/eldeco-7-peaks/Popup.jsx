"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { sevenPeaksConfig } from "@/app/eldeco-7-peaks/config";
import { useEnquiryFormSubmit } from "@/app/eldeco-7-peaks/hooks/useEnquiryFormSubmit";

const INITIAL_OPEN_MS = 10000;
const REOPEN_INTERVAL_MS = 20000;

export const OPEN_7PEAKS_POPUP_EVENT = "open-7peaks-popup";

export function openSevenPeaksPopup(event) {
  if (typeof window === "undefined") return;
  if (event?.preventDefault) event.preventDefault();
  window.dispatchEvent(new Event(OPEN_7PEAKS_POPUP_EVENT));
}

export function CtaButton({
  children,
  light = false,
  amenities = false,
  className = "",
  unstyled = false,
  slideFill = false,
}) {
  const useSlideFill = slideFill || !unstyled;

  return (
    <button
      type="button"
      onClick={openSevenPeaksPopup}
      className={
        unstyled
          ? [useSlideFill ? "btn-7peaks-slide" : "", className]
              .filter(Boolean)
              .join(" ")
          : [
              "inline-flex cursor-pointer items-center justify-center border-none px-7 py-3.5 text-base shadow-[0_1px_5px_rgba(0,0,0,0.16)]",
              light
                ? "btn-7peaks-slide btn-7peaks-slide--light min-h-[52px] min-w-[180px] rounded font-bold"
                : amenities
                  ? "btn-7peaks-slide btn-7peaks-slide--amenities h-[55px] w-[168.33984375px] rounded-[10px] font-medium"
                  : "btn-7peaks-slide min-h-[52px] min-w-[180px] rounded font-bold",
              className,
            ]
              .filter(Boolean)
              .join(" ")
      }
    >
      {useSlideFill ? (
        <span className="relative z-[1]">{children}</span>
      ) : (
        children
      )}
    </button>
  );
}

function Popup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const hasOpenedOnceRef = useRef(false);
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const formRef = useRef(null);
  const animRef = useRef(null);

  const {
    isSubmitting,
    errorMessage,
    fieldErrors,
    handleSubmit,
    clearError,
    clearFieldError,
  } = useEnquiryFormSubmit({
    onSuccess: () => setIsOpen(false),
  });

  useEffect(() => {
    if (
      window.sessionStorage.getItem(sevenPeaksConfig.sessionSubmittedKey) ===
      "true"
    ) {
      setIsSubmitted(true);
    }
  }, []);

  useEffect(() => {
    if (isSubmitted || isOpen) return;

    if (!hasOpenedOnceRef.current) {
      const initialTimeoutId = window.setTimeout(() => {
        hasOpenedOnceRef.current = true;
        setIsOpen(true);
      }, INITIAL_OPEN_MS);

      return () => window.clearTimeout(initialTimeoutId);
    }

    const reopenIntervalId = window.setInterval(() => {
      setIsOpen(true);
    }, REOPEN_INTERVAL_MS);

    return () => window.clearInterval(reopenIntervalId);
  }, [isOpen, isSubmitted]);

  useEffect(() => {
    const openPopup = () => {
      hasOpenedOnceRef.current = true;
      clearError();
      setIsOpen(true);
    };

    window.addEventListener(OPEN_7PEAKS_POPUP_EVENT, openPopup);
    return () => window.removeEventListener(OPEN_7PEAKS_POPUP_EVENT, openPopup);
  }, [clearError]);

  useEffect(() => {
    if (isOpen) setIsMounted(true);
  }, [isOpen]);

  useEffect(() => {
    if (!isMounted) return;

    const overlay = overlayRef.current;
    const panel = panelRef.current;
    const form = formRef.current;
    if (!overlay || !panel) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    animRef.current?.kill();

    if (isOpen) {
      if (prefersReducedMotion) {
        gsap.set(overlay, { autoAlpha: 1 });
        gsap.set(panel, { autoAlpha: 1, y: 0, scale: 1 });
        if (form) gsap.set(form.children, { autoAlpha: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      animRef.current = tl;

      gsap.set(overlay, { autoAlpha: 0 });
      gsap.set(panel, { autoAlpha: 0, y: 36, scale: 0.94 });
      if (form) gsap.set(form.children, { autoAlpha: 0, y: 14 });

      tl.to(overlay, { autoAlpha: 1, duration: 0.35 }).to(
        panel,
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" },
        "-=0.18",
      );

      if (form) {
        tl.to(
          form.children,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.045,
            ease: "power2.out",
          },
          "-=0.22",
        );
      }

      return () => tl.kill();
    }

    if (prefersReducedMotion) {
      setIsMounted(false);
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: "power2.in" },
      onComplete: () => setIsMounted(false),
    });
    animRef.current = tl;

    tl.to(panel, { autoAlpha: 0, y: 20, scale: 0.96, duration: 0.28 }).to(
      overlay,
      { autoAlpha: 0, duration: 0.22 },
      "-=0.12",
    );

    return () => tl.kill();
  }, [isOpen, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting) setIsOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMounted, isSubmitting]);

  const handleClose = () => {
    if (isSubmitting) return;
    clearError();
    setIsOpen(false);
  };

  const onSubmit = async (event) => {
    await handleSubmit(event);
    if (
      window.sessionStorage.getItem(sevenPeaksConfig.sessionSubmittedKey) ===
      "true"
    ) {
      setIsSubmitted(true);
    }
  };

  const fieldErrorClass =
    "m-0 text-[12px] font-medium leading-snug text-red-600";

  if (!isMounted) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 px-4 py-8 backdrop-blur-[2px] max-[520px]:px-3 max-[520px]:py-3"
      style={{ opacity: 0, visibility: "hidden" }}
    >
      <button
        type="button"
        aria-label="Close popup overlay"
        className="absolute inset-0 cursor-default border-none bg-transparent"
        onClick={handleClose}
      />

      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-[14px] bg-white shadow-[0_20px_55px_rgba(9,33,25,0.28)] will-change-transform"
        style={{ opacity: 0, visibility: "hidden" }}
      >
        <div className="bg-[linear-gradient(135deg,#092119_0%,#147b58_100%)] px-8 py-6 text-white max-[520px]:px-5 max-[520px]:py-3.5">
          <p className="m-0 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/80 max-[520px]:hidden">
            Eldeco 7 Peaks Residences
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-7peaks-poppins)] text-[28px] font-semibold leading-tight max-[520px]:mt-0 max-[520px]:text-[20px]">
            Request a Call Back
          </h2>
          <p className="mt-2 mb-0 max-w-[420px] text-[15px] font-normal leading-relaxed text-white/85 max-[520px]:mt-1 max-[520px]:text-[13px] max-[520px]:leading-snug">
            Share your details and our property expert will connect with you
            shortly.
          </p>
        </div>

        <button
          type="button"
          aria-label="Close popup form"
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-none bg-white/15 text-2xl leading-none text-white transition hover:bg-white/25 disabled:opacity-50"
        >
          ×
        </button>

        <form
          ref={formRef}
          id="eldeco-7-peaks-popup-form"
          onSubmit={onSubmit}
          className="grid gap-x-6 gap-y-5 px-8 py-7 sm:grid-cols-2 max-[520px]:gap-y-2.5 max-[520px]:px-5 max-[520px]:py-4"
          noValidate
        >
          <label className="flex flex-col gap-2 text-sm font-medium text-[#122f23] max-[520px]:gap-1">
            Full Name *
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              placeholder="Enter your name"
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.name)}
              onChange={() => clearFieldError("name")}
              className={`h-11 w-full rounded-[4px] border bg-[#f7faf8] px-3 text-sm text-[#0a0a0a] outline-none transition placeholder:text-[#8a968e] focus:border-[#147b58] max-[520px]:h-10 ${
                fieldErrors.name ? "border-red-500" : "border-transparent"
              }`}
            />
            {fieldErrors.name ? (
              <p className={fieldErrorClass} role="alert">
                {fieldErrors.name}
              </p>
            ) : null}
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-[#122f23] max-[520px]:gap-1">
            Email Address *
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="your@email.com"
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.email)}
              onChange={() => clearFieldError("email")}
              className={`h-11 w-full rounded-[4px] border bg-[#f7faf8] px-3 text-sm text-[#0a0a0a] outline-none transition placeholder:text-[#8a968e] focus:border-[#147b58] max-[520px]:h-10 ${
                fieldErrors.email ? "border-red-500" : "border-transparent"
              }`}
            />
            {fieldErrors.email ? (
              <p className={fieldErrorClass} role="alert">
                {fieldErrors.email}
              </p>
            ) : null}
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-[#122f23] sm:col-span-2 max-[520px]:gap-1">
            Phone Number *
            <input
              type="tel"
              name="phone"
              required
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              placeholder="10-digit mobile number"
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.phone)}
              onChange={() => clearFieldError("phone")}
              className={`h-11 w-full rounded-[4px] border bg-[#f7faf8] px-3 text-sm text-[#0a0a0a] outline-none transition placeholder:text-[#8a968e] focus:border-[#147b58] max-[520px]:h-10 ${
                fieldErrors.phone ? "border-red-500" : "border-transparent"
              }`}
            />
            {fieldErrors.phone ? (
              <p className={fieldErrorClass} role="alert">
                {fieldErrors.phone}
              </p>
            ) : null}
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-[#122f23] sm:col-span-2 max-[520px]:gap-1">
            Message
            <textarea
              name="message"
              placeholder="Tell us how we can help (optional)"
              disabled={isSubmitting}
              rows={2}
              maxLength={500}
              aria-invalid={Boolean(fieldErrors.message)}
              onChange={() => clearFieldError("message")}
              className={`w-full resize-none rounded-[4px] border bg-[#f7faf8] px-3 py-3 text-sm text-[#0a0a0a] outline-none transition placeholder:text-[#8a968e] focus:border-[#147b58] max-[520px]:min-h-[52px] max-[520px]:py-2 ${
                fieldErrors.message ? "border-red-500" : "border-transparent"
              }`}
            />
            {fieldErrors.message ? (
              <p className={fieldErrorClass} role="alert">
                {fieldErrors.message}
              </p>
            ) : null}
          </label>

          {errorMessage ? (
            <p
              className="text-[13px] leading-relaxed text-red-600 sm:col-span-2"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 cursor-pointer rounded-[4px] border-none bg-[#147b58] px-8 text-[16px] font-bold text-white shadow-[0_1px_5px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:opacity-[0.92] disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2 sm:w-fit max-[520px]:h-10 max-[520px]:text-[15px]"
          >
            {isSubmitting ? "Submitting..." : "Submit Enquiry"}
          </button>

          <p className="text-[13px] leading-relaxed text-[#717182] sm:col-span-2 max-[520px]:text-[11px] max-[520px]:leading-snug">
            By submitting, you agree to be contacted regarding Eldeco 7 Peaks
            Residences.
          </p>
        </form>
      </div>
    </div>
  );
}

export default Popup;
