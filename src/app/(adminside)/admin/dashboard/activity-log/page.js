"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { useAdminRole } from "../../_contexts/AdminRoleContext";
import { AdminLoader } from "@/components/admin/admin-loader";
import DashboardHeader from "../common-model/dashboardHeader";
import "./activity-log.css";

/** Earliest day stored in admin_audit_log on production. */
const AUDIT_LOG_STARTED = "2026-07-19";

function adminAuthHeaders() {
  return {};
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toDateInputValue(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function todayIso() {
  return toDateInputValue(new Date());
}

function formatDayHeading(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
  if (!d) return { date: "—", time: "", relative: "", iso: "" };
  const date = `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
  const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return { date, time, relative: formatRelative(d), iso: toDateInputValue(d) };
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

function titleCaseWords(s) {
  return String(s || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatAdminPage(path) {
  if (!path || typeof path !== "string") return "";
  const noQuery = path.trim().split("?")[0];
  if (!noQuery) return "";
  const parts = noQuery.split("/").filter(Boolean);
  if (parts.length === 0) return noQuery;
  const last = parts[parts.length - 1];
  if (/^\d+$/.test(last) && parts.length >= 2) {
    return titleCaseWords(parts[parts.length - 2]);
  }
  return titleCaseWords(last);
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
  const clientAdminPage =
    (typeof row?.clientAdminPage === "string" && row.clientAdminPage.trim()) ||
    (typeof row?.client_admin_page === "string" && row.client_admin_page.trim()) ||
    "";
  return {
    ...row,
    actorName,
    actorEmail,
    action,
    clientAdminPage,
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
    action.includes("login") ||
    action.includes("logout") ||
    action.includes("session") ||
    action.includes("sign")
  ) {
    return { key: "auth", label: "Auth", tone: "gold" };
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

function groupRowsByActor(rows) {
  const groups = [];
  const index = new Map();
  for (const row of rows) {
    const key = String(row.actorUserId || row.actorEmail || row.actorName || "unknown");
    if (!index.has(key)) {
      const g = {
        key,
        actorName: row.actorName || "Unknown",
        actorEmail: row.actorEmail || "",
        rows: [],
      };
      index.set(key, g);
      groups.push(g);
    }
    index.get(key).rows.push(row);
  }
  return groups;
}

const QUICK_FILTERS = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "view", label: "Views" },
  { id: "change", label: "Changes" },
  { id: "delete", label: "Deletes" },
  { id: "auth", label: "Auth" },
];

const KIND_FILTERS = new Set(["view", "change", "delete", "auth"]);

export default function ActivityLogPage() {
  const { isSuperAdmin, loading: roleLoading } = useAdminRole();
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");
  const pageSize = 50;

  const base = getPublicApiBase();

  const kindParam = KIND_FILTERS.has(quickFilter) ? quickFilter : "";
  const resolvedFrom = quickFilter === "today" ? todayIso() : fromDate;
  const resolvedTo =
    quickFilter === "today" ? todayIso() : toDate || fromDate || "";
  const singleDay = Boolean(resolvedFrom && resolvedFrom === resolvedTo);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = searchInput.trim();
      setQ((prev) => {
        if (prev !== next) {
          setPage(0);
        }
        return next;
      });
    }, 300);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    if (!base || !isSuperAdmin) return;
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("size", String(pageSize));
      if (resolvedFrom) params.set("from", resolvedFrom);
      if (resolvedTo) params.set("to", resolvedTo);
      if (q) params.set("q", q);
      if (kindParam) params.set("kind", kindParam);
      const url = `${base}admin/management/activities?${params.toString()}`;
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
  }, [base, isSuperAdmin, page, resolvedFrom, resolvedTo, q, kindParam]);

  useEffect(() => {
    if (!roleLoading && isSuperAdmin) {
      load();
    }
  }, [roleLoading, isSuperAdmin, load]);

  const actorGroups = useMemo(() => groupRowsByActor(rows), [rows]);

  const summary = useMemo(() => {
    const counts = { view: 0, change: 0, delete: 0, auth: 0 };
    rows.forEach((row) => {
      const k = classifyAction(row).key;
      if (counts[k] != null) counts[k] += 1;
    });
    return {
      total: totalElements,
      people: actorGroups.length,
      ...counts,
    };
  }, [rows, actorGroups, totalElements]);

  const selectDay = (iso) => {
    if (!iso) return;
    setQuickFilter("all");
    setFromDate(iso);
    setToDate(iso);
    setPage(0);
  };

  const clearFilters = () => {
    setSearchInput("");
    setQ("");
    setFromDate("");
    setToDate("");
    setQuickFilter("all");
    setPage(0);
  };

  const hasActiveFilters =
    Boolean(searchInput.trim()) ||
    Boolean(fromDate) ||
    Boolean(toDate) ||
    quickFilter !== "all";

  const emptyHint = (() => {
    if (rows.length > 0) return "";
    if (resolvedFrom && resolvedFrom < AUDIT_LOG_STARTED) {
      return `Admin action logging started on 19 July 2026. Pick a date on or after that to see who did what.`;
    }
    if (singleDay) {
      return `No admin activity recorded on ${formatDayHeading(resolvedFrom)}.`;
    }
    if (hasActiveFilters) {
      return "No activity matches the selected filters.";
    }
    return "No activity recorded yet.";
  })();

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
        Pick any date to see who did what — name, action, admin page, and time.
        Click a date on a row to open that day.
      </p>

      <div className="activity-log__metrics" aria-label="Activity summary">
        <div className="activity-log__metric">
          <span className="activity-log__metric-value">{summary.total}</span>
          <span className="activity-log__metric-label">
            {singleDay ? "This date" : "Matching"}
          </span>
        </div>
        <div className="activity-log__metric">
          <span className="activity-log__metric-value">{summary.people}</span>
          <span className="activity-log__metric-label">People</span>
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
              onClick={() => {
                setQuickFilter(f.id);
                setPage(0);
                if (f.id === "today") {
                  const t = todayIso();
                  setFromDate(t);
                  setToDate(t);
                }
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="activity-log__filters">
          <label className="activity-log__date-wrap">
            <span>Date</span>
            <input
              id="activity-from-date"
              type="date"
              className="activity-log__date"
              value={quickFilter === "today" ? todayIso() : fromDate}
              max={todayIso()}
              onChange={(e) => {
                const v = e.target.value;
                setQuickFilter("all");
                setFromDate(v);
                if (!toDate || toDate === fromDate) setToDate(v);
                setPage(0);
              }}
              aria-label="Activity date"
            />
          </label>
          <label className="activity-log__date-wrap">
            <span>To</span>
            <input
              id="activity-to-date"
              type="date"
              className="activity-log__date"
              value={quickFilter === "today" ? todayIso() : toDate}
              min={fromDate || undefined}
              max={todayIso()}
              onChange={(e) => {
                setQuickFilter("all");
                setToDate(e.target.value);
                setPage(0);
              }}
              aria-label="To date"
            />
          </label>
          <input
            id="activity-user-search"
            type="search"
            className="activity-log__search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, email, or action…"
            aria-label="Search activity"
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
          {singleDay ? (
            <>
              <strong>{formatDayHeading(resolvedFrom)}</strong>
              {totalElements > 0 ? (
                <>
                  {" "}
                  · {totalElements} action{totalElements === 1 ? "" : "s"}
                  {summary.people > 0 ? (
                    <>
                      {" "}
                      by {summary.people} {summary.people === 1 ? "person" : "people"}
                    </>
                  ) : null}
                </>
              ) : null}
            </>
          ) : (
            <>
              Showing <strong>{rows.length}</strong>
              {totalElements > 0 ? (
                <> of <strong>{totalElements}</strong></>
              ) : null}
            </>
          )}
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

      {!loading && !err && rows.length === 0 ? (
        <p className="activity-log__empty">{emptyHint}</p>
      ) : null}

      {!loading && rows.length > 0 ? (
        <>
          {singleDay ? (
            <div className="activity-log__people" role="list">
              {actorGroups.map((group) => (
                <section
                  key={group.key}
                  className="activity-log__person"
                  role="listitem"
                >
                  <header className="activity-log__person-head">
                    <div className="activity-log__avatar" aria-hidden>
                      {initials(group.actorName, group.actorEmail)}
                    </div>
                    <div className="activity-log__who">
                      <div className="activity-log__name">{group.actorName}</div>
                      {group.actorEmail ? (
                        <div className="activity-log__email">{group.actorEmail}</div>
                      ) : null}
                    </div>
                    <span className="activity-log__person-count">
                      {group.rows.length} action{group.rows.length === 1 ? "" : "s"}
                    </span>
                  </header>
                  <ul className="activity-log__person-actions">
                    {group.rows.map((row, i) => {
                      const when = formatWhenParts(row.occurredAt ?? row.occurred_at);
                      const kind = classifyAction(row);
                      const where = formatAdminPage(row.clientAdminPage);
                      return (
                        <li
                          key={row.id ?? `${group.key}-${i}`}
                          className={`activity-log__person-action activity-log__person-action--${kind.tone}`}
                        >
                          <time className="activity-log__action-time" dateTime={when.iso}>
                            {when.time || "—"}
                          </time>
                          <span className={`activity-log__badge activity-log__badge--${kind.tone}`}>
                            {kind.label}
                          </span>
                          <div className="activity-log__action-copy">
                            <span className="activity-log__action">{row.action}</span>
                            {where ? (
                              <span className="activity-log__where">{where}</span>
                            ) : null}
                            {row.success === false ? (
                              <span className="activity-log__failed">Failed</span>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <div className="activity-log__list" role="list">
              {rows.map((row, i) => {
                const key = row.id ?? `${row.occurredAt ?? "x"}-${row.actorEmail ?? ""}-${i}`;
                const when = formatWhenParts(row.occurredAt ?? row.occurred_at);
                const kind = classifyAction(row);
                const name = row.actorName || "Unknown";
                const email = row.actorEmail || "";
                const where = formatAdminPage(row.clientAdminPage);
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
                      {where ? (
                        <span className="activity-log__where">{where}</span>
                      ) : null}
                    </div>

                    <div className="activity-log__when" title={when.date + " " + when.time}>
                      <button
                        type="button"
                        className="activity-log__when-date"
                        onClick={() => selectDay(when.iso)}
                        title={`Show all activity on ${when.date}`}
                      >
                        {when.date}
                      </button>
                      <span className="activity-log__when-time">{when.time}</span>
                      {when.relative ? (
                        <span className="activity-log__when-rel">{when.relative}</span>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

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
