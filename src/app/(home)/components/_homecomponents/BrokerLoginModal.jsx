"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "./BrokerLoginModal.css";

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function BrokerLoginModal({ show, onClose }) {
  const [mode, setMode] = useState("signin");
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState("");

  useEffect(() => {
    if (!show) {
      setMode("signin");
      setStep("email");
      setEmail("");
      setFullName("");
      setOtp("");
      setError("");
      setDevOtp("");
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

  if (!show) return null;

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const resetToEmail = () => {
    setStep("email");
    setOtp("");
    setError("");
    setDevOtp("");
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (mode === "signup" && !fullName.trim()) {
      setError("Please enter your full name");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}app/auth/send-otp`,
        { email: email.trim() },
      );
      if (response.data.success) {
        setStep("otp");
        if (response.data.otp) setDevOtp(response.data.otp);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Could not send OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (!otp.trim()) {
      setError("Please enter the OTP sent to your email");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const payload = { email: email.trim(), otp: otp.trim() };
      if (mode === "signup" && fullName.trim()) {
        payload.fullName = fullName.trim();
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}app/auth/verify-otp`,
        payload,
      );

      if (response.data.token) {
        Cookies.set("token", response.data.token, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
          path: "/",
        });
        if (response.data.refreshToken) {
          Cookies.set("refreshToken", response.data.refreshToken, {
            expires: 7,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            path: "/",
          });
        }
        if (response.data.user) {
          Cookies.set("userData", JSON.stringify(response.data.user), {
            expires: 7,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            path: "/",
          });
        }
        onClose(false);
        window.location.href = "/portal/dashboard";
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Invalid OTP. Please check and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isSignUp = mode === "signup";

  return (
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

        <div className="broker-login-modal-brand">
          <img src="/logo.webp" alt="" className="broker-login-modal-logo" />
          <h2 id="broker-login-modal-title">Post a Property Free</h2>
          <p>
            {step === "email"
              ? "Sign in with your email to access the broker dashboard"
              : `Enter the code sent to ${email}`}
          </p>
        </div>

        {error && <div className="broker-login-modal-alert error">{error}</div>}
        {devOtp && step === "otp" && (
          <div className="broker-login-modal-alert dev">Dev OTP: <strong>{devOtp}</strong></div>
        )}

        {step === "otp" ? (
          <form onSubmit={handleVerifyOtp}>
            <div className="broker-login-modal-field">
              <label htmlFor="broker-modal-otp">Verification code</label>
              <input
                id="broker-modal-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                placeholder="000000"
                disabled={isLoading}
                className="broker-login-modal-input otp"
                autoFocus
              />
            </div>
            <button type="submit" className="broker-login-modal-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="broker-login-modal-spinner" />
                  Verifying…
                </>
              ) : (
                "Verify & Go to Dashboard"
              )}
            </button>
            <button type="button" className="broker-login-modal-link" onClick={resetToEmail} disabled={isLoading}>
              Use a different email
            </button>
            <button type="button" className="broker-login-modal-link" onClick={handleSendOtp} disabled={isLoading}>
              Resend code
            </button>
          </form>
        ) : (
          <form onSubmit={handleSendOtp}>
            {isSignUp && (
              <div className="broker-login-modal-field">
                <label htmlFor="broker-modal-name">Full name</label>
                <input
                  id="broker-modal-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setError("");
                  }}
                  placeholder="Your full name"
                  disabled={isLoading}
                  className="broker-login-modal-input"
                  autoComplete="name"
                />
              </div>
            )}
            <div className="broker-login-modal-field">
              <label htmlFor="broker-modal-email">Email address</label>
              <div className="broker-login-modal-input-wrap">
                <span className="broker-login-modal-icon"><MailIcon /></span>
                <input
                  id="broker-modal-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@company.com"
                  disabled={isLoading}
                  className="broker-login-modal-input with-icon"
                  autoComplete="email"
                  autoFocus={!isSignUp}
                />
              </div>
            </div>
            <button type="submit" className="broker-login-modal-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="broker-login-modal-spinner" />
                  Sending code…
                </>
              ) : (
                "Continue with Email"
              )}
            </button>
            <p className="broker-login-modal-toggle">
              {isSignUp ? (
                <>
                  Already registered?
                  <button type="button" onClick={() => { setMode("signin"); resetToEmail(); setFullName(""); }}>
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New broker?
                  <button type="button" onClick={() => { setMode("signup"); resetToEmail(); }}>
                    Create account
                  </button>
                </>
              )}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
