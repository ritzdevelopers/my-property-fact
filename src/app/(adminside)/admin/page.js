"use client";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import "./admin-login.css";
import Image from "next/image";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { getPublicApiBase } from "@/lib/publicApiBase";

const apiBase = getPublicApiBase();

function rolesIncludeStaffDashboard(roles) {
  if (!roles || !Array.isArray(roles)) return false;
  return roles.some((r) => {
    const x = String(r || "").toUpperCase().replace(/^ROLE_/, "");
    return x === "ADMIN" || x === "SUPERADMIN";
  });
}

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    dashboardUsername: "",
  });
  const [showLoading, setShowLoading] = useState(false);
  const [buttonName, setButtonName] = useState("Sign in");
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
    router.prefetch("/admin/dashboard");
  }, [router]);

  useEffect(() => {
    if (!mounted) return;

    const accessDenied = searchParams?.get("accessDenied");
    if (accessDenied === "true") {
      toast.error(
        "You don't have access to the admin dashboard. Super Admin or Admin role required.",
      );
      router.replace("/admin", { scroll: false });
    }
  }, [mounted, searchParams, router]);

  const handleSubmit = async (e) => {
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
    let successRedirectScheduled = false;
    try {
      setShowLoading(true);
      setButtonName("");
      const response = await axios.post(
        `${apiBase}auth/login`,
        formData,
        { withCredentials: true },
      );
      if (response.status === 200) {
        const sessionRes = await fetch(`${apiBase}auth/session`, {
          credentials: "include",
        });
        let sessionData = {};
        try {
          sessionData = sessionRes.ok ? await sessionRes.json() : {};
        } catch {
          toast.error(
            "Could not read session after login. Check your connection and try again.",
          );
          return;
        }
        if (!sessionRes.ok) {
          toast.error(
            "Login succeeded but session check failed (often a cookie or API URL issue in production). Try refreshing, or verify NEXT_PUBLIC_API_URL and cookie domain on the API.",
          );
          return;
        }
        const roles = sessionData.roles || [];
        if (!rolesIncludeStaffDashboard(roles)) {
          await axios.post(
            `${apiBase}auth/logout`,
            {},
            { withCredentials: true },
          );
          toast.error(
            "This account only has portal (User) access. To use the admin dashboard, register with Admin enabled and a dashboard username, or ask a Super Admin to assign the Admin role.",
          );
          return;
        }
        successRedirectScheduled = true;
        toast.success("You are Logged in !");
        // Full navigation so middleware and server see HttpOnly cookies reliably
        // (client router.replace alone can leave production stuck on /admin until refresh).
        const target = "/admin/dashboard";
        setTimeout(() => {
          window.location.assign(target);
        }, 450);
        return;
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Invalid email, password, or dashboard username.";
      toast.error(msg);
      setShowLoading(false);
      setButtonName("Sign in");
    } finally {
      if (!successRedirectScheduled) {
        setShowLoading(false);
        setButtonName("Sign in");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="mpf-admin-login">
      <div className="mpf-admin-login__inner">
        <div className="mpf-admin-login__card">
          <div className="mpf-admin-login__brand">
            <div className="mpf-admin-login__logo-wrap">
              <Image
                height={56}
                width={56}
                alt="My Property Fact"
                src="/logo.webp"
                style={{ objectFit: "contain" }}
              />
            </div>
            <h1 className="mpf-admin-login__title">MPF Admin Dashboard</h1>
            <p className="mpf-admin-login__subtitle">Sign in to the dashboard</p>
            {!apiBase ? (
              <p className="alert alert-danger small mb-0 mt-2" role="alert">
                <strong>Configuration error:</strong>{" "}
                <code>NEXT_PUBLIC_API_URL</code> is missing. Admin login and
                route protection cannot reach the API. Set it in your production
                environment and rebuild.
              </p>
            ) : null}
            {/* <p className="mpf-admin-login__hint text-center mb-0" style={{ fontSize: "0.8rem" }}>
              Portal-only accounts use{" "}
              <Link href="/portal" className="mpf-admin-login__link">
                /portal
              </Link>
              . This page is for <strong>Admin</strong> or <strong>Super Admin</strong>.
            </p> */}
          </div>

          <form
            noValidate
            className={validated ? "was-validated" : ""}
            onSubmit={handleSubmit}
            suppressHydrationWarning
          >
            <div className="mpf-admin-login__field">
              <label className="mpf-admin-login__label" htmlFor="admin-email">
                Email
              </label>
              <input
                type="email"
                className="form-control mpf-admin-login__input"
                id="admin-email"
                name="email"
                aria-describedby="emailHelp"
                placeholder="Enter Your Email"
                value={formData.email}
                onChange={handleChange}
                required
                suppressHydrationWarning
                autoComplete="email"
              />
              <div className="invalid-feedback">Enter a valid email address.</div>
            </div>

            <div className="mpf-admin-login__field">
              <label
                className="mpf-admin-login__label"
                htmlFor="admin-dashboard-username"
              >
                Dashboard username
              </label>
              <input
                type="text"
                className="form-control mpf-admin-login__input"
                id="admin-dashboard-username"
                name="dashboardUsername"
                placeholder="Enter Your Username"
                value={formData.dashboardUsername}
                onChange={handleChange}
                suppressHydrationWarning
                autoComplete="username"
              />
              <p className="mpf-admin-login__hint">
                <strong>Super Admin:</strong> Optional until a Username is Assigned.{" "}
                <strong>Admin:</strong> Ask the Username Set by Super Admin.
              </p>
            </div>

            <div className="mpf-admin-login__field">
              <label className="mpf-admin-login__label" htmlFor="admin-password">
                Password
              </label>
              <div className="mpf-admin-login__password-input-row">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control mpf-admin-login__input mpf-admin-login__input--with-toggle"
                  id="admin-password"
                  placeholder="••••••••"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  suppressHydrationWarning
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="mpf-admin-login__password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  tabIndex={0}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
                <div className="invalid-feedback">Password is required.</div>
              </div>
            </div>

            <div className="mpf-admin-login__submit-wrap">
              <button
                type="submit"
                className="mpf-admin-login__submit"
                disabled={showLoading || !apiBase}
                suppressHydrationWarning
              >
                {buttonName}
                <LoadingSpinner show={showLoading} />
              </button>
            </div>

            <div className="mpf-admin-login__footer">
              <Link className="mpf-admin-login__link" href="#">
                Forgot password?
              </Link>
              <Link className="mpf-admin-login__link" href="/admin/register">
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="mpf-admin-login__fallback">
          <div className="mpf-admin-login__fallback-card">
            <div className="mpf-admin-login__logo-wrap mx-auto mb-3">
              <Image
                height={56}
                width={56}
                alt=""
                src="/logo.webp"
                style={{ objectFit: "contain" }}
              />
            </div>
            <LoadingSpinner show={true} />
          </div>
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
