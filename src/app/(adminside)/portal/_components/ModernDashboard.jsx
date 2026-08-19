"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles, TrendingUp } from "lucide-react";
import axios from "axios";
import { useUser } from "../_contexts/UserContext";
import {
  getUserDisplayName,
  getUserRoleLabel,
  getUserContactLine,
} from "../_utils/userDisplay";
import BrokerDashboardStats, { BrokerQuickActions } from "./BrokerDashboardStats";
import PortalUserAvatar from "./PortalUserAvatar";
import "./PortalUI.css";
import "./BrokerDashboard.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function formatTimeAgo(dateString) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function ModernDashboard() {
  const { userData, loading: userLoading } = useUser();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userLoading) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, listingsRes] = await Promise.allSettled([
          axios.get(`${API_BASE}user/dashboard-stats`, { withCredentials: true }),
          axios.get(`${API_BASE}user/property-listings`, { withCredentials: true }),
        ]);

        if (statsRes.status === "fulfilled" && statsRes.value.data) {
          setStats(statsRes.value.data);
        }

        let props = [];
        if (
          listingsRes.status === "fulfilled" &&
          listingsRes.value.data?.success &&
          Array.isArray(listingsRes.value.data.properties)
        ) {
          props = listingsRes.value.data.properties;
        }

        const acts = props
          .sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt),
          )
          .slice(0, 6)
          .map((p) => {
            const title = p.title || p.projectName || "Property";
            const status = (p.approvalStatus || "PENDING").toUpperCase();
            let message = `Updated: ${title}`;
            if (status === "APPROVED") message = `Live on /properties: ${title}`;
            else if (status === "PENDING") message = `Submitted for review: ${title}`;
            else if (status === "DRAFT") message = `Draft saved: ${title}`;
            else if (status === "REJECTED") message = `Needs changes: ${title}`;
            return {
              id: p.id,
              message,
              status,
              time: formatTimeAgo(p.updatedAt || p.createdAt),
            };
          });
        setActivities(acts);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userLoading]);

  if (loading || userLoading) {
    return (
      <div className="brk-dash brk-dash--center">
        <span className="brk-spinner" aria-label="Loading dashboard" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="brk-dash">
        <div className="brk-alert brk-alert--error" role="alert">
          {error}
        </div>
      </div>
    );
  }

  const displayName = getUserDisplayName(userData);
  const roleLabel = getUserRoleLabel(userData);
  const contactLine = getUserContactLine(userData);
  const growthLabel =
    stats?.addedThisMonth > 0
      ? `+${stats.addedThisMonth} this month`
      : stats?.liveListings > 0
        ? `${stats.liveListings} live now`
        : "Start listing";

  return (
    <div className="brk-dash">
      <section className="brk-hero">
        <div className="brk-hero__user">
          <PortalUserAvatar userData={userData} size="lg" />
          <div className="brk-hero__info">
            <p className="brk-hero__kicker">{greeting()}</p>
            <h1 className="brk-hero__name">{displayName}</h1>
            <div className="brk-hero__meta">
              <span className="brk-hero__badge">{roleLabel}</span>
              {contactLine && <span className="brk-hero__contact">{contactLine}</span>}
            </div>
          </div>
        </div>

        <div className="brk-hero__actions">
          <span className="brk-hero__trend">
            <TrendingUp size={14} />
            {growthLabel}
          </span>
          <Link href="/portal/dashboard/listings" className="brk-btn brk-btn--ghost">
            View Listings
          </Link>
          <Link href="/portal/dashboard/listings?action=add" className="brk-btn brk-btn--primary">
            Add Property
          </Link>
        </div>
      </section>

      <div className="brk-section-head">
        <div>
          <p className="brk-section-head__kicker">Executive Overview</p>
          <h2 className="brk-section-head__title">My Portfolio</h2>
        </div>
        <p className="brk-section-head__sub">
          A snapshot of your listed properties, approvals and buyer activity.
        </p>
      </div>

      <BrokerDashboardStats stats={stats} loading={false} />

      {stats?.totalListings === 0 && (
        <section className="brk-onboard">
          <span className="brk-onboard__icon">
            <Sparkles size={20} />
          </span>
          <div className="brk-onboard__text">
            <h3>List your first property</h3>
            <p>Complete the listing wizard, submit for approval, and go live on /properties.</p>
          </div>
          <Link href="/portal/dashboard/listings?action=add" className="brk-btn brk-btn--primary">
            Add Your First Property
          </Link>
        </section>
      )}

      <div className="brk-split">
        <section className="brk-panel">
          <div className="brk-panel__head">
            <div>
              <h2 className="brk-panel__title">Recent Activity</h2>
              <p className="brk-panel__sub">Latest updates on your listings</p>
            </div>
            {activities.length > 0 && (
              <Link href="/portal/dashboard/listings" className="brk-panel__link">
                View all
                <ArrowUpRight size={14} />
              </Link>
            )}
          </div>
          <div className="brk-panel__body">
            {activities.length > 0 ? (
              <ul className="brk-activity">
                {activities.map((a) => (
                  <li key={a.id} className="brk-activity__item">
                    <span
                      className={`brk-activity__dot brk-activity__dot--${a.status.toLowerCase()}`}
                    />
                    <div className="brk-activity__content">
                      <p className="brk-activity__text">{a.message}</p>
                      <span className="brk-activity__time">{a.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="brk-activity__empty">
                No activity yet. Start by listing a property.
              </p>
            )}
          </div>
        </section>

        <BrokerQuickActions />
      </div>
    </div>
  );
}
