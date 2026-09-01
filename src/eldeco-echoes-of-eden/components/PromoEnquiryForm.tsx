"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { promoCtaConfig } from "@/eldeco-echoes-of-eden/config/promo";
import { slideInRight, useMotionSettings } from "@/eldeco-echoes-of-eden/lib/motion";

export function PromoEnquiryForm() {
  const { enquiry } = promoCtaConfig;
  const { transition } = useMotionSettings();
  const [consent, setConsent] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <motion.aside
      className="w-full max-w-md lg:max-w-sm xl:max-w-[32rem]"
      variants={slideInRight}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={transition(0.75, [0.22, 1, 0.36, 1])}
    >
      <div className="rounded-xl border border-white/15 bg-[#1D3B2F]/75 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-5">
        <h2 className="text-center text-lg font-semibold text-white sm:text-xl">
          {enquiry.title}
        </h2>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit} noValidate>
          {enquiry.fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={`promo-${field.name}`} className="sr-only">
                {field.label}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  id={`promo-${field.name}`}
                  name={field.name}
                  rows={3}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full resize-none rounded-md border-0 bg-[#F5F7F5] px-4 py-3 text-sm text-[#1D3B2F] placeholder:text-[#1D3B2F]/45 focus:outline-none focus:ring-2 focus:ring-[#1D3B2F]/30"
                />
              ) : field.type === "tel" ? (
                <div className="flex items-center gap-2 rounded-md bg-[#F5F7F5] px-4 py-3">
                  <span
                    className="shrink-0 text-sm font-medium text-[#1D3B2F]/80"
                    aria-hidden="true"
                  >
                    🇮🇳 +91
                  </span>
                  <input
                    id={`promo-${field.name}`}
                    name={field.name}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={field.placeholder}
                    required={field.required}
                    className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[#1D3B2F] placeholder:text-[#1D3B2F]/45 focus:outline-none"
                  />
                </div>
              ) : (
                <input
                  id={`promo-${field.name}`}
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
                  className="w-full rounded-md border-0 bg-[#F5F7F5] px-4 py-3 text-sm text-[#1D3B2F] placeholder:text-[#1D3B2F]/45 focus:outline-none focus:ring-2 focus:ring-[#1D3B2F]/30"
                />
              )}
            </div>
          ))}

          <motion.button
            type="submit"
            className="w-full rounded-md bg-[#1D3B2F] px-6 py-3.5 text-sm font-bold tracking-[0.08em] text-white transition-colors hover:bg-[#2A5244] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {enquiry.submitLabel}
          </motion.button>

          <label className="flex items-start gap-2.5 text-[0.68rem] leading-5 text-white/85">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-0.5 size-3.5 shrink-0 accent-white"
              required
            />
            <span>{enquiry.consentText}</span>
          </label>
        </form>
      </div>
    </motion.aside>
  );
}
