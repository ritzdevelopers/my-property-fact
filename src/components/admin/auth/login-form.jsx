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
  Shield,
  LayoutDashboard,
  FileText,
  LockKeyhole,
} from "lucide-react";
import { getPublicApiBase } from "@/lib/publicApiBase";

const FEATURE_SLIDES = [
  {
    icon: Shield,
    title: "Secure staff access",
    text: "Sign in with credentials issued by your Super Administrator. Sessions stay protected while you work.",
  },
  {
    icon: LayoutDashboard,
    title: "One control panel",
    text: "Manage projects, blogs, enquiries, and website content from a single workspace.",
  },
  {
    icon: FileText,
    title: "Publish with confidence",
    text: "Preview blogs and web stories before they go live on My Property Fact.",
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
  const [slide, setSlide] = React.useState(0);

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

  React.useEffect(() => {
    const id = setInterval(() => {
      setSlide((s) => (s + 1) % FEATURE_SLIDES.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

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

  const activeSlide = FEATURE_SLIDES[slide];

  return (
    <div className={cn("mpf-zoho-login", className)}>
      <div className="mpf-zoho-login__card" role="main">
        {/* Left — sign-in */}
        <section className="mpf-zoho-login__form-pane">
          <div className="mpf-zoho-login__brand-row">
            <img
              src="/images/admin/logo.svg"
              alt="My Property Fact"
              className="mpf-zoho-login__logo"
            />
            <span className="mpf-zoho-login__pill">
              <LockKeyhole className="h-3 w-3" />
              Staff access
            </span>
          </div>

          <h1 className="mpf-zoho-login__title">Sign in</h1>
          <p className="mpf-zoho-login__subtitle">to access MPF Admin</p>

          {!apiBase && (
            <div className="mpf-zoho-login__alert">
              <strong>Setup incomplete:</strong> The admin server URL is not configured.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mpf-zoho-login__form">
            <div className="mpf-zoho-login__field">
              <label htmlFor="dashboardUsername">Dashboard username</label>
              <div className="mpf-zoho-login__input">
                <User className="mpf-zoho-login__input-icon" aria-hidden />
                <input
                  id="dashboardUsername"
                  name="dashboardUsername"
                  type="text"
                  placeholder="Optional — from Manage Users"
                  value={formData.dashboardUsername}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="mpf-zoho-login__field">
              <label htmlFor="email">Email address</label>
              <div className="mpf-zoho-login__input">
                <Mail className="mpf-zoho-login__input-icon" aria-hidden />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className={cn(errors.email && "is-error")}
                />
              </div>
              {errors.email && <p className="mpf-zoho-login__error">{errors.email}</p>}
            </div>

            <div className="mpf-zoho-login__field">
              <div className="mpf-zoho-login__label-row">
                <label htmlFor="password">Password</label>
                <Link href="/admin/forgot-password" className="mpf-zoho-login__link">
                  Forgot password?
                </Link>
              </div>
              <div className="mpf-zoho-login__input">
                <Lock className="mpf-zoho-login__input-icon" aria-hidden />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className={cn("has-toggle", errors.password && "is-error")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="mpf-zoho-login__toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mpf-zoho-login__error">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="mpf-zoho-login__submit"
              disabled={isLoading || !apiBase}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mpf-zoho-login__footer">
            Need an account? Ask your Super Admin via{" "}
            <span className="mpf-zoho-login__link-static">Manage Users</span>
            {" · "}
            <Link href="/admin/register" className="mpf-zoho-login__link">
              Register
            </Link>
          </p>
        </section>

        {/* Right — feature showcase */}
        <aside className="mpf-zoho-login__promo-pane" aria-label="Admin highlights">
          <div className="mpf-zoho-login__promo-visual mpf-zoho-login__promo-visual--building">
            <img
              src="/images/admin/login-building.png"
              alt="Modern property building"
              className="mpf-zoho-login__building-img"
            />
          </div>
          <h2 className="mpf-zoho-login__promo-title">{activeSlide.title}</h2>
          <p className="mpf-zoho-login__promo-text">{activeSlide.text}</p>
          <div className="mpf-zoho-login__dots" role="tablist" aria-label="Feature slides">
            {FEATURE_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === slide}
                className={cn("mpf-zoho-login__dot", i === slide && "is-active")}
                onClick={() => setSlide(i)}
              />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default LoginForm;
