"use client";

import { useEffect, useRef } from "react";
import { validateLeadPhone } from "@/lib/leadValidation";
import "./LeadOtpFields.css";

function maskPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 4) return digits;
  return `+91 ${digits.slice(0, 2)}****${digits.slice(-4)}`;
}

function OtpDigitInputs({ otp, onOtpChange, disabled, verifying }) {
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!disabled && !verifying) {
      inputRefs.current[0]?.focus();
    }
  }, [disabled, verifying]);

  const digits = [0, 1, 2, 3].map((i) => otp[i] || "");

  const updateOtp = (next) => {
    onOtpChange(next.replace(/\D/g, "").slice(0, 4));
  };

  const handleDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const arr = digits.slice();
    arr[index] = digit;
    updateOtp(arr.join(""));
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted) {
      updateOtp(pasted);
      const focusIndex = Math.min(pasted.length, 3);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="lead-otp-panel__digits" role="group" aria-label="4-digit OTP">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          className="lead-otp-panel__digit"
          aria-label={`Digit ${index + 1}`}
          onChange={(e) => handleDigitChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
        />
      ))}
    </div>
  );
}

export default function LeadOtpFields({
  phone,
  otp,
  onOtpChange,
  otpSent,
  isVerified,
  sending,
  verifying,
  error,
  resendSeconds,
  onSendOtp,
  className = "",
  inputClassName = "",
  buttonClassName = "",
  variant = "default",
  /** When true, OTP is sent on form submit — only resend is shown here. */
  submitFlow = false,
  visible = true,
}) {
  const phoneValid = !validateLeadPhone(phone);
  const rootClass = [
    "lead-otp-fields",
    variant !== "default" ? `lead-otp-fields--${variant}` : "",
    submitFlow ? "lead-otp-fields--submit-flow" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!visible) {
    return null;
  }

  if (submitFlow && otpSent && !isVerified) {
    return (
      <div className={`lead-otp-panel lead-otp-panel--solo ${variant !== "default" ? `lead-otp-panel--${variant}` : ""} ${className}`}>
        <div className="lead-otp-panel__header">
          <p className="lead-otp-panel__title">Verify your mobile number</p>
          <p className="lead-otp-panel__subtitle">
            Enter the 4-digit code sent to {maskPhone(phone)}
          </p>
        </div>

        <OtpDigitInputs
          otp={otp}
          onOtpChange={onOtpChange}
          disabled={isVerified}
          verifying={verifying}
        />

        {verifying ? (
          <p className="lead-otp-panel__status lead-otp-panel__status--loading">
            Verifying code…
          </p>
        ) : null}

        {error && !verifying ? (
          <p className="lead-otp-panel__error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="lead-otp-panel__actions">
          <button
            type="button"
            className={`lead-otp-panel__resend ${buttonClassName}`}
            onClick={onSendOtp}
            disabled={!phoneValid || sending || resendSeconds > 0}
          >
            {sending
              ? "Sending…"
              : resendSeconds > 0
                ? `Resend code in ${resendSeconds}s`
                : "Resend code"}
          </button>
        </div>
      </div>
    );
  }

  const showSendButton = !submitFlow || otpSent;

  return (
    <div className={rootClass}>
      <div className="lead-otp-fields__row">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={4}
          placeholder="Enter 4-digit OTP"
          value={otp}
          onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
          disabled={isVerified}
          className={`lead-otp-fields__input ${inputClassName}`}
          aria-label="OTP verification code"
        />
        {showSendButton ? (
          <button
            type="button"
            className={`lead-otp-fields__send-btn ${buttonClassName}`}
            onClick={onSendOtp}
            disabled={!phoneValid || sending || isVerified || resendSeconds > 0}
          >
            {isVerified
              ? "Verified"
              : sending
                ? "Sending…"
                : otpSent
                  ? resendSeconds > 0
                    ? `Resend (${resendSeconds}s)`
                    : "Resend OTP"
                  : "Send OTP"}
          </button>
        ) : null}
      </div>
      {error ? <p className="lead-otp-fields__error">{error}</p> : null}
      {isVerified ? (
        <p className="lead-otp-fields__success">Mobile number verified</p>
      ) : otpSent ? (
        <p className="lead-otp-fields__hint">
          Enter the 4-digit code sent to your mobile.
          {verifying ? " Verifying…" : ""}
        </p>
      ) : submitFlow ? null : (
        <p className="lead-otp-fields__hint">
          Enter your mobile number, send OTP, and verify to continue.
        </p>
      )}
    </div>
  );
}
