"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  ShieldCheck,
  KeyRound,
  UserPlus,
  Check,
} from "lucide-react";
import { getPublicApiBase } from "@/lib/publicApiBase";

const STEPS = [
  { id: 1, label: "Your details" },
  { id: 2, label: "Security" },
];

export function RegisterForm({ className }) {
  const router = useRouter();
  const { toast } = useToast();
  const apiBase = getPublicApiBase();

  const [step, setStep] = React.useState(1);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dashboardUsername: "",
    registrationPin: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateStep1 = () => {
    const next = {};
    if (!formData.fullName.trim()) next.fullName = "Please enter your full name.";
    if (!formData.email) next.email = "Please enter your work email.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      next.email = "Enter a valid email address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = () => {
    const next = {};
    if (!formData.password) next.password = "Please choose a password.";
    else if (formData.password.length < 8)
      next.password = "Password must be at least 8 characters.";
    if (formData.confirmPassword !== formData.password)
      next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (validateStep1()) setStep(2);
  };

  const goBack = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiBase) {
      toast.error("Server is not configured. Please contact your administrator.");
      return;
    }
    if (!validateStep2()) return;

    setIsLoading(true);
    try {
      await axios.post(
        `${apiBase}admin-portal/auth/admin-register`,
        {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          dashboardUsername: formData.dashboardUsername.trim() || undefined,
          registrationPin: formData.registrationPin.trim() || undefined,
        },
        { withCredentials: true }
      );
      toast.success("Account created. You can now sign in.");
      setTimeout(() => router.push("/admin"), 600);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "We couldn't create the account. Please contact your Super Administrator.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("admin-auth-shell admin-v2-shell", className)}>
      {/* Brand panel */}
      <aside className="admin-auth-brand-panel" aria-label="My Property Fact admin">
        <div className="admin-auth-brand-panel__bg" aria-hidden>
          <img src="/static/banners/desktop-banner-new.svg" alt="" />
          <div className="admin-auth-brand-panel__overlay" />
        </div>

        <div className="admin-auth-brand-panel__inner">
          <div>
            <img
              src="/images/admin/login-register.svg"
              alt="My Property Fact"
              className="admin-auth-brand-panel__logo"
            />
            <span className="admin-auth-brand-panel__version">
              <Sparkles className="h-3 w-3" />
              Admin v2.0
            </span>
            <h1 className="admin-auth-brand-panel__headline">
              Create your admin account
            </h1>
            <p className="admin-auth-brand-panel__sub">
              Set up access to the My Property Fact workspace in two quick steps.
            </p>
          </div>

          <ol className="admin-auth-stepper-vertical">
            {STEPS.map((s) => (
              <li
                key={s.id}
                className={cn(
                  "admin-auth-stepper-vertical__item",
                  step === s.id && "is-active",
                  step > s.id && "is-done"
                )}
              >
                <span className="admin-auth-stepper-vertical__dot">
                  {step > s.id ? <Check className="h-3.5 w-3.5" /> : s.id}
                </span>
                <span>
                  <strong>Step {s.id}</strong>
                  <br />
                  {s.label}
                </span>
              </li>
            ))}
          </ol>

          <p className="admin-auth-brand-panel__footer">
            Authorized personnel only. Account creation may require approval from a
            Super Administrator.
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="admin-auth-form-panel">
        <div className="admin-auth-form-panel__card">
          <p className="admin-auth-form-panel__eyebrow">Staff registration</p>
          <h2 className="admin-auth-form-panel__title">Create an account</h2>

          {/* Stepper (top) */}
          <div className="admin-auth-stepper">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div
                  className={cn(
                    "admin-auth-stepper__step",
                    step === s.id && "is-active",
                    step > s.id && "is-done"
                  )}
                >
                  <span className="admin-auth-stepper__num">
                    {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                  </span>
                  <span className="admin-auth-stepper__label">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <span
                    className={cn(
                      "admin-auth-stepper__bar",
                      step > s.id && "is-done"
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {!apiBase && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive mb-4">
              <strong>Setup incomplete:</strong> The admin server URL is not configured.
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-auth-form">
            {step === 1 ? (
              <>
                <div className="admin-auth-field">
                  <label htmlFor="fullName" className="admin-auth-label">
                    Full name
                  </label>
                  <div className="admin-auth-input">
                    <User className="admin-auth-input__icon" aria-hidden />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={formData.fullName}
                      onChange={handleChange}
                      autoComplete="name"
                      className={cn(errors.fullName && "admin-auth-input--error")}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="admin-auth-error">{errors.fullName}</p>
                  )}
                </div>

                <div className="admin-auth-field">
                  <label htmlFor="email" className="admin-auth-label">
                    Work email
                  </label>
                  <div className="admin-auth-input">
                    <Mail className="admin-auth-input__icon" aria-hidden />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@mypropertyfact.in"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      className={cn(errors.email && "admin-auth-input--error")}
                    />
                  </div>
                  {errors.email && (
                    <p className="admin-auth-error">{errors.email}</p>
                  )}
                </div>

                <button
                  type="button"
                  className="admin-auth-submit"
                  onClick={goNext}
                  disabled={!apiBase}
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <div className="admin-auth-field">
                  <label htmlFor="password" className="admin-auth-label">
                    Password
                  </label>
                  <div className="admin-auth-input">
                    <Lock className="admin-auth-input__icon" aria-hidden />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      className={cn(
                        "admin-auth-input--with-toggle",
                        errors.password && "admin-auth-input--error"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="admin-auth-input__toggle"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="admin-auth-error">{errors.password}</p>
                  )}
                </div>

                <div className="admin-auth-field">
                  <label htmlFor="confirmPassword" className="admin-auth-label">
                    Confirm password
                  </label>
                  <div className="admin-auth-input">
                    <Lock className="admin-auth-input__icon" aria-hidden />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      className={cn(errors.confirmPassword && "admin-auth-input--error")}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="admin-auth-error">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="admin-auth-field">
                  <div className="admin-auth-field__label-row">
                    <label htmlFor="dashboardUsername" className="admin-auth-label">
                      Dashboard username
                    </label>
                    <span className="admin-auth-optional">Optional</span>
                  </div>
                  <div className="admin-auth-input">
                    <User className="admin-auth-input__icon" aria-hidden />
                    <input
                      id="dashboardUsername"
                      name="dashboardUsername"
                      type="text"
                      placeholder="Username for dashboard sign in"
                      value={formData.dashboardUsername}
                      onChange={handleChange}
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="admin-auth-field">
                  <div className="admin-auth-field__label-row">
                    <label htmlFor="registrationPin" className="admin-auth-label">
                      Registration PIN
                    </label>
                    <span className="admin-auth-optional">If provided</span>
                  </div>
                  <div className="admin-auth-input">
                    <KeyRound className="admin-auth-input__icon" aria-hidden />
                    <input
                      id="registrationPin"
                      name="registrationPin"
                      type="text"
                      placeholder="Enter the PIN from your Super Admin"
                      value={formData.registrationPin}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="admin-auth-step-actions">
                  <button
                    type="button"
                    className="admin-auth-secondary-btn admin-auth-secondary-btn--inline"
                    onClick={goBack}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    className="admin-auth-submit"
                    disabled={isLoading || !apiBase}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Create account
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="admin-auth-trust-row">
            <span className="admin-auth-trust-item">
              <ShieldCheck className="h-3.5 w-3.5" />
              Already have an account?
            </span>
            <Link href="/admin" className="admin-auth-forgot">
              Sign in instead
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RegisterForm;
