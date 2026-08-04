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
  KeyRound,
  UserPlus,
  LockKeyhole,
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
    <div className={cn("mpf-zoho-login", className)}>
      <div className="mpf-zoho-login__card" role="main">
        {/* Left — registration form */}
        <section className="mpf-zoho-login__form-pane">
          <div className="mpf-zoho-login__brand-row">
            <img
              src="/images/admin/logo.svg"
              alt="My Property Fact"
              className="mpf-zoho-login__logo"
            />
            <span className="mpf-zoho-login__pill">
              <LockKeyhole className="h-3 w-3" />
              Staff registration
            </span>
          </div>

          <h1 className="mpf-zoho-login__title">Create account</h1>
          <p className="mpf-zoho-login__subtitle">to access MPF Admin</p>

          {!apiBase && (
            <div className="mpf-zoho-login__alert">
              <strong>Setup incomplete:</strong> The admin server URL is not configured.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mpf-zoho-login__form">
            {step === 1 ? (
              <>
                <div className="mpf-zoho-login__field">
                  <label htmlFor="fullName">Full name</label>
                  <div className="mpf-zoho-login__input">
                    <User className="mpf-zoho-login__input-icon" aria-hidden />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={formData.fullName}
                      onChange={handleChange}
                      autoComplete="name"
                      className={cn(errors.fullName && "is-error")}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mpf-zoho-login__error">{errors.fullName}</p>
                  )}
                </div>

                <div className="mpf-zoho-login__field">
                  <label htmlFor="email">Work email</label>
                  <div className="mpf-zoho-login__input">
                    <Mail className="mpf-zoho-login__input-icon" aria-hidden />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@mypropertyfact.in"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      className={cn(errors.email && "is-error")}
                    />
                  </div>
                  {errors.email && (
                    <p className="mpf-zoho-login__error">{errors.email}</p>
                  )}
                </div>

                <button
                  type="button"
                  className="mpf-zoho-login__submit"
                  onClick={goNext}
                  disabled={!apiBase}
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <div className="mpf-zoho-login__field">
                  <label htmlFor="password">Password</label>
                  <div className="mpf-zoho-login__input">
                    <Lock className="mpf-zoho-login__input-icon" aria-hidden />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      className={cn("has-toggle", errors.password && "is-error")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="mpf-zoho-login__toggle"
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
                    <p className="mpf-zoho-login__error">{errors.password}</p>
                  )}
                </div>

                <div className="mpf-zoho-login__field">
                  <label htmlFor="confirmPassword">Confirm password</label>
                  <div className="mpf-zoho-login__input">
                    <Lock className="mpf-zoho-login__input-icon" aria-hidden />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      className={cn(errors.confirmPassword && "is-error")}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mpf-zoho-login__error">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="mpf-zoho-login__field">
                  <div className="mpf-zoho-login__label-row">
                    <label htmlFor="dashboardUsername">Dashboard username</label>
                    <span className="mpf-zoho-login__link-static">Optional</span>
                  </div>
                  <div className="mpf-zoho-login__input">
                    <User className="mpf-zoho-login__input-icon" aria-hidden />
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

                <div className="mpf-zoho-login__field">
                  <div className="mpf-zoho-login__label-row">
                    <label htmlFor="registrationPin">Registration PIN</label>
                    <span className="mpf-zoho-login__link-static">If provided</span>
                  </div>
                  <div className="mpf-zoho-login__input">
                    <KeyRound className="mpf-zoho-login__input-icon" aria-hidden />
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

                <div className="mpf-zoho-login__label-row">
                  <button
                    type="button"
                    className="mpf-zoho-login__link"
                    onClick={goBack}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                </div>

                <button
                  type="submit"
                  className="mpf-zoho-login__submit"
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
              </>
            )}
          </form>

          <p className="mpf-zoho-login__footer">
            Already have an account?{" "}
            <Link href="/admin" className="mpf-zoho-login__link">
              Sign in
            </Link>
          </p>
        </section>

        {/* Right — registration promo */}
        <aside className="mpf-zoho-login__promo-pane" aria-label="Registration information">
          <div className="mpf-zoho-login__promo-visual mpf-zoho-login__promo-visual--building">
            <img
              src="/images/admin/login-building.png"
              alt="Modern property building"
              className="mpf-zoho-login__building-img"
            />
          </div>
          <h2 className="mpf-zoho-login__promo-title">Join the admin workspace</h2>
          <p className="mpf-zoho-login__promo-text">
            Register in two quick steps to manage projects, content, and enquiries on
            My Property Fact. Account creation may require approval from your Super
            Administrator.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default RegisterForm;
