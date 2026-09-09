"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { getAccessToken } from "@/lib/apiAuth";
import {
  clearRecentSearches,
  loadRecentActivity,
  removeRecentSearch,
  RECENT_SEARCHES_CHANGED_EVENT,
} from "@/app/_global_components/smartSearchParser";
import "./HeaderAccountMenu.css";

export const AUTH_CHANGED_EVENT = "mpf-auth-changed";

function readStoredUser() {
  if (typeof window === "undefined") return null;
  if (!getAccessToken()) return null;
  try {
    const raw = Cookies.get("userData");
    if (!raw) return { fullName: "My Account" };
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : { fullName: "My Account" };
  } catch {
    return { fullName: "My Account" };
  }
}

function displayName(user) {
  return (
    user?.fullName?.trim() ||
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    "My Account"
  );
}

function initials(user) {
  const name = displayName(user);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0] || "U").slice(0, 2).toUpperCase();
}

function roleLabel(user) {
  const persona = user?.userType || user?.role;
  if (persona === "OWNER") return "Property Owner";
  if (persona === "BROKER") return "Broker / Agent";
  if (typeof persona === "string" && persona.length > 0) {
    return persona.charAt(0) + persona.slice(1).toLowerCase().replace(/_/g, " ");
  }
  return "Member";
}

function kindLabel(kind) {
  if (kind === "property") return "Property";
  if (kind === "blog") return "Blog";
  if (kind === "builder") return "Builder";
  if (kind === "city") return "City";
  return "Keyword";
}

function HamburgerIcon() {
  return (
    <span className="mpf-account-burger" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

function SearchClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M11 8v3.2L13.2 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function useHeaderAccount() {
  const [user, setUser] = useState(null);
  const [recents, setRecents] = useState([]);

  const refresh = useCallback(() => {
    setUser(readStoredUser());
    setRecents(loadRecentActivity());
  }, []);

  useEffect(() => {
    refresh();
    const onAuth = () => refresh();
    const onRecents = () => setRecents(loadRecentActivity());
    window.addEventListener(AUTH_CHANGED_EVENT, onAuth);
    window.addEventListener(RECENT_SEARCHES_CHANGED_EVENT, onRecents);
    window.addEventListener("storage", onAuth);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuth);
      window.removeEventListener(RECENT_SEARCHES_CHANGED_EVENT, onRecents);
      window.removeEventListener("storage", onAuth);
    };
  }, [refresh]);

  const logout = useCallback(() => {
    const cookieOpts = { path: "/" };
    Cookies.remove("userData", cookieOpts);
    Cookies.remove("token", cookieOpts);
    Cookies.remove("refreshToken", cookieOpts);
    Cookies.remove("accessToken", cookieOpts);
    setUser(null);
    try {
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    } catch {
      /* ignore */
    }
  }, []);

  const removeRecent = useCallback((label) => {
    removeRecentSearch(label);
    setRecents(loadRecentActivity());
  }, []);

  const clearRecents = useCallback(() => {
    clearRecentSearches();
    setRecents([]);
  }, []);

  return { user, recents, refresh, logout, removeRecent, clearRecents };
}

function AccountPanel({
  user,
  recents,
  onLogin,
  onRegister,
  onLogout,
  onClose,
  onRemoveRecent,
  onClearRecents,
}) {
  const loggedIn = Boolean(user);

  return (
    <div className="mpf-account-panel" role="menu">
      {loggedIn ? (
        <div className="mpf-account-panel__profile">
          <span className="mpf-account-avatar mpf-account-avatar--lg" aria-hidden="true">
            {initials(user)}
          </span>
          <div className="mpf-account-panel__who">
            <strong>{displayName(user)}</strong>
            <span>{roleLabel(user)}</span>
          </div>
        </div>
      ) : (
        <div className="mpf-account-panel__guest">
          <p>Login or register with a one-time OTP on your mobile number.</p>
          <div className="mpf-account-panel__auth-row">
            <button type="button" className="mpf-account-btn mpf-account-btn--primary" onClick={onLogin}>
              Login
            </button>
            <button type="button" className="mpf-account-btn mpf-account-btn--ghost" onClick={onRegister}>
              Register
            </button>
          </div>
        </div>
      )}

      <div className="mpf-account-panel__section">
        <div className="mpf-account-panel__section-head">
          <span>Recent searches</span>
          {recents.length > 0 ? (
            <button type="button" className="mpf-account-panel__clear" onClick={onClearRecents}>
              Clear
            </button>
          ) : null}
        </div>
        {recents.length === 0 ? (
          <p className="mpf-account-panel__empty">
            {loggedIn
              ? "Properties, blogs and keywords you look up will show up here."
              : "Your recent property, blog and keyword searches will appear here."}
          </p>
        ) : (
          <ul className="mpf-account-recent">
            {recents.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href || "/projects"}
                  className="mpf-account-recent__link"
                  onClick={onClose}
                >
                  <SearchClockIcon />
                  <span>
                    <em>{item.label}</em>
                    <small>{kindLabel(item.kind)}</small>
                  </span>
                </Link>
                <button
                  type="button"
                  className="mpf-account-recent__remove"
                  aria-label={`Remove ${item.label}`}
                  onClick={() => onRemoveRecent(item.label)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {loggedIn ? (
        <div className="mpf-account-panel__footer">
          <Link href="/portal/dashboard" className="mpf-account-panel__dash" onClick={onClose}>
            Go to broker portal
          </Link>
          <button type="button" className="mpf-account-panel__logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div className="mpf-account-panel__footer">
          <Link href="/portal" className="mpf-account-panel__dash" onClick={onClose}>
            Broker property portal
          </Link>
        </div>
      )}
    </div>
  );
}

export default function HeaderAccountMenu({ onRequestAuth }) {
  const { user, recents, logout, removeRecent, clearRecents } = useHeaderAccount();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const loggedIn = Boolean(user);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const requestAuth = (flow) => {
    setOpen(false);
    onRequestAuth?.(flow);
  };

  return (
    <div className="mpf-account-menu d-none d-lg-block" ref={wrapRef}>
      <button
        type="button"
        className={`mpf-account-trigger${loggedIn ? " is-logged-in" : ""}${open ? " is-open" : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={loggedIn ? `${displayName(user)} account menu` : "Open login and account menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {loggedIn ? (
          <span className="mpf-account-avatar" aria-hidden="true">
            {initials(user)}
          </span>
        ) : null}
        <HamburgerIcon />
      </button>
      {open ? (
        <AccountPanel
          user={user}
          recents={recents}
          onLogin={() => requestAuth("login")}
          onRegister={() => requestAuth("register")}
          onLogout={() => {
            logout();
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
          onRemoveRecent={removeRecent}
          onClearRecents={clearRecents}
        />
      ) : null}
    </div>
  );
}

export function MobileHeaderAccountBlock({ onRequestAuth, onCloseMenu }) {
  const { user, recents, logout, removeRecent, clearRecents } = useHeaderAccount();

  return (
    <div className="mpf-account-mobile">
      <AccountPanel
        user={user}
        recents={recents}
        onLogin={() => {
          onCloseMenu?.();
          onRequestAuth?.("login");
        }}
        onRegister={() => {
          onCloseMenu?.();
          onRequestAuth?.("register");
        }}
        onLogout={() => {
          logout();
          onCloseMenu?.();
        }}
        onClose={onCloseMenu}
        onRemoveRecent={removeRecent}
        onClearRecents={clearRecents}
      />
    </div>
  );
}
