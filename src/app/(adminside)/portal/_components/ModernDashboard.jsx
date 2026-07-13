"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Spinner, Alert } from "react-bootstrap";
import { TrendingUp } from "lucide-react";
import axios from "axios";
import { useUser } from "../_contexts/UserContext";
import BrokerDashboardStats, { BrokerQuickActions } from "./BrokerDashboardStats";
import "../../admin/dashboard/dashboard-home.css";
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
      <div className="broker-dash-shell d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" style={{ color: "#007d51" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="broker-dash-shell">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  const displayName = (userData?.fullName || "Broker").split(" ")[0];
  const growthLabel =
    stats?.addedThisMonth > 0
      ? `+${stats.addedThisMonth} this month`
      : stats?.liveListings > 0
        ? `${stats.liveListings} live`
        : "Start listing";

  return (
    <div className="admin-dash-home broker-dash-shell">
      <div className="admin-dash-home__hero-row">
        <div>
          <p className="admin-dash-home__kicker">Executive Overview</p>
          <h1 className="admin-dash-home__title">My Portfolio</h1>
          <p className="admin-dash-home__signed-in-meta">
            Welcome back, {displayName}. Here&apos;s an overview of your listed properties.
          </p>
        </div>
        <span className="admin-dash-home__trend">
          <TrendingUp className="h-4 w-4" />
          {growthLabel}
        </span>
      </div>

      <BrokerDashboardStats stats={stats} loading={false} />

      {stats?.totalListings === 0 && (
        <div className="broker-dash-onboard">
          <div>
            <h4>List your first property</h4>
            <p>Complete the listing wizard, submit for approval, and go live on /properties.</p>
          </div>
          <Link href="/portal/dashboard/listings?action=add" className="admin-dash-quick-link">
            Add Your First Property
          </Link>
        </div>
      )}

      <div className="admin-dash-home__split admin-dash-home__split--no-chart">
        <section className="broker-dash-panel">
          <div className="broker-dash-panel__head">
            <h2 className="broker-dash-panel__title">Recent Activity</h2>
            <p className="broker-dash-panel__sub">Updates on your listings</p>
          </div>
          <div className="broker-dash-panel__body">
            {activities.length > 0 ? (
              <ul className="broker-dash-activity">
                {activities.map((a) => (
                  <li key={a.id} className="broker-dash-activity__item">
                    <span className="broker-dash-activity__dot" />
                    <div>
                      <p className="broker-dash-activity__text">{a.message}</p>
                      <span className="broker-dash-activity__time">{a.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="broker-dash-empty">No activity yet. Start by listing a property.</p>
            )}
          </div>
        </section>

        <BrokerQuickActions />
      </div>
    </div>
  );
}
