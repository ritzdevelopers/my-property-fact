"use client";

import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { Button, Form } from "react-bootstrap";
import { toast } from "sonner";
import "./LeadEmailOtpSection.css";

function apiBase() {
  return process.env.NEXT_PUBLIC_API_URL || "";
}

/**
 * Email OTP for public enquiry/lead forms.
 * @param {"sonner" | "inline"} feedbackMode — `inline` keeps messages inside the card (e.g. enquiry modal with extreme z-index).
 */
export default function LeadEmailOtpSection({
  email,
  emailFieldValid,
  verificationToken,
  onVerified,
  onClearVerification,
  className = "",
  compact = false,
  feedbackMode = "sonner",
}) {
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [inlineFlash, setInlineFlash] = useState(null);

  const pushFeedback = useCallback(
    (type, message) => {
      if (feedbackMode === "inline") {
        setInlineFlash({ type, message });
        return;
      }
      if (type === "success") toast.success(message);
      else toast.error(message);
    },
    [feedbackMode],
  );

  useEffect(() => {
    if (!inlineFlash || feedbackMode !== "inline") return undefined;
    const t = setTimeout(() => setInlineFlash(null), 4500);
    return () => clearTimeout(t);
  }, [inlineFlash, feedbackMode]);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const id = setTimeout(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  const handleSendOtp = async () => {
    setOtpError("");
    setInlineFlash(null);
    if (!emailFieldValid || !String(email || "").trim()) {
      setOtpError("Enter a valid email first.");
      return;
    }
    setOtpSending(true);
    try {
      const res = await axios.post(`${apiBase()}enquiry/send-email-otp`, {
        email: String(email).trim(),
      });
      const data = res.data;
      if (data.success) {
        pushFeedback("success", data.message || "OTP sent. Check your inbox.");
        setResendIn(60);
      } else {
        setOtpError(data.message || "Could not send OTP.");
      }
    } catch (e) {
      const msg =
        e.response?.data?.message || e.message || "Could not send OTP.";
      setOtpError(msg);
      if (feedbackMode === "inline") {
        setInlineFlash({ type: "error", message: msg });
      } else {
        toast.error(msg);
      }
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError("");
    setInlineFlash(null);
    const trimmed = String(otpCode || "").replace(/\D/g, "");
    if (trimmed.length !== 6) {
      setOtpError("Enter the 6-digit OTP.");
      return;
    }
    setOtpVerifying(true);
    try {
      const res = await axios.post(`${apiBase()}enquiry/verify-email-otp`, {
        email: String(email).trim(),
        otp: trimmed,
      });
      const data = res.data;
      if (data.isSuccess === 1 && data.emailVerificationToken) {
        onVerified(data.emailVerificationToken);
        setOtpCode("");
        pushFeedback("success", data.message || "Email verified. You can submit the form.");
      } else {
        setOtpError(data.message || "Verification failed.");
      }
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.message ||
        "Invalid or expired OTP.";
      setOtpError(msg);
      if (feedbackMode === "inline") {
        setInlineFlash({ type: "error", message: msg });
      } else {
        toast.error(msg);
      }
    } finally {
      setOtpVerifying(false);
    }
  };

  const wrapClass = [
    "lead-email-otp",
    compact ? "lead-email-otp--compact" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (verificationToken) {
    return (
      <div className={`${wrapClass} lead-email-otp--done`}>
        <div className="lead-email-otp-done-inner">
          <span className="lead-email-otp-done-icon" aria-hidden="true">
            ✓
          </span>
          <div>
            <div className="lead-email-otp-done-title">Email verified</div>
            <div className="lead-email-otp-done-sub">
              You can complete the rest of the form and submit.
            </div>
          </div>
        </div>
        <button
          type="button"
          className="lead-email-otp-change-link"
          onClick={() => {
            onClearVerification();
            setOtpCode("");
            setOtpError("");
            setInlineFlash(null);
          }}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className={wrapClass}>
      {inlineFlash ? (
        <div
          className={`lead-email-otp-flash lead-email-otp-flash--${inlineFlash.type}`}
          role="status"
        >
          <span className="lead-email-otp-flash-text">{inlineFlash.message}</span>
          <button
            type="button"
            className="lead-email-otp-flash-dismiss"
            aria-label="Dismiss"
            onClick={() => setInlineFlash(null)}
          >
            ×
          </button>
        </div>
      ) : null}

      <div className="lead-email-otp-header">
        <span className="lead-email-otp-badge" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M8 10h8M8 14h5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <div>
          <div className="lead-email-otp-title">Verify your email</div>
          <p className="lead-email-otp-subtitle">
            We’ll send a one-time code to confirm this address before you submit.
          </p>
        </div>
      </div>

      <div className="lead-email-otp-actions">
        <Button
          type="button"
          variant="outline-secondary"
          className="lead-email-otp-btn-send"
          disabled={!emailFieldValid || otpSending || resendIn > 0}
          onClick={handleSendOtp}
        >
          {otpSending ? (
            <span className="lead-email-otp-btn-loading">Sending…</span>
          ) : resendIn > 0 ? (
            `Resend in ${resendIn}s`
          ) : (
            "Send verification code"
          )}
        </Button>
      </div>

      <div className="lead-email-otp-verify-block">
        <label className="lead-email-otp-label" htmlFor="lead-email-otp-input">
          Enter code
        </label>
        <div className="lead-email-otp-verify-row">
          <Form.Control
            id="lead-email-otp-input"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="• • • • • •"
            maxLength={6}
            value={otpCode}
            onChange={(e) =>
              setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="lead-email-otp-input"
            disabled={otpVerifying}
          />
          <Button
            type="button"
            className="lead-email-otp-btn-verify"
            disabled={otpCode.replace(/\D/g, "").length !== 6 || otpVerifying}
            onClick={handleVerifyOtp}
          >
            {otpVerifying ? "Checking…" : "Verify"}
          </Button>
        </div>
      </div>

      {otpError ? (
        <div className="lead-email-otp-error" role="alert">
          {otpError}
        </div>
      ) : null}

      <p className="lead-email-otp-hint">
        Code expires in a few minutes. Check spam if you don’t see the email.
      </p>
    </div>
  );
}
