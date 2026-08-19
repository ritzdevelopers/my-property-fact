"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Cookies from "js-cookie";
import { validateLeadFields } from "@/lib/leadValidation";
import "./BrokerLoginModal.css";

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 012.12-4.18 2 2 0 014.11-2h3a2 2 0 012 1.72c.12.89.32 1.76.6 2.6a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.48-1.17a2 2 0 012.11-.45c.84.28 1.71.48 2.6.6A2 2 0 0122 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function OwnerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function BrokerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M2 13h20" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function OtpDigitInput({ value, onChange, onKeyDown, onPaste, disabled, inputRef }) {
  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={1}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      disabled={disabled}
      className="broker-login-modal-otp-digit"
      aria-label="OTP digit"
    />
  );
}

function saveAuthCookies(data) {
  Cookies.set("token", data.token, {
    expires: 7,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  });
  if (data.refreshToken) {
    Cookies.set("refreshToken", data.refreshToken, {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
    });
  }
  if (data.user) {
    Cookies.set("userData", JSON.stringify(data.user), {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
    });
  }
}

export default function BrokerLoginModal({
  show,
  onClose,
  redirectPath = "/portal/dashboard",
}) {
  const [step, setStep] = useState("persona");
  const [persona, setPersona] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = useRef([]);
  const authPanelRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  const otp = otpDigits.join("");
  const isOwner = persona === "OWNER";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!show) {
      setStep("persona");
      setPersona("");
      setEmail("");
      setPhone("");
      setFullName("");
      setOtpDigits(["", "", "", ""]);
      setError("");
      setIsLoading(false);
    }
  }, [show]);

  useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [show, onClose]);

  if (!show || !mounted) return null;

  const stepNumber = step === "persona" ? 1 : step === "details" ? 2 : 3;

  const subtitle = () => {
    if (step === "persona") return "Tell us who you are before we continue";
    if (step === "details") return "Enter your details — we'll send an OTP to your mobile";
    return `Enter the 4-digit code sent to ${phone}`;
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    const validation = validateLeadFields({ name: fullName, email, phone });
    if (!validation.isValid) {
      setError(validation.name || validation.email || validation.phone);
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/broker/send-otp", {
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
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (otp.length !== 4) {
      setError("Please enter the 4-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/broker/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          otp,
          fullName: fullName.trim(),
          email: email.trim(),
          userType: persona,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        setError(data.message || data.error || "Verification failed. Please try again.");
        return;
      }
      saveAuthCookies(data);
      onClose(false);
      window.location.href = redirectPath;
    } catch {
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
    if (digit && index < 3) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    const next = ["", "", "", ""];
    pasted.split("").forEach((d, i) => { next[i] = d; });
    setOtpDigits(next);
    setError("");
    otpRefs.current[Math.min(pasted.length, 3)]?.focus();
  };

  return createPortal(
    <div className="broker-login-modal-overlay" onClick={() => onClose(false)} role="presentation">
      <div
        className="broker-login-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="broker-login-modal-title"
      >
        <button type="button" className="broker-login-modal-close" onClick={() => onClose(false)} aria-label="Close">
          <CloseIcon />
        </button>

        <div className="broker-login-modal-visual">
          <div className="broker-login-modal-visual-media">
            <img
              src="/static/broker-portal/post-property-hero.png"
              alt="Post your property on My Property Fact"
              className="broker-login-modal-hero"
            />
          </div>
          <div className="broker-login-modal-visual-content">
            <span className="broker-login-modal-badge">Post Property Portal</span>
            <h3>
              {isOwner ? (
                <>List your property <span className="broker-login-modal-highlight">directly</span></>
              ) : (
                <>List properties. Reach <span className="broker-login-modal-highlight">verified</span> buyers.</>
              )}
            </h3>
            <p>
              {step === "persona"
                ? "Choose how you will post properties on My Property Fact."
                : "One account for login and registration — verified by mobile OTP."}
            </p>
            <ul className="broker-login-modal-features">
              <li><CheckIcon /> Post unlimited listings</li>
              <li><CheckIcon /> Reach verified buyers</li>
              <li><CheckIcon /> Manage leads in one place</li>
            </ul>
          </div>
        </div>

        <div className="broker-login-modal-auth" ref={authPanelRef}>
          <div className="broker-login-modal-brand">
            <img src="/logo.webp" alt="" className="broker-login-modal-logo" />
            <h2 id="broker-login-modal-title">
              {step === "persona" ? (
                <>Post a Property <span className="broker-login-modal-title-badge">FREE</span></>
              ) : (
                "Login or Register"
              )}
            </h2>
            <p>{subtitle()}</p>
          </div>

          {error && <div className="broker-login-modal-alert error">{error}</div>}

          {step === "persona" ? (
            <div className="broker-login-modal-form broker-login-modal-form--persona">
              <span className="broker-login-modal-step">Step {stepNumber} of 3</span>
              <p className="broker-login-modal-persona-label">I am posting as a</p>
              <div className="broker-login-modal-persona-grid">
                <button
                  type="button"
                  className={`broker-login-modal-persona-card ${persona === "OWNER" ? "selected" : ""}`}
                  onClick={() => { setPersona("OWNER"); setError(""); }}
                >
                  <span className="broker-login-modal-persona-card__icon" aria-hidden="true"><OwnerIcon /></span>
                  <span className="broker-login-modal-persona-card__body">
                    <strong>Property Owner</strong>
                    <span>I own this property and want to list it myself</span>
                  </span>
                  <span className="broker-login-modal-persona-card__check" aria-hidden="true"><CheckIcon /></span>
                </button>
                <button
                  type="button"
                  className={`broker-login-modal-persona-card ${persona === "BROKER" ? "selected" : ""}`}
                  onClick={() => { setPersona("BROKER"); setError(""); }}
                >
                  <span className="broker-login-modal-persona-card__icon" aria-hidden="true"><BrokerIcon /></span>
                  <span className="broker-login-modal-persona-card__body">
                    <strong>Broker / Agent</strong>
                    <span>I list properties on behalf of owners or builders</span>
                  </span>
                  <span className="broker-login-modal-persona-card__check" aria-hidden="true"><CheckIcon /></span>
                </button>
              </div>
              <button
                type="button"
                className="broker-login-modal-btn broker-login-modal-btn--continue"
                disabled={!persona}
                onClick={() => setStep("details")}
              >
                Continue
                <ArrowRightIcon />
              </button>
            </div>
          ) : step === "details" ? (
            <form onSubmit={handleSendOtp} className="broker-login-modal-form">
              <span className="broker-login-modal-step">Step {stepNumber} of 3</span>
              <button type="button" className="broker-login-modal-back" onClick={() => setStep("persona")} disabled={isLoading}>
                <BackIcon /> Change role
              </button>

              <div className="broker-login-modal-field">
                <label htmlFor="broker-modal-name">Full name</label>
                <div className="broker-login-modal-input-wrap">
                  <span className="broker-login-modal-icon"><UserIcon /></span>
                  <input
                    id="broker-modal-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setError(""); }}
                    placeholder="Your full name"
                    disabled={isLoading}
                    className="broker-login-modal-input with-icon"
                    autoComplete="name"
                    autoFocus
                  />
                </div>
              </div>

              <div className="broker-login-modal-field">
                <label htmlFor="broker-modal-email">Email address</label>
                <div className="broker-login-modal-input-wrap">
                  <span className="broker-login-modal-icon"><MailIcon /></span>
                  <input
                    id="broker-modal-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@company.com"
                    disabled={isLoading}
                    className="broker-login-modal-input with-icon"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="broker-login-modal-field">
                <label htmlFor="broker-modal-phone">Mobile number</label>
                <div className="broker-login-modal-input-wrap">
                  <span className="broker-login-modal-icon"><PhoneIcon /></span>
                  <input
                    id="broker-modal-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setError(""); }}
                    placeholder="10-digit mobile number"
                    disabled={isLoading}
                    className="broker-login-modal-input with-icon"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <button type="submit" className="broker-login-modal-btn broker-login-modal-btn--continue" disabled={isLoading}>
                {isLoading ? (
                  <><span className="broker-login-modal-spinner" /> Sending OTP…</>
                ) : (
                  <>Send OTP <ArrowRightIcon /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="broker-login-modal-form">
              <span className="broker-login-modal-step">Step {stepNumber} of 3</span>
              <button type="button" className="broker-login-modal-back" onClick={() => setStep("details")} disabled={isLoading}>
                <BackIcon /> Edit details
              </button>

              <div className="broker-login-modal-field">
                <label>Verification code</label>
                <div className="broker-login-modal-otp-row" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, i) => (
                    <OtpDigitInput
                      key={i}
                      value={digit}
                      disabled={isLoading}
                      inputRef={(el) => { otpRefs.current[i] = el; }}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={handleOtpPaste}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="broker-login-modal-btn broker-login-modal-btn--continue" disabled={isLoading || otp.length !== 4}>
                {isLoading ? (
                  <><span className="broker-login-modal-spinner" /> Verifying…</>
                ) : (
                  <>Verify & Continue <ArrowRightIcon /></>
                )}
              </button>

              <button type="button" className="broker-login-modal-link" onClick={handleSendOtp} disabled={isLoading}>
                Resend OTP
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
