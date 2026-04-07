"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import "../admin-login.css";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

export default function AdminRegisterPage() {
  const router = useRouter();
  const [metaLoading, setMetaLoading] = useState(true);
  const [requiresPin, setRequiresPin] = useState(false);
  const [roleOptions, setRoleOptions] = useState([]);
  const [userRoleId, setUserRoleId] = useState(null);
  const [adminRoleId, setAdminRoleId] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dashboardUsername, setDashboardUsername] = useState("");
  const [includeAdmin, setIncludeAdmin] = useState(false);
  const [registrationPin, setRegistrationPin] = useState("");

  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRegistrationPin, setShowRegistrationPin] = useState(false);

  const loadMeta = useCallback(async () => {
    setMetaLoading(true);
    try {
      const { data } = await axios.get(`${apiBase}auth/admin-register-meta`);
      setRequiresPin(Boolean(data?.requiresPin));
      const roles = Array.isArray(data?.roles) ? data.roles : [];
      setRoleOptions(roles);

      const user = roles.find(
        (r) => String(r?.roleName || "").toUpperCase() === "USER",
      );
      const admin = roles.find(
        (r) => String(r?.roleName || "").toUpperCase() === "ADMIN",
      );
      setUserRoleId(user?.id ?? null);
      setAdminRoleId(admin?.id ?? null);
    } catch (e) {
      console.error(e);
      toast.error("Could not load registration options. Is the API running?");
      setRoleOptions([]);
    } finally {
      setMetaLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  const roleIdsForSubmit = useMemo(() => {
    const ids = [];
    if (userRoleId != null) ids.push(userRoleId);
    if (includeAdmin && adminRoleId != null) ids.push(adminRoleId);
    return ids;
  }, [userRoleId, adminRoleId, includeAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Password and confirmation do not match.");
      return;
    }
    if (includeAdmin && !dashboardUsername.trim()) {
      toast.error("Dashboard username is required when Admin access is enabled.");
      return;
    }
    if (requiresPin && !registrationPin.trim()) {
      toast.error("Registration PIN is required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        roleIds: roleIdsForSubmit.length ? roleIdsForSubmit : undefined,
        dashboardUsername: includeAdmin
          ? dashboardUsername.trim()
          : undefined,
        registrationPin: requiresPin ? registrationPin.trim() : undefined,
      };
      const res = await axios.post(`${apiBase}auth/admin-register`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200) {
        toast.success(res.data?.message || "Account created. You can sign in.");
        router.replace("/admin");
      }
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data?.message ||
        (Array.isArray(data?.errors)
          ? data.errors.map((x) => x.defaultMessage || x).join(", ")
          : null) ||
        "Registration failed.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mpf-admin-login mpf-admin-login--register">
      <div className="mpf-admin-login__inner mpf-admin-login__inner--register">
        <div className="mpf-admin-login__panel mpf-admin-login__panel--left">
          <Image
            fill
            priority
            alt="Modern property background"
            src="/images/admin/admin-login-bg.png"
            className="mpf-admin-login__bg-image"
          />
          <div className="mpf-admin-login__left-overlay">
            <div className="mpf-admin-login__left-top">
              <div className="mpf-admin-login__left-brand-center">
                <div className="mpf-admin-login__left-logo-wrap">
                  <Image
                    height={56}
                    width={56}
                    alt="My Property Fact"
                    src="/logo.webp"
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <p className="mpf-admin-login__left-brand-text">My Property Fact</p>
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
            {/* <div className="mpf-admin-login__top-pill-wrap">
              <span className="mpf-admin-login__signin-pill">Register</span>
            </div> */}

            <div className="mpf-admin-login__card">
              <div className="mpf-admin-login__brand mpf-admin-login__brand--register">
                <h1 className="mpf-admin-login__title mpf-admin-login__title--register">
                  Create account 
                </h1>
                {/* <p className="mpf-admin-login__register-desc">
                  Full name, email, password - <strong>User</strong> is included
                  by default. <strong>Admin</strong> must be approved by a Super
                  Admin before dashboard sign-in.
                </p> */}
              </div>

              {metaLoading ? (
                <div className="mpf-admin-login__register-loading-card">
                  <LoadingSpinner show />
                  <p className="mpf-admin-login__register-loading-text">
                    Loading registration...
                  </p>
                </div>
              ) : (
                <form
                  noValidate
                  className={validated ? "was-validated" : ""}
                  onSubmit={handleSubmit}
                >
            <div className="mpf-admin-login__field">
              <label className="mpf-admin-login__label" htmlFor="reg-fullname">
                Full name
              </label>
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
                  id="reg-fullname"
                  className="form-control mpf-admin-login__input mpf-admin-login__input--with-icons"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Enter Full Name"
                />
                <div className="invalid-feedback">Enter your full name.</div>
              </div>
            </div>

            <div className="mpf-admin-login__field">
              <label className="mpf-admin-login__label" htmlFor="reg-email">
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
                  id="reg-email"
                  type="email"
                  className="form-control mpf-admin-login__input mpf-admin-login__input--with-icons"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="Enter Email"
                />
                <div className="invalid-feedback">Enter a valid email.</div>
              </div>
            </div>

            <div className="mpf-admin-login__field">
              <span className="mpf-admin-login__label">Roles</span>
              <div className="mpf-admin-login__role-panel">
                <label className="mpf-admin-login__checkbox mpf-admin-login__checkbox--register">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    readOnly
                  />
                  <span>
                    <strong>User</strong>
                    <span className="mpf-admin-login__role-hint">
                      Portal access (default)
                    </span>
                  </span>
                </label>
                {adminRoleId != null && (
                  <label className="mpf-admin-login__checkbox mpf-admin-login__checkbox--register">
                    <input
                      type="checkbox"
                      checked={includeAdmin}
                      onChange={(e) => setIncludeAdmin(e.target.checked)}
                    />
                    <span>
                      <strong>Admin</strong>
                      <span className="mpf-admin-login__role-hint">
                        Dashboard staff — requires a Super Admin to approve before
                        you can sign in
                      </span>
                    </span>
                  </label>
                )}
              </div>
            </div>

            <div
              className={`mpf-admin-login__admin-username-wrap ${
                includeAdmin ? "is-visible" : ""
              }`}
              aria-hidden={!includeAdmin}
            >
              <div className="mpf-admin-login__field">
                <label
                  className="mpf-admin-login__label"
                  htmlFor="reg-dashboard-user"
                >
                  Dashboard username
                </label>
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
                    id="reg-dashboard-user"
                    className="form-control mpf-admin-login__input mpf-admin-login__input--with-icons"
                    value={dashboardUsername}
                    onChange={(e) => setDashboardUsername(e.target.value)}
                    required={includeAdmin}
                    disabled={!includeAdmin}
                    autoComplete="username"
                    placeholder="Enter Dashboard Username"
                  />
                  <div className="invalid-feedback">
                    Required when Admin is selected.
                  </div>
                </div>
                <p className="mpf-admin-login__hint">
                  Used after approval together with email and password on /admin.
                </p>
              </div>
            </div>

            <div className="mpf-admin-login__field">
              <label className="mpf-admin-login__label" htmlFor="reg-password">
                Password
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
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  className="form-control mpf-admin-login__input mpf-admin-login__input--with-icons mpf-admin-login__input--with-toggle"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="mpf-admin-login__password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
                <div className="invalid-feedback">
                  At least 8 characters required.
                </div>
              </div>
            </div>

            <div className="mpf-admin-login__field">
              <label
                className="mpf-admin-login__label"
                htmlFor="reg-password2"
              >
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
                  id="reg-password2"
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control mpf-admin-login__input mpf-admin-login__input--with-icons mpf-admin-login__input--with-toggle"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="mpf-admin-login__password-toggle"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showConfirmPassword}
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                  />
                </button>
                <div className="invalid-feedback">Please confirm the password.</div>
              </div>
            </div>

            {requiresPin && (
              <div className="mpf-admin-login__field">
                <label className="mpf-admin-login__label" htmlFor="reg-pin">
                  Registration PIN
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
                    id="reg-pin"
                    type={showRegistrationPin ? "text" : "password"}
                    className="form-control mpf-admin-login__input mpf-admin-login__input--with-icons mpf-admin-login__input--with-toggle"
                    value={registrationPin}
                    onChange={(e) => setRegistrationPin(e.target.value)}
                    required={requiresPin}
                    autoComplete="one-time-code"
                    placeholder="Provided by your organization"
                  />
                  <button
                    type="button"
                    className="mpf-admin-login__password-toggle"
                    onClick={() => setShowRegistrationPin((v) => !v)}
                    aria-label={showRegistrationPin ? "Hide PIN" : "Show PIN"}
                    aria-pressed={showRegistrationPin}
                    title={showRegistrationPin ? "Hide PIN" : "Show PIN"}
                  >
                    <FontAwesomeIcon
                      icon={showRegistrationPin ? faEyeSlash : faEye}
                    />
                  </button>
                  <div className="invalid-feedback">PIN is required.</div>
                </div>
              </div>
            )}

                  <div className="mpf-admin-login__submit-wrap mpf-admin-login__submit-wrap--register">
                    <button
                      type="submit"
                      className="mpf-admin-login__submit mpf-admin-login__submit--register"
                      disabled={submitting}
                    >
                      {submitting ? "Creating account..." : "Create account"}
                      <LoadingSpinner show={submitting} />
                    </button>
                  </div>

                  <div className="mpf-admin-login__footer mpf-admin-login__footer--register">
                    <Link
                      className="mpf-admin-login__link mpf-admin-login__link--register-back"
                      href="/admin"
                    >
                      ← Back to sign in
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
