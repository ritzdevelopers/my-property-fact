"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { useAdminRole } from "../../_contexts/AdminRoleContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import "./super-tracking.css";

function adminAuthHeaders() {
  const token = typeof window !== "undefined" ? Cookies.get("token") : undefined;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
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
const TRAFFIC_POLL_MS = 5_000;

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

function visitDwellMs(row) {
  if (row == null) return null;
  const v = row.dwellMs ?? row.dwell_ms;
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
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

function formatVisitOccurredAtCell(row) {
  const d = parseVisitOccurredAt(row?.occurredAt ?? row?.occurred_at);
  return d ? d.toLocaleString() : "—";
}

function formatVisitDwellCell(row) {
  const dms = visitDwellMs(row);
  return dms != null ? formatDwellOnPage(dms) : "—";
}

function formatLastUpdatedClock(d) {
  if (!d || !(d instanceof Date) || Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function secondsSinceUpdate(d) {
  if (!d || !(d instanceof Date) || Number.isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
}

function relativeAgoFromSeconds(sec) {
  if (sec == null) return "";
  if (sec < 60) return `${sec}s ago`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(sec / 3600);
  return `${h}h ago`;
}

export default function SuperTrackingPage() {
  const { isSuperAdmin, loading: roleLoading } = useAdminRole();
  const [tab, setTab] = useState("traffic");

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
      <h1 className="super-tracking__title">Traffic and audit logs</h1>
      <p className="super-tracking__note">
        Website traffic counts come from client-side page views sent by the public site (JavaScript
        navigations), throttled per visitor and path. They do not include every static asset or
        non-JavaScript visit. Admin logs record authenticated calls to admin APIs after each request
        completes (method, path, HTTP status, and duration).
      </p>

      <div className="super-tracking__tabs" role="tablist" aria-label="Tracking views">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "traffic"}
          className={`super-tracking__tab${tab === "traffic" ? " super-tracking__tab--active" : ""}`}
          onClick={() => setTab("traffic")}
        >
          Website traffic
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "logs"}
          className={`super-tracking__tab${tab === "logs" ? " super-tracking__tab--active" : ""}`}
          onClick={() => setTab("logs")}
        >
          Admin logs
        </button>
      </div>

      {tab === "traffic" && (
        <>
          <div className="super-tracking__live-row" aria-live="polite">
            <span className="super-tracking__live-badge">
              <span className="super-tracking__live-dot" aria-hidden />
              Live
            </span>
            <span className="super-tracking__live-meta">
              <a
                href={publicSiteHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="super-tracking__live-link"
              >
                {publicSiteDisplayLabel()}
              </a>
              <span className="super-tracking__live-sep">·</span>
              refreshes every {TRAFFIC_POLL_MS / 1000}s
              <span className="super-tracking__live-sep">·</span>
              <span
                className="super-tracking__live-refresh"
                title="Auto-refreshing"
                aria-label="Auto-refreshing traffic data"
              >
                <FontAwesomeIcon icon={faArrowsRotate} className="super-tracking__live-refresh-icon" aria-hidden />
              </span>
              {trafficUpdatedAt ? (
                <>
                  <span className="super-tracking__live-sep">·</span>
                  <span className="super-tracking__live-updated">
                    Last updated{" "}
                    <time dateTime={trafficUpdatedAt.toISOString()}>
                      {formatLastUpdatedClock(trafficUpdatedAt)}
                    </time>
                    <span className="super-tracking__live-updated-ago">
                      {" "}
                      (
                      {relativeAgoFromSeconds(secondsSinceUpdate(trafficUpdatedAt))}
                      )
                    </span>
                  </span>
                </>
              ) : null}
            </span>
          </div>
          {trafficErr ? <div className="super-tracking__err">{trafficErr}</div> : null}
          {visitsErr ? <div className="super-tracking__err">{visitsErr}</div> : null}
          <div className="super-tracking__metrics">
            <div className="super-tracking__metric">
              <div className="super-tracking__metric-label">Last 15 minutes</div>
              <div className="super-tracking__metric-value">
                {trafficLoading && !traffic ? "…" : traffic?.visitsLast15Minutes ?? "—"}
              </div>
            </div>
            <div className="super-tracking__metric">
              <div className="super-tracking__metric-label">Last 1 hour</div>
              <div className="super-tracking__metric-value">
                {trafficLoading && !traffic ? "…" : traffic?.visitsLast1Hour ?? "—"}
              </div>
            </div>
            <div className="super-tracking__metric">
              <div className="super-tracking__metric-label">Last 24 hours</div>
              <div className="super-tracking__metric-value">
                {trafficLoading && !traffic ? "…" : traffic?.visitsLast24Hours ?? "—"}
              </div>
            </div>
          </div>
          <div className="super-tracking__panel super-tracking__visits-panel">
            <div className="super-tracking__panel-head">Recent page visits (48 hours)</div>
            <div className="super-tracking__visits-unlock">
              <p className="super-tracking__visits-unlock-hint">
                Each row is one completed visit: time on that path before the visitor navigated away or
                closed the tab. Visitor IP is stored from{" "}
                <code className="super-tracking__inline-code">X-Forwarded-For</code> (or{" "}
                <code className="super-tracking__inline-code">X-Real-IP</code> / remote address) and is
                only shown after you enter the 4-digit code (default <strong>2026</strong>).
              </p>
              {ipRevealed ? (
                <p className="super-tracking__visits-unlocked-msg">IP column is unlocked in this browser.</p>
              ) : (
                <div className="super-tracking__visits-pin-row">
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={4}
                    value={trafficPin}
                    onChange={(e) =>
                      setTrafficPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="••••"
                    className="super-tracking__visits-pin-input"
                    aria-label="Four digit code to show visitor IP"
                  />
                  <button
                    type="button"
                    className="super-tracking__btn super-tracking__btn--unlock"
                    onClick={() => unlockTrafficIp()}
                    disabled={trafficPinLoading || trafficPin.length !== 4}
                  >
                    {trafficPinLoading ? "…" : "Unlock IPs"}
                  </button>
                  {trafficPinErr ? (
                    <span className="super-tracking__visits-pin-err">{trafficPinErr}</span>
                  ) : null}
                </div>
              )}
            </div>
            {visits?.content?.length ? (
              <div className="super-tracking__table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Path</th>
                      <th>Time on page</th>
                      <th>Visitor IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.content.map((row) => (
                      <tr key={row.id}>
                        <td className="super-tracking__mono">{formatVisitOccurredAtCell(row)}</td>
                        <td className="super-tracking__mono">{row.path}</td>
                        <td className="super-tracking__mono">{formatVisitDwellCell(row)}</td>
                        <td className="super-tracking__mono">{row.clientIp || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="super-tracking__muted">
                No visit rows with duration yet. Open the public site in another tab, stay on a page, then
                navigate—dwell time and IP are recorded when you leave each page.
              </div>
            )}
          </div>
          <div className="super-tracking__panel">
            <div className="super-tracking__panel-head">Top paths (24 hours)</div>
            {traffic?.topPathsLast24Hours?.length ? (
              <div className="super-tracking__table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Path</th>
                      <th>Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {traffic.topPathsLast24Hours.map((row) => (
                      <tr key={row.path}>
                        <td className="super-tracking__mono">{row.path}</td>
                        <td>{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="super-tracking__muted">
                {trafficLoading && !traffic ? "Loading…" : "No traffic data yet."}
              </div>
            )}
          </div>
          <div className="super-tracking__pager" style={{ borderTop: "none", justifyContent: "flex-start" }}>
            <button
              type="button"
              className="super-tracking__btn"
              onClick={async () => {
                await loadTraffic({ silent: false });
                await loadRevealStatus();
                await loadVisits({ silent: true });
              }}
              disabled={trafficLoading}
            >
              Refresh now
            </button>
          </div>
        </>
      )}

      {tab === "logs" && (
        <div className="super-tracking__cyber">
          {logsErr ? <div className="super-tracking__err super-tracking__err--cyber">{logsErr}</div> : null}
          <div className="super-tracking__panel super-tracking__panel--cyber">
            <div className="super-tracking__panel-head super-tracking__panel-head--cyber">Filters</div>
            <div className="super-tracking__filters super-tracking__filters--cyber">
              <div className="super-tracking__field super-tracking__field--cyber">
                <label htmlFor="st-email">Actor email</label>
                <input
                  id="st-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contains…"
                />
              </div>
              <div className="super-tracking__field super-tracking__field--cyber">
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
              <div className="super-tracking__field super-tracking__field--cyber">
                <label htmlFor="st-path">Search</label>
                <input
                  id="st-path"
                  value={pathContains}
                  onChange={(e) => setPathContains(e.target.value)}
                  placeholder="Task label or API path…"
                />
              </div>
              <div className="super-tracking__field super-tracking__field--cyber">
                <label htmlFor="st-from">From</label>
                <input
                  id="st-from"
                  type="datetime-local"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="super-tracking__field super-tracking__field--cyber">
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
                className="super-tracking__btn super-tracking__btn--cyber"
                onClick={() => {
                  if (page !== 0) setPage(0);
                  else fetchAuditLogs(0);
                }}
                disabled={logsLoading}
              >
                Apply
              </button>
            </div>
            <div className="super-tracking__panel-head super-tracking__panel-head--cyber">Entries</div>
            {!logsLoading && logs?.content?.length ? (
              <div className="super-tracking__table-wrap super-tracking__table-wrap--cyber">
                <table className="super-tracking__table--cyber">
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Actor</th>
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
                        <td className="super-tracking__mono super-tracking__td--cyber">
                          {row.occurredAt
                            ? new Date(row.occurredAt).toLocaleString()
                            : "—"}
                        </td>
                        <td className="super-tracking__td--cyber">{row.actorEmail}</td>
                        <td
                          className="super-tracking__td--cyber super-tracking__task-cell"
                          title={
                            row.queryString
                              ? `${row.httpMethod} ${row.requestPath}?${row.queryString}`
                              : `${row.httpMethod} ${row.requestPath}`
                          }
                        >
                          {row.taskLabel || "—"}
                        </td>
                        <td className="super-tracking__mono super-tracking__td--cyber super-tracking__page-cell">
                          {row.clientAdminPage || "—"}
                        </td>
                        <td className="super-tracking__mono super-tracking__td--cyber">
                          {formatDwellOnPage(row.clientDwellMs)}
                        </td>
                        <td className="super-tracking__td--cyber">{row.httpStatus}</td>
                        <td className="super-tracking__td--cyber">
                          <span
                            className={`super-tracking__pill super-tracking__pill--cyber ${
                              row.success
                                ? "super-tracking__pill--cyber-ok"
                                : "super-tracking__pill--cyber-fail"
                            }`}
                          >
                            {row.success ? "OK" : "FAIL"}
                          </span>
                        </td>
                        <td className="super-tracking__mono super-tracking__td--cyber">{row.durationMs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="super-tracking__muted super-tracking__muted--cyber">
                {logsLoading ? "Loading…" : "No log entries match your filters."}
              </div>
            )}
            <div className="super-tracking__pager super-tracking__pager--cyber">
              <span>
                Page {(logs?.number ?? page) + 1} / {Math.max(logs?.totalPages ?? 1, 1)}
              </span>
              <button
                type="button"
                className="super-tracking__btn--cyber-outline"
                disabled={logsLoading || page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="super-tracking__btn--cyber-outline"
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
        </div>
      )}
    </div>
  );
}
