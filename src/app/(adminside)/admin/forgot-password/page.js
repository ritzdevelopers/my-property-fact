"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "../admin-login.css";
import { getPublicApiBase } from "@/lib/publicApiBase";

/** 1 = email only, 2 = new + confirm (+ dashboard username for API), 3 = done */
const STEP_EMAIL = 1;
const STEP_PASSWORDS = 2;
const STEP_SUCCESS = 3;

export default function AdminForgotPasswordPage() {
  const router = useRouter();
  const apiBase = getPublicApiBase();

  const [step, setStep] = useState(STEP_EMAIL);
  const [email, setEmail] = useState("");
  const [dashboardUsername, setDashboardUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    router.prefetch("/admin");
  }, [router]);

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    if (!apiBase) {
      toast.error(
        "Server URL is not configured. Set NEXT_PUBLIC_API_URL for production.",
      );
      return;
    }
    const trimmed = String(email || "").trim();
    if (!trimmed) {
      toast.error("Enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${apiBase}admin-portal/auth/admin-password-reset-check-email`,
        { email: trimmed },
        { withCredentials: true },
      );
      toast.success("Email verified. Enter your new password.");
      setStep(STEP_PASSWORDS);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "We could not verify this email.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!apiBase) {
      toast.error(
        "Server URL is not configured. Set NEXT_PUBLIC_API_URL for production.",
      );
      return;
    }
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    const trimmedEmail = String(email || "").trim();
    const dash = String(dashboardUsername || "").trim();
    if (newPassword.length < 8 || confirmPassword.length < 8) {
      toast.error("Passwords must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${apiBase}admin-portal/auth/admin-password-reset-request`,
        {
          email: trimmedEmail,
          dashboardUsername: dash,
          newPassword,
          confirmPassword,
        },
        { withCredentials: true },
      );
      toast.success("Request Sent to Super Admin");
      setNewPassword("");
      setConfirmPassword("");
      setStep(STEP_SUCCESS);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Could not send password request.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mpf-admin-login mpf-admin-login--register">
      <div className="mpf-admin-login__inner mpf-admin-login__inner--register">
        <div className="mpf-admin-login__panel mpf-admin-login__panel--left">
          <img loading="eager"
            alt="Modern property background"
            src="/images/admin/admin-login-bg.png"
            className="mpf-admin-login__bg-image"
           style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
          <div className="mpf-admin-login__left-overlay">
            <div className="mpf-admin-login__left-top">
              <div className="mpf-admin-login__left-brand-center">
                <div className="mpf-admin-login__left-logo-wrap">
                  <img
                    height={84}
                    width={101}
                    alt="My Property Fact"
                    src="/images/admin/login-register.svg"
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
            </div>
            <div className="mpf-admin-login__left-bottom">
              <h2 className="mpf-admin-login__left-title">
                Where Precision Meets Property Management
              </h2>
              <div className="mpf-admin-login__left-subbox">
                <p className="mpf-admin-login__left-subbox-text">
                  Access The Master Dashboard For{" "}
                  <span className="mpf-admin-login__left-gold">
                    MyPropertyFact Administrative
                  </span>{" "}
                  Controls And Global Asset Monitoring.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mpf-admin-login__panel mpf-admin-login__panel--right">
          <div className="mpf-admin-login__right-shell">
            <div className="mpf-admin-login__card">
              <div className="mpf-admin-login__brand mpf-admin-login__brand--register">
                <h1 className="mpf-admin-login__title mpf-admin-login__title--register">
                  Forgot admin password
                </h1>
                <p className="mpf-admin-login__subtitle text-start mb-0">
                  {step === STEP_EMAIL
                    ? "Enter the email for your admin dashboard account. We will check it before you choose a new password."
                    : step === STEP_PASSWORDS
                      ? "Enter your new password and confirmation, then your dashboard username so it matches this account."
                      : "Request submitted."}
                </p>
                {!apiBase ? (
                  <p className="alert alert-danger small mb-0 mt-2" role="alert">
                    <strong>Configuration error:</strong>{" "}
                    <code>NEXT_PUBLIC_API_URL</code> is missing.
                  </p>
                ) : null}
              </div>

              {step === STEP_EMAIL ? (
                <form noValidate onSubmit={handleCheckEmail}>
                  <div className="mpf-admin-login__field">
                    <label className="mpf-admin-login__label" htmlFor="forgot-email">
                      Email
                    </label>
                    <div className="mpf-admin-login__input-shell">
                      <img
                        src="/images/admin/mail-send-line.svg"
                        alt=""
                        width={18}
                        height={18}
                        className="mpf-admin-login__input-icon"
                        aria-hidden
                      />
                      <input
                        id="forgot-email"
                        type="email"
                        className="form-control mpf-admin-login__input mpf-admin-login__input--with-icons"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                      <div className="invalid-feedback">
                        Enter a valid email address.
                      </div>
                    </div>
                  </div>
                  <div className="mpf-admin-login__submit-wrap mpf-admin-login__submit-wrap--register">
                    <button
                      type="submit"
                      className="mpf-admin-login__submit mpf-admin-login__submit--register"
                      disabled={loading || !apiBase}
                    >
                      {loading ? "Checking…" : "Continue"}
                    </button>
                  </div>
                </form>
              ) : null}

              {step === STEP_PASSWORDS ? (
                <form
                  noValidate
                  className={validated ? "was-validated" : ""}
                  onSubmit={handleSubmitRequest}
                >
                  <p className="small text-muted mb-3">
                    Account email: <strong>{String(email || "").trim()}</strong>
                  </p>
                  <div className="mpf-admin-login__field">
                    <label className="mpf-admin-login__label" htmlFor="forgot-new-pw">
                      New password
                    </label>
                    <div className="mpf-admin-login__password-input-row">
                      <img
                        src="/images/admin/lock-line.svg"
                        alt=""
                        width={18}
                        height={18}
                        className="mpf-admin-login__input-icon mpf-admin-login__input-icon--password"
                        aria-hidden
                      />
                      <input
                        id="forgot-new-pw"
                        type={showNew ? "text" : "password"}
                        className="form-control mpf-admin-login__input mpf-admin-login__input--with-icons mpf-admin-login__input--with-toggle"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={8}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="mpf-admin-login__password-toggle"
                        onClick={() => setShowNew((v) => !v)}
                        aria-label={showNew ? "Hide password" : "Show password"}
                        aria-pressed={showNew}
                      >
                        <FontAwesomeIcon icon={showNew ? faEyeSlash : faEye} />
                      </button>
                      <div className="invalid-feedback">
                        At least 8 characters.
                      </div>
                    </div>
                  </div>
                  <div className="mpf-admin-login__field">
                    <label className="mpf-admin-login__label" htmlFor="forgot-confirm-pw">
                      Confirm password
                    </label>
                    <div className="mpf-admin-login__password-input-row">
                      <img
                        src="/images/admin/lock-line.svg"
                        alt=""
                        width={18}
                        height={18}
                        className="mpf-admin-login__input-icon mpf-admin-login__input-icon--password"
                        aria-hidden
                      />
                      <input
                        id="forgot-confirm-pw"
                        type={showConfirm ? "text" : "password"}
                        className="form-control mpf-admin-login__input mpf-admin-login__input--with-icons mpf-admin-login__input--with-toggle"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength={8}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="mpf-admin-login__password-toggle"
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                        aria-pressed={showConfirm}
                      >
                        <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
                      </button>
                      <div className="invalid-feedback">
                        Must match new password.
                      </div>
                    </div>
                  </div>
                  <div className="mpf-admin-login__field">
                    <div className="mpf-admin-login__label-row">
                      <label
                        className="mpf-admin-login__label mpf-admin-login__label--inline"
                        htmlFor="forgot-dash-user"
                      >
                        Dashboard username
                      </label>
                      <span className="mpf-admin-login__role-tag">ADMIN/SUPER ADMIN</span>
                    </div>
                    <p className="small text-muted mb-2">
                      Must match the username for this email (same as on the sign-in page).
                    </p>
                    <div className="mpf-admin-login__input-shell">
                      <img
                        src="/images/admin/user-line.svg"
                        alt=""
                        width={18}
                        height={18}
                        className="mpf-admin-login__input-icon"
                        aria-hidden
                      />
                      <input
                        id="forgot-dash-user"
                        type="text"
                        className="form-control mpf-admin-login__input mpf-admin-login__input--with-icons"
                        placeholder="Enter dashboard username"
                        value={dashboardUsername}
                        onChange={(e) => setDashboardUsername(e.target.value)}
                        required
                        autoComplete="username"
                      />
                      <div className="invalid-feedback">
                        Required and must match your account.
                      </div>
                    </div>
                  </div>
                  <div className="mpf-admin-login__submit-wrap mpf-admin-login__submit-wrap--register">
                    <button
                      type="submit"
                      className="mpf-admin-login__submit mpf-admin-login__submit--register"
                      disabled={loading || !apiBase}
                    >
                      {loading ? "Sending…" : "Send request to Super Admin"}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-decoration-none p-0 mt-2"
                    onClick={() => {
                      setStep(STEP_EMAIL);
                      setValidated(false);
                      setDashboardUsername("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                  >
                    ← Use a different email
                  </button>
                </form>
              ) : null}

              {step === STEP_SUCCESS ? (
                <div
                  className="mpf-admin-login__forgot-success alert alert-success small"
                  role="status"
                >
                  <p className="mb-2 fw-semibold">
                    Your new password request has been sent to the Super
                    Administrator.
                  </p>
                  <p className="mb-0">Kindly contact and co-operate with them.</p>
                </div>
              ) : null}

              <div className="mpf-admin-login__footer mpf-admin-login__footer--register mt-3">
                <Link
                  title="Back to sign in"
                  className="mpf-admin-login__link mpf-admin-login__link--register-back"
                  href="/admin"
                >
                  ← Back to sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
