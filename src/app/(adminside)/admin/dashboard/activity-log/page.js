"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { useAdminRole } from "../../_contexts/AdminRoleContext";
import { AdminLoader } from "@/components/admin/admin-loader";
import DashboardHeader from "../common-model/dashboardHeader";
import "./activity-log.css";

function adminAuthHeaders() {
  return {};
}

/** Spring/Jackson may serialize LocalDateTime as an array [y, mo, d, h, mi, s, ns]. */
function parseOccurredAt(raw) {
  if (raw == null) return null;
  if (Array.isArray(raw) && raw.length >= 3) {
    const y = Number(raw[0]);
    const mo = Number(raw[1]) - 1;
    const d = Number(raw[2]);
    const h = raw.length > 3 ? Number(raw[3]) : 0;
    const mi = raw.length > 4 ? Number(raw[4]) : 0;
    const s = raw.length > 5 ? Number(raw[5]) : 0;
    const ms = raw.length > 6 ? Math.floor(Number(raw[6]) / 1e6) : 0;
    if ([y, mo, d, h, mi, s].some((x) => Number.isNaN(x))) return null;
    return new Date(y, mo, d, h, mi, s, ms);
  }
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatWhenParts(raw) {
  const d = parseOccurredAt(raw);
  if (!d) return { date: "—", time: "", relative: "" };
  const pad = (n) => String(n).padStart(2, "0");
  const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const relative = formatRelative(d);
  return { date, time, relative };
}

function formatRelative(d) {
  const now = Date.now();
  const diff = Math.max(0, now - d.getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return "";
}

/** Parse legacy "User Name (email) — Action" when structured fields are missing. */
function parseLegacyEvent(event) {
  const raw = typeof event === "string" ? event.trim() : "";
  if (!raw) {
    return { actorName: "Unknown", actorEmail: "", action: "Admin action" };
  }
  const emDash = raw.indexOf(" — ");
  const sep = emDash >= 0 ? " — " : raw.includes(" - ") ? " - " : null;
  let whoPart = raw;
  let action = "Admin action";
  if (sep) {
    const i = raw.indexOf(sep);
    whoPart = raw.slice(0, i).trim();
    action = raw.slice(i + sep.length).trim() || "Admin action";
  }
  whoPart = whoPart.replace(/^User\s+/i, "").trim();
  let actorEmail = "";
  let actorName = whoPart;
  const m = whoPart.match(/^(.*?)\s*\(([^)]+@[^)]+)\)\s*$/);
  if (m) {
    actorName = m[1].trim() || m[2].split("@")[0];
    actorEmail = m[2].trim();
  }
  return { actorName: actorName || "Unknown", actorEmail, action };
}

function normalizeRow(row) {
  const legacy = parseLegacyEvent(row?.event);
  const actorName =
    (typeof row?.actorName === "string" && row.actorName.trim()) ||
    (typeof row?.actorFullName === "string" && row.actorFullName.trim()) ||
    legacy.actorName;
  const actorEmail =
    (typeof row?.actorEmail === "string" && row.actorEmail.trim()) ||
    legacy.actorEmail;
  const action =
    (typeof row?.action === "string" && row.action.trim()) ||
    (typeof row?.taskLabel === "string" && row.taskLabel.trim()) ||
    legacy.action;
  return {
    ...row,
    actorName,
    actorEmail,
    action,
    httpMethod: String(row?.httpMethod || "").toUpperCase(),
    success: row?.success !== false,
  };
}

function classifyAction(row) {
  const action = String(row.action || "").toLowerCase();
  const method = String(row.httpMethod || "").toUpperCase();

  if (
    method === "DELETE" ||
    action.includes("delete") ||
    action.includes("remove") ||
    action.includes("purge")
  ) {
    return { key: "delete", label: "Delete", tone: "danger" };
  }
  if (
    method === "POST" ||
    method === "PUT" ||
    method === "PATCH" ||
    action.includes("create") ||
    action.includes("update") ||
    action.includes("save") ||
    action.includes("add") ||
    action.includes("assign") ||
    action.includes("upload")
  ) {
    return { key: "change", label: "Change", tone: "green" };
  }
  if (
    action.includes("login") ||
    action.includes("logout") ||
    action.includes("session") ||
    action.includes("sign")
  ) {
    return { key: "auth", label: "Auth", tone: "gold" };
  }
  return { key: "view", label: "View", tone: "blue" };
}

function initials(name, email) {
  const src = (name || email || "?").trim();
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }
  return src.slice(0, 2).toUpperCase();
}

const QUICK_FILTERS = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "view", label: "Views" },
  { id: "change", label: "Changes" },
  { id: "delete", label: "Deletes" },
  { id: "auth", label: "Auth" },
];

export default function ActivityLogPage() {
  const { isSuperAdmin, loading: roleLoading } = useAdminRole();
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [userSearch, setUserSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");
  const pageSize = 50;

  const base = getPublicApiBase();

  const load = useCallback(async () => {
    if (!base || !isSuperAdmin) return;
    setLoading(true);
    setErr("");
    try {
      const url = `${base}admin/management/activities?page=${page}&size=${pageSize}`;
      const res = await fetch(url, {
        headers: { ...adminAuthHeaders(), Accept: "application/json" },
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
          (data && (data.message || data.error)) ||
          `Request failed (${res.status})`;
        throw new Error(typeof msg === "string" ? msg : "Request failed");
      }
      const content = Array.isArray(data?.content) ? data.content : [];
      setRows(content.map(normalizeRow));
      setTotalPages(typeof data?.totalPages === "number" ? data.totalPages : 0);
      setTotalElements(
        typeof data?.totalElements === "number" ? data.totalElements : 0,
      );
    } catch (e) {
      setErr(e?.message || "Could not load activity log.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [base, isSuperAdmin, page]);

  useEffect(() => {
    if (!roleLoading && isSuperAdmin) {
      load();
    }
  }, [roleLoading, isSuperAdmin, load]);

  const filteredRows = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return rows.filter((row) => {
      const kind = classifyAction(row);
      if (quickFilter === "today") {
        const occurredAt = parseOccurredAt(row.occurredAt ?? row.occurred_at);
        if (!occurredAt || occurredAt < startOfToday) return false;
      } else if (quickFilter !== "all" && kind.key !== quickFilter) {
        return false;
      }

      const hay = [
        row.actorName,
        row.actorEmail,
        row.action,
        row.event,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (q && !hay.includes(q)) return false;

      if (!from && !to) return true;
      const occurredAt = parseOccurredAt(row.occurredAt ?? row.occurred_at);
      if (!occurredAt) return false;
      if (from && occurredAt < from) return false;
      if (to && occurredAt > to) return false;
      return true;
    });
  }, [rows, userSearch, fromDate, toDate, quickFilter]);

  const summary = useMemo(() => {
    const counts = { view: 0, change: 0, delete: 0, auth: 0 };
    rows.forEach((row) => {
      const k = classifyAction(row).key;
      if (counts[k] != null) counts[k] += 1;
    });
    return {
      total: rows.length,
      ...counts,
      shown: filteredRows.length,
    };
  }, [rows, filteredRows]);

  const clearFilters = () => {
    setUserSearch("");
    setFromDate("");
    setToDate("");
    setQuickFilter("all");
  };

  const hasActiveFilters =
    Boolean(userSearch.trim()) ||
    Boolean(fromDate) ||
    Boolean(toDate) ||
    quickFilter !== "all";

  if (roleLoading) {
    return <AdminLoader fullPage label="Loading activity…" size="lg" />;
  }

  if (!isSuperAdmin) {
    return (
      <div className="activity-log admin-page-surface">
        <p className="activity-log__err">You do not have access to this page.</p>
      </div>
    );
  }

  return (
    <div className="activity-log admin-page-surface">
      <DashboardHeader
        heading="Activity Log"
        pageStyle="executivePlain"
      />
      <p className="activity-log__lead">
        See who did what — name, action, and time at a glance.
      </p>

      <div className="activity-log__metrics" aria-label="Activity summary">
        <div className="activity-log__metric">
          <span className="activity-log__metric-value">{summary.total}</span>
          <span className="activity-log__metric-label">On this page</span>
        </div>
        <div className="activity-log__metric activity-log__metric--blue">
          <span className="activity-log__metric-value">{summary.view}</span>
          <span className="activity-log__metric-label">Views</span>
        </div>
        <div className="activity-log__metric activity-log__metric--green">
          <span className="activity-log__metric-value">{summary.change}</span>
          <span className="activity-log__metric-label">Changes</span>
        </div>
        <div className="activity-log__metric activity-log__metric--danger">
          <span className="activity-log__metric-value">{summary.delete}</span>
          <span className="activity-log__metric-label">Deletes</span>
        </div>
        <div className="activity-log__metric activity-log__metric--gold">
          <span className="activity-log__metric-value">{summary.auth}</span>
          <span className="activity-log__metric-label">Auth</span>
        </div>
      </div>

      <div className="activity-log__toolbar">
        <div className="activity-log__chips" role="tablist" aria-label="Quick filters">
          {QUICK_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={quickFilter === f.id}
              className={`activity-log__chip${quickFilter === f.id ? " is-active" : ""}${f.id !== "all" && f.id !== "today" ? ` activity-log__chip--${f.id}` : ""}`}
              onClick={() => setQuickFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="activity-log__filters">
          <input
            id="activity-user-search"
            type="search"
            className="activity-log__search"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search name, email, or action…"
            aria-label="Search activity"
          />
          <input
            id="activity-from-date"
            type="date"
            className="activity-log__date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            aria-label="From date"
          />
          <input
            id="activity-to-date"
            type="date"
            className="activity-log__date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            aria-label="To date"
          />
          {hasActiveFilters ? (
            <button
              type="button"
              className="activity-log__clear"
              onClick={clearFilters}
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <div className="activity-log__meta-row">
        <span>
          Showing <strong>{summary.shown}</strong>
          {totalElements > 0 ? <> of <strong>{totalElements}</strong></> : null}
        </span>
        <button
          type="button"
          className="activity-log__refresh"
          onClick={() => load()}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {err ? <div className="activity-log__err">{err}</div> : null}

      {loading && !err ? (
        <AdminLoader fullPage label="Loading activity…" size="lg" />
      ) : null}

      {!loading && !err && filteredRows.length === 0 ? (
        <p className="activity-log__empty">
          {rows.length > 0
            ? "No activity matches the selected filters."
            : "No activity recorded yet."}
        </p>
      ) : null}

      {!loading && filteredRows.length > 0 ? (
        <>
          <div className="activity-log__list" role="list">
            {filteredRows.map((row, i) => {
              const key = `${row.occurredAt ?? "x"}-${row.actorEmail ?? ""}-${i}`;
              const when = formatWhenParts(row.occurredAt ?? row.occurred_at);
              const kind = classifyAction(row);
              const name = row.actorName || "Unknown";
              const email = row.actorEmail || "";
              return (
                <article
                  key={key}
                  className={`activity-log__row activity-log__row--${kind.tone}`}
                  role="listitem"
                >
                  <div className="activity-log__avatar" aria-hidden>
                    {initials(name, email)}
                  </div>

                  <div className="activity-log__who">
                    <div className="activity-log__name">{name}</div>
                    {email ? (
                      <div className="activity-log__email">{email}</div>
                    ) : null}
                  </div>

                  <div className="activity-log__what">
                    <span className={`activity-log__badge activity-log__badge--${kind.tone}`}>
                      {kind.label}
                    </span>
                    <span className="activity-log__action">{row.action}</span>
                  </div>

                  <div className="activity-log__when" title={when.date + " " + when.time}>
                    <span className="activity-log__when-date">{when.date}</span>
                    <span className="activity-log__when-time">{when.time}</span>
                    {when.relative ? (
                      <span className="activity-log__when-rel">{when.relative}</span>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>

          {totalPages > 1 ? (
            <div className="activity-log__pager">
              <span>
                Page {page + 1} of {totalPages}
              </span>
              <button
                type="button"
                className="activity-log__btn"
                disabled={page <= 0 || loading}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="activity-log__btn"
                disabled={page >= totalPages - 1 || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
