"use client";

import { useState } from "react";
import { ArrowRight } from "./ui/Icons";
import { goToEldecoThankYou } from "../eldecoPaths";
import { handleEldecoLeadFormSubmit } from "./eldecoLeadFormSubmit";

/*
  Section 9 — About Developer + Request a Call Back
  (Figma 1:394, y 5863-6535, 1440 wide, px-88 py-56, columns gap 59)

    1:396 grid-container     : 622 wide — "About Developer" Playfair Medium
                               54px/1.1 #1c120b, a 120px 2px rule, then three
                               15px/1.7 #60554e paragraphs (gap 24)
    1:405 callback-container : 583 wide, white, 1px #eae3da, rounded-24, p-40,
                               gap 32. Inputs h46, #faf8f5 on #eae3da,
                               rounded-8, 14px #60554e. Message box h100.
    1:434 submit             : #ad7736, rounded-100, px-32 py-14, 16px gap
*/

const PARAGRAPHS = [
  "Eldeco Group is one of India's most trusted and established real estate developers, with a legacy spanning over four decades. Known for delivering premium residential, commercial, and integrated township developments, the group has consistently created landmark projects that blend quality construction, modern architecture, and customer-centric design.",
  "With a strong presence across multiple cities in North India, Eldeco Group has successfully delivered numerous projects and earned the trust of thousands of families through timely delivery, transparency, and innovation. The brand is recognized for developing thoughtfully planned communities that offer luxury, comfort, sustainability, and enhanced lifestyle experiences.",
  "Driven by excellence and a vision to redefine urban living, Eldeco Group continues to craft future-ready developments that combine strategic locations, world-class amenities, and superior living standards for modern homebuyers and investors.",
];

const inputClass =
  "h-[46px] w-full rounded-[8px] border border-eld-line-2 bg-eld-field px-[16px] py-[12px] text-[14px] leading-[normal] font-normal text-eld-body outline-none transition-colors placeholder:text-eld-body focus:border-eld-bronze-deep";

function Field({ id, label, required, grow = false, children }) {
  return (
    <div
      className={`flex w-full min-w-0 flex-col items-start gap-[8px] ${
        grow ? "flex-1" : "flex-none self-stretch"
      }`}
    >
      <label
        htmlFor={id}
        className="flex items-center gap-[4px] text-[13px] leading-[normal] font-semibold whitespace-nowrap"
      >
        <span className="text-eld-ink-3">{label}</span>
        {required && <span className="text-eld-bronze-deep">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function Section9() {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (event) => {
    setIsSubmitting(true);
    setFormError("");

    try {
      await handleEldecoLeadFormSubmit(event);
      setSent(true);
      goToEldecoThankYou();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong.");
      setIsSubmitting(false);
    }
  };

  return (
    <section id="callback" className="w-full bg-white py-10 lg:py-[56px]">
      <div className="mx-auto w-full max-w-frame px-4 sm:px-8 lg:px-[88px]">
        <div className="grid w-full grid-cols-1 items-center gap-[40px] lg:grid-cols-[minmax(0,622fr)_minmax(0,583fr)] lg:gap-[59px]">
          {/* ── 1:396 developer-narrative ────────────────────────── */}
          <div className="flex w-full min-w-0 items-start justify-center lg:justify-start">
            <div className="flex min-w-px flex-1 flex-col items-center gap-[40px] lg:items-start">
              <div className="flex w-full flex-col items-center gap-[16px] lg:items-start">
                <h2 className="font-playfair w-full text-center text-[36px] leading-[1.1] font-medium text-eld-ink-3 lg:text-left lg:text-[54px]">
                  About Developer
                </h2>
                <div aria-hidden="true" className="h-[2px] w-[120px] bg-eld-bronze-deep" />
              </div>
              <div className="flex w-full flex-col items-center gap-[24px] text-center text-[15px] leading-[1.7] font-normal text-eld-body lg:items-start lg:text-left">
                {PARAGRAPHS.map((p) => (
                  <p key={p.slice(0, 24)} className="w-full">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* ── 1:405 callback-container ─────────────────────────── */}
          <div className="flex w-full min-w-0 flex-col items-start gap-[32px] rounded-[24px] border border-eld-line-2 bg-white p-6 drop-shadow-[0px_16px_16px_rgba(28,18,11,0.04)] sm:p-[40px]">
            <h3 className="font-playfair w-full text-[28px] leading-[normal] font-medium text-eld-ink-3 lg:text-[36px]">
              Request a Call Back
            </h3>

            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-[32px]">
              <div className="flex w-full flex-col items-start gap-[20px]">
                <div className="flex w-full flex-col items-start gap-[20px] sm:flex-row">
                  <Field id="eld-name" label="Your Name" required grow>
                    <input
                      id="eld-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Enter your full name"
                      className={inputClass}
                    />
                  </Field>
                  <Field id="eld-email" label="Email" required grow>
                    <input
                      id="eld-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="Enter your email address"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field id="eld-phone" label="Phone Number" required>
                  <input
                    id="eld-phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="Enter your mobile number"
                    className={inputClass}
                  />
                </Field>

                <Field id="eld-message" label="Message">
                  <textarea
                    id="eld-message"
                    name="message"
                    placeholder="How can we help you?"
                    className={`${inputClass} h-[100px] resize-none p-[16px]`}
                  />
                </Field>
              </div>

              {/* 1:433 submit-button-container */}
              <div className="flex w-full items-center justify-center py-[12px]">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group flex min-w-px flex-1 items-center justify-center gap-[16px] rounded-[100px] border border-eld-bronze-deep bg-eld-bronze-deep px-[32px] py-[14px] transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="text-[14px] leading-[normal] font-bold whitespace-nowrap text-white uppercase">
                    {isSubmitting ? "Submitting..." : sent ? "Request Received" : "Submit Request"}
                  </span>
                  <ArrowRight className="size-[16px] shrink-0 text-white transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              <p role="status" hidden={!sent} className="-mt-4 text-[13px] text-eld-body">
                Thank you — our sales team will call you back shortly.
              </p>
              {formError ? (
                <p role="alert" className="-mt-4 text-[13px] text-red-600">
                  {formError}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
