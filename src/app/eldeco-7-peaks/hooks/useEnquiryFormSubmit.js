"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sevenPeaksConfig } from "@/app/eldeco-7-peaks/config";
import {
  EnquiryValidationError,
  submitValidatedEnquiry,
} from "@/app/eldeco-7-peaks/lib/enquirySubmit";

export function useEnquiryFormSubmit(options = {}) {
  const router = useRouter();
  const onSuccessRef = useRef(options.onSuccess);
  onSuccessRef.current = options.onSuccess;

  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const clearError = useCallback(() => {
    setStatus("idle");
    setErrorMessage("");
  }, []);

  const clearFieldError = useCallback((field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const form = event.currentTarget;
      setFieldErrors({});
      setErrorMessage("");
      setStatus("loading");

      try {
        await submitValidatedEnquiry(form);
        window.sessionStorage.setItem(
          sevenPeaksConfig.sessionSubmittedKey,
          "true",
        );
        onSuccessRef.current?.();
        form.reset();
        router.push(sevenPeaksConfig.thankYouPath);
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
