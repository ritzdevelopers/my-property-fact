"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import "./BrokerLoginModal.css";

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
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

const AUTH_REQUEST_TIMEOUT_MS = 25000;

function getAuthErrorMessage(err, fallback) {
  if (err.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }
  if (!err.response) {
    return "Network error. Please check your connection and try again.";
  }
  return err.response?.data?.message || err.response?.data?.error || fallback;
}

function saveAuthCookies(response) {
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
}

export default function BrokerLoginModal({
  show,
  onClose,
  redirectPath = "/portal/dashboard/post-property",
}) {
  const [mode, setMode] = useState("signin");
  const [step, setStep] = useState("persona");
  const [persona, setPersona] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const otpRefs = useRef([]);
  const authPanelRef = useRef(null);
  const [googleBtnWidth, setGoogleBtnWidth] = useState(280);
  const [mounted, setMounted] = useState(false);

  const otp = otpDigits.join("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!show) {
      setMode("signin");
      setStep("persona");
      setPersona("");
      setEmail("");
      setFullName("");
      setOtpDigits(["", "", "", ""]);
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

  useEffect(() => {
    if (!show || step !== "email") return;
    const panel = authPanelRef.current;
    if (!panel) return;

    const updateWidth = () => {
      const styles = window.getComputedStyle(panel);
      const paddingX =
        parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const available = panel.getBoundingClientRect().width - paddingX;
      setGoogleBtnWidth(Math.min(400, Math.max(200, Math.floor(available))));
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(panel);
    window.addEventListener("resize", updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, [show, step, mode]);

  if (!show || !mounted) return null;

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isSignUp = mode === "signup";
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const resetToEmail = () => {
    setStep("email");
    setOtpDigits(["", "", "", ""]);
    setError("");
    setDevOtp("");
  };

  const resetToPersona = () => {
    setStep("persona");
    setOtpDigits(["", "", "", ""]);
    setError("");
    setDevOtp("");
  };

  const isOwner = persona === "OWNER";
  const personaLabel = isOwner ? "Owner" : "Broker";

  const persistPersona = async () => {
    if (!persona) return;
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}users/me/persona`,
        { userType: persona },
        { withCredentials: true },
      );
    } catch {
      // New signups get persona from verify-otp; ignore if not yet authenticated
    }
  };

  const redirectAfterLogin = async () => {
    await persistPersona();
    onClose(false);
    window.location.href = redirectPath;
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}app/auth/google`,
        { token: credentialResponse.credential, userType: persona },
        { timeout: AUTH_REQUEST_TIMEOUT_MS },
      );
      if (response.data.token) {
        saveAuthCookies(response);
        await redirectAfterLogin();
      }
    } catch (err) {
      setError(getAuthErrorMessage(err, "Google sign-in failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
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
        { email: email.trim(), userType: persona },
        { timeout: AUTH_REQUEST_TIMEOUT_MS },
      );
      if (response.status === 200 && response.data?.success !== false) {
        setStep("otp");
        setOtpDigits(["", "", "", ""]);
        if (response.data.otp) setDevOtp(response.data.otp);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(response.data?.message || response.data?.error || "Could not send OTP. Please try again.");
      }
    } catch (err) {
      setError(getAuthErrorMessage(err, "Could not send OTP. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (otp.length !== 4) {
      setError("Please enter the 4-digit code sent to your email");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const payload = { email: email.trim(), otp, userType: persona };
      if (mode === "signup" && fullName.trim()) {
        payload.fullName = fullName.trim();
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}app/auth/verify-otp`,
        payload,
        { timeout: AUTH_REQUEST_TIMEOUT_MS },
      );

      if (response.data.token) {
        saveAuthCookies(response);
        await redirectAfterLogin();
      }
    } catch (err) {
      setError(getAuthErrorMessage(err, "Invalid OTP. Please check and try again."));
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
    if (digit && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
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
    pasted.split("").forEach((d, i) => {
      next[i] = d;
    });
    setOtpDigits(next);
    setError("");
    const focusIndex = Math.min(pasted.length, 3);
    otpRefs.current[focusIndex]?.focus();
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
              src="/static/home-meta-data/home.gif"
              alt="Real estate property listing"
              className="broker-login-modal-gif"
            />
          </div>
          <div className="broker-login-modal-visual-content">
            <span className="broker-login-modal-badge">{personaLabel || "Post Property"} Portal</span>
            <h3>
              {isOwner
                ? "List your property directly"
                : "List properties. Reach verified buyers."}
            </h3>
            <p>
              {step === "persona"
                ? "Choose how you will post properties on My Property Fact."
                : "Sign in to post your property for free on India's trusted real estate platform."}
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
              {step === "persona" ? "Post a Property Free" : "Sign in to continue"}
            </h2>
            <p>
              {step === "persona"
                ? "Tell us who you are before we continue"
                : step === "email"
                ? isSignUp
                  ? `Create your ${personaLabel.toLowerCase()} account to get started`
                  : `Sign in as ${personaLabel.toLowerCase()} to post a property`
                : `Enter the 4-digit code sent to ${email}`}
            </p>
          </div>

          {error && <div className="broker-login-modal-alert error">{error}</div>}
          {devOtp && step === "otp" && (
            <div className="broker-login-modal-alert dev">Dev OTP: <strong>{devOtp}</strong></div>
          )}

          {step === "persona" ? (
            <div className="broker-login-modal-form">
              <p className="broker-login-modal-persona-label">I am posting as a</p>
              <div className="broker-login-modal-persona-grid">
                <button
                  type="button"
                  className={`broker-login-modal-persona-card ${persona === "OWNER" ? "selected" : ""}`}
                  onClick={() => { setPersona("OWNER"); setError(""); }}
                >
                  <strong>Property Owner</strong>
                  <span>I own this property and want to list it myself</span>
                </button>
                <button
                  type="button"
                  className={`broker-login-modal-persona-card ${persona === "BROKER" ? "selected" : ""}`}
                  onClick={() => { setPersona("BROKER"); setError(""); }}
                >
                  <strong>Broker / Agent</strong>
                  <span>I list properties on behalf of owners or builders</span>
                </button>
              </div>
              <button
                type="button"
                className="broker-login-modal-btn"
                disabled={!persona}
                onClick={() => setStep("email")}
              >
                Continue
              </button>
            </div>
          ) : step === "otp" ? (
            <form onSubmit={handleVerifyOtp} className="broker-login-modal-form">
              <button type="button" className="broker-login-modal-back" onClick={resetToEmail} disabled={isLoading}>
                <BackIcon />
                Change email
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

              <button type="submit" className="broker-login-modal-btn" disabled={isLoading || otp.length !== 4}>
                {isLoading ? (
                  <>
                    <span className="broker-login-modal-spinner" />
                    Verifying…
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </button>

              <button type="button" className="broker-login-modal-link" onClick={handleSendOtp} disabled={isLoading}>
                Resend code
              </button>
            </form>
          ) : (
            <div className="broker-login-modal-form">
              <button type="button" className="broker-login-modal-back" onClick={resetToPersona} disabled={isLoading}>
                <BackIcon />
                Change role
              </button>

              {googleClientId && (
                <>
                  <div className="broker-login-modal-google">
                    <GoogleOAuthProvider clientId={googleClientId}>
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError("Google sign-in was cancelled or failed.")}
                        theme="outline"
                        size="large"
                        text="continue_with"
                        shape="rectangular"
                        width={googleBtnWidth}
                      />
                    </GoogleOAuthProvider>
                  </div>

                  <div className="broker-login-modal-divider">
                    <span>or continue with email</span>
                  </div>
                </>
              )}

              <form onSubmit={handleSendOtp}>
                {isSignUp && (
                  <div className="broker-login-modal-field">
                    <label htmlFor="broker-modal-name">Full name</label>
                    <div className="broker-login-modal-input-wrap">
                      <span className="broker-login-modal-icon"><UserIcon /></span>
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
                        className="broker-login-modal-input with-icon"
                        autoComplete="name"
                      />
                    </div>
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
                    "Send 4-digit Code"
                  )}
                </button>
              </form>

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
                    New here?
                    <button type="button" onClick={() => { setMode("signup"); resetToEmail(); }}>
                      Create account
                    </button>
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
