"use client";

import { useEnquiryFormSubmit } from "@/app/eldeco-7-peaks/hooks/useEnquiryFormSubmit";

export default function EnquiryForm() {
  const {
    isSubmitting,
    errorMessage,
    fieldErrors,
    handleSubmit,
    clearFieldError,
  } = useEnquiryFormSubmit();

  const fieldErrorClass =
    "m-0 text-[12px] font-medium leading-snug text-red-300";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="relative z-10 mt-[35px] flex w-full max-w-[952px] flex-col gap-5 rounded-3xl border-[1.25px] border-[#262626] bg-black/60 p-[33px] shadow-[0_25px_50px_rgba(0,0,0,0.25)] max-[800px]:h-auto"
    >
      <div className="grid grid-cols-2 gap-5 max-[800px]:grid-cols-1">
        <label className="flex flex-col gap-2 text-sm font-medium text-white">
          Full Name *
          <input
            name="name"
            autoComplete="name"
            placeholder="Enter your name"
            required
            disabled={isSubmitting}
            aria-invalid={Boolean(fieldErrors.name)}
            onChange={() => clearFieldError("name")}
            className={`h-[50px] rounded-[50px] border bg-[#262626] px-4 py-3 text-base text-white outline-none placeholder:text-white/50 focus:border-white ${
              fieldErrors.name ? "border-red-400" : "border-none"
            }`}
          />
          {fieldErrors.name ? (
            <p className={fieldErrorClass} role="alert">
              {fieldErrors.name}
            </p>
          ) : null}
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-white">
          Email Address *
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="your@email.com"
            required
            disabled={isSubmitting}
            aria-invalid={Boolean(fieldErrors.email)}
            onChange={() => clearFieldError("email")}
            className={`h-[50px] rounded-[50px] border bg-[#262626] px-4 py-3 text-base text-white outline-none placeholder:text-white/50 focus:border-white ${
              fieldErrors.email ? "border-red-400" : "border-none"
            }`}
          />
          {fieldErrors.email ? (
            <p className={fieldErrorClass} role="alert">
              {fieldErrors.email}
            </p>
          ) : null}
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm font-medium text-white">
        Phone Number *
        <input
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={10}
          placeholder="10-digit mobile number"
          required
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.phone)}
          onChange={() => clearFieldError("phone")}
          className={`h-[50px] rounded-[50px] border bg-[#262626] px-4 py-3 text-base text-white outline-none placeholder:text-white/50 focus:border-white ${
            fieldErrors.phone ? "border-red-400" : "border-none"
          }`}
        />
        {fieldErrors.phone ? (
          <p className={fieldErrorClass} role="alert">
            {fieldErrors.phone}
          </p>
        ) : null}
      </label>

      {errorMessage ? (
        <p className="m-0 text-sm text-red-300" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-7peaks-slide btn-7peaks-slide--light mx-auto mt-auto h-[55px] w-[168px] cursor-pointer rounded-[50px] border-0 text-[17px] font-semibold disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="relative z-[1]">
          {isSubmitting ? "Submitting..." : "Submit Enquiry"}
        </span>
      </button>
    </form>
  );
}
