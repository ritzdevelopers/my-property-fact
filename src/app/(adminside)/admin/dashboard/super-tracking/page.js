"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { useAdminRole } from "../../_contexts/AdminRoleContext";
import "./super-tracking.css";
import WebsiteTrafficOverview from "./WebsiteTrafficOverview";
import IpTrackerOverview from "./IpTrackerOverview";

function adminAuthHeaders() {
  return {};
}

async function adminFetchJson(url) {
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
  return data;
}

/** Poll public-site traffic summary while the Website traffic tab is open (matches beacon data from the live site). */
/** Slightly faster poll so super-tracking feels closer to real time. */
const TRAFFIC_POLL_MS = 4_000;

function isLocalUiUrl(url) {
  if (!url) return true;
  const u = String(url).toLowerCase();
  return u.includes("localhost") || u.includes("127.0.0.1");
}

/** Public marketing site link (production domain when env points at localhost). */
function publicSiteHref() {
  const raw = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_UI_URL : "";
  const trimmed = raw && String(raw).trim() ? String(raw).trim().replace(/\/?$/, "") : "";
  if (!trimmed || isLocalUiUrl(trimmed)) {
    return "https://mypropertyfact.in";
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

function publicSiteDisplayLabel() {
  try {
    return new URL(publicSiteHref()).host;
  } catch {
    return "mypropertyfact.in";
  }
}

function formatDwellOnPage(ms) {
  if (ms == null || ms < 0) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ${sec % 60}s`;
  const h = Math.floor(min / 60);
  return `${h}h ${min % 60}m`;
}

/** Spring/Jackson may serialize LocalDateTime as an array [y, mo, d, h, mi, s, ns]. */
function parseVisitOccurredAt(raw) {
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

function auditOccurredAtCell(row) {
  const d = parseVisitOccurredAt(row?.occurredAt ?? row?.occurred_at);
  return d ? d.toLocaleString() : "—";
}

function auditTaskLabel(row) {
  const t = row?.taskLabel ?? row?.task_label;
  return typeof t === "string" && t.trim() ? t.trim() : "—";
}

function auditClientPage(row) {
  const p = row?.clientAdminPage ?? row?.client_admin_page;
  return typeof p === "string" && p.trim() ? p.trim() : "—";
}

function auditDwellMs(row) {
  const v = row?.clientDwellMs ?? row?.client_dwell_ms;
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Backend adds actorFullName from users.full_name when actorUserId is set. */
function getAuditActorParts(row) {
  const email =
    typeof row?.actorEmail === "string"
      ? row.actorEmail.trim()
      : typeof row?.actor_email === "string"
        ? row.actor_email.trim()
        : "";
  const nameRaw = row?.actorFullName ?? row?.actor_full_name;
  const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
  return { name, email };
}

export default function SuperTrackingPage() {
  const { isSuperAdmin, loading: roleLoading } = useAdminRole();
  const [tab, setTab] = useState("iptrack");

  const [traffic, setTraffic] = useState(null);
  const [trafficErr, setTrafficErr] = useState("");
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [trafficUpdatedAt, setTrafficUpdatedAt] = useState(null);
  /** Bumps once per second on the traffic tab so "Xs ago" stays current. */
  const [, setTrafficClockTick] = useState(0);
  const trafficPollTimeoutRef = useRef(null);

  const [visits, setVisits] = useState(null);
  const [visitsErr, setVisitsErr] = useState("");
  const [ipRevealed, setIpRevealed] = useState(false);
  const [trafficPin, setTrafficPin] = useState("");
  const [trafficPinErr, setTrafficPinErr] = useState("");
  const [trafficPinLoading, setTrafficPinLoading] = useState(false);

  const [logs, setLogs] = useState(null);
  const [logsErr, setLogsErr] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);
  /** Zero-based page index (must match API). */
  const [page, setPage] = useState(0);
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [pathContains, setPathContains] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const base = getPublicApiBase();

  const loadTraffic = useCallback(async (opts = {}) => {
    const silent = Boolean(opts.silent);
    if (!base || !isSuperAdmin) return;
    if (!silent) {
      setTrafficLoading(true);
    }
    setTrafficErr("");
    try {
      const data = await adminFetchJson(`${base}admin/super/traffic/summary`);
      setTraffic(data);
      setTrafficUpdatedAt(new Date());
    } catch (e) {
      setTrafficErr(e.message || "Failed to load traffic");
      if (!silent) {
        setTraffic(null);
      }
    } finally {
      if (!silent) {
        setTrafficLoading(false);
      }
    }
  }, [base, isSuperAdmin]);

  const loadRevealStatus = useCallback(async () => {
    if (!base || !isSuperAdmin) return;
    try {
      const data = await adminFetchJson(`${base}admin/super/traffic/reveal-status`);
      setIpRevealed(Boolean(data?.revealed));
    } catch {
      /* ignore */
    }
  }, [base, isSuperAdmin]);

  const loadVisits = useCallback(
    async (opts = {}) => {
      const silent = Boolean(opts.silent);
      if (!base || !isSuperAdmin) return;
      if (!silent) setVisitsErr("");
      try {
        const data = await adminFetchJson(`${base}admin/super/traffic/visits?page=0&size=50`);
        setVisits(data);
        setIpRevealed(Boolean(data?.ipRevealActive));
      } catch (e) {
        if (!silent) setVisitsErr(e.message || "Failed to load visits");
      }
    },
    [base, isSuperAdmin],
  );

  const unlockTrafficIp = useCallback(async () => {
    if (!base) return;
    setTrafficPinErr("");
    setTrafficPinLoading(true);
    try {
      const res = await fetch(`${base}admin/super/traffic/reveal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ pin: trafficPin.trim() }),
      });
      if (res.status === 403) {
        setTrafficPinErr("Invalid code");
        return;
      }
      if (!res.ok) {
        const t = await res.text();
        setTrafficPinErr(t || "Request failed");
        return;
      }
      setTrafficPin("");
      await loadVisits({ silent: true });
      await loadRevealStatus();
    } catch {
      setTrafficPinErr("Network error");
    } finally {
      setTrafficPinLoading(false);
    }
  }, [base, trafficPin, loadVisits, loadRevealStatus]);

  const fetchAuditLogs = useCallback(
    async (pageIndex) => {
      if (!base || !isSuperAdmin) return;
      setLogsLoading(true);
      setLogsErr("");
      try {
        const params = new URLSearchParams();
        params.set("page", String(pageIndex));
        params.set("size", "20");
        if (email.trim()) params.set("email", email.trim());
        if (success === "true" || success === "false") params.set("success", success);
        if (pathContains.trim()) params.set("pathContains", pathContains.trim());
        if (from.trim()) {
          const d = new Date(from);
          if (!Number.isNaN(d.getTime())) params.set("from", d.toISOString());
        }
        if (to.trim()) {
          const d = new Date(to);
          if (!Number.isNaN(d.getTime())) params.set("to", d.toISOString());
        }
        const data = await adminFetchJson(`${base}admin/super/audit-logs?${params.toString()}`);
        setLogs(data);
      } catch (e) {
        setLogsErr(e.message || "Failed to load audit logs");
        setLogs(null);
      } finally {
        setLogsLoading(false);
      }
    },
    [base, isSuperAdmin, email, success, pathContains, from, to],
  );

  useEffect(() => {
    if (roleLoading || !isSuperAdmin) return;
    if (tab !== "iptrack") return;
    loadRevealStatus();
  }, [roleLoading, isSuperAdmin, tab, loadRevealStatus]);

  useEffect(() => {
    if (roleLoading || !isSuperAdmin) return;
    if (tab !== "traffic") return;

    let cancelled = false;

    const scheduleNext = () => {
      if (cancelled) return;
      trafficPollTimeoutRef.current = window.setTimeout(async () => {
        if (cancelled) return;
        await loadTraffic({ silent: true });
        await loadRevealStatus();
        await loadVisits({ silent: true });
        if (!cancelled) scheduleNext();
      }, TRAFFIC_POLL_MS);
    };

    (async () => {
      await loadTraffic({ silent: false });
      await loadRevealStatus();
      await loadVisits({ silent: true });
      if (!cancelled) scheduleNext();
    })();

    return () => {
      cancelled = true;
      if (trafficPollTimeoutRef.current != null) {
        window.clearTimeout(trafficPollTimeoutRef.current);
        trafficPollTimeoutRef.current = null;
      }
    };
  }, [roleLoading, isSuperAdmin, tab, loadTraffic, loadRevealStatus, loadVisits]);

  useEffect(() => {
    if (tab !== "traffic") return;
    const id = window.setInterval(() => {
      setTrafficClockTick((n) => n + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [tab]);

  useEffect(() => {
    if (roleLoading || !isSuperAdmin) return;
    if (tab === "logs") fetchAuditLogs(page);
  }, [roleLoading, isSuperAdmin, tab, page, fetchAuditLogs]);

  if (!roleLoading && !isSuperAdmin) {
    return (
      <div className="super-tracking">
        <p className="super-tracking__err">You do not have access to this page.</p>
      </div>
    );
  }

  return (
    <div className="super-tracking">
      <p className="super-tracking__kicker">Super Admin</p>
      <h1 className="super-tracking__title">MPF Traffic and Logs</h1>
      {/* <p className="super-tracking__note">
        Website traffic counts come from client-side page views sent by the public site (JavaScript
        navigations), throttled per visitor and path. They do not include every static asset or
        non-JavaScript visit. Admin logs record authenticated calls to admin APIs after each request
        completes (method, path, HTTP status, and duration).
      </p> */}

      <div className="super-tracking__tabs" role="tablist" aria-label="Tracking views">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "iptrack"}
          className={`super-tracking__tab${tab === "iptrack" ? " super-tracking__tab--active" : ""}`}
          onClick={() => setTab("iptrack")}
        >
          IP tracker
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "traffic"}
          className={`super-tracking__tab${tab === "traffic" ? " super-tracking__tab--active" : ""}`}
          onClick={() => setTab("traffic")}
        >
          Website traffic
        </button>
      </div>

      <p className="super-tracking__note" style={{ marginTop: "-0.35rem" }}>
        Looking for what users searched? Open{" "}
        <Link href="/admin/dashboard/search-reports">Search Reports</Link> for weekly/monthly
        keyword, property, and blog search analytics (Excel export included).
      </p>

      {tab === "iptrack" && (
        <IpTrackerOverview
          ipRevealed={ipRevealed}
          trafficPin={trafficPin}
          setTrafficPin={setTrafficPin}
          trafficPinErr={trafficPinErr}
          trafficPinLoading={trafficPinLoading}
          onUnlockIp={unlockTrafficIp}
        />
      )}

      {tab === "traffic" && (
        <WebsiteTrafficOverview
          siteUrl={publicSiteHref()}
          siteLabel={publicSiteDisplayLabel()}
          traffic={traffic}
          trafficLoading={trafficLoading}
          trafficErr={trafficErr}
          trafficUpdatedAt={trafficUpdatedAt}
          visits={visits}
          visitsErr={visitsErr}
          ipRevealed={ipRevealed}
          trafficPin={trafficPin}
          setTrafficPin={setTrafficPin}
          trafficPinErr={trafficPinErr}
          trafficPinLoading={trafficPinLoading}
          onUnlockIp={unlockTrafficIp}
          onRefresh={async () => {
            await loadTraffic({ silent: false });
            await loadRevealStatus();
            await loadVisits({ silent: true });
          }}
          onRefreshDisabled={trafficLoading}
        />
      )}

      {tab === "logs" && (
        <>
          {logsErr ? <div className="super-tracking__err">{logsErr}</div> : null}
          <div className="super-tracking__panel">
            <div className="super-tracking__panel-head">Filters</div>
            <div className="super-tracking__filters">
              <div className="super-tracking__field">
                <label htmlFor="st-email">Email</label>
                <input
                  id="st-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contains…"
                />
              </div>
              <div className="super-tracking__field">
                <label htmlFor="st-success">Result</label>
                <select
                  id="st-success"
                  value={success}
                  onChange={(e) => setSuccess(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="true">Success</option>
                  <option value="false">Failure</option>
                </select>
              </div>
              <div className="super-tracking__field">
                <label htmlFor="st-path">Search</label>
                <input
                  id="st-path"
                  value={pathContains}
                  onChange={(e) => setPathContains(e.target.value)}
                  placeholder="Task label or API path…"
                />
              </div>
              <div className="super-tracking__field">
                <label htmlFor="st-from">From</label>
                <input
                  id="st-from"
                  type="datetime-local"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="super-tracking__field">
                <label htmlFor="st-to">To</label>
                <input
                  id="st-to"
                  type="datetime-local"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="super-tracking__btn"
                onClick={() => {
                  if (page !== 0) setPage(0);
                  else fetchAuditLogs(0);
                }}
                disabled={logsLoading}
              >
                Apply
              </button>
            </div>
            <div className="super-tracking__panel-head">Entries</div>
            {logsLoading ? (
              <div className="wt-table-skeleton" style={{ padding: "0.75rem 1rem 1rem" }} aria-busy="true">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
                  <div key={k} className="admin-skel wt-table-skeleton__row" />
                ))}
              </div>
            ) : logs?.content?.length ? (
              <div className="super-tracking__table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Person</th>
                      <th>Task</th>
                      <th>Page</th>
                      <th>On page</th>
                      <th>Status</th>
                      <th>Result</th>
                      <th>ms</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.content.map((row) => (
                      <tr key={row.id}>
                        <td className="super-tracking__mono">{auditOccurredAtCell(row)}</td>
                        <td className="super-tracking__actor-cell">
                          {(() => {
                            const { name, email } = getAuditActorParts(row);
                            if (name) {
                              return (
                                <>
                                  <div className="super-tracking__actor-name">{name}</div>
                                  {email ? (
                                    <div className="super-tracking__actor-email">{email}</div>
                                  ) : null}
                                </>
                              );
                            }
                            return email || "—";
                          })()}
                        </td>
                        <td
                          className="super-tracking__task-cell"
                          title={
                            row.queryString ?? row.query_string
                              ? `${row.httpMethod ?? row.http_method} ${row.requestPath ?? row.request_path}?${row.queryString ?? row.query_string}`
                              : `${row.httpMethod ?? row.http_method} ${row.requestPath ?? row.request_path}`
                          }
                        >
                          {auditTaskLabel(row)}
                        </td>
                        <td className="super-tracking__mono super-tracking__page-cell">
                          {auditClientPage(row)}
                        </td>
                        <td className="super-tracking__mono">
                          {formatDwellOnPage(auditDwellMs(row))}
                        </td>
                        <td>{row.httpStatus ?? row.http_status ?? "—"}</td>
                        <td>
                          <span
                            className={`super-tracking__pill ${
                              row.success ? "super-tracking__pill--ok" : "super-tracking__pill--fail"
                            }`}
                          >
                            {row.success ? "OK" : "FAIL"}
                          </span>
                        </td>
                        <td className="super-tracking__mono">
                          {row.durationMs ?? row.duration_ms ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="super-tracking__muted">No log entries match your filters.</div>
            )}
            <div className="super-tracking__pager">
              <span>
                Page {(logs?.number ?? page) + 1} / {Math.max(logs?.totalPages ?? 1, 1)}
              </span>
              <button
                type="button"
                disabled={logsLoading || page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={
                  logsLoading ||
                  !logs ||
                  page >= (logs.totalPages ?? 1) - 1
                }
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
