"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { sectionsConfig } from "@/eldeco-echoes-of-eden/config/sections";
import { slideInRight, useMotionSettings } from "@/eldeco-echoes-of-eden/lib/motion";

type QuickEnquiryFormProps = {
  variant?: "overlay" | "section";
};

export function QuickEnquiryForm({ variant = "overlay" }: QuickEnquiryFormProps) {
  const { enquiry } = sectionsConfig.hero;
  const { transition } = useMotionSettings();
  const [consent, setConsent] = useState(false);
  const isSection = variant === "section";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const fieldClassName =
    "w-full border-0 border-b border-[#1D3B2F]/35 bg-transparent pb-2 text-sm text-[#1D3B2F] placeholder:text-[#1D3B2F]/55 focus:border-[#1D3B2F] focus:outline-none";

  return (
    <motion.aside
      className={`w-full ${isSection ? "max-w-none" : "max-w-md lg:max-w-sm xl:max-w-sm"}`}
      variants={isSection ? undefined : slideInRight}
      initial={isSection ? false : "hidden"}
      animate={isSection ? undefined : "visible"}
      transition={isSection ? undefined : transition(0.75, [0.22, 1, 0.36, 1])}
    >
      <div
        className={
          isSection
            ? "w-full"
            : "rounded-2xl border border-white/30 bg-[#E8F0EA]/80 p-6 shadow-2xl backdrop-blur-lg sm:p-7 lg:p-8"
        }
      >
        <h2
          className={`text-center font-extrabold tracking-[0.12em] text-[#1D3B2F] ${
            isSection
              ? "text-base uppercase sm:text-lg"
              : "text-lg sm:text-xl"
          }`}
        >
          {enquiry.title}
        </h2>

        <form
          className={`space-y-5 ${isSection ? "mx-auto mt-5 max-w-md" : "mt-6"}`}
          onSubmit={handleSubmit}
          noValidate
        >
          {enquiry.fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={`hero-${variant}-${field.name}`} className="sr-only">
                {field.label}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  id={`hero-${variant}-${field.name}`}
                  name={field.name}
                  rows={3}
                  placeholder={field.placeholder}
                  required={field.required}
                  className={`${fieldClassName} resize-none`}
                />
              ) : field.type === "tel" ? (
                <div className="flex items-center gap-2 border-b border-[#1D3B2F]/35 pb-2">
                  <span
                    className="shrink-0 rounded-sm bg-[#DBE4DD] px-2 py-1 text-xs font-medium text-[#1D3B2F]/80 sm:text-sm"
                    aria-hidden="true"
                  >
                    🇮🇳 +91
                  </span>
                  <input
                    id={`hero-${variant}-${field.name}`}
                    name={field.name}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={field.placeholder}
                    required={field.required}
                    className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[#1D3B2F] placeholder:text-[#1D3B2F]/55 focus:outline-none"
                  />
                </div>
              ) : (
                <input
                  id={`hero-${variant}-${field.name}`}
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
                  className={fieldClassName}
                />
              )}
            </div>
          ))}

          <motion.button
            type="submit"
            className="w-full rounded-lg bg-[#1D3B2F] px-6 py-3.5 text-sm font-bold tracking-[0.14em] text-white transition-colors hover:bg-[#2A5244] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D3B2F]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {enquiry.submitLabel}
          </motion.button>

          <label className="flex items-start gap-2.5 text-[0.68rem] leading-5 text-[#333333]">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-0.5 size-3.5 shrink-0 accent-[#1D3B2F]"
              required
            />
            <span>{enquiry.consentText}</span>
          </label>
        </form>
      </div>
    </motion.aside>
  );
}
