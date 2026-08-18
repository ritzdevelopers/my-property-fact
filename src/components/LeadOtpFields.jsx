"use client";

import { validateLeadPhone } from "@/lib/leadValidation";
import "./LeadOtpFields.css";

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
}) {
  const phoneValid = !validateLeadPhone(phone);
  const rootClass = [
    "lead-otp-fields",
    variant !== "default" ? `lead-otp-fields--${variant}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

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
      </div>
      {error ? <p className="lead-otp-fields__error">{error}</p> : null}
      {isVerified ? (
        <p className="lead-otp-fields__success">Mobile number verified</p>
      ) : otpSent ? (
        <p className="lead-otp-fields__hint">
          OTP sent to your mobile. Enter the code to verify.
          {verifying ? " Verifying…" : ""}
        </p>
      ) : (
        <p className="lead-otp-fields__hint">
          Enter your mobile number, send OTP, and verify to continue.
        </p>
      )}
    </div>
  );
}
