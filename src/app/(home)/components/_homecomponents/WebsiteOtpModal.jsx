"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { extractAccessToken } from "@/lib/apiAuth";
import { validateLeadPhone } from "@/lib/leadValidation";
import { AUTH_CHANGED_EVENT, saveWebsiteAuth, syncLocalActivityOnLogin } from "@/lib/userActivity";
import "./WebsiteOtpModal.css";

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function WebsiteOtpModal({ show, onClose, initialFlow = "login" }) {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("idle");
  const otpRefs = useRef([]);
  const otp = otpDigits.join("");

  useEffect(() => {
    if (!show) return undefined;
    setStep("phone");
    setPhone("");
    setFullName("");
    setOtpDigits(["", "", "", ""]);
    setError("");
    setStatus("idle");
    setIsLoading(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show, initialFlow]);

  if (!show || typeof document === "undefined") return null;

  const sendOtp = async (event) => {
    event?.preventDefault();
    const phoneError = validateLeadPhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/website/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not send OTP. Please try again.");
        return;
      }
      setStep("otp");
      setOtpDigits(["", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 80);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const finishLogin = async (data) => {
    saveWebsiteAuth(data);
    await syncLocalActivityOnLogin();
    setStatus("success");
    try {
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    } catch {
      /* ignore */
    }
    setTimeout(() => onClose?.(false), 700);
  };

  const verifyOtp = async (event) => {
    event?.preventDefault();
    if (otp.length !== 4) {
      setError("Please enter the 4-digit OTP");
      return;
    }
    setIsLoading(true);
    setError("");
    setStatus("verifying");
    try {
      const res = await fetch("/api/auth/website/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          otp,
          fullName: fullName.trim(),
        }),
      });
      const data = await res.json();
      if (data.error === "full_name_required") {
        setStatus("idle");
        setStep("name");
        setError("");
        return;
      }
      if (!res.ok || !extractAccessToken(data)) {
        setStatus("fail");
        setError(data.message || "Verification failed. Please try again.");
        return;
      }
      await finishLogin(data);
    } catch {
      setStatus("fail");
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setError("");
    setStatus((prev) => (prev === "fail" ? "idle" : prev));
    if (digit && index < 3) otpRefs.current[index + 1]?.focus();
  };

  const modal = (
    <div className="mpf-otp-overlay" role="presentation" onClick={() => onClose?.(false)}>
      <div
        className="mpf-otp-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mpf-otp-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="mpf-otp-close" aria-label="Close login" onClick={() => onClose?.(false)}>
          <CloseIcon />
        </button>
        <div className="mpf-otp-brand">
          <img src="/logo.webp" alt="My Property Fact" title="My Property Fact" width={54} height={50} />
          <p>Login with OTP</p>
        </div>
        {step === "phone" ? (
          <form className="mpf-otp-body" onSubmit={sendOtp}>
            <h2 id="mpf-otp-title">Enter your mobile number</h2>
            <p>We will send a 4-digit OTP to sign you in. New numbers are registered automatically.</p>
            <label className="mpf-otp-field">
              <span>Mobile number</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
              />
            </label>
            {error ? <p className="mpf-otp-error">{error}</p> : null}
            <button type="submit" className="mpf-otp-submit" disabled={isLoading}>
              {isLoading ? "Sending…" : "Get OTP"}
            </button>
          </form>
        ) : null}
        {step === "otp" ? (
          <form className="mpf-otp-body" onSubmit={verifyOtp}>
            <h2 id="mpf-otp-title">Verify OTP</h2>
            <p>Enter the 4-digit code sent to {phone}.</p>
            <div className="mpf-otp-row" onPaste={(e) => {
              e.preventDefault();
              const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
              if (!pasted) return;
              const next = ["", "", "", ""];
              pasted.split("").forEach((d, i) => { next[i] = d; });
              setOtpDigits(next);
              otpRefs.current[Math.min(pasted.length, 3)]?.focus();
            }}>
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpRefs.current[index] = el; }}
                  className={`mpf-otp-digit${status === "fail" ? " is-fail" : ""}${status === "success" ? " is-success" : ""}`}
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
                      otpRefs.current[index - 1]?.focus();
                    }
                  }}
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>
            {error ? <p className="mpf-otp-error">{error}</p> : null}
            <button type="submit" className="mpf-otp-submit" disabled={isLoading || otp.length !== 4}>
              {isLoading ? "Verifying…" : "Verify & continue"}
            </button>
            <button type="button" className="mpf-otp-link" onClick={sendOtp} disabled={isLoading}>
              Resend OTP
            </button>
          </form>
        ) : null}
        {step === "name" ? (
          <form className="mpf-otp-body" onSubmit={verifyOtp}>
            <h2 id="mpf-otp-title">Create your account</h2>
            <p>We could not find an account for this number. Enter your name to continue.</p>
            <label className="mpf-otp-field">
              <span>Full name</span>
              <input
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </label>
            {error ? <p className="mpf-otp-error">{error}</p> : null}
            <button type="submit" className="mpf-otp-submit" disabled={isLoading || fullName.trim().length < 2}>
              {isLoading ? "Creating…" : "Create account"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
