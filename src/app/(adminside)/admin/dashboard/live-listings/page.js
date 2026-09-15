"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { useAdminRole } from "../../_contexts/AdminRoleContext";
import "../super-tracking/super-tracking.css";
import "./live-listings.css";

const PAGE_SIZE = 40;

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

function formatCount(n) {
  if (n == null || Number.isNaN(Number(n))) return "0";
  return Number(n).toLocaleString();
}

function parseDateTime(raw) {
  if (raw == null) return null;
  if (Array.isArray(raw) && raw.length >= 3) {
    const y = Number(raw[0]);
    const mo = Number(raw[1]) - 1;
    const d = Number(raw[2]);
    const h = raw.length > 3 ? Number(raw[3]) : 0;
    const mi = raw.length > 4 ? Number(raw[4]) : 0;
    const s = raw.length > 5 ? Number(raw[5]) : 0;
    const dt = new Date(y, mo, d, h, mi, s);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatDateTime(raw) {
  const dt = parseDateTime(raw);
  if (!dt) return "—";
  return dt.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isLocalUiUrl(url) {
  if (!url) return true;
  const u = String(url).toLowerCase();
  return u.includes("localhost") || u.includes("127.0.0.1");
}

function publicSiteOrigin() {
  const raw = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_UI_URL : "";
  const trimmed = raw && String(raw).trim() ? String(raw).trim().replace(/\/?$/, "") : "";
  if (!trimmed || isLocalUiUrl(trimmed)) return "https://mypropertyfact.in";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

function publicHref(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${publicSiteOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}

function sourceClass(row) {
  if (row?.source === "PROJECT") return "project";
  if (String(row?.listerType || "").toUpperCase() === "OWNER") return "owner";
  return "broker";
}

function sourceLabel(row) {
  if (row?.sourceLabel) return row.sourceLabel;
  if (row?.source === "PROJECT") return "Website project";
  return row?.listerType === "OWNER" ? "Owner portal" : "Broker portal";
}

export default function LiveListingsPage() {
  const { isSuperAdmin, loading: roleLoading } = useAdminRole();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [source, setSource] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const base = useMemo(() => getPublicApiBase(), []);

  const load = useCallback(async () => {
    if (!base || !isSuperAdmin) return;
    setLoading(true);
    setErr("");
    try {
      const data = await adminFetchJson(`${base}admin/super/live-listings`);
      setReport(data);
    } catch (e) {
      setErr(e?.message || "Failed to load live listings");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [base, isSuperAdmin]);

  useEffect(() => {
    if (roleLoading) return;
    if (!isSuperAdmin) return;
    void load();
  }, [load, isSuperAdmin, roleLoading]);

  useEffect(() => {
    setPage(0);
  }, [source, query]);

  const rows = useMemo(() => {
    const list = Array.isArray(report?.rows) ? report.rows : [];
    const q = query.trim().toLowerCase();
    return list.filter((row) => {
      if (source === "project" && row.source !== "PROJECT") return false;
      if (source === "portal" && row.source !== "PORTAL") return false;
      if (source === "broker" && !(row.source === "PORTAL" && row.listerType !== "OWNER")) {
        return false;
      }
      if (source === "owner" && !(row.source === "PORTAL" && row.listerType === "OWNER")) {
        return false;
      }
      if (!q) return true;
      return [
        row.title,
        row.projectName,
        row.builderName,
        row.city,
        row.locality,
        row.listedBy,
        row.listedByEmail,
        row.sourceLabel,
        row.listerType,
        row.listingType,
        row.configuration,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [query, report, source]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pagedRows = rows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  if (roleLoading) {
    return <div className="super-tracking__muted">Checking access…</div>;
  }

  if (!isSuperAdmin) {
    return (
      <div className="super-tracking">
        <h1 className="super-tracking__title">Live listings</h1>
        <p className="super-tracking__note">This page is available to Super Admin only.</p>
      </div>
    );
  }

  const summary = report?.summary || {};

  return (
    <div className="super-tracking live-listings">
      <p className="super-tracking__kicker">Super Admin · Live inventory</p>
      <h1 className="super-tracking__title">Live listings</h1>
      <p className="super-tracking__note">
        Everything currently live on the website: admin-managed project pages and
        approved broker / owner portal listings.
      </p>

      <div className="live-listings__toolbar">
        <div className="super-tracking__tabs" role="tablist" aria-label="Listing source">
          {[
            { id: "all", label: "All live" },
            { id: "project", label: "Website projects" },
            { id: "portal", label: "Broker portal" },
            { id: "broker", label: "Brokers" },
            { id: "owner", label: "Owners" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={source === tab.id}
              className={`super-tracking__tab${source === tab.id ? " super-tracking__tab--active" : ""}`}
              onClick={() => setSource(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="live-listings__actions">
          <input
            type="search"
            className="live-listings__search"
            placeholder="Search name, city, builder, or lister"
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

      <div className="super-tracking__metrics live-listings__metrics">
        <div className="super-tracking__metric">
          <div className="super-tracking__metric-label">Total live</div>
          <div className="super-tracking__metric-value">
            {loading ? "—" : formatCount(summary.totalLive)}
          </div>
        </div>
        <div className="super-tracking__metric">
          <div className="super-tracking__metric-label">Website projects</div>
          <div className="super-tracking__metric-value">
            {loading ? "—" : formatCount(summary.websiteProjects)}
          </div>
        </div>
        <div className="super-tracking__metric">
          <div className="super-tracking__metric-label">Broker portal</div>
          <div className="super-tracking__metric-value">
            {loading ? "—" : formatCount(summary.portalListings)}
          </div>
        </div>
        <div className="super-tracking__metric">
          <div className="super-tracking__metric-label">Broker listings</div>
          <div className="super-tracking__metric-value">
            {loading ? "—" : formatCount(summary.brokerListings)}
          </div>
        </div>
        <div className="super-tracking__metric">
          <div className="super-tracking__metric-label">Owner listings</div>
          <div className="super-tracking__metric-value">
            {loading ? "—" : formatCount(summary.ownerListings)}
          </div>
        </div>
      </div>

      <div className="super-tracking__panel">
        <div className="super-tracking__panel-head">
          {source === "all"
            ? "All live listings"
            : source === "project"
              ? "Live website projects"
              : source === "owner"
                ? "Live owner portal listings"
                : source === "broker"
                  ? "Live broker portal listings"
                  : "Live broker & owner portal listings"}
          <span className="live-listings__count">
            {loading ? "" : `${formatCount(rows.length)} shown`}
          </span>
        </div>
        {!pagedRows.length ? (
          <div className="super-tracking__muted">
            {loading ? "Loading live listings…" : "No matching live listings."}
          </div>
        ) : (
          <div className="super-tracking__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Listing</th>
                  <th>Source</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Listed by</th>
                  <th>Went live</th>
                  <th>Open</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row, idx) => {
                  const publicUrl = publicHref(row.publicPath);
                  return (
                    <tr key={`${row.source}-${row.id}`}>
                      <td className="super-tracking__mono">
                        {safePage * PAGE_SIZE + idx + 1}
                      </td>
                      <td>
                        <div className="live-listings__name">{row.title || "—"}</div>
                        <div className="live-listings__meta">
                          {[row.configuration, row.listingType, row.transaction, row.builderName]
                            .filter(Boolean)
                            .join(" · ") || row.statusLabel || "Live"}
                        </div>
                      </td>
                      <td>
                        <span className={`live-listings__type live-listings__type--${sourceClass(row)}`}>
                          {sourceLabel(row)}
                        </span>
                      </td>
                      <td>
                        <div>{row.city || "—"}</div>
                        {row.locality ? (
                          <div className="live-listings__meta">{row.locality}</div>
                        ) : null}
                      </td>
                      <td className="super-tracking__mono">{row.price || "—"}</td>
                      <td>
                        <div>{row.listedBy || "—"}</div>
                        {row.listedByEmail ? (
                          <div className="live-listings__meta">{row.listedByEmail}</div>
                        ) : null}
                      </td>
                      <td className="live-listings__date">{formatDateTime(row.wentLiveAt)}</td>
                      <td>
                        <div className="live-listings__links">
                          {publicUrl ? (
                            <a href={publicUrl} target="_blank" rel="noreferrer">
                              Public
                            </a>
                          ) : null}
                          {row.adminPath ? (
                            <Link href={row.adminPath}>Admin</Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {rows.length > PAGE_SIZE ? (
          <div className="live-listings__pager">
            <button
              type="button"
              className="super-tracking__btn"
              disabled={safePage <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </button>
            <span>
              Page {safePage + 1} of {pageCount}
            </span>
            <button
              type="button"
              className="super-tracking__btn"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              Next
            </button>
          </div>
        ) : null}
        <div className="live-listings__foot">
          <Link href="/admin/dashboard/manage-projects">Manage website projects</Link>
          <Link href="/admin/dashboard/property-approvals">Property approvals</Link>
          <Link href="/admin/dashboard/portal-listing-stats">Portal listing counts</Link>
          <Link href="/admin/dashboard/project-activity">Project listings by date</Link>
        </div>
      </div>
    </div>
  );
}
