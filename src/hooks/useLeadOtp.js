"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { validateLeadPhone } from "@/lib/leadValidation";
import { sendLeadOtp, verifyLeadOtpClient } from "@/lib/leadOtpClient";

const RESEND_SECONDS = 30;

export function useLeadOtp(phone) {
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);
  const timerRef = useRef(null);
  /** Prevents re-verifying the same wrong 4-digit code in a loop. */
  const lastAutoVerifyOtpRef = useRef("");

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startCooldown = useCallback(() => {
    clearTimer();
    setResendSeconds(RESEND_SECONDS);
    timerRef.current = setInterval(() => {
      setResendSeconds((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  useEffect(() => {
    setOtp("");
    setOtpSent(false);
    setIsVerified(false);
    setError("");
    lastAutoVerifyOtpRef.current = "";
    clearTimer();
    setResendSeconds(0);
  }, [phone, clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const sendOtp = useCallback(async () => {
    const phoneError = validateLeadPhone(phone);
    if (phoneError) {
      setError(phoneError);
      return false;
    }
    if (resendSeconds > 0) {
      setError(`Please wait ${resendSeconds}s before resending OTP`);
      return false;
    }

    setSending(true);
    setError("");
    try {
      await sendLeadOtp(phone);
      setOtpSent(true);
      startCooldown();
      return true;
    } catch (err) {
      setError(err.message || "Could not send OTP");
      return false;
    } finally {
      setSending(false);
    }
  }, [phone, resendSeconds, startCooldown]);

  const verifyOtp = useCallback(async () => {
    if (!String(otp || "").trim()) {
      setError("Please enter the OTP");
      return false;
    }

    setVerifying(true);
    setError("");
    try {
      await verifyLeadOtpClient(phone, otp);
      setIsVerified(true);
      lastAutoVerifyOtpRef.current = "";
      return true;
    } catch (err) {
      const message = String(err?.message || "");
      setError(
        /invalid/i.test(message)
          ? "Invalid code. Please try again."
          : message || "Invalid code. Please try again.",
      );
      return false;
    } finally {
      setVerifying(false);
    }
  }, [phone, otp]);

  useEffect(() => {
    if (otp.length < 4) {
      lastAutoVerifyOtpRef.current = "";
      return;
    }
    if (!otpSent || isVerified || verifying || otp.length !== 4) {
      return;
    }
    if (lastAutoVerifyOtpRef.current === otp) {
      return;
    }

    lastAutoVerifyOtpRef.current = otp;
    verifyOtp();
  }, [otp, otpSent, isVerified, verifying, verifyOtp]);

  const reset = useCallback(() => {
    setOtp("");
    setOtpSent(false);
    setIsVerified(false);
    setError("");
    lastAutoVerifyOtpRef.current = "";
    clearTimer();
    setResendSeconds(0);
  }, [clearTimer]);

  return {
    otp,
    setOtp,
    otpSent,
    isVerified,
    /** @deprecated Fields are never locked — OTP runs after submit. */
    formLocked: false,
    /** Show OTP input only after the user submits and SMS is sent. */
    showOtpStep: otpSent && !isVerified,
    sending,
    verifying,
    error,
    resendSeconds,
    sendOtp,
    verifyOtp,
    reset,
  };
}
