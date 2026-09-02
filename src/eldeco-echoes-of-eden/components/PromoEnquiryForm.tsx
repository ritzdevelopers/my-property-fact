"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { promoCtaConfig } from "@/eldeco-echoes-of-eden/config/promo";
import { FormStatusPopup } from "@/eldeco-echoes-of-eden/components/FormStatusPopup";
import { useEnquiryFormSubmit } from "@/eldeco-echoes-of-eden/hooks/useEnquiryFormSubmit";
import { slideInRight, useMotionSettings } from "@/eldeco-echoes-of-eden/lib/motion";

export function PromoEnquiryForm() {
  const { enquiry } = promoCtaConfig;
  const { transition } = useMotionSettings();
  const [consent, setConsent] = useState(false);
  const {
    isSubmitting,
    errorMessage,
    fieldErrors,
    handleSubmit,
    clearError,
    clearFieldError,
  } = useEnquiryFormSubmit();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleSubmit(event, consent);
  };

  const errorClassName = "mt-1.5 text-xs font-medium text-red-300";

  return (
    <>
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

          <form className="mt-4 space-y-3" onSubmit={onSubmit} noValidate>
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
                    disabled={isSubmitting}
                    className="w-full resize-none rounded-md border-0 bg-[#F5F7F5] px-4 py-3 text-sm text-[#1D3B2F] placeholder:text-[#1D3B2F]/45 focus:outline-none focus:ring-2 focus:ring-[#1D3B2F]/30"
                  />
                ) : field.type === "tel" ? (
                  <div
                    className={`flex items-center gap-2 rounded-md bg-[#F5F7F5] px-4 py-3 ${
                      fieldErrors.phone ? "ring-2 ring-red-500" : ""
                    }`}
                  >
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
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      placeholder={field.placeholder}
                      required={field.required}
                      disabled={isSubmitting}
                      aria-invalid={Boolean(fieldErrors.phone)}
                      onChange={() => clearFieldError("phone")}
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
                    disabled={isSubmitting}
                    aria-invalid={Boolean(
                      fieldErrors[field.name as keyof typeof fieldErrors],
                    )}
                    onChange={() =>
                      clearFieldError(field.name as keyof typeof fieldErrors)
                    }
                    autoComplete={
                      field.type === "email"
                        ? "email"
                        : field.name === "name"
                          ? "name"
                          : "off"
                    }
                    className={`w-full rounded-md border-0 bg-[#F5F7F5] px-4 py-3 text-sm text-[#1D3B2F] placeholder:text-[#1D3B2F]/45 focus:outline-none focus:ring-2 focus:ring-[#1D3B2F]/30 ${
                      fieldErrors[field.name as keyof typeof fieldErrors]
                        ? "ring-2 ring-red-500"
                        : ""
                    }`}
                  />
                )}

                {field.name !== "message" &&
                  fieldErrors[field.name as keyof typeof fieldErrors] && (
                    <p className={errorClassName} role="alert">
                      {fieldErrors[field.name as keyof typeof fieldErrors]}
                    </p>
                  )}
              </div>
            ))}

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-[#1D3B2F] px-6 py-3.5 text-sm font-bold tracking-[0.08em] text-white transition-colors hover:bg-[#2A5244] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-70"
              whileHover={isSubmitting ? undefined : { scale: 1.02 }}
              whileTap={isSubmitting ? undefined : { scale: 0.98 }}
            >
              {isSubmitting ? "Sending…" : enquiry.submitLabel}
            </motion.button>

            <label className="flex items-start gap-2.5 text-[0.68rem] leading-5 text-white/85">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => {
                  setConsent(event.target.checked);
                  clearFieldError("consent");
                }}
                disabled={isSubmitting}
                className="mt-0.5 size-3.5 shrink-0 accent-white"
                required
              />
              <span>{enquiry.consentText}</span>
            </label>
            {fieldErrors.consent && (
              <p className={errorClassName} role="alert">
                {fieldErrors.consent}
              </p>
            )}
          </form>
        </div>
      </motion.aside>

      <FormStatusPopup
        isLoading={isSubmitting}
        errorMessage={errorMessage}
        onDismissError={clearError}
      />
    </>
  );
}
