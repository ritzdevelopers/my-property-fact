"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { useAdminRole } from "../../_contexts/AdminRoleContext";
import "./activity-log.css";

function adminAuthHeaders() {
  const token = typeof window !== "undefined" ? Cookies.get("token") : undefined;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
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

function formatWhenCell(raw) {
  const d = parseOccurredAt(raw);
  if (!d) return "—";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

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
      setRows(Array.isArray(data?.content) ? data.content : []);
      setTotalPages(typeof data?.totalPages === "number" ? data.totalPages : 0);
      setTotalElements(typeof data?.totalElements === "number" ? data.totalElements : 0);
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
    return rows.filter((row) => {
      const eventText =
        typeof row?.event === "string" ? row.event : "";
      const nameText =
        typeof row?.actorFullName === "string"
          ? row.actorFullName
          : typeof row?.actor_full_name === "string"
            ? row.actor_full_name
            : "";
      const matchesUser =
        !q ||
        eventText.toLowerCase().includes(q) ||
        nameText.toLowerCase().includes(q);
      if (!matchesUser) return false;

      if (!from && !to) return true;
      const occurredAt = parseOccurredAt(row.occurredAt ?? row.occurred_at);
      if (!occurredAt) return false;
      if (from && occurredAt < from) return false;
      if (to && occurredAt > to) return false;
      return true;
    });
  }, [rows, userSearch, fromDate, toDate]);

  if (roleLoading) {
    return (
      <div className="activity-log">
        <p className="activity-log__muted" style={{ textAlign: "left", padding: 0 }}>
          Loading…
        </p>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="activity-log">
        <p className="activity-log__err">You do not have access to this page.</p>
      </div>
    );
  }

  return (
    <div className="activity-log">
      <h1 className="activity-log__title">Activity log</h1>
      <p className="activity-log__subtitle">All management actions by admins.</p>

      <div className="activity-log__filters">
        <div className="activity-log__filter">
          <label htmlFor="activity-user-search">Search user</label>
          <input
            id="activity-user-search"
            type="search"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Type name or email..."
          />
        </div>
        <div className="activity-log__filter">
          <label htmlFor="activity-from-date">From</label>
          <input
            id="activity-from-date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="activity-log__filter">
          <label htmlFor="activity-to-date">To</label>
          <input
            id="activity-to-date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {err ? <div className="activity-log__err">{err}</div> : null}

      <div className="activity-log__panel">
        {loading && !err ? (
          <div className="activity-log__skeleton" aria-busy="true">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
              <div key={k} className="activity-log__skeleton-row">
                <span className="admin-skel activity-log__skeleton-when" />
                <span className="admin-skel activity-log__skeleton-event" />
              </div>
            ))}
          </div>
        ) : null}
        {!loading && !err && filteredRows.length === 0 ? (
          <p className="activity-log__muted">
            {rows.length > 0
              ? "No activity matches the selected filters."
              : "No activity recorded yet."}
          </p>
        ) : null}
        {!loading && filteredRows.length > 0 ? (
          <>
            <div className="activity-log__table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">When</th>
                    <th scope="col">Event</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, i) => {
                    const key = `${row.occurredAt ?? "x"}-${i}`;
                    return (
                      <tr key={key}>
                        <td className="activity-log__when">
                          {formatWhenCell(row.occurredAt ?? row.occurred_at)}
                        </td>
                        <td className="activity-log__event">
                          {typeof row.event === "string" ? row.event : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 ? (
              <div className="activity-log__pager">
                <span>
                  Page {page + 1} of {totalPages}
                  {totalElements > 0 ? ` · ${totalElements} total` : ""}
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
    </div>
  );
}
