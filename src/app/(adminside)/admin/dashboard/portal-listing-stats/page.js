"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { isPortalManagedUser } from "@/lib/isPortalManagedUser";
import { useAdminRole } from "../../_contexts/AdminRoleContext";
import "../super-tracking/super-tracking.css";
import "./portal-listing-stats.css";

async function adminFetchJson(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new Error(typeof msg === "string" ? msg : "Request failed");
  }
  return data;
}

function personaFromUser(user) {
  const roles = (user?.roles || [])
    .map((r) => String(r?.roleName ?? r ?? "").toUpperCase().replace(/^ROLE_/, ""))
    .filter(Boolean);
  if (roles.includes("OWNER") || roles.includes("PROPERTY_OWNER")) return "OWNER";
  if (roles.includes("BROKER")) return "BROKER";
  return "BROKER";
}

function emptyCounts() {
  return { total: 0, live: 0, pending: 0, draft: 0, rejected: 0 };
}

function bumpStatus(counts, status) {
  const value = String(status || "").toUpperCase();
  if (value === "APPROVED") counts.live += 1;
  else if (value === "PENDING") counts.pending += 1;
  else if (value === "DRAFT") counts.draft += 1;
  else if (value === "REJECTED") counts.rejected += 1;
  counts.total += 1;
}

function buildFallbackReport(users, listings) {
  const portalUsers = (Array.isArray(users) ? users : []).filter(isPortalManagedUser);
  const countsByUser = new Map();
  (Array.isArray(listings) ? listings : []).forEach((listing) => {
    const userId = listing?.userId;
    if (userId == null) return;
    const current = countsByUser.get(userId) || emptyCounts();
    bumpStatus(current, listing.approvalStatus);
    countsByUser.set(userId, current);
  });

  const rows = portalUsers.map((user) => {
    const counts = countsByUser.get(user.id) || emptyCounts();
    return {
      userId: user.id,
      fullName: user.fullName || "—",
      email: user.email || "—",
      phone: user.phone || "—",
      userType: personaFromUser(user),
      userCategory: user.userCategory || "—",
      enabled: user.enabled !== false,
      verified: Boolean(user.verified),
      totalListings: counts.total,
      liveListings: counts.live,
      pendingListings: counts.pending,
      draftListings: counts.draft,
      rejectedListings: counts.rejected,
    };
  });

  const summary = rows.reduce(
    (acc, row) => {
      acc.totalPortalUsers += 1;
      if (row.userType === "OWNER") acc.owners += 1;
      else acc.brokers += 1;
      acc.totalListings += row.totalListings;
      acc.liveListings += row.liveListings;
      acc.pendingListings += row.pendingListings;
      acc.draftListings += row.draftListings;
      acc.rejectedListings += row.rejectedListings;
      return acc;
    },
    {
      totalPortalUsers: 0,
      brokers: 0,
      owners: 0,
      totalListings: 0,
      liveListings: 0,
      pendingListings: 0,
      draftListings: 0,
      rejectedListings: 0,
    },
  );

  rows.sort((a, b) => b.totalListings - a.totalListings || String(a.fullName).localeCompare(String(b.fullName)));
  return { summary, rows };
}

async function loadFallbackReport(base) {
  const [users, listingsPayload] = await Promise.all([
    adminFetchJson(`${base}users`),
    adminFetchJson(`${base}admin/property-listings`),
  ]);
  return buildFallbackReport(
    Array.isArray(users) ? users : users?.users || [],
    listingsPayload?.properties || [],
  );
}

function formatCount(n) {
  if (n == null || Number.isNaN(Number(n))) return "0";
  return Number(n).toLocaleString();
}

export default function PortalListingStatsPage() {
  const { isSuperAdmin, loading: roleLoading } = useAdminRole();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [persona, setPersona] = useState("all");
  const [query, setQuery] = useState("");

  const base = useMemo(() => getPublicApiBase(), []);

  const load = useCallback(async () => {
    if (!base || !isSuperAdmin) return;
    setLoading(true);
    setErr("");
    try {
      const data = await adminFetchJson(`${base}admin/super/portal-listing-stats`);
      setReport(data);
    } catch {
      try {
        const fallback = await loadFallbackReport(base);
        setReport(fallback);
      } catch (e) {
        setErr(e?.message || "Failed to load portal listing stats");
        setReport(null);
      }
    } finally {
      setLoading(false);
    }
  }, [base, isSuperAdmin]);

  useEffect(() => {
    if (roleLoading) return;
    if (!isSuperAdmin) return;
    void load();
  }, [load, isSuperAdmin, roleLoading]);

  const rows = useMemo(() => {
    const list = Array.isArray(report?.rows) ? report.rows : [];
    const q = query.trim().toLowerCase();
    return list.filter((row) => {
      if (persona === "broker" && row.userType !== "BROKER") return false;
      if (persona === "owner" && row.userType !== "OWNER") return false;
      if (!q) return true;
      return [row.fullName, row.email, row.phone, row.userType]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [persona, query, report]);

  if (roleLoading) {
    return <div className="super-tracking__muted">Checking access…</div>;
  }

  if (!isSuperAdmin) {
    return (
      <div className="super-tracking">
        <h1 className="super-tracking__title">Portal listing counts</h1>
        <p className="super-tracking__note">This page is available to Super Admin only.</p>
      </div>
    );
  }

  const summary = report?.summary || {};

  return (
    <div className="super-tracking portal-listing-stats">
      <p className="super-tracking__kicker">Super Admin · Portal</p>
      <h1 className="super-tracking__title">Broker &amp; Owner listings</h1>
      <p className="super-tracking__note">
        See how many properties each portal broker or owner has listed, including live, pending,
        draft, and rejected counts.
      </p>

      <div className="portal-listing-stats__toolbar">
        <div className="super-tracking__tabs" role="tablist" aria-label="User type">
          {[
            { id: "all", label: "All" },
            { id: "broker", label: "Brokers" },
            { id: "owner", label: "Owners" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={persona === tab.id}
              className={`super-tracking__tab${persona === tab.id ? " super-tracking__tab--active" : ""}`}
              onClick={() => setPersona(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="portal-listing-stats__actions">
          <input
            type="search"
            className="portal-listing-stats__search"
            placeholder="Search name, email, or phone"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className="super-tracking__btn"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {err ? <div className="super-tracking__err">{err}</div> : null}

      <div className="super-tracking__metrics">
        <div className="super-tracking__metric">
          <div className="super-tracking__metric-label">Portal users</div>
          <div className="super-tracking__metric-value">
            {loading ? "—" : formatCount(summary.totalPortalUsers)}
          </div>
        </div>
        <div className="super-tracking__metric">
          <div className="super-tracking__metric-label">Brokers</div>
          <div className="super-tracking__metric-value">
            {loading ? "—" : formatCount(summary.brokers)}
          </div>
        </div>
        <div className="super-tracking__metric">
          <div className="super-tracking__metric-label">Owners</div>
          <div className="super-tracking__metric-value">
            {loading ? "—" : formatCount(summary.owners)}
          </div>
        </div>
        <div className="super-tracking__metric">
          <div className="super-tracking__metric-label">Total listings</div>
          <div className="super-tracking__metric-value">
            {loading ? "—" : formatCount(summary.totalListings)}
          </div>
        </div>
        <div className="super-tracking__metric">
          <div className="super-tracking__metric-label">Live</div>
          <div className="super-tracking__metric-value">
            {loading ? "—" : formatCount(summary.liveListings)}
          </div>
        </div>
        <div className="super-tracking__metric">
          <div className="super-tracking__metric-label">Pending</div>
          <div className="super-tracking__metric-value">
            {loading ? "—" : formatCount(summary.pendingListings)}
          </div>
        </div>
      </div>

      <div className="super-tracking__panel">
        <div className="super-tracking__panel-head">
          Listed properties by broker / owner
        </div>
        {!rows.length ? (
          <div className="super-tracking__muted">
            {loading
              ? "Loading listing counts…"
              : "No matching portal users yet."}
          </div>
        ) : (
          <div className="super-tracking__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Contact</th>
                  <th>Total</th>
                  <th>Live</th>
                  <th>Pending</th>
                  <th>Draft</th>
                  <th>Rejected</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.userId || `${row.email}-${idx}`}>
                    <td className="super-tracking__mono">{idx + 1}</td>
                    <td>
                      <div className="portal-listing-stats__name">{row.fullName}</div>
                      <div className="portal-listing-stats__meta">
                        {row.enabled ? "Active" : "Disabled"}
                        {row.verified ? " · Verified" : ""}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`portal-listing-stats__type portal-listing-stats__type--${String(row.userType || "BROKER").toLowerCase()}`}
                      >
                        {row.userType || "BROKER"}
                      </span>
                    </td>
                    <td>
                      <div>{row.email}</div>
                      <div className="portal-listing-stats__meta">{row.phone}</div>
                    </td>
                    <td className="super-tracking__mono">{formatCount(row.totalListings)}</td>
                    <td className="super-tracking__mono">{formatCount(row.liveListings)}</td>
                    <td className="super-tracking__mono">{formatCount(row.pendingListings)}</td>
                    <td className="super-tracking__mono">{formatCount(row.draftListings)}</td>
                    <td className="super-tracking__mono">{formatCount(row.rejectedListings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="portal-listing-stats__foot">
          <Link href="/admin/dashboard/property-approvals">Open property approvals</Link>
          <Link href="/admin/dashboard/manage-portal-users">Manage portal users</Link>
        </div>
      </div>
    </div>
  );
}
