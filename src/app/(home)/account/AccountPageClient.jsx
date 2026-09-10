"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { getAccessToken } from "@/lib/apiAuth";
import {
  AUTH_CHANGED_EVENT,
  ACTIVITY_CHANGED_EVENT,
  fetchActivitySummary,
  getLocalShortlisted,
  getLocalViewed,
  toggleProjectShortlist,
} from "@/lib/userActivity";
import { loadRecentActivity } from "@/app/_global_components/smartSearchParser";
import "./account.css";

function readUser() {
  if (!getAccessToken()) return null;
  try {
    const raw = Cookies.get("userData");
    return raw ? JSON.parse(raw) : { fullName: "My Account" };
  } catch {
    return { fullName: "My Account" };
  }
}

function displayName(user) {
  return user?.fullName?.trim() || user?.name?.trim() || "My Account";
}

export default function AccountPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "viewed" ? "viewed" : "shortlisted";
  const [tab, setTab] = useState(initialTab);
  const [user, setUser] = useState(null);
  const [shortlisted, setShortlisted] = useState([]);
  const [viewed, setViewed] = useState([]);
  const [searches, setSearches] = useState([]);

  const refresh = useCallback(async () => {
    setUser(readUser());
    setShortlisted(getLocalShortlisted());
    setViewed(getLocalViewed());
    setSearches(loadRecentActivity().filter((item) => !item.kind || item.kind === "keyword"));
    const remote = await fetchActivitySummary();
    if (remote?.recent?.length) {
      setShortlisted(
        remote.recent
          .filter((item) => item.type === "SHORTLIST")
          .map((item) => ({
            id: item.entityId,
            slug: item.entitySlug,
            label: item.entityLabel,
            href: item.href,
            at: item.at,
          })),
      );
      setViewed(
        remote.recent
          .filter((item) => item.type === "VIEW")
          .map((item) => ({
            id: item.entityId,
            slug: item.entitySlug,
            label: item.entityLabel,
            href: item.href,
            at: item.at,
          })),
      );
    }
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(AUTH_CHANGED_EVENT, refresh);
    window.addEventListener(ACTIVITY_CHANGED_EVENT, refresh);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, refresh);
      window.removeEventListener(ACTIVITY_CHANGED_EVENT, refresh);
    };
  }, [refresh]);

  const items = tab === "viewed" ? viewed : shortlisted;

  const openLogin = () => {
    window.dispatchEvent(new CustomEvent("mpf-open-website-login", { detail: { flow: "login" } }));
  };

  const stats = useMemo(
    () => [
      { key: "shortlisted", label: "Shortlisted", value: shortlisted.length },
      { key: "viewed", label: "Viewed", value: viewed.length },
      { key: "searches", label: "Searches", value: searches.length },
    ],
    [shortlisted.length, viewed.length, searches.length],
  );

  return (
    <main className="mpf-account-page">
      <div className="container mpf-account-page__inner">
        {!user ? (
          <section className="mpf-account-page__guest">
            <h1>Your MPF profile</h1>
            <p>Login with a one-time OTP to see properties you have viewed and shortlisted.</p>
            <button type="button" onClick={openLogin}>
              Login with OTP
            </button>
          </section>
        ) : (
          <>
            <header className="mpf-account-page__head">
              <h1>{displayName(user)}</h1>
              <p>{user.phone || "Website member"}</p>
            </header>
            <div className="mpf-account-page__stats">
              {stats.map((stat) => (
                <button
                  key={stat.key}
                  type="button"
                  className={tab === stat.key ? "is-active" : ""}
                  onClick={() => {
                    if (stat.key !== "searches") setTab(stat.key);
                  }}
                >
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </button>
              ))}
            </div>
            <div className="mpf-account-page__tabs">
              <button type="button" className={tab === "shortlisted" ? "is-active" : ""} onClick={() => setTab("shortlisted")}>
                Shortlisted
              </button>
              <button type="button" className={tab === "viewed" ? "is-active" : ""} onClick={() => setTab("viewed")}>
                Viewed
              </button>
            </div>
            {items.length === 0 ? (
              <p className="mpf-account-page__empty">
                {tab === "viewed"
                  ? "Properties you open will show up here."
                  : "Tap the heart on a project card to shortlist it."}
              </p>
            ) : (
              <ul className="mpf-account-page__list">
                {items.map((item) => (
                  <li key={`${item.slug || item.id || item.label}`}>
                    <Link href={item.href || (item.slug ? `/${item.slug}` : "/projects")}>
                      {item.label}
                    </Link>
                    {tab === "shortlisted" ? (
                      <button
                        type="button"
                        onClick={() => toggleProjectShortlist(item).then(refresh)}
                      >
                        Remove
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            {searches.length > 0 ? (
              <section className="mpf-account-page__searches">
                <h2>Recent searches</h2>
                <div>
                  {searches.map((item) => (
                    <Link key={item.id} href={item.href || "/projects"}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
