"use client";

import { useEffect, useState } from "react";
import { goToEldecoThankYou } from "./eldecoPaths";
import { handleLeadFormSubmit } from "./leadFormSubmit";
import styles from "./page.module.css";

const STORAGE_KEY = "eldeco-lead-form-submitted";
export const OPEN_LEAD_POPUP_EVENT = "open-lead-popup";

function LeadPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const hasSubmitted = window.localStorage.getItem(STORAGE_KEY) === "true";

    if (hasSubmitted) {
      setIsSubmitted(true);
      return;
    }

    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (isOpen || isSubmitted) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsOpen(true);
    }, 20000);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen, isSubmitted]);

  useEffect(() => {
    const openPopup = () => {
      setFormError("");
      setIsSubmitting(false);
      setIsSubmitted(false);
      setIsOpen(true);
    };

    window.addEventListener(OPEN_LEAD_POPUP_EVENT, openPopup);

    return () => window.removeEventListener(OPEN_LEAD_POPUP_EVENT, openPopup);
  }, []);

  const handleSubmit = async (event) => {
    try {
      setIsSubmitting(true);
      setFormError("");
      await handleLeadFormSubmit(event);
      window.localStorage.setItem(STORAGE_KEY, "true");
      goToEldecoThankYou();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen || isSubmitted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 py-8 backdrop-blur-[2px]">
      <div className="relative w-full max-w-[560px] rounded-[14px] bg-white px-8 py-8 shadow-[0_20px_55px_rgba(0,0,0,0.28)]">
        <button
          type="button"
          aria-label="Close popup form"
          onClick={() => setIsOpen(false)}
          disabled={isSubmitting}
          className="absolute right-5 top-5 text-2xl leading-none text-neutral-500 transition hover:text-black"
        >
          ×
        </button>

        <div className="pr-8">
          <h2 className={`${styles.heading} mt-2 md:text-[30px] text-[24px] font-[600] leading-tight text-black `}>
            Request a Call Back
          </h2>
          <p className={`${styles.paragraph} mt-2 max-w-[420px] text-[16px] font-[400] leading-relaxed text-neutral-600 `}>
            Share your details and our property expert will connect with you shortly.
          </p>
        </div>

        <form
          id="eldeco-lead-popup-form"
          onSubmit={handleSubmit}
          className="mt-8 grid gap-x-6 gap-y-5 sm:grid-cols-2"
          noValidate
        >
          <input
            type="text"
            name="name"
            required
            placeholder="Your Name *"
            disabled={isSubmitting}
            className="h-11 w-full border-0 border-b border-neutral-300 bg-transparent px-0 text-sm text-[#222] outline-none transition placeholder:text-neutral-400 focus:border-[#c59c35]"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="Email Address *"
            disabled={isSubmitting}
            className="h-11 w-full border-0 border-b border-neutral-300 bg-transparent px-0 text-sm text-[#222] outline-none transition placeholder:text-neutral-400 focus:border-[#c59c35]"
          />
          <input
            type="tel"
            name="phone"
            required
            inputMode="numeric"
            placeholder="Phone Number *"
            disabled={isSubmitting}
            className="h-11 w-full border-0 border-b border-neutral-300 bg-transparent px-0 text-sm text-[#222] outline-none transition placeholder:text-neutral-400 focus:border-[#c59c35] sm:col-span-2"
          />
          <textarea
            name="message"
            placeholder="Message"
            disabled={isSubmitting}
            className="h-20 w-full resize-none border-0 border-b border-neutral-300 bg-transparent px-0 py-3 text-sm text-[#222] outline-none transition placeholder:text-neutral-400 focus:border-[#c59c35] sm:col-span-2"
          />

          {formError ? (
            <p className={`${styles.paragraph} text-[13px] leading-relaxed text-red-600 sm:col-span-2`}>
              {formError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 rounded-[4px] bg-[#c59c35] px-8 text-[16px] font-[600] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2 sm:w-fit"
          >
            {isSubmitting ? "Submitting..." : "Submit Enquiry"}
          </button>

          <p className={`${styles.paragraph} text-[13px] md:text-[16px] font-[400] leading-relaxed text-neutral-500 sm:col-span-2`}>
            By submitting, you agree to be contacted regarding Eldeco project details.
          </p>
        </form>
      </div>
    </div>
  );
}

export default LeadPopup;
