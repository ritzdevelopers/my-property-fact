"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import "./portal-login.css";

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

export default function PortalSignInPage() {
  const [mode, setMode] = useState("signin");
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState("");

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const resetToEmail = () => {
    setStep("email");
    setOtp("");
    setError("");
    setDevOtp("");
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetToEmail();
    setEmail("");
    setFullName("");
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
        { timeout: 25000 },
      );
      if (response.status === 200 && response.data?.success !== false) {
        setStep("otp");
        if (response.data.otp) setDevOtp(response.data.otp);
      } else {
        setError(response.data?.message || response.data?.error || "Could not send OTP. Please try again.");
      }
    } catch (err) {
      const message = err.code === "ECONNABORTED"
        ? "Request timed out. Please try again."
        : !err.response
          ? "Network error. Please check your connection and try again."
          : err.response?.data?.message ||
            err.response?.data?.error ||
            "Could not send OTP. Please try again.";
      setError(message);
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
    <div className="broker-login-page">
      <div className="broker-login-wrap">
        <div className="broker-login-card">
          {/* Brand */}
          <div className="broker-login-brand">
            <img src="/logo.webp" alt="My Property Fact" className="broker-login-logo" />
            <h1>Property Portal</h1>
            <p>
              {step === "email"
                ? isSignUp
                  ? "Create your account with email"
                  : "Sign in with your email to manage listings"
                : "Enter the code we sent to your inbox"}
            </p>
          </div>

          {step === "otp" ? (
            <>
              <button type="button" className="broker-login-back" onClick={resetToEmail}>
                <BackIcon />
                Change email
              </button>

              <div className="broker-login-otp-header">
                <span className="broker-login-step-label">Step 2 of 2</span>
                <h2>Check your email</h2>
                <p>
                  We sent a 4-digit code to<br />
                  <strong>{email}</strong>
                </p>
              </div>

              {error && <div className="broker-login-alert error">{error}</div>}

              {devOtp && (
                <div className="broker-login-alert dev-otp">
                  Dev OTP: <strong>{devOtp}</strong>
                </div>
              )}

              <form onSubmit={handleVerifyOtp}>
                <div className="broker-login-field">
                  <label htmlFor="otp">Verification code</label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ""));
                      setError("");
                    }}
                    placeholder="0000"
                    disabled={isLoading}
                    className="broker-login-input otp-input no-icon"
                    autoFocus
                  />
                </div>

                <button type="submit" className="broker-login-btn" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="broker-login-btn-spinner" />
                      Verifying…
                    </>
                  ) : (
                    isSignUp ? "Verify & Create Account" : "Verify & Sign In"
                  )}
                </button>
              </form>

              <button
                type="button"
                className="broker-login-link-btn"
                onClick={handleSendOtp}
                disabled={isLoading}
              >
                Didn&apos;t receive it? Resend code
              </button>
            </>
          ) : (
            <>
              <span className="broker-login-step-label">Step 1 of 2 · Email</span>

              {error && <div className="broker-login-alert error">{error}</div>}

              <form onSubmit={handleSendOtp}>
                {isSignUp && (
                  <div className="broker-login-field">
                    <label htmlFor="fullName">Full name</label>
                    <div className="broker-login-input-wrap">
                      <span className="broker-login-input-icon">
                        <UserIcon />
                      </span>
                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          setError("");
                        }}
                        placeholder="Your full name"
                        disabled={isLoading}
                        className="broker-login-input"
                        autoComplete="name"
                      />
                    </div>
                  </div>
                )}

                <div className="broker-login-field">
                  <label htmlFor="email">Email address</label>
                  <div className="broker-login-input-wrap">
                    <span className="broker-login-input-icon">
                      <MailIcon />
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="you@company.com"
                      disabled={isLoading}
                      className="broker-login-input"
                      autoComplete="email"
                      autoFocus={!isSignUp}
                    />
                  </div>
                </div>

                <button type="submit" className="broker-login-btn" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="broker-login-btn-spinner" />
                      Sending code…
                    </>
                  ) : (
                    "Continue with Email"
                  )}
                </button>
              </form>

              <div className="broker-login-toggle">
                {isSignUp ? (
                  <>
                    Already a broker?
                    <button type="button" onClick={() => switchMode("signin")}>
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    New broker?
                    <button type="button" onClick={() => switchMode("signup")}>
                      Create account
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          <p className="broker-login-footer">
            By continuing, you agree to our{" "}
            <Link href="/privacy-policy">Privacy Policy</Link> and{" "}
            <Link href="/terms-and-conditions">Terms</Link>.
          </p>
        </div>

        <div className="broker-login-features">
          <span className="broker-login-feature">
            <CheckIcon /> List properties free
          </span>
          <span className="broker-login-feature">
            <CheckIcon /> Live on /properties
          </span>
          <span className="broker-login-feature">
            <CheckIcon /> Secure email login
          </span>
        </div>
      </div>
    </div>
  );
}
