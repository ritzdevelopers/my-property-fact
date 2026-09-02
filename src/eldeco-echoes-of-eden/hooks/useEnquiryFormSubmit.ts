"use client";

import { FormEvent, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { googleSheetConfig } from "@/eldeco-echoes-of-eden/config/googleSheet";
import {
  EnquiryValidationError,
  type EnquiryFieldErrors,
  submitValidatedEnquiry,
} from "@/eldeco-echoes-of-eden/lib/enquirySubmit";

type FormStatus = "idle" | "loading" | "error";

type UseEnquiryFormSubmitOptions = {
  onSuccess?: () => void;
};

export function useEnquiryFormSubmit(options: UseEnquiryFormSubmitOptions = {}) {
  const router = useRouter();
  const onSuccessRef = useRef(options.onSuccess);
  onSuccessRef.current = options.onSuccess;

  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<EnquiryFieldErrors>({});

  const clearError = useCallback(() => {
    setStatus("idle");
    setErrorMessage("");
  }, []);

  const clearFieldError = useCallback((field: keyof EnquiryFieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>, consentChecked: boolean) => {
      event.preventDefault();

      const form = event.currentTarget;
      setFieldErrors({});
      setErrorMessage("");
      setStatus("loading");

      try {
        await submitValidatedEnquiry(form, consentChecked);
        onSuccessRef.current?.();
        form.reset();
        router.push(googleSheetConfig.thankYouPath);
      } catch (error) {
        if (error instanceof EnquiryValidationError) {
          setFieldErrors(error.fieldErrors);
          setStatus("idle");
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong while submitting your enquiry. Please try again.",
        );
        setStatus("error");
      }
    },
    [router],
  );

  return {
    status,
    isSubmitting: status === "loading",
    errorMessage,
    fieldErrors,
    handleSubmit,
    clearError,
    clearFieldError,
  };
}
