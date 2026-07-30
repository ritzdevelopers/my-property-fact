"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Mail, Lock, User, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import "../admin-globals.css";
import "../admin-auth.css";
import { getPublicApiBase } from "@/lib/publicApiBase";

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

  const subtitle =
    step === STEP_EMAIL
      ? "Enter the email for your admin dashboard account. We will check it before you choose a new password."
      : step === STEP_PASSWORDS
        ? "Enter your new password and confirmation, then your dashboard username so it matches this account."
        : "Your request was submitted successfully.";

  return (
    <div className="mpf-zoho-login">
      <div className="mpf-zoho-login__card" role="main">
        <section className="mpf-zoho-login__form-pane">
          <div className="mpf-zoho-login__brand-row">
            <img
              src="/images/admin/logo.svg"
              alt="My Property Fact"
              className="mpf-zoho-login__logo"
            />
            <span className="mpf-zoho-login__pill">
              <KeyRound className="h-3 w-3" />
              Password reset
            </span>
          </div>

          <h1 className="mpf-zoho-login__title">Forgot password</h1>
          <p className="mpf-zoho-login__subtitle">{subtitle}</p>

          {!apiBase && (
            <div className="mpf-zoho-login__alert">
              <strong>Configuration error:</strong> NEXT_PUBLIC_API_URL is missing.
            </div>
          )}

          {step === STEP_EMAIL && (
            <form onSubmit={handleCheckEmail} className="mpf-zoho-login__form">
              <div className="mpf-zoho-login__field">
                <label htmlFor="forgot-email">Email</label>
                <div className="mpf-zoho-login__input">
                  <Mail className="mpf-zoho-login__input-icon" aria-hidden />
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mpf-zoho-login__submit"
                disabled={loading || !apiBase}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking…
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </form>
          )}

          {step === STEP_PASSWORDS && (
            <form
              noValidate
              className={`mpf-zoho-login__form${validated ? " was-validated" : ""}`}
              onSubmit={handleSubmitRequest}
            >
              <p className="mpf-zoho-login__subtitle" style={{ marginTop: 0 }}>
                Account email: <strong>{String(email || "").trim()}</strong>
              </p>

              <div className="mpf-zoho-login__field">
                <label htmlFor="forgot-new-pw">New password</label>
                <div className="mpf-zoho-login__input">
                  <Lock className="mpf-zoho-login__input-icon" aria-hidden />
                  <input
                    id="forgot-new-pw"
                    type={showNew ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                    autoComplete="new-password"
                    className="has-toggle"
                  />
                  <button
                    type="button"
                    className="mpf-zoho-login__toggle"
                    onClick={() => setShowNew((v) => !v)}
                    aria-label={showNew ? "Hide password" : "Show password"}
                  >
                    <FontAwesomeIcon icon={showNew ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <div className="mpf-zoho-login__field">
                <label htmlFor="forgot-confirm-pw">Confirm password</label>
                <div className="mpf-zoho-login__input">
                  <Lock className="mpf-zoho-login__input-icon" aria-hidden />
                  <input
                    id="forgot-confirm-pw"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    required
                    autoComplete="new-password"
                    className="has-toggle"
                  />
                  <button
                    type="button"
                    className="mpf-zoho-login__toggle"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <div className="mpf-zoho-login__field">
                <label htmlFor="forgot-dash-user">Dashboard username</label>
                <div className="mpf-zoho-login__input">
                  <User className="mpf-zoho-login__input-icon" aria-hidden />
                  <input
                    id="forgot-dash-user"
                    type="text"
                    placeholder="Must match your account"
                    value={dashboardUsername}
                    onChange={(e) => setDashboardUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mpf-zoho-login__submit"
                disabled={loading || !apiBase}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send request to Super Admin"
                )}
              </button>

              <button
                type="button"
                className="mpf-zoho-login__link"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  marginTop: "0.5rem",
                  alignSelf: "flex-start",
                }}
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
          )}

          {step === STEP_SUCCESS && (
            <div
              className="mpf-zoho-login__alert"
              style={{
                borderColor: "#d8dfb8",
                background: "#f3f5e6",
                color: "#5a6b20",
              }}
              role="status"
            >
              <p style={{ margin: "0 0 0.5rem", fontWeight: 600 }}>
                Your new password request has been sent to the Super Administrator.
              </p>
              <p style={{ margin: 0 }}>Kindly contact and co-operate with them.</p>
            </div>
          )}

          <p className="mpf-zoho-login__footer">
            <Link href="/admin" className="mpf-zoho-login__link">
              <ArrowLeft className="inline h-3.5 w-3.5" style={{ marginRight: 4 }} />
              Back to sign in
            </Link>
          </p>
        </section>

        <aside className="mpf-zoho-login__promo-pane" aria-hidden>
          <div className="mpf-zoho-login__promo-visual mpf-zoho-login__promo-visual--building">
            <img
              src="/images/admin/login-building.png"
              alt=""
              className="mpf-zoho-login__building-img"
            />
          </div>
          <h2 className="mpf-zoho-login__promo-title">Reset securely</h2>
          <p className="mpf-zoho-login__promo-text">
            Password changes are reviewed by Super Admin before your account is updated.
          </p>
        </aside>
      </div>
    </div>
  );
}
