"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  Loader2,
  Sparkles,
  Shield,
  LayoutDashboard,
  FileText,
  LockKeyhole,
  Info,
  UserPlus,
} from "lucide-react";
import { getPublicApiBase } from "@/lib/publicApiBase";

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "One dashboard for everything",
    text: "Projects, blogs, enquiries, and site content — all in one place.",
  },
  {
    icon: FileText,
    title: "Publish with confidence",
    text: "Preview blogs and web stories before they go live.",
  },
];

function rolesIncludeStaffDashboard(roles) {
  if (!roles || !Array.isArray(roles)) return false;
  return roles.some((r) => {
    const x = String(r || "").toUpperCase().replace(/^ROLE_/, "");
    return x === "ADMIN" || x === "SUPERADMIN";
  });
}

export function LoginForm({ className }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const apiBase = getPublicApiBase();

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    dashboardUsername: "",
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    router.prefetch("/admin/dashboard");
    router.prefetch("/admin/forgot-password");
  }, [router]);

  React.useEffect(() => {
    const accessDenied = searchParams?.get("accessDenied");
    if (accessDenied === "true") {
      toast.error("This account doesn't have admin access. Contact your Super Administrator.");
      router.replace("/admin", { scroll: false });
    }
  }, [searchParams, router, toast]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Please enter the email linked to your admin account.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address (e.g. name@company.com).";
    }
    if (!formData.password) {
      newErrors.password = "Please enter your password.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!apiBase) {
      toast.error("Server is not configured. Please contact your administrator.");
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    let successRedirectScheduled = false;

    try {
      const response = await axios.post(
        `${apiBase}admin-portal/auth/login`,
        formData,
        { withCredentials: true }
      );

      if (response.status === 200) {
        const sessionRes = await fetch(`${apiBase}admin-portal/auth/session`, {
          credentials: "include",
        });

        let sessionData = {};
        try {
          sessionData = sessionRes.ok ? await sessionRes.json() : {};
        } catch {
          toast.error("Could not verify your session. Please try again.");
          return;
        }

        if (!sessionRes.ok) {
          toast.error("Sign-in worked, but verification failed. Refresh and try again.");
          return;
        }

        const roles = sessionData.roles || [];
        if (!rolesIncludeStaffDashboard(roles)) {
          await axios.post(`${apiBase}admin-portal/auth/logout`, {}, { withCredentials: true });
          toast.error("This account is not authorized for the admin panel.");
          return;
        }

        const isSuperAdmin = roles.some(
          (r) => String(r || "").toUpperCase().replace(/^ROLE_/, "") === "SUPERADMIN"
        );

        successRedirectScheduled = true;
        toast.success(isSuperAdmin ? "Welcome back, Super Admin!" : "Welcome back!");

        setTimeout(() => {
          window.location.assign("/admin/dashboard");
        }, 450);
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Incorrect email or password. Double-check your details or use Forgot password.";
      toast.error(msg);
    } finally {
      if (!successRedirectScheduled) {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
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
              Manage your property platform with clarity
            </h1>
            <p className="admin-auth-brand-panel__sub">
              A secure workspace for My Property Fact staff.
            </p>
          </div>

          <ul className="admin-auth-brand-panel__features">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="admin-auth-brand-panel__feature">
                <span className="admin-auth-brand-panel__feature-icon">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <strong>{title}</strong>
                  <br />
                  {text}
                </span>
              </li>
            ))}
          </ul>

          <div className="admin-auth-brand-panel__info">
            <span className="admin-auth-brand-panel__info-icon">
              <Info className="h-4 w-4" />
            </span>
            <p>
              <strong>New to the admin panel?</strong> Your Super Administrator
              creates accounts from <strong>Manage Users</strong>. If you cannot
              sign in, ask them to verify your role and email.
            </p>
          </div>
        </div>
      </aside>

      {/* Sign-in form */}
      <main className="admin-auth-form-panel">
        <div className="admin-auth-form-panel__card">
          <p className="admin-auth-form-panel__eyebrow">Staff sign in</p>
          <h2 className="admin-auth-form-panel__title">Welcome back</h2>
          <p className="admin-auth-form-panel__intro">
            Use the credentials provided by your Super Administrator. All fields below are required.
          </p>

          {!apiBase && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive mb-4">
              <strong>Setup incomplete:</strong> The admin server URL is not configured. Contact IT or your Super Admin.
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-auth-form">
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
                  placeholder="Same username shown in Manage Users"
                  value={formData.dashboardUsername}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
              <p className="admin-auth-field-hint">
                If your Super Admin gave you a dashboard username, enter it here. Otherwise leave blank.
              </p>
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
              {errors.email ? (
                <p className="admin-auth-error">{errors.email}</p>
              ) : (
                <p className="admin-auth-field-hint">
                  The email address registered for your admin account.
                </p>
              )}
            </div>

            <div className="admin-auth-field">
              <div className="admin-auth-field__label-row">
                <label htmlFor="password" className="admin-auth-label">
                  Password
                </label>
                <Link href="/admin/forgot-password" className="admin-auth-forgot">
                  Forgot password?
                </Link>
              </div>
              <div className="admin-auth-input">
                <Lock className="admin-auth-input__icon" aria-hidden />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className={cn("admin-auth-input--with-toggle", errors.password && "admin-auth-input--error")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="admin-auth-input__toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="admin-auth-error">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="admin-auth-submit"
              disabled={isLoading || !apiBase}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing you in…
                </>
              ) : (
                <>
                  Sign in to dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="admin-auth-divider">
            <span>or</span>
          </div>

          <Link href="/admin/register" className="admin-auth-secondary-btn">
            <UserPlus className="h-4 w-4" />
            Create an account
          </Link>

          <div className="admin-auth-trust-row">
            <span className="admin-auth-trust-item">
              <Shield className="h-3.5 w-3.5" />
              Secure staff access
            </span>
            <span className="admin-auth-trust-item">
              <LockKeyhole className="h-3.5 w-3.5" />
              Session protected
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginForm;
