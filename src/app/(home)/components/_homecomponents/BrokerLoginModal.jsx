"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Cookies from "js-cookie";
import { validateLeadFields, validateLeadPhone } from "@/lib/leadValidation";
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

function UserOffIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="17" y1="8" x2="22" y2="13" />
      <line x1="22" y1="8" x2="17" y2="13" />
    </svg>
  );
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function OtpSuccessMark() {
  return (
    <svg className="broker-login-modal-otp-mark" viewBox="0 0 64 64" aria-hidden="true">
      <circle className="broker-login-modal-otp-mark__ring is-success" cx="32" cy="32" r="28" />
      <path className="broker-login-modal-otp-mark__check" d="M18 33.5 27.5 43 46 22.5" />
    </svg>
  );
}

function OtpFailMark() {
  return (
    <svg className="broker-login-modal-otp-mark" viewBox="0 0 64 64" aria-hidden="true">
      <circle className="broker-login-modal-otp-mark__ring is-fail" cx="32" cy="32" r="28" />
      <path className="broker-login-modal-otp-mark__cross" d="M22 22 42 42" />
      <path className="broker-login-modal-otp-mark__cross broker-login-modal-otp-mark__cross--late" d="M42 22 22 42" />
    </svg>
  );
}

function OtpVerifyArea({
  otpDigits,
  otpStatus,
  disabled,
  otpRefs,
  onChange,
  onKeyDown,
  onPaste,
}) {
  return (
    <div className={`broker-login-modal-otp-stage is-${otpStatus || "idle"}`}>
      <div className="broker-login-modal-otp-row" onPaste={onPaste}>
        {otpDigits.map((digit, i) => (
          <span key={i} className="broker-login-modal-otp-cell">
            <OtpDigitInput
              value={digit}
              disabled={disabled}
              inputRef={(el) => { otpRefs.current[i] = el; }}
              onChange={(e) => onChange(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onPaste={onPaste}
            />
          </span>
        ))}
      </div>
      {otpStatus === "success" && (
        <div className="broker-login-modal-otp-result" aria-live="polite">
          <OtpSuccessMark />
          <span>Verified</span>
        </div>
      )}
      {otpStatus === "fail" && (
        <div className="broker-login-modal-otp-result is-fail" aria-live="polite">
          <OtpFailMark />
          <span>Not verified</span>
        </div>
      )}
    </div>
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
  const [flow, setFlow] = useState("register");
  const [step, setStep] = useState("persona");
  const [persona, setPersona] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [otpStatus, setOtpStatus] = useState("idle");
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
      setFlow("register");
      setStep("persona");
      setPersona("");
      setEmail("");
      setPhone("");
      setFullName("");
      setOtpDigits(["", "", "", ""]);
      setOtpStatus("idle");
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

  const isLogin = flow === "login";
  const stepNumber = isLogin
    ? (step === "login-otp" ? 2 : 1)
    : (step === "persona" ? 1 : step === "details" ? 2 : 3);
  const stepTotal = isLogin ? 2 : 3;

  const subtitle = () => {
    if (step === "persona") return "Tell us who you are before we continue";
    if (step === "details") return "Enter your details — we'll send an OTP to your mobile";
    if (step === "login-phone") return "Enter the mobile number on your account";
    if (step === "login-no-account") return "We could not find an account for this number";
    return `Enter the 4-digit code sent to ${phone}`;
  };

  const goToLogin = () => {
    setFlow("login");
    setStep("login-phone");
    setOtpDigits(["", "", "", ""]);
    setOtpStatus("idle");
    setError("");
  };

  const goToCreateAccount = () => {
    setFlow("register");
    setStep("persona");
    setOtpDigits(["", "", "", ""]);
    setOtpStatus("idle");
    setError("");
  };

  const completeLoginSuccess = async (data) => {
    setOtpStatus("success");
    saveAuthCookies(data);
    await wait(1000);
    onClose(false);
    window.location.href = redirectPath;
  };

  const completeLoginMissingAccount = async () => {
    setOtpStatus("fail");
    await wait(1000);
    setOtpStatus("idle");
    setStep("login-no-account");
  };

  const completeVerifyFail = async (message) => {
    setOtpStatus("fail");
    await wait(1000);
    setOtpStatus("idle");
    setError(message);
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
    setOtpStatus("verifying");
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
        await completeVerifyFail(data.message || data.error || "Verification failed. Please try again.");
        return;
      }
      await completeLoginSuccess(data);
    } catch {
      await completeVerifyFail("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendLoginOtp = async (e) => {
    e?.preventDefault();
    const phoneError = validateLeadPhone(phone);
    if (phoneError) {
      setError(phoneError);
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
      setStep("login-otp");
      setOtpDigits(["", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyLoginOtp = async (e) => {
    e?.preventDefault();
    if (otp.length !== 4) {
      setError("Please enter the 4-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");
    setOtpStatus("verifying");
    try {
      const res = await fetch("/api/broker/login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (data.error === "account_not_found" || res.status === 404) {
        await completeLoginMissingAccount();
        return;
      }
      if (!res.ok || !data.token) {
        await completeVerifyFail(data.message || data.error || "Verification failed. Please try again.");
        return;
      }
      await completeLoginSuccess(data);
    } catch {
      await completeVerifyFail("Network error. Please try again.");
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
    setOtpStatus((prev) => (prev === "fail" ? "idle" : prev));
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
    setOtpStatus((prev) => (prev === "fail" ? "idle" : prev));
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
              {isLogin ? (
                <>Welcome back to the <span className="broker-login-modal-highlight">portal</span></>
              ) : isOwner ? (
                <>List your property <span className="broker-login-modal-highlight">directly</span></>
              ) : (
                <>List properties. Reach <span className="broker-login-modal-highlight">verified</span> buyers.</>
              )}
            </h3>
            <p>
              {step === "persona"
                ? "Choose how you will post properties on My Property Fact."
                : isLogin
                  ? "Login with your registered mobile number. We’ll send an OTP."
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
              ) : step === "login-no-account" ? (
                "Account not created"
              ) : isLogin ? (
                "Login"
              ) : (
                "Create an account"
              )}
            </h2>
            <p>{subtitle()}</p>
          </div>

          {error && step !== "login-no-account" && (
            <div className="broker-login-modal-alert error">{error}</div>
          )}

          {step === "persona" ? (
            <div className="broker-login-modal-form broker-login-modal-form--persona">
              <span className="broker-login-modal-step">Step {stepNumber} of {stepTotal}</span>
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
                onClick={() => { setFlow("register"); setStep("details"); }}
              >
                Continue
                <ArrowRightIcon />
              </button>
              <p className="broker-login-modal-toggle">
                Already have an account?
                <button type="button" onClick={goToLogin}>Login</button>
              </p>
            </div>
          ) : step === "details" ? (
            <form onSubmit={handleSendOtp} className="broker-login-modal-form">
              <span className="broker-login-modal-step">Step {stepNumber} of {stepTotal}</span>
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

              <p className="broker-login-modal-toggle">
                Already have an account?
                <button type="button" onClick={goToLogin} disabled={isLoading}>Login</button>
              </p>
            </form>
          ) : step === "login-phone" ? (
            <form onSubmit={handleSendLoginOtp} className="broker-login-modal-form">
              <span className="broker-login-modal-step">Step {stepNumber} of {stepTotal}</span>
              <button type="button" className="broker-login-modal-back" onClick={goToCreateAccount} disabled={isLoading}>
                <BackIcon /> Back
              </button>

              <div className="broker-login-modal-field">
                <label htmlFor="broker-modal-login-phone">Mobile number</label>
                <div className="broker-login-modal-input-wrap">
                  <span className="broker-login-modal-icon"><PhoneIcon /></span>
                  <input
                    id="broker-modal-login-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setError(""); }}
                    placeholder="10-digit mobile number"
                    disabled={isLoading}
                    className="broker-login-modal-input with-icon"
                    autoComplete="tel"
                    autoFocus
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

              <p className="broker-login-modal-toggle">
                New here?
                <button type="button" onClick={goToCreateAccount} disabled={isLoading}>Create an account</button>
              </p>
            </form>
          ) : step === "login-otp" ? (
            <form onSubmit={handleVerifyLoginOtp} className="broker-login-modal-form">
              <span className="broker-login-modal-step">Step {stepNumber} of {stepTotal}</span>
              <button type="button" className="broker-login-modal-back" onClick={() => setStep("login-phone")} disabled={isLoading}>
                <BackIcon /> Change number
              </button>

              <div className="broker-login-modal-field">
                <label>Verification code</label>
                <OtpVerifyArea
                  otpDigits={otpDigits}
                  otpStatus={otpStatus}
                  disabled={isLoading || otpStatus === "success" || otpStatus === "fail"}
                  otpRefs={otpRefs}
                  onChange={handleOtpChange}
                  onKeyDown={handleOtpKeyDown}
                  onPaste={handleOtpPaste}
                />
              </div>

              <button type="submit" className="broker-login-modal-btn broker-login-modal-btn--continue" disabled={isLoading || otp.length !== 4 || otpStatus === "success" || otpStatus === "fail"}>
                {otpStatus === "success" ? (
                  "Verified"
                ) : otpStatus === "fail" ? (
                  "Not verified"
                ) : isLoading ? (
                  <><span className="broker-login-modal-spinner" /> Verifying…</>
                ) : (
                  <>Verify & Login <ArrowRightIcon /></>
                )}
              </button>

              <button type="button" className="broker-login-modal-link" onClick={handleSendLoginOtp} disabled={isLoading}>
                Resend OTP
              </button>
            </form>
          ) : step === "login-no-account" ? (
            <div className="broker-login-modal-form">
              <button type="button" className="broker-login-modal-back" onClick={() => setStep("login-phone")}>
                <BackIcon /> Try another number
              </button>
              <div className="broker-login-modal-empty">
                <span className="broker-login-modal-empty__icon" aria-hidden="true"><UserOffIcon /></span>
                <h3>Account not created with that number</h3>
                <p>No portal account is registered for <strong>{phone}</strong>.</p>
              </div>
              <button
                type="button"
                className="broker-login-modal-btn broker-login-modal-btn--continue"
                onClick={goToCreateAccount}
              >
                Click to create an account
                <ArrowRightIcon />
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerifyOtp} className="broker-login-modal-form">
              <span className="broker-login-modal-step">Step {stepNumber} of {stepTotal}</span>
              <button type="button" className="broker-login-modal-back" onClick={() => setStep("details")} disabled={isLoading}>
                <BackIcon /> Edit details
              </button>

              <div className="broker-login-modal-field">
                <label>Verification code</label>
                <OtpVerifyArea
                  otpDigits={otpDigits}
                  otpStatus={otpStatus}
                  disabled={isLoading || otpStatus === "success" || otpStatus === "fail"}
                  otpRefs={otpRefs}
                  onChange={handleOtpChange}
                  onKeyDown={handleOtpKeyDown}
                  onPaste={handleOtpPaste}
                />
              </div>

              <button type="submit" className="broker-login-modal-btn broker-login-modal-btn--continue" disabled={isLoading || otp.length !== 4 || otpStatus === "success" || otpStatus === "fail"}>
                {otpStatus === "success" ? (
                  "Verified"
                ) : otpStatus === "fail" ? (
                  "Not verified"
                ) : isLoading ? (
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
