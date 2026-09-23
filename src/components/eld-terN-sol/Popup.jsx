"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Close, MapPin } from "./ui/Icons";
import { ASSETS } from "./ui/assets";
import { goToEldecoThankYou } from "../eldecoPaths";
import { handleEldecoLeadFormSubmit } from "./eldecoLeadFormSubmit";

const fieldClass =
  "h-[48px] w-full rounded-[8px] border border-eld-line-2 bg-eld-field px-4 text-[14px] text-eld-body outline-none transition-colors placeholder:text-eld-body/70 focus:border-eld-bronze-deep";

export default function Popup() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const firstInput = useRef(null);

  useEffect(() => {
    const openPopup = (event) => {
      const trigger = event.target.closest("[data-open-popup]");
      if (!trigger) return;

      event.preventDefault();
      setSent(false);
      setFormError("");
      setOpen(true);
    };

    document.addEventListener("click", openPopup);
    return () => document.removeEventListener("click", openPopup);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    const focusTimer = window.setTimeout(() => firstInput.current?.focus(), 350);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  const handleSubmit = async (event) => {
    setIsSubmitting(true);
    setFormError("");

    try {
      await handleEldecoLeadFormSubmit(event);
      setSent(true);
      setOpen(false);
      goToEldecoThankYou();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-3 transition-[visibility] sm:p-6 ${
        open ? "visible" : "invisible delay-500"
      }`}
    >
      <button
        type="button"
        aria-label="Close enquiry form"
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-black/70 backdrop-blur-[5px] transition-opacity duration-500 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-title"
        className={`relative grid max-h-[calc(100dvh-24px)] w-full max-w-[920px] overflow-y-auto rounded-[20px] bg-white shadow-[0_32px_90px_rgba(0,0,0,0.35)] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:grid-cols-[0.82fr_1.18fr] md:overflow-hidden ${
          open ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-[0.97] opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 flex size-10 items-center justify-center rounded-full border border-black/10 bg-white/90 text-eld-ink shadow-sm transition-transform hover:rotate-90 md:top-5 md:right-5"
        >
          <Close className="size-5" />
        </button>

        <div className="relative hidden min-h-[560px] overflow-hidden bg-eld-bronze p-8 text-white md:flex md:flex-col md:justify-between lg:p-10">
          <Image
            src={ASSETS.hero.src}
            alt="Eldeco Ter N Sol Hero Image"
            fill
            sizes="360px"
            title="Eldeco Ter N Sol Hero Image"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-[#5d351d]/75 to-[#1c120b]/95" />

          <div className="relative">
            <span className="text-[12px] font-semibold tracking-[0.18em] text-eld-gold uppercase">
              Eldeco Terra &amp; Sol
            </span>
            <h2 className="font-playfair mt-4 text-[38px] leading-[1.12] font-medium">
              Your private preview awaits.
            </h2>
            <p className="mt-4 text-[14px] leading-[1.7] text-white/75">
              Share your details and our property advisor will help you with pricing,
              availability, and a personalised site visit.
            </p>
          </div>

          <div className="relative flex items-center gap-3 border-t border-white/20 pt-5">
            <span className="flex size-9 items-center justify-center rounded-full bg-white/10">
              <MapPin className="size-4 text-eld-gold" />
            </span>
            <div>
              <p className="text-[11px] text-white/55 uppercase">Prime location</p>
              <p className="text-[14px] font-semibold">Sector 80, Gurugram</p>
            </div>
          </div>
        </div>

        <div className="p-5 pt-14 sm:p-8 sm:pt-12 lg:p-10">
          <div className="mb-7">
            <p className="text-[11px] font-bold tracking-[0.16em] text-eld-bronze-deep uppercase">
              Exclusive enquiry
            </p>
            <h2
              id="enquiry-title"
              className="font-playfair mt-2 text-[30px] leading-tight font-medium text-eld-ink-3 sm:text-[36px]"
            >
              Request a Call Back
            </h2>
            <p className="mt-2 text-[13px] leading-[1.6] text-eld-body">
              Fill in the form and our sales team will contact you shortly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-[12px] font-semibold text-eld-ink-3">
                Your Name <span className="sr-only">(required)</span>
                <input
                  ref={firstInput}
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Enter your full name"
                  className={fieldClass}
                />
              </label>
              <label className="flex flex-col gap-2 text-[12px] font-semibold text-eld-ink-3">
                Phone Number <span className="sr-only">(required)</span>
                <input
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="Enter mobile number"
                  className={fieldClass}
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-[12px] font-semibold text-eld-ink-3">
              Email Address
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Enter your email address"
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col gap-2 text-[12px] font-semibold text-eld-ink-3">
              Message
              <textarea
                name="message"
                rows={3}
                placeholder="I would like to know more about..."
                className={`${fieldClass} h-[88px] resize-none py-3`}
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group mt-1 flex w-full items-center justify-center gap-3 rounded-full bg-eld-bronze-deep px-6 py-[14px] text-[13px] font-bold text-white uppercase transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : sent ? "Request Received" : "Submit Enquiry"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </button>

            <p
              role="status"
              className={`text-center text-[12px] text-eld-bronze-deep transition-opacity ${
                sent ? "opacity-100" : "opacity-0"
              }`}
            >
              Thank you — our advisor will contact you shortly.
            </p>
            {formError ? (
              <p role="alert" className="text-center text-[12px] text-red-600">
                {formError}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}