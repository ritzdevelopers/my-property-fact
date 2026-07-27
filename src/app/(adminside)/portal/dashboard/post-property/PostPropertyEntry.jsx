"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../_contexts/UserContext";
import { getUserDisplayName, getUserRoleLabel } from "../../_utils/userDisplay";
import PortalUserAvatar from "../../_components/PortalUserAvatar";

function AddPropertyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function PostPropertyEntry() {
  const router = useRouter();
  const { userData, loading } = useUser();

  useEffect(() => {
    const layout = document.querySelector(".portal-layout");
    if (layout) layout.classList.add("portal-layout--post-entry");
    return () => {
      if (layout) layout.classList.remove("portal-layout--post-entry");
    };
  }, []);

  if (loading) {
    return (
      <div className="ppe-shell ppe-shell--loading">
        <div className="ppe-spinner" />
      </div>
    );
  }

  const displayName = getUserDisplayName(userData);
  const personaLabel = getUserRoleLabel(userData);

  return (
    <div className="ppe-shell">
      <div className="ppe-layout">
        <section className="ppe-hero">
          <h1>
            Sell or Rent Property <span>online faster</span> with My Property Fact
          </h1>
          <ul className="ppe-hero__list">
            <li>Advertise for FREE</li>
            <li>Get unlimited enquiries</li>
            <li>Reach verified buyers</li>
            <li>Manage listings in one place</li>
          </ul>
          <div className="ppe-hero__illus" aria-hidden>
            <img src="/static/home-meta-data/home.gif" alt="" />
          </div>
        </section>

        <section className="ppe-card">
          <div className="ppe-card__user">
            <PortalUserAvatar userData={userData} size="md" />
            <div>
              <h2>What would you like to do?</h2>
              <p className="ppe-card__sub">
                Welcome back, <strong>{displayName}</strong>
                {personaLabel ? ` · ${personaLabel}` : ""}
              </p>
            </div>
          </div>

          <div className="ppe-action-grid">
            <button
              type="button"
              className="ppe-action-card ppe-action-card--primary"
              onClick={() => router.push("/portal/dashboard/listings?action=add")}
            >
              <span className="ppe-action-card__icon">
                <AddPropertyIcon />
              </span>
              <span className="ppe-action-card__body">
                <strong>Add a Property</strong>
                <span>Start a new listing — sell or rent your property for free</span>
              </span>
            </button>

            <button
              type="button"
              className="ppe-action-card"
              onClick={() => router.push("/portal/dashboard")}
            >
              <span className="ppe-action-card__icon">
                <DashboardIcon />
              </span>
              <span className="ppe-action-card__body">
                <strong>View Dashboard</strong>
                <span>Manage listings, track leads, and view your portfolio</span>
              </span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
